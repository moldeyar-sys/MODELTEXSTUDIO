// Funcion serverless "paraguas": junta varias funciones chicas y sin relacion
// entre si (notificaciones, geolocalizacion, IndexNow) bajo un solo archivo con
// un parametro ?action=, para no gastar mas slots del limite de 12 funciones
// del plan Hobby de Vercel (ver comentario de api/embed-catalog.ts, que ya
// aplica el mismo patron). Las rutas viejas (/api/notify-order,
// /api/notify-buyer-paid, /api/geo) se mantienen funcionando IGUAL para el
// cliente via rewrites en vercel.json que apuntan aca con la action correcta:
// nadie tuvo que tocar el codigo que las llama.
//
// Acciones:
//   POST ?action=notify-order        -> avisa al dueño (WhatsApp+email) de una compra nueva
//   POST ?action=notify-buyer-paid   -> avisa al comprador invitado que ya puede descargar
//   GET  ?action=geo                 -> pais del visitante (geolocalizacion de Vercel)
//   GET  ?action=indexnow-key        -> archivo de verificacion de IndexNow (texto plano)
//   POST ?action=indexnow            -> notifica URLs nuevas/actualizadas a IndexNow (Bing/Yandex)
//   POST ?action=upload-image        -> sube una imagen a Cloudflare R2 (reemplaza Supabase Storage)
//   GET  ?action=announce-free-molds -> aviso diario por mail de moldes gratis nuevos (cron de vercel.json;
//                                       mode=status|test para el panel admin)
//   GET/POST ?action=unsubscribe     -> baja de la lista de novedades (link /api/baja de los mails)

import { createHmac, timingSafeEqual } from 'node:crypto';
import { AwsClient } from 'aws4fetch';
import { assignFreeMoldSlugs, freeMoldName, freeMoldPath } from '../src/lib/freeMoldFormats.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE_URL = 'https://modeltex.com.ar';

async function isAdmin(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!res.ok) return false;
    return (await res.json()) === true;
  } catch {
    return false;
  }
}

function readBody(req: any): any {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
}

// ---------------------------------------------------------------------------
// geo: pais del visitante (geolocalizacion de Vercel, sin servicios externos)
// ---------------------------------------------------------------------------
function handleGeo(req: any, res: any) {
  const country = (req.headers['x-vercel-ip-country'] || '').toString().toUpperCase();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ country });
}

// ---------------------------------------------------------------------------
// notify-order: avisa al dueño (WhatsApp + email) cuando entra una compra.
// El cliente solo envia { orderId }; el detalle real se lee de Supabase con
// la service role para que nadie pueda falsificar el contenido del aviso.
// ---------------------------------------------------------------------------
const paymentLabels: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  transfer: 'Transferencia',
  paypal: 'PayPal',
  binance: 'Binance / Cripto',
  stripe: 'Tarjeta (Stripe)',
};

