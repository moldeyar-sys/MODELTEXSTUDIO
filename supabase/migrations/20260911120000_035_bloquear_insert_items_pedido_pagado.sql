/*
  035_bloquear_insert_items_pedido_pagado — FIX DE SEGURIDAD CRÍTICO

  ## Problema
  Las migraciones 022 y 033 cerraron el hueco de "insertar un PEDIDO ya
  marcado pagado" para usuarios con cuenta e invitados respectivamente. Pero
  quedó abierto el mismo hueco un escalón más abajo, en order_items:

  - Policy "Users can insert own order items" (migración 001, nunca tocada):
    WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id=order_items.order_id
    AND user_id=auth.uid())) — no exige que el pedido siga 'pendiente'.

  - Función is_recent_guest_order() (migración 032, nunca tocada): solo
    exige user_id IS NULL y created_at reciente, tampoco mira payment_status.

  Como el acceso a los archivos (product_files y el bucket privado
  product-files) se concede con un JOIN orders⋈order_items que solo mira
  payment_status='pagado' del lado de la orden, cualquiera con UNA orden
  propia ya pagada (aunque sea la compra más barata del catálogo) podía
  insertar DESPUÉS, directo desde el cliente con su propia sesión, un
  order_item nuevo apuntando a esa MISMA orden pero con el product_id de
  CUALQUIER OTRO producto — y descargarlo sin haberlo pagado nunca.

  ## Fix
  Mismo patrón que 022/033: exigir que el pedido padre siga 'pendiente' en
  el momento de insertar el item. Una vez que el admin/webhook lo marca
  'pagado', no se le pueden agregar líneas nuevas.

  No rompe el checkout normal: CheckoutPage.tsx siempre inserta la orden en
  'pendiente' y RECIÉN DESPUÉS inserta los order_items, todavía en
  'pendiente' en ese momento (ver src/pages/CheckoutPage.tsx).

  Idempotente.
*/

DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
        AND user_id = auth.uid()
        AND payment_status = 'pendiente'
        AND order_status = 'pendiente'
    )
  );

CREATE OR REPLACE FUNCTION public.is_recent_guest_order(oid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = oid
      AND user_id IS NULL
      AND payment_status = 'pendiente'
      AND order_status = 'pendiente'
      AND created_at > now() - interval '10 minutes'
  );
$$;
