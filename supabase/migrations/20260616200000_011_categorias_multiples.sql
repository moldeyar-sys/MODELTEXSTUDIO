/*
  011_categorias_multiples
  Permite que un producto tenga varias categorías (hasta 3).
  `category` sigue siendo la principal; `categories` es el array completo.
  Siembra el array con la categoría actual para los productos existentes.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

UPDATE products
  SET categories = ARRAY[category]
  WHERE (categories IS NULL OR cardinality(categories) = 0)
    AND category IS NOT NULL AND category <> '';

-- Índice para filtrar rápido por categoría dentro del array
CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING gin (categories);
