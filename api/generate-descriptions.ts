// Funcion serverless (Vercel). Genera BORRADORES de descripcion corta para
// productos que no tienen (hoy: el 100% del catalogo). A diferencia de
// embed-catalog.ts, esta funcion NUNCA escribe en la base: devuelve los
// textos generados para que el admin los revise, edite o descarte, y sea
// otra llamada (el PATCH normal que ya usa el formulario de producto) la
// que finalmente los guarda. La revision humana es el punto central del
// diseño, no un detalle.
//
// Seguridad: mismo patron que embed-catalog.ts — sin clave de servicio,
// se reenvia el token del admin logueado y se verifica is_admin() antes
// de gastar en OpenRouter.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const TEXT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

// Chico a proposito: cada producto suma tokens al prompt y a la respuesta,
// y la funcion tiene un tiempo maximo de ejecucion.
const BATCH_SIZE = 15;

const MIN_MS_BETWEEN_CALLS = 1500;
let lastCallAt = 0;

type RawProduct = {
  id: string;
  name: string;
  garment_type: string | null;
  category: string;
  sizes: string[] | null;
  formats: string[] | null;
  recommended_fabrics: string[] | null;
};

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

const SYSTEM_PROMPT = [
  'Sos redactor de fichas de producto para Modeltex, tienda argentina de moldes digitales de indumentaria (molderia textil para fabricantes y emprendedores).',
  'Vas a recibir una lista de productos en JSON. Para cada uno, escribi una descripcion corta de venta.',
  '',
  'REGLAS:',
  '- Espanol rioplatense natural, como lo escribiria una persona, no un robot.',
  '- Entre 100 y 160 caracteres.',
  '- Mencion la prenda y algo util para quien compra (talles incluidos, formato digital, tela recomendada) segun los datos que te dan.',
  '- NUNCA inventes datos que no esten en el JSON del producto (nada de precios, materiales o promesas que no figuren).',
  '- No repitas el codigo ni el nombre completo tal cual aparece; sonaria repetitivo en la pagina.',
  '- Sin emojis, sin signos de exclamacion en exceso, sin mayusculas sostenidas.',
  '',
  'Responde UNICAMENTE un JSON con esta forma exacta, sin texto antes ni despues:',
  '{"items":[{"id":"...","text":"..."}]}',
  'Un item por cada producto recibido, usando el mismo "id" que te dieron.',
].join('\n');

function buildUserPrompt(products: RawProduct[]): string {
  const compact = products.map((p) => ({
    id: p.id,
    nombre: p.name,
    prenda: p.garment_type || undefined,
    categoria: p.category,
    talles: (p.sizes || []).length ? p.sizes : undefined,
    formatos: (p.formats || []).length ? p.formats : undefined,
    telas: (p.recommended_fabrics || []).length ? p.recommended_fabrics : undefined,
  }));
  return JSON.stringify(compact);
}

async function generateDescriptions(products: RawProduct[]): Promise<Map<string, string>> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://modeltex.com.ar',
      'X-Title': 'Modeltex Descripciones SEO',
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      temperature: 0.6,
      max_tokens: Math.max(400, products.length * 60),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(products) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter chat ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content || '';

  let parsed: { items?: { id?: string; text?: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('La IA devolvió una respuesta que no se pudo leer. Probá generar esta tanda de nuevo.');
  }

  const validIds = new Set(products.map((p) => p.id));
  const out = new Map<string, string>();
  for (const item of parsed.items || []) {
    if (item?.id && validIds.has(item.id) && typeof item.text === 'string' && item.text.trim()) {
      out.set(item.id, item.text.trim());
    }
  }
  return out;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!OPENROUTER_API_KEY) {
    res.status(200).json({ error: 'Falta OPENROUTER_API_KEY en Vercel.' });
    return;
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ error: 'Falta iniciar sesion.' });
    return;
  }
  if (!(await isAdmin(token))) {
    res.status(403).json({ error: 'Esta accion es solo para administradores.' });
    return;
  }

  const now = Date.now();
  if (now - lastCallAt < MIN_MS_BETWEEN_CALLS) {
    res.status(429).json({ error: 'Demasiadas llamadas seguidas. Esperá un momento y reintentá.' });
    return;
  }
  lastCallAt = now;

  try {
    // Solo productos activos sin descripcion todavia. No hace falta paginar
    // por offset: a medida que el admin guarda las que aprueba, esas dejan
    // de aparecer solas en la proxima tanda.
    const listRes = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,name,garment_type,category,sizes,formats,recommended_fabrics` +
        `&is_active=eq.true&or=(short_description.is.null,short_description.eq.)&order=id.asc&limit=${BATCH_SIZE}`,
      {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: 'count=exact' },
      },
    );
    if (!listRes.ok) throw new Error(`Supabase list ${listRes.status}: ${await listRes.text()}`);
    const products = (await listRes.json()) as RawProduct[];
    const totalMissing = parseInt((listRes.headers.get('content-range') || '').split('/')[1] || '0', 10);

    if (products.length === 0) {
      res.status(200).json({ done: true, items: [], remaining: 0 });
      return;
    }

    const drafts = await generateDescriptions(products);
    const items = products.map((p) => ({ id: p.id, name: p.name, text: drafts.get(p.id) || '' }));
    const missingCount = items.filter((i) => !i.text).length;

    res.status(200).json({
      done: false, // el admin decide cuando terminar: siempre puede pedir "otra tanda"
      items,
      // Antes de esta tanda habia totalMissing productos sin descripcion.
      remainingBeforeThisBatch: totalMissing,
      missingCount, // productos de esta tanda para los que la IA no devolvio texto (reintentar)
    });
  } catch (err) {
    console.error('generate-descriptions error', err);
    res.status(500).json({ error: (err as Error).message || 'Error generando descripciones.' });
  }
}
