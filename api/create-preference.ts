// Serverless function: crea una preferencia de pago en Mercado Pago Checkout Pro.
// El Access Token vive como variable de entorno secreta en Vercel, nunca en el cliente.

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// El comprador invitado no tiene cuenta: mandarlo a /mis-compras tras pagar
// lo estrella contra la pantalla de login. Se mira el pedido real para saber
// si es invitado y devolverlo a SU pagina (/mi-pedido), donde con el pago ya
// auto-confirmado por el webhook le aparecen las descargas directamente.
async function esInvitado(orderId: string): Promise<string | null> {
  if (!SERVICE_ROLE || !orderId) return null;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=guest_email&limit=1`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (!r.ok) return null;
    const rows = (await r.json()) as Array<{ guest_email?: string | null }>;
    return rows?.[0]?.guest_email || null;
  } catch {
    return null;
  }
}

/**
 * Trae los items REALES del pedido desde Supabase (service role), en vez de
 * confiar en lo que mande el navegador. Antes este endpoint armaba la
 * preferencia de MP directo con el unit_price del body — cualquiera podía
 * llamarlo con un precio inventado y generar un link de pago por lo que
 * quisiera. order_items.price ya pasa la validación de piso mínimo de la
 * migración 036 al insertarse, así que leerlo de ahí hereda esa protección.
 * Si por algún motivo el insert de order_items falló, se cae al respaldo
 * cart_snapshot (mismo patrón que ya usan api/guest-order.ts y el panel admin).
 */
async function itemsReales(orderId: string): Promise<{
  ok: boolean;
  status: string | null;
  items: { id: string; title: string; quantity: number; unit_price: number }[];
}> {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
      `&select=payment_status,order_status,cart_snapshot,order_items(product_id,quantity,price,product_name)`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
  );
  if (!r.ok) return { ok: false, status: null, items: [] };
  const rows = (await r.json()) as any[];
  const order = rows?.[0];
  if (!order) return { ok: false, status: null, items: [] };

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

  return { ok: items.length > 0, status: order.payment_status, items };
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

    const pedido = await itemsReales(orderId);
    if (pedido.status !== 'pendiente') {
      res.status(409).json({ error: 'Este pedido ya no está pendiente de pago.' });
      return;
    }
    if (!pedido.ok) {
      res.status(404).json({ error: 'No se encontraron los items de este pedido.' });
      return;
    }

    const guestEmail = await esInvitado(orderId);
    const volverA = guestEmail
      ? `https://modeltex.com.ar/mi-pedido?order=${orderId}&email=${encodeURIComponent(guestEmail)}`
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
