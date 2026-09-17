// Webhook de Mercado Pago: confirma pagos SOLO, sin intervencion del admin.
//
// MP llama aca cuando un pago cambia de estado. NUNCA confiamos en lo que
// dice la notificacion: solo tomamos el id y consultamos el pago real a la
// API de MP con nuestro token. Recien si MP dice "approved" Y el monto
// cierra contra los precios REALES del catalogo, marcamos el pedido como
// pagado (lo que habilita la descarga). Si algo no cierra, el pedido queda
// "pendiente" y el admin lo revisa a mano como siempre — nunca se aprueba
// de mas, a lo sumo se aprueba de menos.
//
// Esto tambien neutraliza (para MP) el vector de "precio manipulado en el
// navegador": un pago menor al precio real de catalogo no se auto-aprueba.

import { sendBuyerPaidEmailCore } from './utils';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Opcional: secret del webhook (Mercado Pago > Tu integración > Webhooks >
// Firma secreta). Sin configurar, se sigue funcionando igual que siempre
// (nunca se aprueba nada sin consultar el pago real a la API de MP), pero
// cualquiera puede llamar a esta URL para forzar una consulta con nuestro
// token o para leer el estado/monto de un pago ajeno por prueba y error. Con
// la key configurada, una notificación sin firma válida se corta antes de
// tocar la API de MP.
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || '';

/** Valida la cabecera x-signature de Mercado Pago (HMAC-SHA256). */
async function verificarFirma(req: any, dataId: string): Promise<boolean> {
  if (!MP_WEBHOOK_SECRET) return true; // sin secret configurada: no se puede validar, no se bloquea
  const sig = String(req.headers['x-signature'] || '');
  const reqId = String(req.headers['x-request-id'] || '');
  const parts = Object.fromEntries(
    sig.split(',').map((p) => p.split('=').map((s) => s.trim())).filter((p) => p.length === 2),
  ) as Record<string, string>;
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  const manifest = `id:${dataId};request-id:${reqId};ts:${ts};`;
  const { createHmac } = await import('node:crypto');
  const expected = createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex');
  return expected === v1;
}

function extractPaymentId(req: any): string | null {
  // Formato webhook nuevo: body { type: "payment", data: { id } }
  // Formato IPN viejo: query ?topic=payment&id=...
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (body?.data?.id && (body.type === 'payment' || body.action?.startsWith('payment'))) {
      return String(body.data.id);
    }
    const q = req.query || {};
    const qid = q['data.id'] || q.id;
    if (qid && (q.type === 'payment' || q.topic === 'payment')) return String(Array.isArray(qid) ? qid[0] : qid);
  } catch {
    /* cuerpo raro: se ignora */
  }
  return null;
}

/** Precio real minimo de un producto entre todos sus formatos cargados. */
function precioMinimo(p: any): number {
  const candidatos = [
    p?.precio_carton, p?.precio_pdf_a4, p?.precio_pdf_ploter, p?.price,
    p?.precio_dxf, p?.precio_pds, p?.precio_mrk, p?.precio_ads,
  ]
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  return candidatos.length ? Math.min(...candidatos) : 0;
}

/**
 * Precio real del FORMATO especifico que el item dice haber comprado (el string
 * libre guardado en order_items.formato, ej "Moldes en Cartón", "DXF / AAMA").
 * Sin esto, alguien podia pagar el precio del formato mas barato y declarar
 * en el pedido el formato mas caro (el piso solo miraba el minimo global).
 * Si el formato no matchea nada conocido (pedidos viejos sin este campo, o
 * un valor inesperado) se cae al piso global de siempre: nunca mas estricto
 * de lo que ya funcionaba.
 */
function precioReal(p: any, formato: string | null | undefined): number {
  const f = (formato || '').toLowerCase();
  if (f.includes('cartón') || f.includes('carton')) return Number(p?.precio_carton) || 0;
  if (f.includes('plóter') || f.includes('ploter')) return Number(p?.precio_pdf_ploter) || 0;
  if (f.includes('pdf-a4') || f.includes('pdf a4')) return Number(p?.precio_pdf_a4) || Number(p?.price) || 0;
  if (f.includes('dxf') || f.includes('aama')) return Number(p?.precio_dxf) || 0;
  if (f.includes('pds')) return Number(p?.precio_pds) || 0;
  if (f.includes('mrk') || f.includes('tizado')) return Number(p?.precio_mrk) || 0;
  if (f.includes('ads') || f.includes('audaces')) return Number(p?.precio_ads) || 0;
  return precioMinimo(p);
}

