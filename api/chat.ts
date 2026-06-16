// Funcion serverless (corre en Vercel, del lado del servidor).
// Aca vive la clave de OpenRouter como SECRETO: nunca llega al navegador del cliente.
// El navegador llama a /api/chat y esta funcion reenvia el pedido a OpenRouter.

// Claves PUBLICAS de Supabase (solo lectura del catalogo activo para dar contexto).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const WHATSAPP = '5491166531086';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

// Trae un resumen compacto del catalogo activo para que el asistente no invente.
async function getCatalogSummary(): Promise<string> {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?select=name,price,sale_price,category,garment_type,sizes,formats,recommended_fabrics,short_description` +
      `&is_active=eq.true&order=created_at.desc&limit=60`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return '';
    const rows = (await res.json()) as any[];
    if (!Array.isArray(rows) || rows.length === 0) return 'El catalogo no tiene productos activos en este momento.';
    return rows
      .map((p) => {
        const precio = p.sale_price ? `${p.sale_price} (oferta, antes ${p.price})` : `${p.price}`;
        const talles = (p.sizes || []).join(', ') || 's/d';
        const formatos = (p.formats || []).join(', ') || 's/d';
        const telas = (p.recommended_fabrics || []).join(', ') || 's/d';
        return `- ${p.name} | categoria: ${p.category} | prenda: ${p.garment_type || 's/d'} | precio: ${precio} | talles: ${talles} | formatos: ${formatos} | telas: ${telas}`;
      })
      .join('\n');
  } catch {
    return '';
  }
}

function buildSystemPrompt(catalog: string): string {
  return [
    'Sos el asistente virtual de Modeltex, una tienda online que vende MOLDES DIGITALES de ropa para imprimir y producir.',
    'Los productos son archivos digitales (PDF A4, PDF Plotter, DXF, CDR, PLT, sublimacion) con DESCARGA INMEDIATA tras el pago. Se vende a todo el mundo.',
    '',
    'TU ESTILO:',
    '- Respondes SIEMPRE en español rioplatense, claro, amable y breve (2-5 frases).',
    '- Sos cordial y vendedor, pero nunca inventas datos.',
    '- Si no sabes algo o el cliente quiere hablar con una persona, deriva a WhatsApp: https://wa.me/' + WHATSAPP,
    '',
    'QUE PODES RESPONDER:',
    '- Productos disponibles, talles incluidos, formatos y telas recomendadas (usa el CATALOGO de abajo, no inventes productos que no esten).',
    '- Precios (los del catalogo).',
    '- Formas de pago: Mercado Pago, PayPal, tarjeta (Stripe), transferencia bancaria y Binance/cripto.',
    '- Como comprar: agregar al carrito y pagar; la descarga queda disponible en la seccion "Descargas" tras confirmarse el pago.',
    '- Diseño a pedido (molde a medida): se solicita desde la pagina "Diseño a pedido".',
    '- Si piden algo que no esta en el catalogo, ofrece el diseño a pedido o derivar a WhatsApp.',
    '',
    'REGLAS:',
    '- No prometas plazos ni descuentos que no figuren.',
    '- No pidas datos sensibles (tarjetas, contraseñas).',
    '- Si preguntan por una compra puntual ya realizada, deriva a WhatsApp.',
    '',
    'CATALOGO ACTUAL:',
    catalog || '(no se pudo cargar el catalogo en este momento)',
  ].join('\n');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!OPENROUTER_API_KEY) {
    res.status(200).json({
      reply:
        'El asistente todavía no está configurado (falta la clave de OpenRouter). Mientras tanto podés escribirnos por WhatsApp: https://wa.me/' +
        WHATSAPP,
    });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const incoming: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    // Sanitiza: solo user/assistant, recorta largo y cantidad.
    const history = incoming
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const catalog = await getCatalogSummary();
    const messages: ChatMessage[] = [{ role: 'system', content: buildSystemPrompt(catalog) }, ...history];

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://modeltexstudio.com',
        'X-Title': 'Modeltex Asistente',
      },
      body: JSON.stringify({ model: OPENROUTER_MODEL, messages, temperature: 0.4, max_tokens: 600 }),
    });

    if (!orRes.ok) {
      const detail = await orRes.text();
      console.error('OpenRouter error', orRes.status, detail);
      res.status(200).json({
        reply:
          'Uy, tuve un problema para responder en este momento. Probá de nuevo en un ratito o escribinos por WhatsApp: https://wa.me/' +
          WHATSAPP,
      });
      return;
    }

    const data = (await orRes.json()) as any;
    const reply = data?.choices?.[0]?.message?.content?.trim() || 'No pude generar una respuesta. Probá de nuevo.';
    res.status(200).json({ reply });
  } catch (err) {
    console.error('chat handler error', err);
    res.status(200).json({
      reply:
        'Tuve un inconveniente técnico. Escribinos por WhatsApp y te ayudamos enseguida: https://wa.me/' + WHATSAPP,
    });
  }
}
