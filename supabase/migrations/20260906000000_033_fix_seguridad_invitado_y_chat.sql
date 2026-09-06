/*
  033_fix_seguridad_invitado_y_chat — FIX DE SEGURIDAD CRÍTICO (revisión 2026-09-06)

  ## Problema 1: auto-aprobación de pedido de invitado
  La policy "Guests can insert guest orders" (migración 028) permite insertar
  un pedido de invitado con WITH CHECK (user_id IS NULL AND guest_email...),
  SIN restringir payment_status/order_status — exactamente el mismo agujero
  que la migración 022 ya había cerrado para usuarios con cuenta. Con la
  anon key (pública, vive en el bundle del cliente) se podía insertar un
  pedido YA marcado 'pagado' y descargar el molde sin pagar.

  Fix: mismo patrón que 022, aplicado a la policy de invitados.

  ## Problema 2: inyección en chat_messages
  La policy "chat_messages public insert" (migración 027) es WITH CHECK (true):
  cualquiera con la anon key podía insertar mensajes falsos con user_id ajeno
  o role='assistant', que el panel admin luego muestra como historial real.

  Fix: cerrar el INSERT público por completo. El endpoint /api/chat pasa a
  escribir con la service role (que ignora RLS), así que no se pierde el
  registro de historial real — solo se cierra la puerta de escritura directa.

  Ambos fixes son solo de políticas: no tocan datos ni columnas existentes,
  no rompen el checkout normal (que siempre inserta 'pendiente') ni el chat
  (que pasa a loguear server-side).
*/

DROP POLICY IF EXISTS "Guests can insert guest orders" ON orders;
CREATE POLICY "Guests can insert guest orders" ON orders FOR INSERT
  TO anon WITH CHECK (
    user_id IS NULL AND guest_email IS NOT NULL AND guest_email <> ''
    AND payment_status = 'pendiente' AND order_status = 'pendiente'
  );

DROP POLICY IF EXISTS "chat_messages public insert" ON chat_messages;
