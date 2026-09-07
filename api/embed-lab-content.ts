// Funcion serverless (Vercel). Genera embeddings del contenido PUBLICADO de
// MODELTEX LAB (cursos, modulos, clases, glosario) y los guarda en
// lab_chunks, para que el tutor IA (api/chat.ts) pueda buscar por
// significado ademas de usar siempre la clase actual.
//
// La llama el panel admin (boton "Generar embeddings del Lab"). Por cada
// fuente, borra sus chunks viejos antes de insertar los nuevos: asi una
// clase editada nunca deja conocimiento obsoleto dando vueltas.
//
// Nota: a diferencia de api/embed-catalog.ts (catalogo de cientos de
// productos, procesado en tandas con "done/remaining"), el contenido de Lab
// arranca chico a proposito (curso de demostracion). Si el curso crece mucho
// en el futuro, este endpoint deberia paginarse igual que embed-catalog.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const EMBED_MODEL = process.env.OPENROUTER_EMBED_MODEL || 'openai/text-embedding-3-small';

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

async function sbGet(path: string, token: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Supabase GET ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

type Chunk = {
  source_type: 'course' | 'module' | 'lesson' | 'glossary';
  source_id: string;
  course_slug: string;
  module_slug: string;
  lesson_slug: string;
  title: string;
  content: string;
};

function devToText(dev: { h3?: string; paragraphs?: string[]; bullets?: string[] }[] | null): string {
  return (dev || [])
    .map((b) => [b.h3, ...(b.paragraphs || []), ...(b.bullets || []).map((x) => `- ${x}`)].filter(Boolean).join('\n'))
    .join('\n');
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://modeltex.com.ar',
      'X-Title': 'Modeltex Lab Embeddings',
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) throw new Error(`OpenRouter embeddings ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { data: { embedding: number[] }[] };
  const vectors = (data.data || []).map((d) => d?.embedding);
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

  try {
    const courses = (await sbGet(
      'lab_courses?select=id,slug,title,subtitle,description,objectives&status=eq.published',
      token,
    )) as { id: string; slug: string; title: string; subtitle: string; description: string; objectives: string[] }[];

    const modules = (await sbGet(
      'lab_modules?select=id,course_id,slug,title,description,objectives&status=eq.published',
      token,
    )) as { id: string; course_id: string; slug: string; title: string; description: string; objectives: string[] }[];

    const lessons = (await sbGet(
      'lab_lessons?select=id,module_id,slug,title,objective,concept,development,steps,example,common_mistakes,modeltex_tip,summary,faqs&status=eq.published',
      token,
    )) as {
      id: string;
      module_id: string;
      slug: string;
      title: string;
      objective: string;
      concept: string;
      development: { h3?: string; paragraphs?: string[]; bullets?: string[] }[] | null;
      steps: string[] | null;
      example: string;
      common_mistakes: { mistake: string; fix: string }[] | null;
      modeltex_tip: string;
      summary: string;
      faqs: { q: string; a: string }[] | null;
    }[];

    const glossary = (await sbGet(
      'lab_glossary_terms?select=id,slug,term,short_definition,explanation,example&status=eq.published',
      token,
    )) as { id: string; slug: string; term: string; short_definition: string; explanation: string; example: string }[];

    const courseById = new Map(courses.map((c) => [c.id, c]));
    const moduleById = new Map(modules.map((m) => [m.id, m]));

    const chunks: Chunk[] = [];

    for (const c of courses) {
      chunks.push({
        source_type: 'course',
        source_id: c.id,
        course_slug: c.slug,
        module_slug: '',
        lesson_slug: '',
        title: c.title,
        content: [c.title, c.subtitle, c.description, (c.objectives || []).join(' | ')].filter(Boolean).join('\n'),
      });
    }

    for (const m of modules) {
      const course = courseById.get(m.course_id);
      if (!course) continue;
      chunks.push({
        source_type: 'module',
        source_id: m.id,
        course_slug: course.slug,
        module_slug: m.slug,
        lesson_slug: '',
        title: `${course.title} — ${m.title}`,
        content: [m.title, m.description, (m.objectives || []).join(' | ')].filter(Boolean).join('\n'),
      });
    }

    for (const l of lessons) {
      const module = moduleById.get(l.module_id);
      const course = module ? courseById.get(module.course_id) : undefined;
      if (!module || !course) continue;
      const faqsText = (l.faqs || []).map((f) => `${f.q}\n${f.a}`).join('\n');
      const mistakesText = (l.common_mistakes || []).map((m) => `Error: ${m.mistake}\nCómo evitarlo: ${m.fix}`).join('\n');
      const stepsText = (l.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
      chunks.push({
        source_type: 'lesson',
        source_id: l.id,
        course_slug: course.slug,
        module_slug: module.slug,
        lesson_slug: l.slug,
        title: `${course.title} — ${module.title} — ${l.title}`,
        content: [
          l.title,
          l.objective,
          l.concept,
          devToText(l.development),
          stepsText,
          l.example,
          mistakesText,
          l.modeltex_tip,
          l.summary,
          faqsText,
        ]
          .filter(Boolean)
          .join('\n'),
      });
    }

    for (const g of glossary) {
      chunks.push({
        source_type: 'glossary',
        source_id: g.id,
        course_slug: '',
        module_slug: '',
        lesson_slug: g.slug,
        title: g.term,
        content: [g.term, g.short_definition, g.explanation, g.example].filter(Boolean).join('\n'),
      });
    }

    if (chunks.length === 0) {
      res.status(200).json({ processed: 0, message: 'No hay contenido publicado todavía en MODELTEX LAB.' });
      return;
    }

    const embeddings = await embedTexts(chunks.map((c) => c.content.slice(0, 6000)));
    const now = new Date().toISOString();

    // Borra los chunks viejos de cada fuente y crea los nuevos (evita
    // conocimiento obsoleto cuando se edita una clase publicada).
    for (const sourceId of new Set(chunks.map((c) => c.source_id))) {
      await fetch(`${SUPABASE_URL}/rest/v1/lab_chunks?source_id=eq.${sourceId}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: 'return=minimal' },
      });
    }

    const rows = chunks.map((c, i) => ({ ...c, embedding: embeddings[i], updated_at: now }));
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/lab_chunks`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(rows),
    });
    if (!insertRes.ok) throw new Error(`Supabase insert lab_chunks ${insertRes.status}: ${await insertRes.text()}`);

    res.status(200).json({ processed: rows.length });
  } catch (err) {
    console.error('embed-lab-content error', err);
    res.status(500).json({ error: (err as Error).message || 'Error generando embeddings del Lab.' });
  }
}
