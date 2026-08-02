/*
  028_compra_sin_cuenta — Checkout de invitado

  Hoy comprar exige cuenta porque orders/order_items solo aceptan INSERT de
  "authenticated" con user_id = auth.uid(). Se agrega un camino paralelo para
  invitados: user_id queda NULL y se guarda su email (guest_email) para poder
  avisarle cuando se confirme el pago (el pago siempre se confirma a mano,
  nunca automatico, asi que sin este dato el invitado no tendria forma de
  volver a buscar sus archivos).

  La lectura del pedido de un invitado (sin sesion) NO pasa por RLS de estas
  tablas: la hace el endpoint /api/guest-order con la service role, verificando
  pedido + email antes de mostrar nada. Por eso alcanza con permitir el INSERT
  aca; no hace falta (ni conviene) una policy de SELECT publica.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email text;

DROP POLICY IF EXISTS "Guests can insert guest orders" ON orders;
CREATE POLICY "Guests can insert guest orders" ON orders FOR INSERT
  TO anon WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL AND guest_email <> '');

-- El id de pedido (uuid) no es adivinable, pero de todos modos se acota la
-- ventana: solo se puede sumar items a un pedido de invitado creado hace
-- poco (el propio checkout, no cualquier pedido viejo de otra persona).
DROP POLICY IF EXISTS "Guests can insert items for guest orders" ON order_items;
CREATE POLICY "Guests can insert items for guest orders" ON order_items FOR INSERT
  TO anon WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id AND user_id IS NULL AND created_at > now() - interval '10 minutes'
    )
  );
