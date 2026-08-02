// Funcion serverless (Vercel). Genera embeddings para los productos activos
// y los guarda en Supabase, para que el asistente IA pueda buscar por
// significado en vez de solo coincidencia de texto.
//
// La llama el panel admin (boton "Busqueda inteligente" en Productos),
// repitiendo la llamada hasta que "done" sea true (procesa de a tandas para
// no pasarse del tiempo maximo de una funcion serverless).
//
// Seguridad: no hay clave de servicio en este proyecto (por diseño, ver
// src/lib/supabase.ts). En su lugar, reenvia el token de sesion del que
// llama: la escritura en "products" la autoriza la policy RLS "Admins can
// update products" (public.is_admin()), y ademas se verifica is_admin()
// ANTES de gastar en OpenRouter, para que nadie sin sesion de admin pueda
// generar costo llamando a este endpoint directo.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const EMBED_MODEL = process.env.OPENROUTER_EMBED_MODEL || 'openai/text-embedding-3-small';

// Cuantos productos se procesan por llamada. Bajo a proposito: cada tanda
// hace 1 llamada a OpenRouter + 1 upsert a Supabase, y las funciones
// serverless tienen un tiempo maximo de ejecucion.
const BATCH_SIZE = 40;

// Freno de gasto (mejor esfuerzo): minimo intervalo entre tandas por instancia.
// No reemplaza al limite de gasto de la cuenta de OpenRouter (configurarlo
// alla es la proteccion real), pero le baja mucho la velocidad a un script
// que intente drenar credito con un token de admin robado. Vive en memoria
// del proceso: persiste mientras la funcion serverless este "caliente".
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
  short_description: string | null;
};

async function isAdmin(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (!res.ok) return false;
    return (await res.json()) === true;
  } catch {
    return false;
  }
}

// Texto compacto que representa al producto para el embedding: mientras mas
// describe el producto en palabras naturales, mejor "entiende" el buscador.
function buildEmbeddingText(p: RawProduct): string {
  return [
    p.name,
    p.garment_type,
    p.category,
    (p.sizes || []).join(' '),
    (p.formats || []).join(' '),
    (p.recommended_fabrics || []).join(' '),
    p.short_description,
  ]
    .filter(Boolean)
    .join(' | ');
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://modeltex.com.ar',
      'X-Title': 'Modeltex Embeddings',
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) throw new Error(`OpenRouter embeddings ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { data: { embedding: number[] }[] };
  const vectors = (data.data || []).map((d) => d?.embedding);
  // Sin esta validacion, una respuesta incompleta guardaria embeddings vacios
  // y esos productos quedarian invisibles para la busqueda sin ningun aviso.
  if (vectors.length !== texts.length || vectors.some((v) => !Array.isArray(v) || v.length === 0)) {
    throw new Error(`OpenRouter devolvio ${vectors.length} embeddings para ${texts.length} textos.`);
  }
  return vectors;
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const force = !!body.force; // true = re-generar TODOS los activos, no solo los que faltan
    // Solo se usa (y hace falta) en modo force: sin filtro "embedding is null"
    // que vaya achicando el resultado solo, hace falta paginar a mano o cada
    // llamada devolvería siempre los mismos primeros N productos.
    const offset = force ? Math.max(0, parseInt(body.offset, 10) || 0) : 0;

    const filter = force ? '' : '&embedding=is.null';
    const listRes = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,name,garment_type,category,sizes,formats,recommended_fabrics,short_description&is_active=eq.true${filter}&order=id.asc&limit=${BATCH_SIZE}&offset=${offset}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: 'count=exact',
          Range: `0-${BATCH_SIZE - 1}`,
        },
      },
    );
    if (!listRes.ok) throw new Error(`Supabase list ${listRes.status}: ${await listRes.text()}`);
    const products = (await listRes.json()) as RawProduct[];
    const totalMatching = parseInt((listRes.headers.get('content-range') || '').split('/')[1] || '0', 10);

    if (products.length === 0) {
      res.status(200).json({ done: true, processed: 0, remaining: 0 });
      return;
    }

    const embeddings = await embedTexts(products.map(buildEmbeddingText));
    const now = new Date().toISOString();
    const rows = products.map((p, i) => ({ id: p.id, embedding: embeddings[i], embedding_updated_at: now }));

    // PATCH por producto (no upsert): un upsert vía POST intenta construir una
    // fila INSERT completa y Postgres exige sus columnas NOT NULL (name, price,
    // etc.) aunque el conflicto por id termine resolviéndose como UPDATE. PATCH
    // es un UPDATE puro por WHERE id=..., nunca arma una fila nueva.
    const results = await Promise.all(
      rows.map((row) =>
        fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${row.id}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ embedding: row.embedding, embedding_updated_at: row.embedding_updated_at }),
        }),
      ),
    );
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      throw new Error(`Supabase update: ${failed.length}/${rows.length} productos fallaron (ej. ${failed[0].status})`);
    }

    const processedSoFar = offset + rows.length;
    // El conteo total puede quedar viejo si el admin activa/desactiva productos
    // mientras corre el proceso; una tanda incompleta es la señal segura de que
    // se llego al final de la lista, sin importar el conteo.
    const reachedEnd = products.length < BATCH_SIZE;
    const remaining = reachedEnd ? 0 : Math.max(totalMatching - processedSoFar, 0);

    res.status(200).json({
      done: reachedEnd || remaining <= 0,
      processed: rows.length,
      remaining,
      // El admin lo manda de vuelta en la proxima llamada para seguir donde quedo (solo modo force).
      nextOffset: force ? processedSoFar : undefined,
    });
  } catch (err) {
    console.error('embed-catalog error', err);
    res.status(500).json({ error: (err as Error).message || 'Error generando embeddings.' });
  }
}
