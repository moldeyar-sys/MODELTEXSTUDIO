/*
  019_order_items_detalle
  Guarda el detalle real de cada compra en order_items:
  - sizes: talles que eligió el cliente (ej: {"S","M","L"}).
  - product_name: nombre del producto AL MOMENTO de la compra (snapshot).
    Se guarda como copia porque product_id es ON DELETE SET NULL: si el
    producto se borra o renombra, el pedido histórico sigue mostrando qué se vendió.
  Aditivo, no toca nada existente.
*/

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_name text;
