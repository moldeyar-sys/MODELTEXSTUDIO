-- 041 — products.updated_at: fecha real de ultima modificacion de cada molde.
--
-- POR QUE: el sitemap usaba created_at como <lastmod> en las 2.044 fichas. Eso
-- le dice a Google "esta ficha no cambio nunca desde que la cargamos", aunque
-- se le haya corregido el titulo, la descripcion, el precio, la imagen o la
-- categoria. Resultado: Google vuelve a rastrear cada vez menos seguido y los
-- cambios tardan en verse en los resultados. Peor todavia, un <lastmod> que
-- miente hace que el buscador deje de confiar en el archivo entero.
--
-- QUE HACE: agrega products.updated_at y un trigger que la pisa con now() en
-- CUALQUIER UPDATE de la fila. Asi cambia sola cuando cambia el titulo, la
-- descripcion, cualquier precio, la imagen, la categoria, los talles, los
-- formatos, la disponibilidad o el estado activo. Nadie tiene que acordarse
-- de actualizarla a mano.
--
-- COMO SE APLICA (Denis): entrar a Supabase -> proyecto de Modeltex -> menu
-- izquierdo "SQL Editor" -> "New query" -> pegar TODO este archivo -> "Run".
-- Es seguro correrlo mas de una vez: no borra ni cambia ningun dato de los
-- moldes, solo agrega la columna y el trigger si todavia no existen.
--
-- Mientras no se ejecute, api/sitemap.ts detecta que la columna no esta y
-- sigue usando created_at: el sitio no se rompe, simplemente el lastmod no
-- mejora hasta que se corra este SQL.

-- 1. La columna. Arranca con el valor de created_at para no inventar fechas
--    de modificacion que nunca ocurrieron.
alter table public.products
  add column if not exists updated_at timestamptz;

update public.products
   set updated_at = coalesce(created_at, now())
 where updated_at is null;

alter table public.products
  alter column updated_at set default now();

-- 2. La funcion del trigger. Generica y reutilizable por otras tablas.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 3. El trigger. Se recrea para que correr el archivo dos veces no falle.
--
-- CORREGIDO 2026-09-16 (auditoria, antes de que Denis llegara a correr este
-- archivo — nunca estuvo asi en produccion): la primera version disparaba
-- el trigger en CUALQUIER UPDATE, sin condicion. api/embed-catalog.ts hace
-- un PATCH por producto con {embedding, embedding_updated_at} cada vez que
-- el admin aprieta "Indexar"/"Regenerar" (puede ser el catalogo entero), y
-- las funciones de vistas (migraciones 025/026) hacen UPDATE products SET
-- view_count = ... en CADA visita de un producto, sin cuenta incluida. Con
-- el trigger sin condicion, el <lastmod> del sitemap hubiera pasado a ser
-- "la ultima vez que alguien miro la ficha" o "la ultima vez que se
-- reindexo" — exactamente el lastmod mentiroso que este archivo existe para
-- evitar. La clausula WHEN de abajo compara solo las columnas de CONTENIDO
-- real (la misma lista que ya usa PRODUCT_COLUMNS en src/lib/productColumns.ts,
-- la fuente que el propio código mantiene al día, menos "embedding" — nunca
-- se compara ese vector de 1536 numeros, evaluarlo en cada vista de producto
-- seria caro) y deja afuera a proposito view_count/view_count_account/
-- view_count_no_account/embedding_updated_at/created_at/updated_at.
drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
  before update on public.products
  for each row
  when (
    (
      OLD.name, OLD.slug, OLD.short_description, OLD.long_description,
      OLD.price, OLD.sale_price, OLD.category, OLD.categories, OLD.garment_type,
      OLD.sizes, OLD.formats, OLD.recommended_fabrics, OLD.codigo,
      OLD.precio_carton, OLD.precio_pdf_a4, OLD.precio_pdf_ploter,
      OLD.disponible_carton, OLD.disponible_pdf_a4, OLD.mostrar_consulta_otro_formato,
      OLD.precio_usd_carton, OLD.precio_usd_pdf_a4, OLD.precio_usd_pdf_ploter, OLD.precio_usd,
      OLD.precio_dxf, OLD.precio_pds, OLD.precio_mrk, OLD.precio_ads,
      OLD.precio_usd_dxf, OLD.precio_usd_pds, OLD.precio_usd_mrk, OLD.precio_usd_ads,
      OLD.free_until, OLD.season, OLD.entrega_inmediata,
      OLD.main_image_url, OLD.gallery, OLD.is_active, OLD.is_featured
    ) IS DISTINCT FROM (
      NEW.name, NEW.slug, NEW.short_description, NEW.long_description,
      NEW.price, NEW.sale_price, NEW.category, NEW.categories, NEW.garment_type,
      NEW.sizes, NEW.formats, NEW.recommended_fabrics, NEW.codigo,
      NEW.precio_carton, NEW.precio_pdf_a4, NEW.precio_pdf_ploter,
      NEW.disponible_carton, NEW.disponible_pdf_a4, NEW.mostrar_consulta_otro_formato,
      NEW.precio_usd_carton, NEW.precio_usd_pdf_a4, NEW.precio_usd_pdf_ploter, NEW.precio_usd,
      NEW.precio_dxf, NEW.precio_pds, NEW.precio_mrk, NEW.precio_ads,
      NEW.precio_usd_dxf, NEW.precio_usd_pds, NEW.precio_usd_mrk, NEW.precio_usd_ads,
      NEW.free_until, NEW.season, NEW.entrega_inmediata,
      NEW.main_image_url, NEW.gallery, NEW.is_active, NEW.is_featured
    )
  )
  execute function public.set_updated_at();

-- 4. Indice: el sitemap y el panel ordenan por fecha de modificacion.
create index if not exists products_updated_at_idx
  on public.products (updated_at desc);

comment on column public.products.updated_at is
  'Ultima modificacion real de la ficha. La pisa el trigger products_set_updated_at en cada UPDATE. Es la fuente del <lastmod> del sitemap (api/sitemap.ts).';
