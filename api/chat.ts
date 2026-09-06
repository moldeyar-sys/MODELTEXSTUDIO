// Funcion serverless (corre en Vercel, del lado del servidor).
// Aca vive la clave de OpenRouter como SECRETO: nunca llega al navegador del cliente.
// El navegador llama a /api/chat y esta funcion reenvia el pedido a OpenRouter.

// Claves PUBLICAS de Supabase (solo lectura del catalogo activo para dar contexto).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';
// Secreta: solo para escribir el historial server-side (migración 033 cierra
// el INSERT público en chat_messages, así que esta escritura debe ignorar RLS).
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_EMBED_MODEL = process.env.OPENROUTER_EMBED_MODEL || 'openai/text-embedding-3-small';
const WHATSAPP = '5491166531086';

// Preguntas maximas para quien todavia no se creo una cuenta. Con cuenta: sin tope.
const ANON_MESSAGE_LIMIT = 10;

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };
type ProductRow = {
  name: string;
  codigo?: string;
  price: number;
  sale_price?: number | null;
  category: string;
  garment_type?: string;
  sizes?: string[];
  formats?: string[];
  recommended_fabrics?: string[];
};

function formatProductLine(p: ProductRow): string {
  const precio = p.sale_price ? `${p.sale_price} (oferta, antes ${p.price})` : `${p.price}`;
  const talles = (p.sizes || []).join('/') || 's/d';
  const formatos = (p.formats || []).join('/') || 's/d';
  const telas = (p.recommended_fabrics || []).join('/') || 's/d';
  const codigo = p.codigo ? ` [${p.codigo}]` : '';
  return `- ${p.name}${codigo} | ${p.category} | ${p.garment_type || 's/d'} | $${precio} | talles: ${talles} | formatos: ${formatos} | telas: ${telas}`;
}

// Si el navegador manda un token de sesion, confirma quien es (para no
// contar como "sin cuenta" a alguien que dice tener token pero es invalido).
async function getUserId(token: string | null): Promise<string | null> {
  if (!token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return user?.id || null;
  } catch {
    return null;
  }
}

// Cuantas preguntas ya mando esta sesion SIN cuenta (via funcion segura:
// no hace falta permiso de lectura general sobre chat_messages).
async function countSessionMessages(sessionId: string): Promise<number> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/count_session_messages`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_session_id: sessionId }),
    });
    if (!res.ok) return 0;
    return (await res.json()) as number;
  } catch {
    return 0;
  }
}

// Guarda un mensaje en el historial (best-effort: si falla, no interrumpe el chat).
// Usa la service role: chat_messages ya no acepta INSERT público (migración 033),
// asi que solo este endpoint (server-side) puede escribir el historial real.
async function logMessage(sessionId: string, userId: string | null, role: 'user' | 'assistant', content: string): Promise<void> {
  if (!SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ session_id: sessionId, user_id: userId, role, content: content.slice(0, 4000) }),
    });
  } catch {
    /* best-effort */
  }
}

// Trae la "memoria" editable del admin (tabla ai_settings, fila default).
async function getAdminKnowledge(): Promise<string> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/ai_settings?select=knowledge&id=eq.default`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return '';
    const rows = (await res.json()) as any[];
    return rows?.[0]?.knowledge?.trim() || '';
  } catch {
    return '';
  }
}

// Tope de productos que se le pasan al modelo como contexto.
// Antes eran 60 sobre un catalogo de ~566: el asistente "no veia" el 89% del
// catalogo y respondia que no teniamos moldes que si tenemos. Con la linea
// compacta de abajo, 600 productos entran holgados en la ventana del modelo.
const CATALOG_LIMIT = 600;

// Trae un resumen compacto del catalogo activo para que el asistente no invente.
async function getCatalogSummary(): Promise<string> {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?select=name,codigo,price,sale_price,category,garment_type,sizes,formats,recommended_fabrics` +
      `&is_active=eq.true&order=name.asc&limit=${CATALOG_LIMIT}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return '';
    const rows = (await res.json()) as any[];
    if (!Array.isArray(rows) || rows.length === 0) return 'El catalogo no tiene productos activos en este momento.';

    return `(${rows.length} moldes activos)\n${rows.map(formatProductLine).join('\n')}`;
  } catch {
    return '';
  }
}

