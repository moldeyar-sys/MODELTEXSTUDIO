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

import { AwsClient } from 'aws4fetch';

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
      `&select=id,total,payment_method,payment_status,created_at,notified_at,` +
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
    const buyerName = buyer.full_name || buyer.email || 'Cliente';
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

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ notified_at: new Date().toISOString() }),
      });
    } catch (e) {
      console.error('notify-order: no se pudo marcar notified_at', e);
    }

    res.status(200).json({ ok: true, results });
  } catch (err) {
    console.error('notify-order error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}

// ---------------------------------------------------------------------------
// notify-buyer-paid: avisa por mail al comprador invitado que su pedido ya
// esta pagado y listo. Solo el admin puede dispararla.
// ---------------------------------------------------------------------------
async function handleNotifyBuyerPaid(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) {
    return res.status(403).json({ error: 'Esta accion es solo para administradores.' });
  }
  const resendKey = process.env.RESEND_API_KEY;
  if (!SERVICE_ROLE || !resendKey) {
    return res.status(200).json({ ok: false, skipped: true });
  }
  try {
    const body = readBody(req);
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) return res.status(400).json({ error: 'orderId requerido' });

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,total,guest_email,payment_status`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (!orderRes.ok) throw new Error(`Supabase orders ${orderRes.status}`);
    const rows = (await orderRes.json()) as any[];
    const order = rows?.[0];

    if (!order || !order.guest_email || order.payment_status !== 'pagado') {
      return res.status(200).json({ ok: false, skipped: true });
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
      console.error('notify-buyer-paid resend', r.status, await r.text());
      return res.status(200).json({ ok: false, error: `resend ${r.status}` });
    }
    res.status(200).json({ ok: true });
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
    const contentType = typeof body.contentType === 'string' ? body.contentType : 'application/octet-stream';
    const dataBase64 = typeof body.dataBase64 === 'string' ? body.dataBase64 : '';
    const folder = typeof body.folder === 'string' && /^[a-z0-9-]+$/.test(body.folder) ? body.folder : 'products';
    if (!fileName || !dataBase64) return res.status(400).json({ error: 'fileName y dataBase64 son requeridos' });

    const bytes = Buffer.from(dataBase64, 'base64');
    // Tope de seguridad: storage.ts comprime a <1600px webp antes de mandar,
    // así que esto nunca debería acercarse a 15 MB salvo un archivo mal enviado.
    if (bytes.length > 15 * 1024 * 1024) return res.status(413).json({ error: 'Archivo demasiado grande' });

    const path = `${folder}/${Date.now()}-${safeFileName(fileName)}`;
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
    default:
      res.status(400).json({ error: 'Accion desconocida. Usa ?action=geo|notify-order|notify-buyer-paid|indexnow-key|indexnow|upload-image' });
  }
}
