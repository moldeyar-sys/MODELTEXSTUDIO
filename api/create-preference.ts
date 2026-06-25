// Serverless function: crea una preferencia de pago en Mercado Pago Checkout Pro.
// El Access Token vive como variable de entorno secreta en Vercel, nunca en el cliente.

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!MP_ACCESS_TOKEN) {
    res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { items, orderId, payerEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'items requeridos' });
      return;
    }

    const preference = {
      items: items.map((item: any) => ({
        id: item.product_id || item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: 'ARS',
      })),
      payer: payerEmail ? { email: payerEmail } : undefined,
      back_urls: {
        success: `https://modeltex.com.ar/mis-compras?pago=exitoso&order=${orderId}`,
        failure: `https://modeltex.com.ar/checkout?pago=fallido`,
        pending: `https://modeltex.com.ar/mis-compras?pago=pendiente&order=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      statement_descriptor: 'MODELTEX',
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
