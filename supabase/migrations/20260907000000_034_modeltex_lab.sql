/*
  034_modeltex_lab — MODELTEX LAB (curso gratis de moldería textil)

  Convierte /ia-textil en la base de una sección nueva: un curso gratis real
  (curso → módulos/niveles → clases → recursos → glosario) editable 100% desde
  el panel admin (sin tocar código), con progreso por alumno y un tutor IA que
  reutiliza el mismo backend de /api/chat.

  Mismo patrón de seguridad que ya usa el resto del proyecto:
  - RLS habilitada en todas las tablas nuevas.
  - Lectura pública SOLO de contenido status='published' (equivalente al
    is_active=true de products/free_molds).
  - Escritura solo admin, vía public.is_admin() (definida en la migración 003).
  - Progreso guardado en Supabase SOLO para usuarios con cuenta; el progreso
    anónimo vive en localStorage del navegador (mismo criterio que el carrito),
    así no hace falta RLS de sesión anónima.
*/

-- ==================== CURSOS ====================
CREATE TABLE IF NOT EXISTS lab_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  track_slug text NOT NULL DEFAULT '', -- agrupador libre (ej. "molderia-a-medida"); sin CHECK: admite N cursos futuros
  title text NOT NULL,
  subtitle text DEFAULT '',
  description text DEFAULT '',
  objectives text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  estimated_duration text DEFAULT '',
  cover_image_url text DEFAULT '',
  author text DEFAULT 'Modeltex',
  order_index integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lab_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_courses public read" ON lab_courses;
CREATE POLICY "lab_courses public read" ON lab_courses FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "lab_courses admin all" ON lab_courses;
CREATE POLICY "lab_courses admin all" ON lab_courses FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==================== MÓDULOS (incluye el "nivel" como etiqueta) ====================
CREATE TABLE IF NOT EXISTS lab_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lab_courses(id) ON DELETE CASCADE,
  slug text NOT NULL,
  level_label text DEFAULT '', -- ej. "Nivel 1 — Fundamentos"; vacío = sin agrupador de nivel
  level_order integer DEFAULT 0,
  title text NOT NULL,
  description text DEFAULT '',
  objectives text[] DEFAULT '{}',
  order_index integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (course_id, slug)
);

ALTER TABLE lab_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_modules public read" ON lab_modules;
CREATE POLICY "lab_modules public read" ON lab_modules FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "lab_modules admin all" ON lab_modules;
CREATE POLICY "lab_modules admin all" ON lab_modules FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==================== CLASES (clase = lección: una página con el formato pedagógico completo) ====================
CREATE TABLE IF NOT EXISTS lab_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES lab_modules(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  objective text DEFAULT '',            -- "Qué vas a aprender"
  before_start text DEFAULT '',         -- "Antes de empezar"
  concept text DEFAULT '',              -- "Concepto"
  development jsonb DEFAULT '[]'::jsonb, -- "Desarrollo": [{h3?, paragraphs:[], bullets?:[]}] (mismo shape que GuiaSection)
  steps jsonb DEFAULT '[]'::jsonb,       -- "Paso a paso": string[]
  example text DEFAULT '',              -- "Ejemplo práctico"
  common_mistakes jsonb DEFAULT '[]'::jsonb, -- "Errores frecuentes": [{mistake, fix}]
  modeltex_tip text DEFAULT '',         -- "Consejo Modeltex"
  exercise_instructions text DEFAULT '', -- "Ejercicio"
  faqs jsonb DEFAULT '[]'::jsonb,        -- "Preguntas frecuentes": [{q, a}] (mismo shape que GuiaFaq)
  summary text DEFAULT '',              -- "Resumen"
  related_guide_slugs text[] DEFAULT '{}', -- cross-link a /guias/:slug existentes
  order_index integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author text DEFAULT 'Modeltex',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (module_id, slug)
);

ALTER TABLE lab_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_lessons public read" ON lab_lessons;
CREATE POLICY "lab_lessons public read" ON lab_lessons FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "lab_lessons admin all" ON lab_lessons;
CREATE POLICY "lab_lessons admin all" ON lab_lessons FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==================== GLOSARIO ====================
CREATE TABLE IF NOT EXISTS lab_glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  term text NOT NULL,
  short_definition text DEFAULT '',
  explanation text DEFAULT '',
  example text DEFAULT '',
  related_lesson_ids uuid[] DEFAULT '{}',
  order_index integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lab_glossary_terms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_glossary_terms public read" ON lab_glossary_terms;
CREATE POLICY "lab_glossary_terms public read" ON lab_glossary_terms FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "lab_glossary_terms admin all" ON lab_glossary_terms;
CREATE POLICY "lab_glossary_terms admin all" ON lab_glossary_terms FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==================== RECURSOS (PDF, imagen, tabla, link, molde, CAD) ====================
CREATE TABLE IF NOT EXISTS lab_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES lab_courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES lab_modules(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lab_lessons(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'image', 'table', 'link', 'molde', 'cad')),
  title text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (course_id IS NOT NULL)::int + (module_id IS NOT NULL)::int + (lesson_id IS NOT NULL)::int = 1
  )
);

