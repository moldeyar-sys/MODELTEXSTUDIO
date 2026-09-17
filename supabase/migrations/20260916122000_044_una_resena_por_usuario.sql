/*
  044_una_resena_por_usuario (auditoría 2026-09-16)

  ## Problema
  La tabla reviews (migración 012) no tiene ningún UNIQUE sobre
  (target_type, target_id, user_id), y la policy de INSERT solo exige
  user_id = auth.uid(). ReviewsSection.tsx oculta el formulario si el
  usuario ya calificó ese producto, pero es un control de UI: cualquier
  usuario autenticado puede insertar reseñas repetidas para el mismo
  producto llamando directo a la API. Esas reseñas alimentan el
  AggregateRating que ProductDetailPage.tsx pone en el JSON-LD (lo que
  Google usa para las estrellas en el resultado de búsqueda) — una sola
  cuenta podía inflar el rating público de un molde.

  ## Fix
  Antes de agregar la restricción, se deduplican reseñas existentes
  (se conserva la más reciente por usuario+producto, se borran las demás)
  para que la migración no falle si ya hay duplicados cargados. Después,
  UNIQUE (target_type, target_id, user_id): src/lib/reviews.ts pasa a hacer
  upsert con onConflict en vez de insert, así que reintentar simplemente
  actualiza la reseña existente en lugar de fallar o duplicar.

  Idempotente (el DELETE de duplicados no hace nada si ya no hay ninguno).
*/

-- Conserva la reseña más reciente de cada (target_type, target_id, user_id)
-- y borra el resto, solo para filas con user_id (las únicas que la policy
-- de insert permite crear).
DELETE FROM public.reviews r
WHERE r.user_id IS NOT NULL
  AND r.id NOT IN (
    SELECT DISTINCT ON (target_type, target_id, user_id) id
    FROM public.reviews
    WHERE user_id IS NOT NULL
    ORDER BY target_type, target_id, user_id, created_at DESC
  );

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_one_per_user;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_one_per_user UNIQUE (target_type, target_id, user_id);
