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
drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- 4. Indice: el sitemap y el panel ordenan por fecha de modificacion.
create index if not exists products_updated_at_idx
  on public.products (updated_at desc);

comment on column public.products.updated_at is
  'Ultima modificacion real de la ficha. La pisa el trigger products_set_updated_at en cada UPDATE. Es la fuente del <lastmod> del sitemap (api/sitemap.ts).';
