-- ====================================================================
-- 015 — TEMPORADA (estación) de los moldes del catálogo
-- --------------------------------------------------------------------
-- Agrega la columna `season` a products para filtrar el catálogo por
-- Verano / Invierno / Todo el año.
--
-- Regla de negocio: los moldes marcados como 'todo-el-anio' se muestran
-- en TODAS las temporadas (en Todas, Verano e Invierno). Esa lógica se
-- aplica en el frontend (CatalogPage); acá solo guardamos el valor.
--
-- Valores esperados: 'verano' | 'invierno' | 'todo-el-anio'
-- Por defecto, todo molde existente queda como 'todo-el-anio'.
-- ====================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS season text NOT NULL DEFAULT 'todo-el-anio';

-- Índice opcional para acelerar filtros por temporada en catálogos grandes.
CREATE INDEX IF NOT EXISTS idx_products_season ON products (season);
