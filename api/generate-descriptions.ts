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
const BATCH_SIZE = 10;

// NOTA: este freno es best-effort. En Vercel serverless, invocaciones
// concurrentes pueden caer en instancias de proceso distintas y esta
// variable de modulo no se comparte entre ellas — no es una garantia dura,
// solo reduce la chance de llamadas pegadas dentro de la misma instancia
// caliente. Suficiente hoy: lo dispara un solo admin a mano y el boton se
// deshabilita mientras carga. Si se vuelve un problema real, mover el
// estado a una tabla de Supabase con timestamp.
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
  '- AUDIENCIA — clave: quien lee esto NO es quien va a usar la prenda puesta. Es un fabricante o emprendedor que compra el MOLDE como insumo de produccion para despues coser y vender. Evita beneficios de uso personal ("comodo", "a la moda", "te queda bien") y priorizá beneficios de produccion: precision del patronaje, amplitud de talles para vender a mas publico, formato listo para imprimir/cortar, ahorro de tiempo de trazado. Tono profesional-cercano, no de venta de ropa a un consumidor final.',
  '- Intencion de venta: no es una ficha tecnica que lista datos por igual, es un texto que tiene que dar ganas de comprar. De cada producto, priorizá el dato que mas vende (si tiene muchos talles, ese es el gancho; si la tela recomendada es especifica, ese es el gancho) en vez de enumerar todo parejo.',
  '- OBLIGATORIO: espanol rioplatense con VOSEO, nunca "tu". Conjugaciones correctas de ejemplo: "creá" (no "crea"), "diseñá" (no "diseña"), "confeccioná" (no "confecciona"), "descargá" (no "descarga"), "elegí" (no "elige"), "obtené" (no "obtienes"), "tenés" (no "tienes"). Si dudás entre dos formas, elegi siempre la forma con vos.',
  '- Entre 100 y 160 caracteres.',
  '- Mencion la prenda y algo util para quien compra (talles incluidos, formato digital, tela recomendada) segun los datos que te dan.',
  '- NUNCA inventes datos que no esten en el JSON del producto (nada de precios, materiales o promesas que no figuren).',
  '- No repitas el codigo ni el nombre completo tal cual aparece; sonaria repetitivo en la pagina. Tampoco repitas la misma palabra o un sinonimo de ella mas de una vez dentro del mismo texto corto.',
  '- No menciones "Modeltex": ya aparece en el nombre y el contexto de la pagina, repetirla en la descripcion no suma y resta espacio util.',
  '- Sin emojis, sin signos de exclamacion en exceso, sin mayusculas sostenidas.',
  '- IMPORTANTE — variedad: vas a escribir varias descripciones seguidas para un catalogo real. No repitas la misma estructura de frase en todas (ej. "no arranques siempre con un verbo de accion seguido de \'un/una [prenda] para\'"). Cada una tiene que sonar como si la hubiera escrito una persona distinta pensando en ESE producto puntual, no una plantilla con los datos cambiados. Variá el orden: a veces empezá nombrando la prenda, otras el beneficio, otras el talle.',
  '- Evitá cierres genericos y vacios de contenido como "para un trabajo mas sencillo" o "para una confeccion precisa" salvo que agreguen algo especifico de ESE producto.',
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
      // Generoso a proposito: si se queda corto, la respuesta se corta a
      // mitad de un JSON y JSON.parse revienta. Mejor gastar de mas en
      // margen que fallar la tanda entera por un limite ajustado.
      max_tokens: Math.max(800, products.length * 130),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(products) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter chat ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  };
  const choice = data.choices?.[0];
  const raw = choice?.message?.content || '';

  // Algunos modelos devuelven el JSON envuelto en ```json ... ``` (a veces con
  // texto tipo "Aca esta el JSON:" antes) pese a pedir response_format
  // json_object. En vez de un regex anclado al inicio/fin exacto del string
  // (que no cubre texto alrededor), se recorta directo del primer '{' al
  // ultimo '}': funciona este envoltorio este o no.
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  const cleaned = firstBrace !== -1 && lastBrace > firstBrace ? raw.slice(firstBrace, lastBrace + 1).trim() : raw.trim();

  let parsed: { items?: { id?: string; text?: string }[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    // Se loguea el motivo real (truncado, para no volcar datos de mas a los
    // logs) en vez de solo "no se pudo leer": la proxima vez que falle, se
    // sabe si fue corte por longitud, formato raro, u otra cosa.
    console.error(
      'generate-descriptions: JSON invalido. finish_reason=', choice?.finish_reason,
      'parseErr=', (parseErr as Error).message,
      'raw(0-400)=', raw.slice(0, 400),
    );
    const truncated = choice?.finish_reason === 'length';
    throw new Error(
      truncated
        ? 'La respuesta de la IA se cortó por longitud. Ya lo ajusté para la próxima tanda — probá de nuevo.'
        : 'La IA devolvió una respuesta que no se pudo leer. Probá generar esta tanda de nuevo.',
    );
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
