/*
  007_free_molds — Sección pública "Moldes Gratis"

  Aísla TODO lo gratuito de lo pago/privado:
  - Bucket PÚBLICO 'free-files' solo para archivos gratis (los pagos siguen en
    'product-files' privado, intactos).
  - Tabla 'free_molds' con RLS: el público SOLO lee los activos; escritura solo admin.
  - Contador de descargas vía función SECURITY DEFINER (sin escritura pública).

  Reutiliza public.is_admin() (ya usada por las policies de storage existentes).
*/

-- ── A) Bucket PÚBLICO solo para archivos gratis ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('free-files', 'free-files', true, 209715200, NULL)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "free-files public read" ON storage.objects;
CREATE POLICY "free-files public read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'free-files');

DROP POLICY IF EXISTS "free-files admin write" ON storage.objects;
CREATE POLICY "free-files admin write" ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'free-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'free-files' AND public.is_admin());

-- ── B) Tabla catálogo de moldes gratis ──
CREATE TABLE IF NOT EXISTS free_molds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code text DEFAULT '',
  category text DEFAULT '',
  product_type text DEFAULT '',
  fabric_recommendation text DEFAULT '',
  sizes text[] DEFAULT '{}',
  formats text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  season text DEFAULT '',
  image_url text DEFAULT '',
  files jsonb DEFAULT '[]'::jsonb,   -- lista de archivos: [{label,name,url}]
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE free_molds ENABLE ROW LEVEL SECURITY;

-- Público: SOLO lectura de los activos
DROP POLICY IF EXISTS "free_molds public read" ON free_molds;
CREATE POLICY "free_molds public read" ON free_molds FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Admin: administra todo
DROP POLICY IF EXISTS "free_molds admin all" ON free_molds;
CREATE POLICY "free_molds admin all" ON free_molds FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── C) Contador de descargas seguro (sin escritura pública) ──
CREATE OR REPLACE FUNCTION public.increment_free_mold_download(p_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE free_molds SET download_count = download_count + 1
  WHERE id = p_id AND is_active = true;
$$;
GRANT EXECUTE ON FUNCTION public.increment_free_mold_download(uuid) TO anon, authenticated;
