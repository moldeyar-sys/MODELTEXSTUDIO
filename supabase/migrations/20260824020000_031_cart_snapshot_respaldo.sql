/*
  031_cart_snapshot_respaldo — Respaldo del carrito en el pedido

  Bug real: orders y order_items se guardan en dos inserts separados desde
  el checkout. Si el segundo (order_items) falla por lo que sea (RLS, red,
  producto editado a mitad de compra), el pedido queda creado en orders
  pero sin ningun item, y el panel admin no tiene forma de saber que
  compro el cliente.

  Fix: se agrega cart_snapshot, guardado en el MISMO insert que crea el
  pedido (no puede fallar "a medias" como el insert aparte de order_items).
  El panel admin usa este respaldo cuando order_items viene vacio.

  No reemplaza order_items (se sigue usando para reportes/estadisticas),
  es la red de seguridad para nunca mas perder de vista una compra.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cart_snapshot jsonb;
