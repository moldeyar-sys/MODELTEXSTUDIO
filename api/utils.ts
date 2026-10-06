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
//   POST ?action=email-buyer         -> email del admin al comprador de un pedido (boton "Enviar email" del panel)
//   GET  ?action=geo                 -> pais del visitante (geolocalizacion de Vercel)
//   GET  ?action=indexnow-key        -> archivo de verificacion de IndexNow (texto plano)
//   POST ?action=indexnow            -> notifica URLs nuevas/actualizadas a IndexNow (Bing/Yandex)
//   POST ?action=upload-image        -> sube una imagen a Cloudflare R2 (reemplaza Supabase Storage)
//   GET/POST ?action=unsubscribe     -> baja de la lista de novedades (link /api/baja de los mails)
//   GET/POST ?action=send-free-molds -> envio MANUAL (solo admin) del mail de moldes gratis:
//                                       GET mode=status (cuantos destinatarios por publico, ultimos envios);
//                                       POST { moldIds, audience, test } manda (test=true: solo al admin)

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
// Precios reales por formato (compartido por mp-webhook, create-preference y
// guest-order). UNA sola regla para "qué formato es este order_item", calcada
// de public.formato_a_file_type() (migración 037): antes cada archivo tenía su
// propia copia y no coincidían. Ejemplo real (auditoría 2026-10-05): un
// order_item con formato "pl" lo mapeaba la base a 'pdf_plotter' (entregaba
// los archivos de plóter) pero el webhook no lo reconocía y usaba el precio
// MÍNIMO del producto para validar el pago. Peor: si el formato declarado no
// tenía precio cargado (ej. "DXF" en un producto que no vende DXF), el
// webhook tomaba piso 0 y auto-aprobaba cualquier monto. Ahora:
//   - mismo mapeo que la base, siempre;
//   - un formato sin precio en ese producto devuelve null => NUNCA se
//     auto-aprueba ni se arma link de pago: queda para revisión manual.
// ---------------------------------------------------------------------------
export type FileTypeKey = 'carton' | 'pdf_plotter' | 'dxf' | 'pds' | 'mrk' | 'ads' | 'pdf_a4';

/** Mismo criterio y mismo orden que public.formato_a_file_type() (migración 037). */
export function formatoAFileType(formato: string | null | undefined): FileTypeKey {
  const f = (formato || '').toLowerCase();
  if (f.includes('cart')) return 'carton';
  if (f.includes('pl')) return 'pdf_plotter';
  if (f.includes('dxf') || f.includes('aama')) return 'dxf';
  if (f.includes('pds') || f.includes('optitex')) return 'pds';
  if (f.includes('mrk') || f.includes('tizado')) return 'mrk';
  if (f.includes('ads') || f.includes('audaces')) return 'ads';
  return 'pdf_a4';
}

/**
 * Precio de catálogo (ARS) del formato declarado. Devuelve null si ese
 * formato no tiene precio cargado en el producto (= no se vende en ese
 * formato): el que llama tiene que tratarlo como "no verificable".
 */
