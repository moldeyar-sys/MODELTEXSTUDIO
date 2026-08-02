/*
  025_analitica_admin — Estadisticas visibles para el dueño

  Dos cosas que hoy no se registran en ningun lado:

  1) Vistas por producto ("que articulos son mas vistos"): se suma
     view_count en products via funcion segura (SECURITY DEFINER, RLS no
     deja escribir products directo desde el publico). El propio admin
     navegando su catalogo NO suma vista: eso se filtra del lado del
     cliente, aca solo se prepara la columna y la funcion.

  2) Detalle de descargas de Moldes Gratis, con o sin cuenta: el contador
     viejo (free_molds.download_count) sigue sumando exactamente igual que
     siempre — no se toca, para no perder el historico ya acumulado. Esta
     tabla nueva agrega el detalle (con cuenta / sin cuenta, que archivo)
     desde el momento en que se activa esta migracion en adelante.
*/

-- 1) Vistas de producto
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_product_view(p_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE products SET view_count = view_count + 1
  WHERE id = p_id AND is_active = true;
$$;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO anon, authenticated;

-- 2) Detalle de descargas de Moldes Gratis
CREATE TABLE IF NOT EXISTS free_mold_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  free_mold_id uuid REFERENCES free_molds(id) ON DELETE CASCADE,
  file_label text DEFAULT '',
  has_account boolean DEFAULT false,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE free_mold_downloads ENABLE ROW LEVEL SECURITY;

-- Publico: solo puede REGISTRAR su propia descarga (nunca a nombre de otro user_id)
DROP POLICY IF EXISTS "free_mold_downloads anon insert" ON free_mold_downloads;
CREATE POLICY "free_mold_downloads anon insert" ON free_mold_downloads FOR INSERT
  TO anon WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "free_mold_downloads auth insert" ON free_mold_downloads;
CREATE POLICY "free_mold_downloads auth insert" ON free_mold_downloads FOR INSERT
  TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Admin: lee el detalle completo
DROP POLICY IF EXISTS "free_mold_downloads admin read" ON free_mold_downloads;
CREATE POLICY "free_mold_downloads admin read" ON free_mold_downloads FOR SELECT
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_free_mold_downloads_mold ON free_mold_downloads(free_mold_id);
