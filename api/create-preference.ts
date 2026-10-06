// Serverless function: crea una preferencia de pago en Mercado Pago Checkout Pro.
// El Access Token vive como variable de entorno secreta en Vercel, nunca en el cliente.

import { pisoDelItem, PRODUCT_PRICE_COLUMNS } from './utils.js';

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
  currency: string | null;
  ownerEmail: string | null;
  guestEmail: string | null;
  formatoInvalido: string | null;
  items: { id: string; title: string; quantity: number; unit_price: number }[];
}> {
  const NO_ENCONTRADO = { ok: false, status: null, currency: null, ownerEmail: null, guestEmail: null, formatoInvalido: null, items: [] };
  const ITEMS = 'order_items(product_id,quantity,price,formato,sizes,product_name)';
  let r = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
      `&select=payment_status,order_status,guest_email,currency,cart_snapshot,buyer:profiles(email),${ITEMS}`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
  );
  if (!r.ok) {
    // Resiliente: si la migracion que agrega orders.currency todavia no se
    // corrio, reintenta sin esa columna (ver mismo patron en mp-webhook.ts).
    r = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
        `&select=payment_status,order_status,guest_email,cart_snapshot,buyer:profiles(email),${ITEMS}`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
  }
  if (!r.ok) return NO_ENCONTRADO;
  const rows = (await r.json()) as any[];
  const order = rows?.[0];
  if (!order) return NO_ENCONTRADO;

  const usandoRespaldo = !order.order_items?.length;
  const raw: any[] = usandoRespaldo ? (order.cart_snapshot || []) : order.order_items;

  // Tanto order_items.price como cart_snapshot los escribe el NAVEGADOR (ver
  // CheckoutPage.tsx). order_items.price pasa el trigger de piso de la base
  // (migración 042), pero ese piso es el 15 % del precio real: antes el link
  // de pago se armaba con ese valor tal cual, así que se podía pagar por MP
  // el 15 % del molde. Ahora el precio que se cobra es SIEMPRE el mayor entre
  // lo que dice el pedido y el precio real de catálogo del formato declarado
  // (ajustado por talles, misma función que valida el webhook). Si el
  // formato declarado no se vende en ese producto, no se arma link de pago.
  const preciosReales = new Map<string, any>();
  const ids = Array.from(new Set(raw.map((it: any) => it.product_id).filter(Boolean)));
  if (ids.length) {
    const pRes = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=in.(${ids.map(encodeURIComponent).join(',')})&select=${PRODUCT_PRICE_COLUMNS}`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (pRes.ok) {
      for (const p of (await pRes.json()) as any[]) preciosReales.set(p.id, p);
    }
  }

  let formatoInvalido: string | null = null;
  const items = raw
    .map((it: any) => {
      const product = preciosReales.get(it.product_id);
      const piso = pisoDelItem(product, it.formato, it.sizes);
      if (piso === null) {
        formatoInvalido = String(it.formato ?? '(sin formato)');
        return null;
      }
      const declarado = usandoRespaldo ? 0 : Number(it.price) || 0;
      return {
        id: String(it.product_id ?? ''),
        title: String(product?.name || it.product_name || 'Molde'),
        quantity: Number(it.quantity) || 1,
        unit_price: Math.max(declarado, piso),
      };
    })
    .filter((it): it is NonNullable<typeof it> => !!it && !!it.id && it.unit_price > 0);

  const ownerEmail: string | null = order.guest_email || order.buyer?.email || null;

  return {
    ok: items.length > 0,
    status: order.payment_status,
    currency: order.currency ?? null,
    ownerEmail,
    guestEmail: order.guest_email || null,
    formatoInvalido,
    items,
  };
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
    if (pedido.formatoInvalido !== null) {
      res.status(400).json({ error: 'Uno de los formatos del pedido no está disponible para ese molde. Volvé a armar el carrito o escribinos por WhatsApp.' });
      return;
    }
    if (!pedido.ok) {
      res.status(404).json({ error: 'No se encontraron los items de este pedido.' });
      return;
    }
    // Mercado Pago en esta cuenta solo cobra en pesos argentinos. Un pedido
    // en USD (comprador fuera de Argentina, ver FormatOptions/useCountry) no
    // se puede cobrar correctamente por acá: antes esto armaba una
    // preferencia igual con currency_id fijo en 'ARS' y cobraba el número en
    // dólares como si fueran pesos (24 dólares -> 24 pesos).
    if (pedido.currency && pedido.currency !== 'ARS') {
      res.status(400).json({ error: 'Mercado Pago no está disponible para pedidos en dólares. Elegí PayPal, Payoneer, Wise, transferencia o cripto.' });
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
        // Antes mandaba siempre a /checkout?pago=fallido: como el carrito ya
        // se vació antes de redirigir a MP (ver CheckoutPage.tsx) y esa
        // pantalla no sabe nada del pedido, el comprador volvía a un
        // "carrito vacío" sin ninguna forma de reintentar el pago del pedido
        // que quedó pendiente. Ahora vuelve al mismo lugar que success/pending
        // (su pedido, con cuenta o de invitado), donde sí hay un botón para
        // volver a generar el link de pago (MyOrdersPage.tsx / MyGuestOrderPage.tsx).
        failure: `${volverA}${volverA.includes('?') ? '&' : '?'}pago=fallido`,
        pending: `${volverA}${volverA.includes('?') ? '&' : '?'}pago=pendiente`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      statement_descriptor: 'MODELTEX',
      // Aviso automatico de pago: MP llama a este endpoint cuando el pago se
      // acredita y el pedido se marca "pagado" solo (ver api/mp-webhook.ts).
      notification_url: 'https://modeltex.com.ar/api/mp-webhook',
      // Sin esto el link de pago quedaba vivo para siempre: si alguien volvia
      // a pagar por el mismo link semanas despues (o MP reintentaba un pago
      // duplicado del comprador), el webhook lo descartaba en silencio como
      // "ya estaba pagado" sin que nadie se enterara del cobro doble. 24hs
      // alcanza de sobra para completar un pago normal.
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
