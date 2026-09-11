// Serverless function: crea una preferencia de pago en Mercado Pago Checkout Pro.
// El Access Token vive como variable de entorno secreta en Vercel, nunca en el cliente.

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Trae el pedido REAL desde Supabase (service role), en vez de confiar en
 * lo que mande el navegador. Dos problemas que esto cierra:
 *
 * 1) Antes este endpoint armaba la preferencia de MP directo con el
 *    unit_price del body — cualquiera podía llamarlo con un precio
 *    inventado y generar un link de pago por lo que quisiera.
 *    order_items.price ya pasa la validación de piso mínimo de la
 *    migración 036 al insertarse, así que leerlo de ahí hereda esa
 *    protección. Si el insert de order_items falló, cae al respaldo
 *    cart_snapshot (mismo patrón que ya usan api/guest-order.ts y el panel admin).
 *
 * 2) Antes tampoco se verificaba que quien llama sea el dueño del pedido:
 *    con solo adivinar/conseguir un orderId ajeno (uuid, no es trivial,
 *    pero tampoco imposible si se filtra por otro medio) se le podía
 *    generar un link de pago a nombre de otra persona y de paso averiguar
 *    su email de invitado. Ahora se exige que el payerEmail que manda el
 *    checkout (ya lo manda siempre, ver CheckoutPage.tsx) coincida con el
 *    email real del dueño del pedido (guest_email, o el email de la
 *    cuenta si el pedido es de un usuario logueado).
 */
async function pedidoReal(orderId: string): Promise<{
  ok: boolean;
  status: string | null;
  ownerEmail: string | null;
  guestEmail: string | null;
  items: { id: string; title: string; quantity: number; unit_price: number }[];
}> {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
      `&select=payment_status,order_status,guest_email,cart_snapshot,` +
      `buyer:profiles(email),order_items(product_id,quantity,price,product_name)`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
  );
  if (!r.ok) return { ok: false, status: null, ownerEmail: null, guestEmail: null, items: [] };
  const rows = (await r.json()) as any[];
  const order = rows?.[0];
  if (!order) return { ok: false, status: null, ownerEmail: null, guestEmail: null, items: [] };

  const raw: any[] =
    order.order_items?.length ? order.order_items : (order.cart_snapshot || []);

  const items = raw
    .map((it: any) => ({
      id: String(it.product_id ?? ''),
      title: String(it.product_name || 'Molde'),
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.price) || 0,
    }))
    .filter((it) => it.id && it.unit_price > 0);

  const ownerEmail: string | null = order.guest_email || order.buyer?.email || null;

  return { ok: items.length > 0, status: order.payment_status, ownerEmail, guestEmail: order.guest_email || null, items };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!MP_ACCESS_TOKEN || !SERVICE_ROLE) {
    res.status(500).json({ error: 'Pagos no configurados' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { orderId, payerEmail } = body;

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({ error: 'orderId requerido' });
      return;
    }
    if (!payerEmail || typeof payerEmail !== 'string') {
      res.status(400).json({ error: 'payerEmail requerido' });
      return;
    }

    const pedido = await pedidoReal(orderId);
    if (pedido.status === null) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    // Solo el dueño del pedido (su email de invitado, o el email de su cuenta)
    // puede generar un link de pago para él. Sin esto, cualquiera con un
    // orderId ajeno podía generarle un pago a nombre de otra persona.
    if (!pedido.ownerEmail || pedido.ownerEmail.toLowerCase() !== payerEmail.trim().toLowerCase()) {
      res.status(403).json({ error: 'Este pedido no te pertenece.' });
      return;
    }
    if (pedido.status !== 'pendiente') {
      res.status(409).json({ error: 'Este pedido ya no está pendiente de pago.' });
      return;
    }
    if (!pedido.ok) {
      res.status(404).json({ error: 'No se encontraron los items de este pedido.' });
      return;
    }

    const volverA = pedido.guestEmail
      ? `https://modeltex.com.ar/mi-pedido?order=${orderId}&email=${encodeURIComponent(pedido.guestEmail)}`
      : `https://modeltex.com.ar/mis-compras`;

    const preference = {
      items: pedido.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS',
      })),
      payer: payerEmail ? { email: payerEmail } : undefined,
      back_urls: {
        success: `${volverA}${volverA.includes('?') ? '&' : '?'}pago=exitoso`,
        failure: `https://modeltex.com.ar/checkout?pago=fallido`,
        pending: `${volverA}${volverA.includes('?') ? '&' : '?'}pago=pendiente`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      statement_descriptor: 'MODELTEX',
      // Aviso automatico de pago: MP llama a este endpoint cuando el pago se
      // acredita y el pedido se marca "pagado" solo (ver api/mp-webhook.ts).
      notification_url: 'https://modeltex.com.ar/api/mp-webhook',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const detail = await mpRes.text();
      console.error('MP error', mpRes.status, detail);
      res.status(500).json({ error: 'Error al crear preferencia de MP' });
      return;
    }

    const data = await mpRes.json() as any;
    res.status(200).json({ init_point: data.init_point, preference_id: data.id });
  } catch (err) {
    console.error('create-preference error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}
