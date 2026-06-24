/*
  012_resenas
  Reseñas con estrellas para productos del catálogo y moldes gratis.
  RLS: cualquiera lee; usuario logueado crea la suya; borra la suya o el admin.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,          -- 'product' | 'free_mold'
  target_id uuid NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_name text DEFAULT '',
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews public read" ON reviews;
CREATE POLICY "reviews public read" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews insert own" ON reviews;
CREATE POLICY "reviews insert own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "reviews delete own or admin" ON reviews;
CREATE POLICY "reviews delete own or admin" ON reviews FOR DELETE
  TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_type, target_id);
