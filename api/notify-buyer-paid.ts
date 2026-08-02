// Funcion serverless: le avisa por mail al COMPRADOR (no al dueño, para eso
// esta notify-order.ts) que su pedido ya esta pagado y listo. Solo tiene
// sentido para pedidos de invitado (sin cuenta): un usuario con cuenta ya
// puede ver el estado entrando a "Mis compras". El panel admin la llama
// cuando el admin marca un pedido de invitado como "pagado".
//
// Reusa el mismo Resend ya configurado para avisarle al dueño de compras
// nuevas (variables RESEND_API_KEY / NOTIFY_FROM).

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  // Solo el admin puede disparar este mail: sin este chequeo, cualquiera con
  // un orderId podria hacer que le reenviemos el mail de "pedido listo" a un
  // cliente ajeno tantas veces como quisiera.
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) {
    res.status(403).json({ error: 'Esta accion es solo para administradores.' });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!SERVICE_ROLE || !resendKey) {
    // No es un error del comprador ni bloquea nada: el admin igual puede marcar
    // el pedido como pagado, simplemente no sale el mail automatico.
    res.status(200).json({ ok: false, skipped: true });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) {
      res.status(400).json({ error: 'orderId requerido' });
      return;
    }

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,total,guest_email,payment_status`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (!orderRes.ok) throw new Error(`Supabase orders ${orderRes.status}`);
    const rows = (await orderRes.json()) as any[];
    const order = rows?.[0];

    if (!order || !order.guest_email || order.payment_status !== 'pagado') {
      res.status(200).json({ ok: false, skipped: true });
      return;
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
      res.status(200).json({ ok: false, error: `resend ${r.status}` });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('notify-buyer-paid error', err);
    res.status(500).json({ error: 'Error interno' });
  }
}
