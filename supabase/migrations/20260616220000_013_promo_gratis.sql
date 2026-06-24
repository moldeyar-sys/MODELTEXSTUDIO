/*
  013_promo_gratis
  Permite "pasar" un producto del catálogo a Moldes Gratis por un tiempo.
  products.free_until: si > now(), el producto está en promo gratis.
  - Durante la promo, cualquiera VE la lista de archivos (para incentivar la cuenta).
  - Solo un usuario LOGUEADO puede DESCARGAR (signed URL) -> captura el lead.
  - Al vencer la fecha, los permisos dejan de aplicar solos (vuelve a ser pago).
  No toca las políticas existentes (se suman con OR).
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS free_until timestamptz;

-- Ver la lista de archivos del producto en promo (anon + logueado)
DROP POLICY IF EXISTS "product_files free promo read" ON product_files;
CREATE POLICY "product_files free promo read" ON product_files FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_files.product_id
        AND p.free_until IS NOT NULL AND p.free_until > now()
    )
  );

-- Descargar (signed URL) los archivos del producto en promo: SOLO logueado
DROP POLICY IF EXISTS "product-files free promo read" ON storage.objects;
CREATE POLICY "product-files free promo read" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-files'
    AND position('/' in name) > 0
    AND EXISTS (
      SELECT 1 FROM products p
      WHERE p.id::text = split_part(name, '/', 1)
        AND p.free_until IS NOT NULL AND p.free_until > now()
    )
  );

CREATE INDEX IF NOT EXISTS idx_products_free_until ON products(free_until);
