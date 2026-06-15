/*
  # Storage: buckets para imagenes (publico) y archivos descargables (privado)

  - product-images: PUBLICO. Imagenes de producto (main + galeria). Lectura
    publica; escritura solo admin.
  - product-files: PRIVADO. Archivos descargables (PDF/PLT/DXF/CDR/etc). Sin
    lectura publica: las descargas se serviran con signed URLs temporales
    (Fase 3). Solo admin puede subir/leer/borrar directamente.

  Reutiliza public.is_admin() (SECURITY DEFINER) para los chequeos de rol.
*/

-- ==================== BUCKETS ====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880,
   ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('product-files', 'product-files', false, 209715200, NULL)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==================== POLICIES: product-images (publico) ====================
DROP POLICY IF EXISTS "product-images public read" ON storage.objects;
CREATE POLICY "product-images public read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product-images admin insert" ON storage.objects;
CREATE POLICY "product-images admin insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product-images admin update" ON storage.objects;
CREATE POLICY "product-images admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product-images admin delete" ON storage.objects;
CREATE POLICY "product-images admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ==================== POLICIES: product-files (privado, solo admin) ====================
DROP POLICY IF EXISTS "product-files admin read" ON storage.objects;
CREATE POLICY "product-files admin read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'product-files' AND public.is_admin());

DROP POLICY IF EXISTS "product-files admin insert" ON storage.objects;
CREATE POLICY "product-files admin insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-files' AND public.is_admin());

DROP POLICY IF EXISTS "product-files admin update" ON storage.objects;
CREATE POLICY "product-files admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-files' AND public.is_admin());

DROP POLICY IF EXISTS "product-files admin delete" ON storage.objects;
CREATE POLICY "product-files admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-files' AND public.is_admin());
