/*
  039_notify_order_dedupe — soporte para el fix de seguridad MEDIA de
  api/utils.ts (accion notify-order): ese endpoint no puede exigir login
  (se llama con sendBeacon justo despues del checkout, sin sesion, incluso
  para invitados), asi que la mitigacion es no dejar notificar dos veces el
  mismo pedido ni pedidos viejos. Esta columna guarda cuando ya se notifico.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS notified_at timestamptz;
