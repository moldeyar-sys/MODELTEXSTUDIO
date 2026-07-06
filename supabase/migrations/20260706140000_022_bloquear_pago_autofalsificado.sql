/*
  022_bloquear_pago_autofalsificado — FIX DE SEGURIDAD CRÍTICO

  ## Problema
  La policy "Users can insert own orders" (migración 001) permite insertar un
  pedido con WITH CHECK (user_id = auth.uid()), SIN restringir el estado de
  pago. Un usuario podía crear un pedido YA marcado como 'pagado':
      supabase.from('orders').insert({ user_id: <su id>, payment_status: 'pagado', ... })
  Y como las descargas del bucket privado se habilitan cuando existe un pedido
  'pagado' de ese producto, podía bajar moldes pagos sin pagar y sin que el
  admin lo autorice.

  ## Fix
  Reemplazar la policy de INSERT para que un usuario SOLO pueda crear pedidos
  con payment_status = 'pendiente' (y order_status = 'pendiente'). El pase a
  'pagado' queda exclusivamente en manos del admin (policy de UPDATE, que ya
  es solo admin). El checkout ya inserta 'pendiente', así que no se rompe nada.

  ## Notas
  - No afecta el flujo normal: CheckoutPage crea el pedido en 'pendiente'.
  - El admin sigue confirmando el pago a mano desde el panel (o, a futuro, un
    webhook con service role, que ignora RLS).
  - Idempotente.
*/

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND payment_status = 'pendiente'
    AND order_status = 'pendiente'
  );
