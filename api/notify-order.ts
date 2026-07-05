// Serverless function: avisa al dueño (WhatsApp + email) cuando entra una compra.
//
// El cliente solo envía { orderId }. La función lee el detalle REAL del pedido
// desde Supabase con la service role, así nadie puede falsificar el contenido del aviso.
//
// Variables de entorno (se cargan en Vercel, nunca en el cliente):
//   SUPABASE_SERVICE_ROLE_KEY  -> clave secreta de Supabase (Settings > API > service_role)
//   NOTIFY_EMAIL               -> a qué mail te llega el aviso
//   RESEND_API_KEY             -> API key de https://resend.com (para el email)
//   NOTIFY_FROM (opcional)     -> remitente; por defecto onboarding@resend.dev
//   CALLMEBOT_PHONE            -> tu WhatsApp en formato internacional sin +  (ej: 5493511234567)
//   CALLMEBOT_APIKEY           -> clave que te da el bot de CallMeBot
// Cada canal es opcional: si no cargaste sus variables, ese canal simplemente se saltea.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const paymentLabels: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  transfer: 'Transferencia',
  paypal: 'PayPal',
  binance: 'Binance / Cripto',
  stripe: 'Tarjeta (Stripe)',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!SERVICE_ROLE) {
    console.error('notify-order: falta SUPABASE_SERVICE_ROLE_KEY');
    res.status(500).json({ error: 'Notificaciones no configuradas' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { orderId } = body;
    if (!orderId) {
      res.status(400).json({ error: 'orderId requerido' });
      return;
    }

    // Leer el pedido real desde Supabase (REST) con la service role.
    const query =
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}` +
      `&select=id,total,payment_method,payment_status,created_at,` +
      `order_items(quantity,price,formato,sizes,product_name,product:products(name)),` +
      `buyer:profiles(email,whatsapp,full_name)`;

    const dbRes = await fetch(query, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    if (!dbRes.ok) {
      console.error('notify-order: error leyendo pedido', dbRes.status, await dbRes.text());
      res.status(500).json({ error: 'No se pudo leer el pedido' });
      return;
    }
    const rows = (await dbRes.json()) as any[];
    const order = rows?.[0];
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    // Componer el detalle legible.
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

    // ---------- WhatsApp (CallMeBot) ----------
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

    // ---------- Email (Resend) ----------
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

    res.status(200).json({ ok: true, results });
  } catch (err) {
    console.error('notify-order error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}
