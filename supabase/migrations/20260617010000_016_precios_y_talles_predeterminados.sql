-- ====================================================================
-- 016 — Precios y talles predeterminados para todos los productos
-- --------------------------------------------------------------------
-- Aplica precios estándar y curva completa de talles a TODOS los
-- productos existentes, agrupados por categoría.
-- Se puede re-ejecutar de forma segura (idempotente).
--
-- Nota: Los precios son para la curva completa predeterminada.
-- El ajuste por talle extra/menos se hace en el frontend.
-- ====================================================================

-- ── ADULTOS (dama, hombre, adultos-unisex) ───────────────────────────
-- Cartón:  $80.000 ARS / USD 60
-- PDF-A4:  $30.000 ARS / USD 20
-- Plóter:  $50.000 ARS / USD 40
-- Talles:  XS, S, M, L, XL, 2XL, 3XL, 4XL
UPDATE products SET
  precio_carton         = 80000,
  precio_pdf_a4         = 30000,
  precio_pdf_ploter     = 50000,
  precio_usd_carton     = 60,
  precio_usd_pdf_a4     = 20,
  precio_usd_pdf_ploter = 40,
  price                 = 30000,   -- campo base = PDF-A4 (fallback en catálogo)
  disponible_carton     = true,
  disponible_pdf_a4     = true,
  sizes                 = ARRAY['XS','S','M','L','XL','2XL','3XL','4XL']
WHERE category IN ('dama','hombre','adultos-unisex');

-- ── NIÑOS / NIÑAS (nina, nino, ninos-unisex) ─────────────────────────
-- Cartón:  $80.000 ARS / USD 60
-- PDF-A4:  $36.000 ARS / USD 24
-- Plóter:  $50.000 ARS / USD 40
-- Talles:  4, 6, 8, 10, 12, 14, 16
UPDATE products SET
  precio_carton         = 80000,
  precio_pdf_a4         = 36000,
  precio_pdf_ploter     = 50000,
  precio_usd_carton     = 60,
  precio_usd_pdf_a4     = 24,
  precio_usd_pdf_ploter = 40,
  price                 = 36000,
  disponible_carton     = true,
  disponible_pdf_a4     = true,
  sizes                 = ARRAY['4','6','8','10','12','14','16']
WHERE category IN ('nina','nino','ninos-unisex');

-- ── BEBÉS ─────────────────────────────────────────────────────────────
-- Cartón:  $70.000 ARS / USD 55
-- PDF-A4:  $28.000 ARS (estimado — ajustar si es necesario) / USD 20
-- Plóter:  $45.000 ARS / USD 35
-- Talles:  1, 2, 3, 4, 5, 6, 7, 8, 9
UPDATE products SET
  precio_carton         = 70000,
  precio_pdf_a4         = 30000,
  precio_pdf_ploter     = 45000,
  precio_usd_carton     = 55,
  precio_usd_pdf_a4     = 20,
  precio_usd_pdf_ploter = 35,
  price                 = 28000,
  disponible_carton     = true,
  disponible_pdf_a4     = true,
  sizes                 = ARRAY['1','2','3','4','5','6','7','8','9']
WHERE category IN ('bebes');
