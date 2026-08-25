/*
  032_fix_items_invitado_rls — Arreglo real del guardado de items de invitado

  Dos defectos de la migracion 028 detectados probando en vivo:

  1. La policy de INSERT en order_items para anon usa un EXISTS que SELECTea
     la tabla orders... pero anon no tiene policy de SELECT sobre orders (a
     proposito), asi que ese EXISTS siempre da false y el insert de items de
     un invitado SIEMPRE es rechazado (42501), aunque el pedido si se cree.
     Fix: mover el chequeo a una funcion SECURITY DEFINER (mismo patron que
     public.is_admin() de la migracion 003), que puede leer orders sin abrirle
     SELECT a los anonimos.

  2. (Arreglado en codigo, documentado aca) El checkout hacia
     .insert(...).select() y ese read-back tambien chocaba contra la falta de
     SELECT de anon, tirando abajo TODA la compra sin cuenta. El frontend
     ahora genera el uuid del pedido el mismo y no pide nada de vuelta.
*/

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
      AND created_at > now() - interval '10 minutes'
  );
$$;

DROP POLICY IF EXISTS "Guests can insert items for guest orders" ON order_items;
CREATE POLICY "Guests can insert items for guest orders" ON order_items FOR INSERT
  TO anon WITH CHECK (public.is_recent_guest_order(order_id));
