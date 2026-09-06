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

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
        `&select=id,total,payment_status,order_items(quantity,formato,product:products(price,precio_carton,precio_pdf_a4,precio_pdf_ploter,precio_dxf,precio_pds,precio_mrk,precio_ads))`,
      { headers: H },
    );
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
    const pisoCatalogo = items.reduce(
      (sum: number, it: any) => sum + precioReal(it?.product, it?.formato) * (Number(it?.quantity) || 1),
      0,
    );

    const controles: string[] = [];
    if (pago.currency_id !== 'ARS') controles.push(`moneda ${pago.currency_id}`);
    if (!Number.isFinite(monto) || monto < Number(order.total)) controles.push(`monto ${monto} < total ${order.total}`);
    if (!items.length) controles.push('pedido sin items para verificar');
    else if (Number(order.total) < pisoCatalogo) controles.push(`total ${order.total} < piso de catalogo ${pisoCatalogo}`);

    if (controles.length) {
      console.warn(`mp-webhook: pago ${paymentId} de pedido ${orderId} NO auto-aprobado: ${controles.join('; ')}`);
      res.status(200).json({ ok: false, reason: 'requiere revision manual', detalle: controles });
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

    console.log(`mp-webhook: pedido ${orderId} confirmado automaticamente (pago MP ${paymentId}, $${monto})`);
    res.status(200).json({ ok: true, confirmado: orderId });
  } catch (err) {
    console.error('mp-webhook error', err);
    // 500 real: que MP reintente mas tarde.
    res.status(500).json({ error: 'Error interno' });
  }
}
