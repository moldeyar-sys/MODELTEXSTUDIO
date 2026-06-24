/*
  014_hero_images
  Imágenes del carrusel del hero (inicio). Se gestionan desde el panel admin.
  Públicas (lectura de activas); escritura solo admin. Se guardan en el bucket
  público product-images.
*/

CREATE TABLE IF NOT EXISTS hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hero public read" ON hero_images;
CREATE POLICY "hero public read" ON hero_images FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "hero admin all" ON hero_images;
CREATE POLICY "hero admin all" ON hero_images FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
