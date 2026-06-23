/*
  009_formatos_comerciales
  Agrega a products los campos de formatos comerciales (Cartón / PDF-A4),
  código y flags de disponibilidad. Reutiliza el precio existente (price)
  sembrando precio_pdf_a4. No toca price/sale_price (los usa el carrito).

  Editable desde el panel (CEO Modeltex y /admin) porque comparten esta tabla.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS codigo text DEFAULT '',
  ADD COLUMN IF NOT EXISTS precio_carton numeric,
  ADD COLUMN IF NOT EXISTS precio_pdf_a4 numeric,
  ADD COLUMN IF NOT EXISTS disponible_carton boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS disponible_pdf_a4 boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS mostrar_consulta_otro_formato boolean DEFAULT true;

-- Sembrar el precio PDF-A4 con el precio actual para no mostrar "Consultar" en todos
UPDATE products
  SET precio_pdf_a4 = price
  WHERE precio_pdf_a4 IS NULL AND price IS NOT NULL AND price > 0;