async function handleNotifyOrder(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SERVICE_ROLE) {
    console.error('notify-order: falta SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: 'Notificaciones no configuradas' });
  }
  try {
    const { orderId } = readBody(req);
    if (!orderId) return res.status(400).json({ error: 'orderId requerido' });

    const query =
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
      `&select=id,total,payment_method,payment_status,created_at,notified_at,guest_email,` +
      `order_items(quantity,price,formato,sizes,product_name,product:products(name)),` +
      `buyer:profiles(email,whatsapp,full_name)`;

    const dbRes = await fetch(query, { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } });
    if (!dbRes.ok) {
      console.error('notify-order: error leyendo pedido', dbRes.status, await dbRes.text());
      return res.status(500).json({ error: 'No se pudo leer el pedido' });
    }
    const rows = (await dbRes.json()) as any[];
    const order = rows?.[0];
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Este endpoint no tiene sesion (se llama con sendBeacon justo despues del
    // checkout, invitados incluidos) asi que no se le puede exigir un token de
    // admin. Como mitigacion: solo notifica pedidos recien creados, y una sola
    // vez por pedido — asi un orderId ajeno (viejo) no sirve para releer datos
    // ni para spamear notificaciones repetidas sobre la misma compra.
    if (order.notified_at) {
      return res.status(200).json({ ok: true, skipped: 'already_notified' });
    }
    const ageMs = Date.now() - new Date(order.created_at).getTime();
    if (ageMs > 30 * 60 * 1000) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Reserva atómica ANTES de mandar nada: dos POST concurrentes con el
    // mismo orderId (red lenta reintentando el sendBeacon, o alguien
    // repitiendo el pedido a mano) antes solo chequeaban notified_at con un
    // GET y lo escribian recien AL FINAL, asi que los dos pasaban el chequeo
    // y mandaban WhatsApp/email por duplicado. Ahora el PATCH filtra
    // notified_at=is.null: si otra llamada ya lo reservó, esta no trae
    // ninguna fila de vuelta y no manda nada.
    const claimRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&notified_at=is.null`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ notified_at: new Date().toISOString() }),
      },
    );
    const claimed = claimRes.ok ? ((await claimRes.json()) as any[]) : [];
    if (!claimed.length) {
      return res.status(200).json({ ok: true, skipped: 'already_notified' });
    }

    const items: any[] = order.order_items ?? [];
    const lines = items.map((it) => {
      const name = it.product?.name || it.product_name || 'Producto';
      const parts = [`• ${name} x${it.quantity}`];
      if (it.formato) parts.push(`[${it.formato}]`);
      if (Array.isArray(it.sizes) && it.sizes.length) parts.push(`Talles: ${it.sizes.join(', ')}`);
      parts.push(`$${Number(it.price).toLocaleString('es-AR')}`);
      return parts.join(' ');
    });

    const buyer = order.buyer || {};
    // order.guest_email cubre las compras sin cuenta (buyer siempre es null
    // ahí, porque no hay user_id): antes el aviso decía "Cliente: Cliente"
    // sin ningún dato para contactar a quien acababa de comprar.
    const buyerName = buyer.full_name || buyer.email || order.guest_email || 'Cliente (sin cuenta)';
    const total = `$${Number(order.total).toLocaleString('es-AR')}`;
    const metodo = paymentLabels[order.payment_method] || order.payment_method;
    const shortId = String(order.id).slice(0, 8);

    const textLines = [
      `🛒 NUEVA COMPRA en Modeltex`,
      `Pedido #${shortId} — Total: ${total}`,
      `Método: ${metodo}`,
      `Cliente: ${buyerName}${buyer.whatsapp ? ` (WhatsApp: ${buyer.whatsapp})` : ''}${buyer.email ? ` — ${buyer.email}` : ''}`,
      ``,
      `Detalle:`,
      ...lines,
    ];
    const plainText = textLines.join('\n');
    const results: Record<string, string> = {};

    const cmbPhone = process.env.CALLMEBOT_PHONE;
    const cmbKey = process.env.CALLMEBOT_APIKEY;
    if (cmbPhone && cmbKey) {
      try {
        const url =
          `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cmbPhone)}` +
          `&apikey=${encodeURIComponent(cmbKey)}&text=${encodeURIComponent(plainText)}`;
        const r = await fetch(url);
        results.whatsapp = r.ok ? 'ok' : `error ${r.status}`;
      } catch (e) {
        results.whatsapp = 'error';
        console.error('notify-order whatsapp', e);
      }
    } else {
      results.whatsapp = 'skip (sin CALLMEBOT_*)';
    }

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;
    if (resendKey && notifyEmail) {
      try {
        const htmlItems = lines.map((l) => `<li>${l.replace(/^• /, '')}</li>`).join('');
        const html =
          `<h2>🛒 Nueva compra en Modeltex</h2>` +
          `<p><strong>Pedido #${shortId}</strong> — Total: <strong>${total}</strong><br/>` +
          `Método: ${metodo}<br/>` +
          `Cliente: ${buyerName}${buyer.whatsapp ? ` (WhatsApp: ${buyer.whatsapp})` : ''}` +
          `${buyer.email ? ` — ${buyer.email}` : ''}</p>` +
          `<p><strong>Detalle:</strong></p><ul>${htmlItems}</ul>`;
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: process.env.NOTIFY_FROM || 'Modeltex <onboarding@resend.dev>',
            to: [notifyEmail],
            subject: `🛒 Nueva compra #${shortId} — ${total}`,
            html,
            text: plainText,
          }),
        });
        results.email = r.ok ? 'ok' : `error ${r.status}`;
        if (!r.ok) console.error('notify-order resend', r.status, await r.text());
      } catch (e) {
        results.email = 'error';
        console.error('notify-order email', e);
      }
    } else {
      results.email = 'skip (sin RESEND_API_KEY/NOTIFY_EMAIL)';
    }

    // notified_at ya quedó marcado en el PATCH de reserva de arriba, antes de
    // mandar nada (así el segundo POST concurrente no llega a duplicar el aviso).

    // Antes `results` (con textos como "skip (sin CALLMEBOT_*)" o
    // "skip (sin RESEND_API_KEY/NOTIFY_EMAIL)") volvía en la respuesta: este
    // endpoint es público y sin sesión, así que cualquiera podía usarlo para
    // saber qué integraciones tiene o no configuradas el sitio. El detalle
    // real queda en los logs del servidor (console.error de cada rama).
    console.log(`notify-order: pedido ${orderId} → whatsapp=${results.whatsapp}, email=${results.email}`);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('notify-order error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}

// ---------------------------------------------------------------------------
// notify-buyer-paid: avisa por mail al comprador invitado que su pedido ya
// esta pagado y listo. Solo el admin puede dispararla.
// ---------------------------------------------------------------------------
/**
 * Manda el mail "tu pedido ya está listo" a un comprador SIN cuenta.
 * Separado del handler HTTP para que api/mp-webhook.ts pueda llamarlo
 * directo (mismo proceso, sin pasar por la verificación de admin) apenas
 * aprueba un pago automáticamente: antes esto SOLO se disparaba si el admin
 * apretaba un botón a mano en el panel, así que un pago aprobado sin
 * intervención humana nunca mandaba el mail que el checkout le prometió al
 * comprador ("te avisamos por mail... con un link para descargar").
 * Best-effort: nunca tira una excepción, siempre devuelve un resultado.
 */
export async function sendBuyerPaidEmailCore(orderId: string): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!SERVICE_ROLE || !resendKey) return { ok: false, skipped: true };
  try {
    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,total,guest_email,payment_status`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (!orderRes.ok) throw new Error(`Supabase orders ${orderRes.status}`);
    const rows = (await orderRes.json()) as any[];
    const order = rows?.[0];

    if (!order || !order.guest_email || order.payment_status !== 'pagado') {
      return { ok: false, skipped: true };
    }

    const shortId = String(order.id).slice(0, 8);
    const total = `$${Number(order.total).toLocaleString('es-AR')}`;
    const orderUrl = `${SITE_URL}/mi-pedido?order=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.guest_email)}`;

    const html =
      `<h2>¡Tu pedido en Modeltex ya está confirmado!</h2>` +
      `<p>Pedido <strong>#${shortId}</strong> — Total: <strong>${total}</strong></p>` +
      `<p>Ya podés descargar tus moldes desde este link (guardalo, sirve para volver a descargar cuando quieras):</p>` +
      `<p><a href="${orderUrl}" style="display:inline-block;background:#0048AD;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver y descargar mi pedido</a></p>` +
      `<p style="color:#666;font-size:13px;">Si el botón no funciona, copiá y pegá este link en tu navegador:<br/>${orderUrl}</p>`;
    const text = `Tu pedido #${shortId} (${total}) ya esta confirmado. Descargalo aca: ${orderUrl}`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'Modeltex <onboarding@resend.dev>',
        to: [order.guest_email],
        subject: `Tu pedido #${shortId} ya está listo para descargar`,
        html,
        text,
      }),
    });

    if (!r.ok) {
      console.error('sendBuyerPaidEmailCore: resend', r.status, await r.text());
      return { ok: false, error: `resend ${r.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('sendBuyerPaidEmailCore error', err);
    return { ok: false, error: 'error interno' };
  }
}

async function handleNotifyBuyerPaid(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) {
    return res.status(403).json({ error: 'Esta accion es solo para administradores.' });
  }
  try {
    const body = readBody(req);
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) return res.status(400).json({ error: 'orderId requerido' });
    const result = await sendBuyerPaidEmailCore(orderId);
    res.status(200).json(result);
  } catch (err) {
    console.error('notify-buyer-paid error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}

// ---------------------------------------------------------------------------
// IndexNow (protocolo abierto de Bing/Yandex/Seznam; Google no participa hoy,
// pero no cuesta nada avisarle a los que si). Ver docs/indexnow.md.
//
//   INDEXNOW_KEY  -> clave propia (cualquier string hex de 8-64 caracteres).
//                    Se genera una vez y se guarda solo en variables de
//                    entorno de Vercel; nunca se hardcodea en el repo.
//
// El archivo de verificacion que pide el protocolo (normalmente
// https://tusitio.com/<key>.txt) se sirve dinamicamente desde
// ?action=indexnow-key con keyLocation apuntando ahi mismo, asi no hace
// falta saber la clave de antemano para commitear un archivo estatico.
// ---------------------------------------------------------------------------
function handleIndexNowKey(_req: any, res: any) {
  const key = process.env.INDEXNOW_KEY || '';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  if (!key) return res.status(404).send('IndexNow no configurado');
  res.status(200).send(key);
}

async function handleIndexNow(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) {
    return res.status(403).json({ error: 'Esta accion es solo para administradores.' });
  }
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    // Sin key configurada el sitio sigue funcionando normal: esto es
    // "best-effort", nunca debe bloquear nada de lo que llama a este endpoint.
    return res.status(200).json({ ok: false, skipped: true, reason: 'INDEXNOW_KEY no configurada' });
  }
  try {
    const body = readBody(req);
    const urlsRaw: unknown = body.urls;
    const urls = (Array.isArray(urlsRaw) ? urlsRaw : [urlsRaw])
      .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      .map((u) => (u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`))
      // Solo se notifican URLs del propio dominio: evita que este endpoint se
      // use para pegarle a la cuota de IndexNow con URLs de otro sitio.
      .filter((u) => u.startsWith(SITE_URL))
      .slice(0, 10000); // limite del propio protocolo IndexNow por request

    if (!urls.length) return res.status(400).json({ error: 'urls requerido (string o string[])' });

    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'modeltex.com.ar',
        key,
        keyLocation: `${SITE_URL}/api/utils?action=indexnow-key`,
        urlList: urls,
      }),
    });
    // IndexNow responde 200/202 en exito; no exige cuerpo de respuesta.
    res.status(200).json({ ok: r.ok, status: r.status, submitted: urls.length });
  } catch (err) {
    console.error('indexnow error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}

// ---------------------------------------------------------------------------
// upload-image: sube una imagen a Cloudflare R2 (bucket privado, servido con
// un dominio público propio) en vez de Supabase Storage. Motivo: las fotos
// del catálogo eran la mayor parte del "egress" que hizo que Supabase
// restringiera el proyecto entero (ver README/memoria del proyecto). R2 no
// cobra por transferencia de salida, así que esto saca ese consumo de raíz.
//
// El navegador manda el archivo ya comprimido en base64 (dentro del límite
// de body de Vercel de sobra: las imágenes salen en <500 KB de storage.ts).
// Solo admin puede subir. Requiere estas variables de entorno:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME,
//   VITE_R2_PUBLIC_URL (dominio público del bucket, sin barra al final)
// ---------------------------------------------------------------------------
function safeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1) : '';
  const cleanBase = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
  const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanExt ? `${cleanBase || 'archivo'}.${cleanExt}` : (cleanBase || 'archivo');
}

