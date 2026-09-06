/*
  030_payoneer_wise_paypal_business
  - Agrega campos de Payoneer y Wise (cobro internacional) a payment_settings.
  - Limpia el link personal de PayPal (paypal.me/JHONDESPINOZA) guardado hoy:
    generaba desconfianza porque el titular no coincide con "Modeltex".
    Cargar el link de la cuenta PayPal Business "Modeltex" desde el panel admin.
  Aditivo y seguro: el UPDATE solo borra el link si sigue siendo exactamente
  el personal (no pisa un valor que Denis ya haya cambiado a mano).
*/

ALTER TABLE payment_settings
  ADD COLUMN IF NOT EXISTS payoneer_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payoneer_link  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS wise_email     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS wise_link      text NOT NULL DEFAULT '';

UPDATE payment_settings
SET paypal_link = ''
WHERE id = 'default'
  AND paypal_link = 'https://paypal.me/JHONDESPINOZA?locale.x=es_XC&country.x=AR';