export function precioDelFormato(p: any, formato: string | null | undefined, currency: 'ARS' | 'USD' = 'ARS'): number | null {
  const ft = formatoAFileType(formato);
  const v = currency === 'USD'
    ? (ft === 'carton' ? p?.precio_usd_carton
      : ft === 'pdf_plotter' ? p?.precio_usd_pdf_ploter
      : ft === 'dxf' ? p?.precio_usd_dxf
      : ft === 'pds' ? p?.precio_usd_pds
      : ft === 'mrk' ? p?.precio_usd_mrk
      : ft === 'ads' ? p?.precio_usd_ads
      : p?.precio_usd_pdf_a4)
    : (ft === 'carton' ? p?.precio_carton
      : ft === 'pdf_plotter' ? p?.precio_pdf_ploter
      : ft === 'dxf' ? p?.precio_dxf
      : ft === 'pds' ? p?.precio_pds
      : ft === 'mrk' ? p?.precio_mrk
      : ft === 'ads' ? p?.precio_ads
      : (p?.precio_pdf_a4 ?? p?.price));
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Ajuste por talles: MISMA lógica que src/lib/sizeUtils.ts (ver nota en
// api/sitemap.ts sobre por qué no se importa desde src/).
const ADULT_LETTERS = new Set(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']);
const DEFAULT_ADULT = new Set(['S', 'M', 'L', 'XL', '2XL']);
const DEFAULT_CHILD = new Set(['4', '6', '8', '10', '12', '14', '16']);
const DEFAULT_BABY = new Set(['1', '2', '3', '4', '5']);
const CHILD_ONLY = new Set(['10', '12', '14', '16', '18']);
const TALLE_ARS: Record<'carton' | 'pdf' | 'ploter', number> = { carton: 10_000, pdf: 3_000, ploter: 4_000 };
const TALLE_USD: Record<'carton' | 'pdf' | 'ploter', number> = { carton: 7, pdf: 3, ploter: 5 };

function getDefaultSizes(availableSizes: string[]): string[] {
  if (!availableSizes || availableSizes.length === 0) return [];
  if (availableSizes.some((s) => ADULT_LETTERS.has(s))) {
    const defs = availableSizes.filter((s) => DEFAULT_ADULT.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }
  if (availableSizes.some((s) => CHILD_ONLY.has(s))) {
    const defs = availableSizes.filter((s) => DEFAULT_CHILD.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }
  const allNumeric = availableSizes.every((s) => /^\d+$/.test(s));
  if (allNumeric && Math.max(...availableSizes.map(Number)) <= 9) {
    const defs = availableSizes.filter((s) => DEFAULT_BABY.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }
  return availableSizes;
}

function tipoTalle(formato: string | null | undefined): 'carton' | 'pdf' | 'ploter' {
  const ft = formatoAFileType(formato);
  if (ft === 'carton') return 'carton';
  if (ft === 'pdf_plotter') return 'ploter';
  return 'pdf';
}

/**
 * Piso real (ARS) de UN item: precio del formato declarado ajustado por la
 * cantidad de talles pedidos. null si el formato no se vende en ese producto.
 */
export function pisoDelItem(
  product: any,
  formato: string | null | undefined,
  sizesPedidos: string[] | null | undefined,
  currency: 'ARS' | 'USD' = 'ARS',
): number | null {
  const base = precioDelFormato(product, formato, currency);
  if (base === null) return null;
  const disponibles: string[] = Array.isArray(product?.sizes) ? product.sizes : [];
  const defaults = getDefaultSizes(disponibles);
  const seleccionados = Array.isArray(sizesPedidos) && sizesPedidos.length ? sizesPedidos.length : defaults.length;
  const diff = seleccionados - defaults.length;
  const porTalle = currency === 'USD' ? TALLE_USD : TALLE_ARS;
  return Math.max(0, base + diff * porTalle[tipoTalle(formato)]);
}

/** Columnas de products que necesitan precioDelFormato/pisoDelItem. */
export const PRODUCT_PRICE_COLUMNS =
  'id,name,sizes,price,precio_carton,precio_pdf_a4,precio_pdf_ploter,precio_dxf,precio_pds,precio_mrk,precio_ads,' +
  'precio_usd_carton,precio_usd_pdf_a4,precio_usd_pdf_ploter,precio_usd_dxf,precio_usd_pds,precio_usd_mrk,precio_usd_ads';

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
        // Todo lo que entra acá lo escribió el comprador (nombre de perfil,
        // formato, talles de order_items): se escapa para que nadie pueda
        // meter un link o HTML en el mail que lee el dueño.
        const htmlItems = lines.map((l) => `<li>${escHtml(l.replace(/^• /, ''))}</li>`).join('');
        const html =
          `<h2>🛒 Nueva compra en Modeltex</h2>` +
          `<p><strong>Pedido #${escHtml(shortId)}</strong> — Total: <strong>${escHtml(total)}</strong><br/>` +
          `Método: ${escHtml(String(metodo))}<br/>` +
          `Cliente: ${escHtml(String(buyerName))}${buyer.whatsapp ? ` (WhatsApp: ${escHtml(String(buyer.whatsapp))})` : ''}` +
          `${buyer.email ? ` — ${escHtml(String(buyer.email))}` : ''}</p>` +
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
// Email al comprador desde el panel (boton "Enviar email" de cada pedido).
// Solo admin. El destinatario sale del pedido en la base (guest_email o el
// email del perfil), nunca del cliente: el panel elige el pedido, el servidor
// decide la direccion. Sale desde NOTIFY_FROM (la misma casilla que el aviso
// de pago) con reply_to al dueño (NOTIFY_EMAIL), asi la respuesta le llega.
// ---------------------------------------------------------------------------
async function handleEmailBuyer(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) {
    return res.status(403).json({ error: 'Esta accion es solo para administradores.' });
  }
  const resendKey = process.env.RESEND_API_KEY;
  if (!SERVICE_ROLE || !resendKey) {
    return res.status(200).json({ ok: false, error: 'Falta RESEND_API_KEY o SUPABASE_SERVICE_ROLE_KEY en Vercel. Usá "Abrir en mi correo".' });
  }
  try {
    const body = readBody(req);
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : '';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 6000) : '';
    const includeLink = body.includeLink !== false;
    if (!orderId || !subject || !message) return res.status(400).json({ error: 'Faltan orderId, subject o message' });

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,total,guest_email,user_id,payment_status,buyer:profiles(email,full_name)`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (!orderRes.ok) throw new Error(`Supabase orders ${orderRes.status}`);
    const order = ((await orderRes.json()) as any[])?.[0];
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    const to = String(order.guest_email || order.buyer?.email || '').trim();
    if (!to) return res.status(400).json({ error: 'El pedido no tiene email del comprador' });

    const shortId = String(order.id).slice(0, 8);
    const link = order.guest_email
      ? `${SITE_URL}/mi-pedido?order=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.guest_email)}`
      : `${SITE_URL}/mis-compras`;
    const firma = 'Modeltex · contacto@modeltex.com.ar · WhatsApp +54 9 11 6653 1086';
    const text =
      message +
      (includeLink ? `\n\nPodés ver y descargar tu pedido #${shortId} acá: ${link}` : '') +
      `\n\n${firma}`;
    const htmlLink = includeLink
      ? `<p><a href="${link}" style="display:inline-block;background:#0048AD;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver y descargar mi pedido #${escHtml(shortId)}</a></p>` +
        `<p style="color:#666;font-size:13px;">Si el botón no funciona, copiá y pegá este link en tu navegador:<br/>${escHtml(link)}</p>`
      : '';
    const html =
      `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.5;">` +
      `<p>${escHtml(message).replace(/\n/g, '<br/>')}</p>` +
      htmlLink +
      `<p style="color:#666;font-size:13px;margin-top:24px;">${escHtml(firma)}</p></div>`;

    const payload: Record<string, unknown> = {
      from: process.env.NOTIFY_FROM || 'Modeltex <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      text,
    };
    if (process.env.NOTIFY_EMAIL) payload.reply_to = process.env.NOTIFY_EMAIL;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error('email-buyer resend', r.status, await r.text());
      return res.status(200).json({ ok: false, error: `El servicio de email respondió ${r.status}. Probá "Abrir en mi correo".` });
    }
    return res.status(200).json({ ok: true, to });
  } catch (err) {
    console.error('email-buyer error', err);
    return res.status(500).json({ error: 'Error interno' });
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
// Novedades por mail: envio MANUAL de moldes gratis (solo admin, desde el
// panel). El envio automatico (cron diario) se elimino el 2026-10-05 a
// pedido de Denis: nada sale solo. El admin elige que moldes y a que
// publico, se manda una prueba y recien con "Enviar" sale. Cada envio queda
// registrado en newsletter_sends; quien se da de baja (/api/baja) entra en
// newsletter_optout y no recibe mas nada, sea cual sea el publico elegido.
// Requiere el dominio verificado en Resend (si no, Resend solo entrega a la
// casilla del duenio de la cuenta y devuelve el error, que se muestra en el panel).
const NEWSLETTER_FROM = process.env.NEWSLETTER_FROM || 'Modeltex <novedades@modeltex.com.ar>';

interface MoldRow { id: string; title: string; sizes: string[] | string | null; image_url: string | null; created_at: string }
// ---------------------------------------------------------------------------
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


type Audience = 'subscribers' | 'users' | 'customers' | 'all';
const AUDIENCES: Audience[] = ['subscribers', 'users', 'customers', 'all'];
const H_SR = () => ({ apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` });

function normEmails(rows: Array<{ email?: string | null }>): string[] {
  return rows.map((x) => (x.email || '').trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
}

/** Emails que pidieron no recibir mas nada (link de baja). Vale para todos los publicos. */
async function fetchOptouts(): Promise<Set<string>> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_optout?select=email`, { headers: H_SR() });
  if (!r.ok) return new Set(); // tabla inexistente (migracion 048 sin correr): no bloquea
  return new Set(normEmails((await r.json()) as Array<{ email: string }>));
}

async function fetchAudience(audience: Audience): Promise<string[]> {
  const out = new Set<string>();
  const add = (list: string[]) => list.forEach((e) => out.add(e));
  if (audience === 'subscribers' || audience === 'all') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers?select=email`, { headers: H_SR() });
    if (!r.ok) throw new Error(`newsletter_subscribers ${r.status}`);
    add(normEmails((await r.json()) as Array<{ email: string }>));
  }
  if (audience === 'users' || audience === 'all') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=email`, { headers: H_SR() });
    if (!r.ok) throw new Error(`profiles ${r.status}`);
    add(normEmails((await r.json()) as Array<{ email: string }>));
  }
  if (audience === 'customers' || audience === 'all') {
    // Compradores: pedidos pagados, con cuenta (email del perfil) o invitados (guest_email).
    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=guest_email,buyer:profiles(email)&payment_status=eq.pagado`, { headers: H_SR() });
    if (!r.ok) throw new Error(`orders ${r.status}`);
    const rows = (await r.json()) as Array<{ guest_email: string | null; buyer: { email: string } | null }>;
    add(normEmails(rows.map((o) => ({ email: o.guest_email || o.buyer?.email || '' }))));
  }
  const optout = await fetchOptouts();
  return [...out].filter((e) => !optout.has(e));
}

async function recordSend(row: Record<string, unknown>) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_sends`, {
      method: 'POST',
      headers: { ...H_SR(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    if (!r.ok) console.warn('newsletter_sends insert', r.status, await r.text());
  } catch (e) {
    console.warn('newsletter_sends insert', e);
  }
}

async function handleSendFreeMolds(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (!SERVICE_ROLE) return res.status(500).json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY en Vercel.' });
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) return res.status(403).json({ error: 'Solo para administradores.' });

  if (req.method === 'GET') {
    try {
      const counts: Record<string, number> = {};
      for (const a of AUDIENCES) counts[a] = (await fetchAudience(a)).length;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_sends?select=id,created_at,audience,mold_titles,recipients,sent,error,test&order=created_at.desc&limit=10`, { headers: H_SR() });
      const lastSends = r.ok ? await r.json() : [];
      return res.status(200).json({ counts, lastSends, resendConfigured: !!process.env.RESEND_API_KEY, from: NEWSLETTER_FROM });
    } catch (err) {
      console.error('send-free-molds status', err);
      return res.status(500).json({ error: 'Error interno' });
    }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = readBody(req);
    const moldIds: string[] = Array.isArray(body.moldIds)
      ? body.moldIds.filter((x: unknown) => typeof x === 'string' && /^[0-9a-f-]{36}$/i.test(x)).slice(0, 12)
      : [];
    const audience: Audience = AUDIENCES.includes(body.audience) ? body.audience : 'subscribers';
    const test = body.test === true;
    if (!moldIds.length) return res.status(400).json({ error: 'Elegí al menos un molde.' });

    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/free_molds?select=id,title,sizes,image_url,created_at&is_active=eq.true&id=in.(${moldIds.join(',')})&order=created_at.desc`,
      { headers: H_SR() },
    );
    if (!r.ok) throw new Error(`free_molds ${r.status}`);
    const molds = (await r.json()) as MoldRow[];
    if (!molds.length) return res.status(400).json({ error: 'Esos moldes no existen o no están activos.' });

    const me = await adminEmail(token);
    let emails: string[];
    if (test) {
      if (!me) return res.status(400).json({ error: 'No se pudo leer tu email de administrador.' });
      emails = [me];
    } else {
      emails = await fetchAudience(audience);
      if (!emails.length) return res.status(400).json({ error: 'No hay destinatarios para ese público.' });
    }

    const result = await sendNewsletter(molds, emails);
    const row = {
      audience: test ? 'test' : audience,
      mold_ids: molds.map((m) => m.id),
      mold_titles: molds.map((m) => freeMoldName(m.title)),
      recipients: emails.length,
      sent: result.sent,
      error: result.error || null,
      test,
      sent_by: me,
    };
    await recordSend(row);
    console.log('send-free-molds', row);
    return res.status(result.error ? 502 : 200).json({ ...result, recipients: emails.length, to: test ? me : undefined });
  } catch (err) {
    console.error('send-free-molds', err);
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
    // Queda anotado en newsletter_optout: aunque sea usuario registrado o
    // comprador (publicos que no salen de newsletter_subscribers), no se le
    // vuelve a mandar nada. Best-effort: si la migracion 048 no corrio, igual
    // se lo saca de la lista de abajo.
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/newsletter_optout`, {
        method: 'POST',
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({ email }),
      });
    } catch (e) {
      console.warn('unsubscribe optout', e);
    }
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
    case 'email-buyer':
      return handleEmailBuyer(req, res);
    case 'indexnow-key':
      return handleIndexNowKey(req, res);
    case 'indexnow':
      return handleIndexNow(req, res);
    case 'upload-image':
      return handleUploadImage(req, res);
    case 'send-free-molds':
      return handleSendFreeMolds(req, res);
    case 'unsubscribe':
      return handleUnsubscribe(req, res);
    default:
      res.status(400).json({ error: 'Accion desconocida. Usa ?action=geo|notify-order|notify-buyer-paid|email-buyer|indexnow-key|indexnow|upload-image|send-free-molds|unsubscribe' });
  }
}