// Antes se confiaba en el `contentType` que manda el navegador (cualquier
// string) y se subía tal cual: con un token de admin se podía subir un
// .html o un .svg con <script>, que después /img/... reenvía desde
// modeltex.com.ar con ese mismo content-type (donde vive la sesión de
// Supabase en localStorage). Ahora se exige que el tipo declarado esté en
// esta lista Y que coincida con la firma real de los primeros bytes del
// archivo — así un .html renombrado a .jpg con contentType falso no pasa.
const ALLOWED_IMAGE_TYPES: Record<string, (b: Buffer) => boolean> = {
  'image/jpeg': (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/webp': (b) => b.length > 12 && b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP',
  'image/gif': (b) => b.length > 6 && b.slice(0, 3).toString('ascii') === 'GIF',
  'image/avif': (b) => b.length > 12 && b.slice(4, 8).toString('ascii') === 'ftyp',
};
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

async function handleUploadImage(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) {
    return res.status(403).json({ error: 'Esta accion es solo para administradores.' });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.VITE_R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return res.status(500).json({ error: 'Cloudflare R2 no está configurado (faltan variables de entorno).' });
  }

  try {
    const body = readBody(req);
    const fileName = typeof body.fileName === 'string' ? body.fileName : '';
    const contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
    const dataBase64 = typeof body.dataBase64 === 'string' ? body.dataBase64 : '';
    const folder = typeof body.folder === 'string' && /^[a-z0-9-]+$/.test(body.folder) ? body.folder : 'products';
    if (!fileName || !dataBase64) return res.status(400).json({ error: 'fileName y dataBase64 son requeridos' });

    const bytes = Buffer.from(dataBase64, 'base64');
    // Tope de seguridad: storage.ts comprime a <1600px webp antes de mandar,
    // así que esto nunca debería acercarse a 15 MB salvo un archivo mal enviado.
    if (bytes.length > 15 * 1024 * 1024) return res.status(413).json({ error: 'Archivo demasiado grande' });

    const signatureCheck = ALLOWED_IMAGE_TYPES[contentType];
    if (!signatureCheck || !signatureCheck(bytes)) {
      return res.status(415).json({ error: 'Solo se admiten imágenes JPEG, PNG, WEBP, GIF o AVIF.' });
    }
    // La extensión sale del tipo real verificado, no de lo que diga el
    // nombre de archivo que mandó el navegador (evita "foto.jpg" que en
    // realidad es un HTML/SVG con content-type falseado).
    const path = `${folder}/${Date.now()}-${safeFileName(fileName).replace(/\.[a-z0-9]+$/i, '')}.${EXT_BY_TYPE[contentType]}`;
    const client = new AwsClient({ accessKeyId, secretAccessKey, service: 's3', region: 'auto' });
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${path}`;
    const uploadRes = await client.fetch(endpoint, {
      method: 'PUT',
      body: bytes,
      headers: { 'Content-Type': contentType },
    });
    if (!uploadRes.ok) {
      console.error('upload-image R2 error', uploadRes.status, await uploadRes.text());
      return res.status(502).json({ error: 'No se pudo subir la imagen a Cloudflare' });
    }

    res.status(200).json({ url: `${publicUrl.replace(/\/$/, '')}/${path}`, path });
  } catch (err) {
    console.error('upload-image error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}

// ---------------------------------------------------------------------------
// Novedades por mail: aviso automatico de moldes gratis nuevos.
//
// Un envio por dia (cron de vercel.json, 21:00 UTC = 18:00 AR) a toda la
// lista newsletter_subscribers con los moldes gratis ACTIVOS creados en la
// ventana del dia: [corte de ayer, corte de hoy), con el corte a las 20:00
// UTC. La ventana es fija y no depende de cuando corra el cron dentro de su
// hora, asi cada molde entra en exactamente un envio sin guardar estado en la
// base. Si se suben 10 moldes el mismo dia, sale UN mail con los 10.
//
// Por eso el envio real solo lo dispara el cron: un "enviar ahora" manual
// duplicaria el aviso del cron. El admin tiene mode=status (que sale en el
// proximo envio) y mode=test (se lo manda solo a si mismo).
//
// Requiere el dominio verificado en Resend: con el remitente de prueba
// (onboarding@resend.dev) Resend solo entrega a la casilla del duenio de la
// cuenta, y el error de Resend se devuelve tal cual para que se vea en el panel.
// ---------------------------------------------------------------------------
const CUTOFF_UTC_HOUR = 20;
const NEWSLETTER_FROM = process.env.NEWSLETTER_FROM || 'Modeltex <novedades@modeltex.com.ar>';

interface MoldRow { id: string; title: string; sizes: string[] | string | null; image_url: string | null; created_at: string }

function lastCutoff(now = new Date()): Date {
  const c = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), CUTOFF_UTC_HOUR));
  if (c > now) c.setUTCDate(c.getUTCDate() - 1);
  return c;
}

function unsubscribeToken(email: string): string {
  const secret = process.env.NEWSLETTER_SECRET || SERVICE_ROLE;
  return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('base64url').slice(0, 32);
}

function validUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token || !(process.env.NEWSLETTER_SECRET || SERVICE_ROLE)) return false;
  const a = Buffer.from(unsubscribeToken(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

function escHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function moldSizes(sizes: MoldRow['sizes']) {
  const list = (Array.isArray(sizes) ? sizes : [sizes]).filter(Boolean).join('-').split(/[-,\s]+/).filter(Boolean);
  if (list.length >= 4) return `Talles ${list[0]} a ${list[list.length - 1]}`;
  if (list.length === 3) return `Talles ${list[0]}, ${list[1]} y ${list[2]}`;
  if (list.length === 2) return `Talles ${list[0]} y ${list[1]}`;
  if (list.length === 1) return `Talle ${list[0]}`;
  return 'PDF A4 para imprimir';
}

// Fotos que son collages de varias vistas: se usa solo el primer panel (la
// prenda completa de frente), en pixeles de la foto original. Mismo criterio
// que las imagenes del anuncio (Desktop\Anuncio moldes gratis\_fuente\datos.mjs).
const EMAIL_PANEL: Record<string, { w: number; h: number }> = {
  'vestido 414': { w: 380, h: 663 },
};

// Cuadrado con la prenda entera (sin recortar) y en JPG: las fotos del
// catalogo son WebP, que Outlook de escritorio no muestra.
function emailImage(url: string, title: string) {
  const panel = EMAIL_PANEL[title.trim().toLowerCase()];
  // precrop: sin él wsrv recorta DESPUÉS de achicar y toma otra zona.
  const crop = panel ? `&cx=0&cy=0&cw=${panel.w}&ch=${panel.h}&precrop` : '';
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}${crop}&w=520&h=520&fit=contain&cbg=ffffff&output=jpg&q=82`;
}

const UTM = 'utm_source=newsletter&utm_medium=email&utm_campaign=moldes_gratis';

/** slugs: id -> slug de su pagina (/moldes-gratis/<slug>); sin slug se enlaza la lista. */
function buildNewsletterEmail(molds: MoldRow[], unsubUrl: string, slugs: Map<string, string>) {
  const link = `${SITE_URL}/moldes-gratis?${UTM}`;
  const moldLink = (m: MoldRow) => (slugs.get(m.id) ? `${SITE_URL}${freeMoldPath(slugs.get(m.id) as string)}?${UTM}` : link);
  const subject = molds.length === 1
    ? `🎁 Nuevo molde gratis: ${freeMoldName(molds[0].title)}`
    : `🎁 ${molds.length} moldes gratis nuevos para descargar`;
  const cells = molds.map((m) => {
    const name = escHtml(freeMoldName(m.title));
    const img = m.image_url
      ? `<a href="${moldLink(m)}"><img src="${escHtml(emailImage(m.image_url, m.title))}" width="260" height="260" alt="${name}" style="display:block;width:100%;max-width:260px;height:auto;border-radius:12px;border:1px solid #e5e7eb;"></a>`
      : '';
    return `<td width="50%" valign="top" style="padding:8px;">${img}` +
      `<p style="margin:10px 0 2px;font:bold 16px Arial,sans-serif;color:#0F172A;">${name}</p>` +
      `<p style="margin:0 0 10px;font:13px Arial,sans-serif;color:#64748b;">${escHtml(moldSizes(m.sizes))}</p>` +
      `<a href="${moldLink(m)}" style="display:inline-block;background:#16a34a;color:#fff;font:bold 13px Arial,sans-serif;padding:9px 14px;border-radius:8px;text-decoration:none;">Descargar gratis</a></td>`;
  });
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 2) rows.push(`<tr>${cells[i]}${cells[i + 1] || '<td width="50%"></td>'}</tr>`);

  const intro = molds.length === 1
    ? 'Publicamos un molde gratis nuevo. Descargalo, imprimilo y probá la calidad de nuestra moldería:'
    : `Publicamos ${molds.length} moldes gratis nuevos. Descargalos, imprimilos y probá la calidad de nuestra moldería:`;
  const html =
    `<div style="background:#f1f5f9;padding:24px 12px;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">` +
    `<tr><td style="background:#0048AD;padding:20px 24px;"><img src="${SITE_URL}/brand/modeltex-logo-full.png" alt="Modeltex" height="44" style="display:block;background:#fff;border-radius:8px;padding:4px 8px;"></td></tr>` +
    `<tr><td style="padding:24px 24px 8px;"><h1 style="margin:0 0 8px;font:bold 24px Georgia,serif;color:#012f6f;">${molds.length === 1 ? '¡Nuevo molde gratis!' : '¡Nuevos moldes gratis!'}</h1>` +
    `<p style="margin:0;font:15px/1.5 Arial,sans-serif;color:#334155;">${intro}</p></td></tr>` +
    `<tr><td style="padding:8px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table></td></tr>` +
    `<tr><td align="center" style="padding:16px 24px 28px;"><a href="${link}" style="display:inline-block;background:#0048AD;color:#fff;font:bold 15px Arial,sans-serif;padding:14px 26px;border-radius:999px;text-decoration:none;">Ver todos los moldes gratis</a></td></tr>` +
    `<tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;font:12px/1.5 Arial,sans-serif;color:#94a3b8;">` +
    `Recibís este mail porque te anotaste para recibir avisos de moldes gratis y novedades de Modeltex.<br>` +
    `<a href="${unsubUrl}" style="color:#64748b;">Darme de baja de estos avisos</a></td></tr>` +
    `</table></div>`;
  const text =
    `${intro}\n\n` +
    molds.map((m) => `- ${freeMoldName(m.title)} (${moldSizes(m.sizes)}): ${moldLink(m)}`).join('\n') +
    `\n\nDescargalos gratis: ${link}\n\nPara darte de baja de estos avisos: ${unsubUrl}\n`;
  return { subject, html, text };
}

