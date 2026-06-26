-- 018 — Campo entrega_inmediata en products
-- true  = "⚡ Descarga inmediata" (PDF ya subido)
-- false = "🕐 Moldes en preparación · disponible en 24 hs"
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS entrega_inmediata boolean NOT NULL DEFAULT false;
