/*
  024_busqueda_semantica — Embeddings para el asistente IA

  Hoy el asistente recibe un volcado de hasta 600 productos como contexto en
  cada mensaje: caro y ademas solo entiende coincidencia literal de texto
  ("abrigado" no encuentra "campera de frisa"). Esto agrega busqueda por
  significado: cada producto activo se convierte en un vector (embedding) y,
  ante una pregunta, se buscan los productos mas cercanos en significado —
  igual que hace un vendedor humano, no una busqueda de texto.

  No hace falta una base de datos vectorial aparte: pgvector vive en el mismo
  Postgres de Supabase.

  Los embeddings se generan aparte (panel admin, boton "Busqueda inteligente"),
  no en esta migracion: acá solo se prepara el terreno.
*/

CREATE EXTENSION IF NOT EXISTS vector;

-- 1536 = dimension del modelo openai/text-embedding-3-small (via OpenRouter,
-- la misma cuenta que ya se usa para el chat).
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- HNSW: el tipo de indice recomendado por pgvector para busqueda por
-- similitud coseno en catalogos de este tamaño (cientos/miles de filas).
CREATE INDEX IF NOT EXISTS products_embedding_idx
  ON products USING hnsw (embedding vector_cosine_ops);

-- Devuelve los productos activos mas parecidos en significado al embedding
-- de la pregunta. Solo las columnas que necesita el asistente (nunca el
-- vector de 1536 numeros: no sirve para nada del lado del cliente y solo
-- infla la respuesta). SECURITY INVOKER (default): corre con los permisos de
-- quien llama, y ya existe una policy publica "is_active = true", asi que
-- funciona tanto desde el chat (anon) como logueado.
CREATE OR REPLACE FUNCTION public.match_products(
  query_embedding vector(1536),
  match_count int DEFAULT 8
)
RETURNS TABLE (
  name text,
  codigo text,
  price numeric,
  sale_price numeric,
  category text,
  garment_type text,
  sizes text[],
  formats text[],
  recommended_fabrics text[]
)
LANGUAGE sql
STABLE
AS $$
  SELECT name, codigo, price, sale_price, category, garment_type, sizes, formats, recommended_fabrics
  FROM products
  WHERE is_active = true AND embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_products(vector(1536), int) TO anon, authenticated;