function unsubscribeUrl(email: string) {
  return `${SITE_URL}/api/baja?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

async function fetchMolds(from: Date, to?: Date): Promise<MoldRow[]> {
  const q = [`select=id,title,sizes,image_url,created_at`, `is_active=eq.true`, `created_at=gte.${from.toISOString()}`];
  if (to) q.push(`created_at=lt.${to.toISOString()}`);
  const r = await fetch(`${SUPABASE_URL}/rest/v1/free_molds?${q.join('&')}&order=created_at.asc`, {
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
  });
  if (!r.ok) throw new Error(`free_molds ${r.status}`);
  return (await r.json()) as MoldRow[];
}

async function fetchSubscriberEmails(): Promise<string[]> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?select=email`, {
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
  });
  if (!r.ok) throw new Error(`newsletter_subscribers ${r.status}`);
  const rows = (await r.json()) as Array<{ email: string }>;
  return [...new Set(rows.map((x) => (x.email || '').trim().toLowerCase()).filter(Boolean))];
}

/** Slugs de las paginas de todos los moldes activos (mismo calculo que la app y middleware.ts). */
async function fetchMoldSlugs(): Promise<Map<string, string>> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/free_molds?select=id,title,created_at&is_active=eq.true`, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    return r.ok ? assignFreeMoldSlugs((await r.json()) as Array<{ id: string; title: string; created_at: string }>) : new Map();
  } catch {
    return new Map();
  }
}

/** Manda el aviso a cada email (lotes de 100, el máximo del endpoint batch de Resend). */
async function sendNewsletter(molds: MoldRow[], emails: string[]): Promise<{ sent: number; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { sent: 0, error: 'Falta RESEND_API_KEY en las variables de Vercel.' };
  const slugs = await fetchMoldSlugs();
  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const batch = emails.slice(i, i + 100).map((to) => {
      const unsub = unsubscribeUrl(to);
      const { subject, html, text } = buildNewsletterEmail(molds, unsub, slugs);
      return {
        from: NEWSLETTER_FROM,
        to: [to],
        subject,
        html,
        text,
        ...(process.env.NOTIFY_EMAIL ? { reply_to: process.env.NOTIFY_EMAIL } : {}),
        headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      };
    });
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify(batch),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error('newsletter resend', r.status, detail);
      let msg = detail;
      try { msg = JSON.parse(detail).message || detail; } catch { /* texto plano */ }
      return { sent, error: `Resend ${r.status}: ${msg}` };
    }
    sent += batch.length;
  }
  return { sent };
}

async function adminEmail(token: string): Promise<string | null> {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    return ((await r.json()) as { email?: string }).email || null;
  } catch {
    return null;
  }
}

async function handleAnnounceFreeMolds(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (!SERVICE_ROLE) return res.status(500).json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY en Vercel.' });
  const mode = String(req.query?.mode || '');
  const cutoff = lastCutoff();

  if (mode === 'status' || mode === 'test') {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token || !(await isAdmin(token))) return res.status(403).json({ error: 'Solo para administradores.' });
    try {
      const next = new Date(cutoff);
      next.setUTCDate(next.getUTCDate() + 1);
      const [pending, emails] = await Promise.all([fetchMolds(cutoff), fetchSubscriberEmails()]);
      if (mode === 'status') {
        return res.status(200).json({
          subscribers: emails.length,
          pending: pending.map((m) => freeMoldName(m.title)),
          nextSendUtc: new Date(next.getTime() + 3600_000).toISOString(),
          resendConfigured: !!process.env.RESEND_API_KEY,
          from: NEWSLETTER_FROM,
        });
      }
      // Prueba: los moldes del proximo envio o, si no hay, los 3 ultimos publicados.
      let molds = pending;
      if (!molds.length) {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/free_molds?select=id,title,sizes,image_url,created_at&is_active=eq.true&order=created_at.desc&limit=3`, {
          headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
        });
        molds = r.ok ? ((await r.json()) as MoldRow[]) : [];
      }
      const me = await adminEmail(token);
      if (!me) return res.status(400).json({ error: 'No se pudo leer tu email de administrador.' });
      if (!molds.length) return res.status(400).json({ error: 'No hay moldes gratis activos para armar el mail.' });
      const result = await sendNewsletter(molds, [me]);
      return res.status(result.error ? 502 : 200).json({ ...result, to: me });
    } catch (err) {
      console.error('announce status/test', err);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  // Envio real: solo el cron de Vercel. Con CRON_SECRET configurado Vercel lo
  // manda como Bearer; sin el, se acepta el user-agent del cron (es
  // idempotente por ventana, asi que dispararlo de mas no duplica nada nuevo).
  const cronSecret = process.env.CRON_SECRET;
  const auth = String(req.headers.authorization || '');
  const isCron = cronSecret ? auth === `Bearer ${cronSecret}` : /vercel-cron/i.test(String(req.headers['user-agent'] || ''));
  if (!isCron) return res.status(403).json({ error: 'Solo el envio automatico diario.' });
  try {
    const from = new Date(cutoff);
    from.setUTCDate(from.getUTCDate() - 1);
    const molds = await fetchMolds(from, cutoff);
    if (!molds.length) return res.status(200).json({ sent: 0, molds: 0 });
    const emails = await fetchSubscriberEmails();
    if (!emails.length) return res.status(200).json({ sent: 0, molds: molds.length });
    const result = await sendNewsletter(molds, emails);
    console.log('newsletter', { molds: molds.length, subscribers: emails.length, ...result });
    return res.status(result.error ? 502 : 200).json({ molds: molds.length, ...result });
  } catch (err) {
    console.error('announce-free-molds', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

function unsubscribePage(title: string, body: string) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Modeltex</title></head>` +
    `<body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0F172A;"><div style="max-width:460px;margin:60px auto;background:#fff;border-radius:16px;padding:32px;text-align:center;">` +
    `<img src="${SITE_URL}/brand/modeltex-logo-full.png" alt="Modeltex" height="48"><h1 style="font-size:22px;margin:20px 0 10px;">${title}</h1>${body}` +
    `<p style="margin-top:24px;"><a href="${SITE_URL}/moldes-gratis" style="color:#0048AD;">Ir a Modeltex</a></p></div></body></html>`;
}

// Baja de la lista desde el link del mail. GET muestra un boton de
// confirmacion (los antivirus de correo "abren" los links solos y no deben
// dar de baja a nadie); POST borra el email. POST tambien es el "one-click"
// de List-Unsubscribe que usan Gmail y Yahoo.
async function handleUnsubscribe(req: any, res: any) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const email = String(req.query?.e || '').trim().toLowerCase();
  const token = String(req.query?.t || '');
  if (!validUnsubscribeToken(email, token)) {
    return res.status(400).send(unsubscribePage('Link inválido', '<p>Este link de baja no es válido. Si querés dejar de recibir avisos, respondé cualquiera de nuestros mails y te damos de baja.</p>'));
  }
  if (req.method === 'POST') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    if (!r.ok) {
      console.error('unsubscribe', r.status, await r.text());
      return res.status(500).send(unsubscribePage('No pudimos darte de baja', '<p>Probá de nuevo en un rato.</p>'));
    }
    return res.status(200).send(unsubscribePage('Listo, te diste de baja', `<p>No vamos a mandarte más avisos de moldes gratis a <b>${escHtml(email)}</b>.</p>`));
  }
  const action = `${SITE_URL}/api/baja?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`;
  return res.status(200).send(unsubscribePage(
    'Darte de baja de los avisos',
    `<p>¿Querés dejar de recibir los avisos de moldes gratis nuevos en <b>${escHtml(email)}</b>?</p>` +
    `<form method="POST" action="${action}"><button type="submit" style="background:#dc2626;color:#fff;border:0;border-radius:999px;padding:12px 24px;font-size:15px;font-weight:bold;cursor:pointer;">Sí, darme de baja</button></form>`,
  ));
}

export default async function handler(req: any, res: any) {
  const action = String(req.query?.action || '');
  switch (action) {
    case 'geo':
      return handleGeo(req, res);
    case 'notify-order':
      return handleNotifyOrder(req, res);
    case 'notify-buyer-paid':
      return handleNotifyBuyerPaid(req, res);
    case 'indexnow-key':
      return handleIndexNowKey(req, res);
    case 'indexnow':
      return handleIndexNow(req, res);
    case 'upload-image':
      return handleUploadImage(req, res);
    case 'announce-free-molds':
      return handleAnnounceFreeMolds(req, res);
    case 'unsubscribe':
      return handleUnsubscribe(req, res);
    default:
      res.status(400).json({ error: 'Accion desconocida. Usa ?action=geo|notify-order|notify-buyer-paid|indexnow-key|indexnow|upload-image|announce-free-molds|unsubscribe' });
  }
}
