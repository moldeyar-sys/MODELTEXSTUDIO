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
// Contexto opcional de MODELTEX LAB: cuando el alumno pregunta desde adentro
// de una clase, el frontend manda estos slugs para que el tutor priorice esa
// clase en vez de responder de forma genérica.
type LabContext = { courseSlug?: string; moduleSlug?: string; lessonSlug?: string };
type LabSource = { title: string; url: string };
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

// sessionId lo genera y manda el propio navegador: borrar el localStorage
// resetea el contador de arriba a cero. Este segundo conteo por IP (24hs)
// es mas dificil de rotar sin cambiar de red.
async function countIpMessagesToday(ip: string): Promise<number> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/count_ip_messages_today`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_ip: ip }),
    });
    if (!res.ok) return 0;
    return (await res.json()) as number;
  } catch {
    return 0;
  }
}

// IP real del visitante detras del proxy de Vercel.
function getClientIp(req: any): string | null {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim();
  return first || req.headers['x-real-ip'] || null;
}

// Guarda un mensaje en el historial (best-effort: si falla, no interrumpe el chat).
// Usa la service role: chat_messages ya no acepta INSERT público (migración 033),
// asi que solo este endpoint (server-side) puede escribir el historial real.
async function logMessage(
  sessionId: string,
  userId: string | null,
  role: 'user' | 'assistant',
  content: string,
  labContext?: string,
  ip?: string | null,
): Promise<void> {
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
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        role,
        content: content.slice(0, 4000),
        lab_context: labContext || null,
        ip_address: ip || null,
      }),
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

// Convierte texto en un vector de embedding via OpenRouter. Compartido entre
// la busqueda semantica del catalogo y la del contenido de MODELTEX LAB.
async function embedQuery(query: string): Promise<number[] | null> {
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
      console.warn('embedQuery: embeddings API', embedRes.status);
      return null;
    }
    const embedData = (await embedRes.json()) as { data?: { embedding: number[] }[] };
    return embedData.data?.[0]?.embedding || null;
  } catch (err) {
    console.warn('embedQuery: error inesperado', err);
    return null;
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
    const queryEmbedding = await embedQuery(query);
    if (!queryEmbedding) {
      console.warn('semantic search: sin embedding - fallback a catalogo completo');
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

// ==================== MODELTEX LAB: tutor IA del curso ====================

type LabLessonRow = {
  title: string;
  objective: string;
  concept: string;
  development: { h3?: string; paragraphs?: string[]; bullets?: string[] }[] | null;
  example: string;
  modeltex_tip: string;
  summary: string;
};

// Trae SIEMPRE el contenido completo de la clase actual (si el alumno esta
// adentro de una) para que el tutor la priorice, aunque todavia no se hayan
// generado embeddings de MODELTEX LAB (a diferencia del catalogo, acá no
// dependemos solo de la busqueda semantica para el contexto inmediato).
async function getCurrentLessonContent(lab: LabContext): Promise<string | null> {
  if (!lab.courseSlug || !lab.moduleSlug || !lab.lessonSlug) return null;
  try {
    const courseRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lab_courses?select=id&slug=eq.${encodeURIComponent(lab.courseSlug)}&status=eq.published`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    const courses = (await courseRes.json()) as { id: string }[];
    const courseId = courses?.[0]?.id;
    if (!courseId) return null;

    const moduleRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lab_modules?select=id&course_id=eq.${courseId}&slug=eq.${encodeURIComponent(lab.moduleSlug)}&status=eq.published`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    const modules = (await moduleRes.json()) as { id: string }[];
    const moduleId = modules?.[0]?.id;
    if (!moduleId) return null;

    const lessonRes = await fetch(
      `${SUPABASE_URL}/rest/v1/lab_lessons?select=title,objective,concept,development,example,modeltex_tip,summary&module_id=eq.${moduleId}&slug=eq.${encodeURIComponent(lab.lessonSlug)}&status=eq.published`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    const lessons = (await lessonRes.json()) as LabLessonRow[];
    const lesson = lessons?.[0];
    if (!lesson) return null;

    const devText = (lesson.development || [])
      .map((b) => [b.h3, ...(b.paragraphs || []), ...(b.bullets || []).map((x) => `- ${x}`)].filter(Boolean).join('\n'))
      .join('\n');

    return [
      `Título: ${lesson.title}`,
      lesson.objective && `Qué se aprende: ${lesson.objective}`,
      lesson.concept && `Concepto: ${lesson.concept}`,
      devText && `Desarrollo:\n${devText}`,
      lesson.example && `Ejemplo práctico: ${lesson.example}`,
      lesson.modeltex_tip && `Consejo Modeltex: ${lesson.modeltex_tip}`,
      lesson.summary && `Resumen: ${lesson.summary}`,
    ]
      .filter(Boolean)
      .join('\n');
  } catch (err) {
    console.warn('getCurrentLessonContent: error', err);
    return null;
  }
}

// Busqueda semantica sobre el contenido publicado de MODELTEX LAB (clases,
// modulos, cursos, glosario), para profundizar o cruzar con otras clases
// ademas de la actual. Devuelve tambien las fuentes reales usadas (nunca
// inventadas) para que el frontend muestre "Basado en: ...".
async function getLabSemanticMatches(
  query: string,
  courseSlug: string | undefined,
  count = 6,
): Promise<{ text: string; sources: LabSource[] } | null> {
  try {
    const queryEmbedding = await embedQuery(query);
    if (!queryEmbedding) return null;

    const matchRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_lab_chunks`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_embedding: queryEmbedding, match_count: count, p_course_slug: courseSlug || null }),
    });
    if (!matchRes.ok) return null;
    const rows = (await matchRes.json()) as {
      title: string;
      content: string;
      course_slug: string;
      module_slug: string;
      lesson_slug: string;
      source_type: string;
    }[];
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const sources: LabSource[] = rows.map((r) => ({
      title: r.title,
      url:
        r.source_type === 'lesson' && r.course_slug && r.module_slug && r.lesson_slug
          ? `/lab/${r.course_slug}/${r.module_slug}/${r.lesson_slug}`
          : r.source_type === 'glossary'
            ? `/lab/glosario/${r.lesson_slug || ''}`
            : r.course_slug
              ? `/lab/${r.course_slug}`
              : '/lab',
    }));
    const text = rows.map((r) => `[${r.title}]\n${r.content}`).join('\n\n');
    return { text, sources };
  } catch (err) {
    console.warn('getLabSemanticMatches: error', err);
    return null;
  }
}