// ---------------------------------------------------------------------------
// Ajuste de precio por talles: MISMA lógica que src/lib/sizeUtils.ts (no se
// puede importar de src/ desde api/ en este proyecto, ver comentario en
// api/sitemap.ts). Sin esto, un comprador que sacó talles en FormatOptions
// para bajar el precio (funcionalidad real, promocionada en la ficha) pagaba
// de menos frente al piso de "curva completa" de abajo y el pago quedaba
// SIEMPRE en revisión manual aunque Mercado Pago lo hubiera aprobado.
// ---------------------------------------------------------------------------
const ADULT_LETTERS = new Set(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']);
const DEFAULT_ADULT = new Set(['S', 'M', 'L', 'XL', '2XL']);
const DEFAULT_CHILD = new Set(['4', '6', '8', '10', '12', '14', '16']);
const DEFAULT_BABY = new Set(['1', '2', '3', '4', '5']);
const CHILD_ONLY = new Set(['10', '12', '14', '16', '18']);

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

const TALLE_ARS: Record<'carton' | 'pdf' | 'ploter', number> = { carton: 10_000, pdf: 3_000, ploter: 4_000 };

function tipoFormato(formato: string | null | undefined): 'carton' | 'pdf' | 'ploter' {
  const f = (formato || '').toLowerCase();
  if (f.includes('cart') || f.includes('carton')) return 'carton';
  if (f.includes('pl')) return 'ploter';
  return 'pdf';
}

/** Piso real de UN item: precio del formato ajustado por la cantidad de talles pedidos. */
function pisoDelItem(product: any, formato: string | null | undefined, sizesPedidos: string[] | null | undefined): number {
  const base = precioReal(product, formato);
  const disponibles: string[] = Array.isArray(product?.sizes) ? product.sizes : [];
  const defaults = getDefaultSizes(disponibles);
  const seleccionados = Array.isArray(sizesPedidos) && sizesPedidos.length ? sizesPedidos.length : defaults.length;
  const diff = seleccionados - defaults.length;
  return Math.max(0, base + diff * TALLE_ARS[tipoFormato(formato)]);
}

export default async function handler(req: any, res: any) {
  // MP reintenta si no respondemos 2xx; respondemos 200 siempre que la
  // notificacion sea procesable (aunque decidamos no aprobar), para no
  // acumular reintentos eternos.
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!MP_ACCESS_TOKEN || !SERVICE_ROLE) {
    console.error('mp-webhook: faltan MP_ACCESS_TOKEN o SUPABASE_SERVICE_ROLE_KEY');
    res.status(200).json({ ok: false, reason: 'sin configuracion' });
    return;
  }

  const paymentId = extractPaymentId(req);
  if (!paymentId) {
    res.status(200).json({ ok: true, reason: 'notificacion ignorada (no es de pago)' });
    return;
  }

  if (MP_WEBHOOK_SECRET && !(await verificarFirma(req, paymentId))) {
    console.warn(`mp-webhook: firma invalida para el pago ${paymentId}`);
    res.status(401).json({ error: 'Firma invalida' });
    return;
  }

  try {
    // 1. El pago REAL, directo de MP (unica fuente de verdad).
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!payRes.ok) {
      console.warn(`mp-webhook: pago ${paymentId} no consultable (${payRes.status})`);
      res.status(200).json({ ok: false, reason: 'pago no consultable' });
      return;
    }
    const pago = (await payRes.json()) as any;
    const orderId = pago?.external_reference;

    if (pago?.status !== 'approved' || !orderId) {
      res.status(200).json({ ok: true, reason: `estado ${pago?.status ?? 'desconocido'}, sin accion` });
      return;
    }

    // 2. El pedido nuestro, con items y precios reales de catalogo.
    const H = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };
    const ITEMS_SELECT =
      'order_items(quantity,formato,sizes,product:products(price,precio_carton,precio_pdf_a4,precio_pdf_ploter,precio_dxf,precio_pds,precio_mrk,precio_ads,sizes))';
    let orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
        `&select=id,total,payment_status,guest_email,currency,${ITEMS_SELECT}`,
      { headers: H },
    );
    if (!orderRes.ok) {
      // Resiliente: si la migracion que agrega orders.currency todavia no se
      // corrio en la base, reintenta sin esa columna (mismo patron ya usado
      // en CheckoutPage.tsx para cart_snapshot/formato/sizes) — un pago real
      // nunca deberia quedar sin auto-aprobar por esto.
      orderRes = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
          `&select=id,total,payment_status,guest_email,${ITEMS_SELECT}`,
        { headers: H },
      );
    }
    if (!orderRes.ok) throw new Error(`orders ${orderRes.status}`);
    const rows = (await orderRes.json()) as any[];
    const order = rows?.[0];
    if (!order) {
      console.warn(`mp-webhook: pago ${paymentId} aprobado pero pedido ${orderId} inexistente`);
      res.status(200).json({ ok: false, reason: 'pedido inexistente' });
      return;
    }
    if (order.payment_status === 'pagado') {
      res.status(200).json({ ok: true, reason: 'ya estaba pagado' });
      return;
    }

    // 3. Controles antes de aprobar solo. Si alguno falla: queda pendiente
    //    para revision manual (el flujo de siempre), nunca se aprueba.
    const monto = Number(pago.transaction_amount);
    const items = Array.isArray(order.order_items) ? order.order_items : [];
    // pisoDelItem ya ajusta por talles (menos talles => piso mas bajo): antes
    // esto comparaba siempre contra la curva COMPLETA, asi que cualquiera que
    // sacara talles (funcionalidad real, mas barata a proposito) quedaba
    // "pendiente" para siempre aunque Mercado Pago hubiera aprobado el pago
    // por el monto correcto.
    const pisoCatalogo = items.reduce(
      (sum: number, it: any) => sum + pisoDelItem(it?.product, it?.formato, it?.sizes) * (Number(it?.quantity) || 1),
      0,
    );

    const controles: string[] = [];
    // Mercado Pago en esta cuenta solo cobra en pesos. Si el pedido quedo
    // marcado en otra moneda (ver orders.currency, USD para compradores del
    // exterior via FormatOptions) no se puede auto-aprobar por MP: ese caso
    // ya deberia estar bloqueado en el checkout (no se ofrece MP si el pedido
    // es en USD), pero esto es la ultima barrera del lado del servidor.
    if (order.currency && order.currency !== 'ARS') controles.push(`pedido en ${order.currency}, Mercado Pago solo cobra ARS`);
    if (pago.currency_id !== 'ARS') controles.push(`moneda ${pago.currency_id}`);
    if (!Number.isFinite(monto) || monto < Number(order.total)) controles.push(`monto ${monto} < total ${order.total}`);
    if (!items.length) controles.push('pedido sin items para verificar');
    else if (Number(order.total) < pisoCatalogo) controles.push(`total ${order.total} < piso de catalogo ${pisoCatalogo}`);

    if (controles.length) {
      // El detalle completo (que antes viajaba en la respuesta publica) queda
      // solo en los logs del servidor: esta URL no exige autenticacion, asi
      // que cualquiera podia usarla para enterarse del estado/monto/piso de
      // un pedido ajeno con solo probar un id de pago.
      console.warn(`mp-webhook: pago ${paymentId} de pedido ${orderId} NO auto-aprobado: ${controles.join('; ')}`);
      res.status(200).json({ ok: false, reason: 'requiere revision manual' });
      return;
    }

    // 4. Todo cierra: marcar pagado (solo si sigue pendiente, nunca degradar).
    const up = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&payment_status=eq.pendiente`,
      {
        method: 'PATCH',
        headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ payment_status: 'pagado' }),
      },
    );
    if (!up.ok) throw new Error(`update ${up.status}`);

    // Best-effort, nunca bloquea la confirmacion del pago: guarda el id del
    // pago de MP (para poder identificar un cobro duplicado o reembolsar
    // desde el panel de MP) y, si es un invitado, le manda el mail con el
    // link de descarga que el checkout le prometio — antes esto SOLO pasaba
    // si un admin apretaba el boton a mano, asi que un pago auto-aprobado
    // (el camino mas comun) nunca avisaba a un comprador sin cuenta.
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ mp_payment_id: String(paymentId) }),
      });
    } catch (e) {
      console.warn('mp-webhook: no se pudo guardar mp_payment_id (¿falta la migracion de esa columna?)', e);
    }
    if (order.guest_email) {
      sendBuyerPaidEmailCore(orderId).catch((e) => console.warn('mp-webhook: fallo el mail al comprador', e));
    }

    console.log(`mp-webhook: pedido ${orderId} confirmado automaticamente (pago MP ${paymentId}, $${monto})`);
    res.status(200).json({ ok: true, confirmado: orderId });
  } catch (err) {
    console.error('mp-webhook error', err);
    // 500 real: que MP reintente mas tarde.
    res.status(500).json({ error: 'Error interno' });
  }
}
