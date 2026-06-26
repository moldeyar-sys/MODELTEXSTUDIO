-- ====================================================================
-- 017 — Configuración de medios de pago (editable desde el admin)
-- ====================================================================

CREATE TABLE IF NOT EXISTS payment_settings (
  id                text PRIMARY KEY DEFAULT 'default',
  -- Transferencia bancaria
  transfer_alias    text NOT NULL DEFAULT 'MOLDEY.DIGITAL',
  transfer_holder   text NOT NULL DEFAULT 'Modeltex',
  transfer_bank     text NOT NULL DEFAULT '',
  transfer_cbu      text NOT NULL DEFAULT '',
  -- Binance / Cripto
  binance_wallet    text NOT NULL DEFAULT '',
  binance_network   text NOT NULL DEFAULT 'BSC (BEP20)',
  -- PayPal
  paypal_link       text NOT NULL DEFAULT '',
  paypal_qr_url     text NOT NULL DEFAULT '/brand/paypal-qr.png',
  -- Mercado Pago
  mp_payment_link   text NOT NULL DEFAULT 'https://link.mercadopago.com.ar/modeltex',
  -- Metadata
  updated_at        timestamptz DEFAULT now()
);

-- Insertar fila default (sólo si no existe)
INSERT INTO payment_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- RLS: cualquiera puede leer (necesario para CheckoutPage público),
-- sólo admin puede escribir.
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_settings_read_all"
  ON payment_settings FOR SELECT USING (true);

CREATE POLICY "payment_settings_admin_write"
  ON payment_settings FOR ALL USING (public.is_admin());
