/*
  010_ploter_y_formato_pedido
  - products.precio_pdf_ploter: precio del formato PDF Plóter (mismo para las 3 medidas).
  - order_items.formato: guarda qué formato eligió el cliente en cada ítem del pedido.
  Aditivo, no toca nada existente.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS precio_pdf_ploter numeric;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS formato text;
