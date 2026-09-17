/*
  043_orders_currency_y_mp_payment_id (auditoría 2026-09-16)

  ## Problema
  Un comprador fuera de Argentina paga en USD (FormatOptions/useCountry ya
  calculan y muestran precios en dólares), pero orders.total nunca guardaba
  en qué moneda estaba ese número. El checkout mostraba "US$ 0.02" para un
  producto de USD 24 (formatPrice() dividía un monto que YA era dólares por
  la cotización ARS/USD, como si fuera pesos) y, si el método era Mercado
  Pago, se armaba un cobro con currency_id fijo en "ARS" — cobrando 24
  PESOS por un producto de 24 DÓLARES.

  Además, no había ningún lugar para guardar el id del pago real de Mercado
  Pago: un cobro duplicado del mismo pedido se descartaba en silencio ("ya
  estaba pagado") sin dejar rastro para reembolsar desde el panel de MP.

  ## Fix
  - orders.currency: 'ARS' (default, pedidos existentes y nuevos sin
    especificar quedan en ARS, que es lo que siempre fue) o 'USD'. La
    escribe CheckoutPage.tsx al crear el pedido; la usa api/create-preference.ts
    (rechaza Mercado Pago si no es ARS) y api/mp-webhook.ts (última barrera).
  - orders.mp_payment_id: id del pago aprobado en Mercado Pago, para poder
    identificar/reembolsar un cobro duplicado desde el panel de MP.

  Ambas columnas nullable con default seguro: no rompe pedidos existentes ni
  las policies de RLS ya definidas (no dependen de estas columnas).

  Idempotente.
*/

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'ARS'
    CHECK (currency IN ('ARS', 'USD'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS mp_payment_id text;

COMMENT ON COLUMN public.orders.currency IS 'Moneda real del total del pedido (ARS o USD). Ver src/components/ui/FormatOptions.tsx y api/create-preference.ts.';
COMMENT ON COLUMN public.orders.mp_payment_id IS 'Id del pago de Mercado Pago que confirmó este pedido (lo guarda api/mp-webhook.ts, best-effort).';