function buildLabSystemPrompt(currentLesson: string | null, related: string | null, lab: LabContext): string {
  return [
    'Sos el profesor/asistente virtual de MODELTEX LAB, el curso gratuito de moldería textil de Modeltex (moldería a medida y moldería industrial).',
    'Tu rol es pedagógico: explicás conceptos de moldería y producción textil con claridad, como un profesor paciente, no como un vendedor.',
    '',
    'TU ESTILO:',
    '- Español rioplatense, claro y didáctico. Podés extenderte más que un chat de ventas (hasta 6-8 frases) si la explicación lo pide.',
    '- Si el alumno está dentro de una clase, priorizá SIEMPRE el contenido de esa clase (más abajo) antes que conocimiento general.',
    '- Podés reformular con otras palabras, dar ejemplos adicionales o aclarar dudas puntuales, pero sin contradecir el contenido oficial de la clase.',
    '- Si la pregunta tiene intención de negocio real (fabricar en cantidad, lanzar una marca, necesitar moldería industrial/digitalización), podés mencionar el servicio de Modeltex relevante UNA sola vez, de forma breve — nunca conviertas la respuesta en publicidad.',
    '- Nunca inventes datos, técnicas o cifras que no estén en el contenido provisto.',
    '',
    currentLesson
      ? `CLASE ACTUAL (${lab.courseSlug}/${lab.moduleSlug}/${lab.lessonSlug}) — priorizar esta información:\n${currentLesson}`
      : 'El alumno no está dentro de una clase puntual: respondé de forma general sobre moldería y producción textil.',
    '',
    related ? `CONTENIDO RELACIONADO de otras clases/glosario de MODELTEX LAB:\n${related}` : '',
  ]
    .filter((line) => line !== '')
    .join('\n');
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
    // MODELTEX LAB: si el frontend manda `lab`, este mensaje viene del tutor
    // del curso (clase puntual o /lab/ia general), no del asesor comercial.
    const rawLab = body.lab;
    const lab: LabContext | null =
      rawLab && typeof rawLab === 'object'
        ? {
            courseSlug: typeof rawLab.courseSlug === 'string' ? rawLab.courseSlug.slice(0, 100) : undefined,
            moduleSlug: typeof rawLab.moduleSlug === 'string' ? rawLab.moduleSlug.slice(0, 100) : undefined,
            lessonSlug: typeof rawLab.lessonSlug === 'string' ? rawLab.lessonSlug.slice(0, 100) : undefined,
          }
        : null;

    // Sanitiza: solo user/assistant, recorta largo y cantidad.
    const history = incoming
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const lastUserMessage = [...history].reverse().find((m) => m.role === 'user')?.content || '';

    const clientIp = getClientIp(req);

    // Limite de preguntas para quien no tiene cuenta. Se chequea ANTES de
    // gastar en OpenRouter: si ya llego al tope, ni se llama al modelo.
    // Dos conteos combinados: por sessionId (lo manda el navegador, se
    // resetea borrando localStorage) y por IP+dia (mas dificil de rotar).
    if (sessionId && !userId && lastUserMessage) {
      const [askedSoFar, askedFromIpToday] = await Promise.all([
        countSessionMessages(sessionId),
        clientIp ? countIpMessagesToday(clientIp) : Promise.resolve(0),
      ]);
      if (askedSoFar >= ANON_MESSAGE_LIMIT || askedFromIpToday >= ANON_MESSAGE_LIMIT) {
        res.status(200).json({
          reply:
            `Llegaste al máximo de ${ANON_MESSAGE_LIMIT} preguntas sin cuenta. Creá una cuenta gratis (es rápido) para seguir preguntando sin límite: /registro`,
          limitReached: true,
        });
        return;
      }
    }

    const labContextLabel = lab
      ? [lab.courseSlug, lab.moduleSlug, lab.lessonSlug].filter(Boolean).join('/')
      : undefined;

    if (sessionId && lastUserMessage) {
      await logMessage(sessionId, userId, 'user', lastUserMessage, labContextLabel, clientIp);
    }

    let messages: ChatMessage[];
    let sources: LabSource[] = [];

    if (lab) {
      // Tutor de MODELTEX LAB: prioriza la clase actual (si hay) + contenido
      // relacionado via busqueda semantica sobre lab_chunks.
      const [currentLesson, related] = await Promise.all([
        getCurrentLessonContent(lab),
        lastUserMessage ? getLabSemanticMatches(lastUserMessage, lab.courseSlug, 6) : Promise.resolve(null),
      ]);
      sources = related?.sources || [];
      messages = [
        { role: 'system', content: buildLabSystemPrompt(currentLesson, related?.text || null, lab) },
        ...history,
      ];
    } else {
      const [semanticMatches, knowledge] = await Promise.all([
        lastUserMessage ? getSemanticMatches(lastUserMessage) : Promise.resolve(null),
        getAdminKnowledge(),
      ]);
      // Si hubo resultados de busqueda inteligente los usa (mas relevantes y mas
      // baratos); si no (todavia no se generaron embeddings, o es el primer
      // saludo sin pregunta), cae al volcado completo del catalogo de siempre.
      const catalog = semanticMatches ?? (await getCatalogSummary());
      messages = [
        { role: 'system', content: buildSystemPrompt(catalog, knowledge, semanticMatches !== null) },
        ...history,
      ];
    }

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://modeltex.com.ar',
        'X-Title': lab ? 'Modeltex Lab' : 'Modeltex Asistente',
      },
      body: JSON.stringify({ model: OPENROUTER_MODEL, messages, temperature: 0.4, max_tokens: lab ? 800 : 600 }),
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
    if (sessionId) await logMessage(sessionId, userId, 'assistant', reply, labContextLabel);
    res.status(200).json(lab ? { reply, sources } : { reply });
  } catch (err) {
    console.error('chat handler error', err);
    res.status(200).json({
      reply:
        'Tuve un inconveniente técnico. Escribinos por WhatsApp y te ayudamos enseguida: https://wa.me/' + WHATSAPP,
    });
  }
}
