/*
  029_formatos_industriales
  Precios (ARS y USD) de los formatos industriales CAD para fábricas y
  departamentos de patronaje: DXF/AAMA, PDS (Optitex), MRK (Tizado Optitex)
  y ADS (Audaces). Se venden con la curva completa de talles (sin ajuste
  por talle, a diferencia de Cartón/PDF-A4/Plóter).
  Aditivo, no toca nada existente.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS precio_dxf numeric,
  ADD COLUMN IF NOT EXISTS precio_pds numeric,
  ADD COLUMN IF NOT EXISTS precio_mrk numeric,
  ADD COLUMN IF NOT EXISTS precio_ads numeric,
  ADD COLUMN IF NOT EXISTS precio_usd_dxf numeric,
  ADD COLUMN IF NOT EXISTS precio_usd_pds numeric,
  ADD COLUMN IF NOT EXISTS precio_usd_mrk numeric,
  ADD COLUMN IF NOT EXISTS precio_usd_ads numeric;