ALTER TABLE lab_resources ENABLE ROW LEVEL SECURITY;

-- Sin columna status propia: un recurso es público si su clase/módulo/curso
-- dueño está publicado (evita adjuntos "sueltos" visibles de contenido borrador).
DROP POLICY IF EXISTS "lab_resources public read" ON lab_resources;
CREATE POLICY "lab_resources public read" ON lab_resources FOR SELECT
  TO anon, authenticated USING (
    (lesson_id IS NOT NULL AND EXISTS (SELECT 1 FROM lab_lessons WHERE id = lesson_id AND status = 'published'))
    OR (module_id IS NOT NULL AND EXISTS (SELECT 1 FROM lab_modules WHERE id = module_id AND status = 'published'))
    OR (course_id IS NOT NULL AND EXISTS (SELECT 1 FROM lab_courses WHERE id = course_id AND status = 'published'))
  );

DROP POLICY IF EXISTS "lab_resources admin all" ON lab_resources;
CREATE POLICY "lab_resources admin all" ON lab_resources FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==================== VÍNCULO CON MOLDES GRATIS EXISTENTES ====================
-- No se duplica free_molds: se agregan columnas nullable para que un molde
-- gratis pueda mostrarse dentro de una clase/curso y seguir viviendo en
-- /moldes-gratis exactamente como hoy.
ALTER TABLE free_molds ADD COLUMN IF NOT EXISTS lab_course_id uuid REFERENCES lab_courses(id) ON DELETE SET NULL;
ALTER TABLE free_molds ADD COLUMN IF NOT EXISTS lab_lesson_id uuid REFERENCES lab_lessons(id) ON DELETE SET NULL;

-- ==================== PROGRESO (solo usuarios con cuenta) ====================
CREATE TABLE IF NOT EXISTS lab_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES lab_courses(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lab_lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT true,
  exercise_done boolean DEFAULT false,
  completed_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE lab_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_progress own read" ON lab_progress;
CREATE POLICY "lab_progress own read" ON lab_progress FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "lab_progress own write" ON lab_progress;
CREATE POLICY "lab_progress own write" ON lab_progress FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "lab_progress own update" ON lab_progress;
CREATE POLICY "lab_progress own update" ON lab_progress FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "lab_progress own delete" ON lab_progress;
CREATE POLICY "lab_progress own delete" ON lab_progress FOR DELETE
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "lab_progress admin read" ON lab_progress;
CREATE POLICY "lab_progress admin read" ON lab_progress FOR SELECT
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_lab_progress_user ON lab_progress(user_id);

-- ==================== RAG: CHUNKS + BÚSQUEDA SEMÁNTICA DEL TUTOR IA ====================
-- Requiere la extension "vector" (ya habilitada en la migración 024).
CREATE TABLE IF NOT EXISTS lab_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('lesson', 'module', 'course', 'glossary')),
  source_id uuid NOT NULL,
  course_slug text DEFAULT '',
  module_slug text DEFAULT '',
  lesson_slug text DEFAULT '',
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  embedding vector(1536),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lab_chunks ENABLE ROW LEVEL SECURITY;

-- Lectura pública: el contenido de los chunks ya es público vía las clases
-- publicadas (no expone nada que la clase misma no muestre).
DROP POLICY IF EXISTS "lab_chunks public read" ON lab_chunks;
CREATE POLICY "lab_chunks public read" ON lab_chunks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "lab_chunks admin all" ON lab_chunks;
CREATE POLICY "lab_chunks admin all" ON lab_chunks FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_lab_chunks_source ON lab_chunks(source_type, source_id);
CREATE INDEX IF NOT EXISTS lab_chunks_embedding_idx ON lab_chunks USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_lab_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 8,
  p_course_slug text DEFAULT NULL
)
RETURNS TABLE (
  title text,
  content text,
  course_slug text,
  module_slug text,
  lesson_slug text,
  source_type text
)
LANGUAGE sql
STABLE
AS $$
  SELECT title, content, course_slug, module_slug, lesson_slug, source_type
  FROM lab_chunks
  WHERE embedding IS NOT NULL
    AND (p_course_slug IS NULL OR p_course_slug = '' OR course_slug = p_course_slug)
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_lab_chunks(vector(1536), int, text) TO anon, authenticated;

-- ==================== HISTORIAL DE CHAT: de qué clase venía la pregunta ====================
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS lab_context text;

-- ==================== STORAGE: bucket público para archivos del Lab ====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lab-files', 'lab-files', true, 209715200, NULL)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "lab-files public read" ON storage.objects;
CREATE POLICY "lab-files public read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'lab-files');

DROP POLICY IF EXISTS "lab-files admin write" ON storage.objects;
CREATE POLICY "lab-files admin write" ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'lab-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'lab-files' AND public.is_admin());

-- ==================== ÍNDICES ====================
CREATE INDEX IF NOT EXISTS idx_lab_modules_course ON lab_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lab_lessons_module ON lab_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lab_resources_lesson ON lab_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_free_molds_lab_lesson ON free_molds(lab_lesson_id);