// Busqueda por significado: convierte la ultima pregunta del cliente en un
// vector y trae los productos mas parecidos (no coincidencia de texto, sino
// de significado — "algo abrigado" encuentra "campera de frisa"). Requiere
// que el admin haya generado los embeddings del catalogo (panel admin,
// pestaña Productos). Si todavia no hay embeddings, devuelve null y el
// caller cae al catalogo completo de siempre.
async function getSemanticMatches(query: string, count = 10): Promise<string | null> {
  try {
    const embedRes = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://modeltex.com.ar',
        'X-Title': 'Modeltex Asistente',
      },
      body: JSON.stringify({ model: OPENROUTER_EMBED_MODEL, input: query.slice(0, 2000) }),
    });
    if (!embedRes.ok) {
      console.warn('semantic search: embeddings API', embedRes.status, '- fallback a catalogo completo');
      return null;
    }
    const embedData = (await embedRes.json()) as { data?: { embedding: number[] }[] };
    const queryEmbedding = embedData.data?.[0]?.embedding;
    if (!queryEmbedding) {
      console.warn('semantic search: respuesta sin embedding - fallback a catalogo completo');
      return null;
    }

    const matchRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_products`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query_embedding: queryEmbedding, match_count: count }),
    });
    if (!matchRes.ok) {
      // Caso tipico: la migracion 024 todavia no se corrio (RPC inexistente).
      console.warn('semantic search: rpc match_products', matchRes.status, '- fallback a catalogo completo');
      return null;
    }
    const rows = (await matchRes.json()) as ProductRow[];
    if (!Array.isArray(rows) || rows.length === 0) return null; // sin embeddings generados aun

    return rows.map(formatProductLine).join('\n');
  } catch (err) {
    console.warn('semantic search: error inesperado - fallback a catalogo completo', err);
    return null;
  }
}

function buildSystemPrompt(catalog: string, knowledge: string, catalogIsPartial: boolean): string {
  return [
    'Sos el asistente virtual de Modeltex, una tienda online que vende MOLDES DIGITALES de ropa para imprimir y producir.',
    'Los productos son archivos digitales (PDF A4, PDF Plotter, DXF, CDR, PLT, sublimacion) con DESCARGA INMEDIATA tras el pago. Se vende a todo el mundo.',
    '',
    // Base de conocimiento editable por el admin (rubro textil + info del sitio).
    ...(knowledge
      ? ['BASE DE CONOCIMIENTO (info oficial de Modeltex y del rubro textil; usala como fuente principal):', knowledge, '']
      : []),
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
    catalogIsPartial
      ? 'PRODUCTOS MAS RELEVANTES A LO QUE PREGUNTA EL CLIENTE (busqueda inteligente, no es el catalogo completo — si ninguno encaja bien, decilo y ofrece derivar a WhatsApp o diseño a medida en vez de asumir que no tenemos nada parecido):'
      : 'CATALOGO ACTUAL:',
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
    // Identifica la sesion (para historial y limite) y, si mando token, quien es.
    const sessionId = typeof body.sessionId === 'string' && body.sessionId ? body.sessionId.slice(0, 100) : null;
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || null;
    const userId = await getUserId(token);

    // Sanitiza: solo user/assistant, recorta largo y cantidad.
    const history = incoming
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const lastUserMessage = [...history].reverse().find((m) => m.role === 'user')?.content || '';

    // Limite de preguntas para quien no tiene cuenta. Se chequea ANTES de
    // gastar en OpenRouter: si ya llego al tope, ni se llama al modelo.
    if (sessionId && !userId && lastUserMessage) {
      const askedSoFar = await countSessionMessages(sessionId);
      if (askedSoFar >= ANON_MESSAGE_LIMIT) {
        res.status(200).json({
          reply:
            `Llegaste al máximo de ${ANON_MESSAGE_LIMIT} preguntas sin cuenta. Creá una cuenta gratis (es rápido) para seguir preguntando sin límite: /registro`,
          limitReached: true,
        });
        return;
      }
    }

    if (sessionId && lastUserMessage) {
      await logMessage(sessionId, userId, 'user', lastUserMessage);
    }

    const [semanticMatches, knowledge] = await Promise.all([
      lastUserMessage ? getSemanticMatches(lastUserMessage) : Promise.resolve(null),
      getAdminKnowledge(),
    ]);
    // Si hubo resultados de busqueda inteligente los usa (mas relevantes y mas
    // baratos); si no (todavia no se generaron embeddings, o es el primer
    // saludo sin pregunta), cae al volcado completo del catalogo de siempre.
    const catalog = semanticMatches ?? (await getCatalogSummary());
    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt(catalog, knowledge, semanticMatches !== null) },
      ...history,
    ];

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://modeltex.com.ar',
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
    if (sessionId) await logMessage(sessionId, userId, 'assistant', reply);
    res.status(200).json({ reply });
  } catch (err) {
    console.error('chat handler error', err);
    res.status(200).json({
      reply:
        'Tuve un inconveniente técnico. Escribinos por WhatsApp y te ayudamos enseguida: https://wa.me/' + WHATSAPP,
    });
  }
}
