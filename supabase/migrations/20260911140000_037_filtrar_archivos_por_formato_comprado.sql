/*
  037_filtrar_archivos_por_formato_comprado — FIX DE SEGURIDAD CRÍTICO

  ## Problema
  Un producto puede tener archivos de varios formatos cargados (PDF A4,
  Cartón, Plóter, DXF/AAMA, PDS, MRK, ADS), cada uno con precio muy distinto
  (ej. PDF A4 $36.000 vs Cartón $80.000). Pero tanto la policy de
  product_files (migración 001) como la de storage.objects (migración 005)
  solo exigen que exista ALGUNA orden pagada de ese product_id — nunca
  comparan qué formato pagó el comprador (order_items.formato) contra qué
  archivo se le entrega. Pagar el formato más barato alcanzaba para
  descargar TODOS los formatos cargados del mismo producto.

  ## Fix, con compatibilidad hacia atrás
  Se agrega la comparación de formato, PERO con una salvedad: si un
  producto tiene un solo file_type distinto entre todos sus archivos (hoy,
  10-sep-2026, los 2 únicos productos con archivos reales tienen TODOS sus
  archivos como 'pdf_a4' — son piezas del mismo formato, no formatos
  distintos), se siguen entregando todos sus archivos sin exigir match,
  para no romper compras ya aprobadas. La restricción por formato entra en
  vigencia automáticamente el día que un producto tenga más de un file_type
  cargado (lo cual requiere que el admin lo cargue explícitamente distinto
  al subir cada archivo — ver el selector de formato agregado en el panel
  admin).

  Mapeo texto libre (order_items.formato) -> file_type, calcado del mismo
  mapeo que ya usa api/mp-webhook.ts (función precioReal) para no inventar
  un criterio nuevo.

  Esto NO protege el checkout de invitado (api/guest-order.ts usa la
  service role, que ignora RLS) — ese endpoint se corrige aparte en el
  mismo código, replicando esta misma lógica en JavaScript.

  Idempotente.
*/

-- Mismo orden de prioridad que precioReal() en api/mp-webhook.ts, para que la
-- validación de precio y el filtro de archivos nunca discrepen sobre qué
-- formato es cada order_item.
CREATE OR REPLACE FUNCTION public.formato_a_file_type(formato text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN formato ILIKE '%cart%' THEN 'carton'
    WHEN formato ILIKE '%pl%' THEN 'pdf_plotter'
    WHEN formato ILIKE '%dxf%' OR formato ILIKE '%aama%' THEN 'dxf'
    WHEN formato ILIKE '%pds%' OR formato ILIKE '%optitex%' THEN 'pds'
    WHEN formato ILIKE '%mrk%' OR formato ILIKE '%tizado%' THEN 'mrk'
    WHEN formato ILIKE '%ads%' OR formato ILIKE '%audaces%' THEN 'ads'
    ELSE 'pdf_a4'
  END;
$$;

DROP POLICY IF EXISTS "Users can read files of purchased products" ON product_files;
CREATE POLICY "Users can read files of purchased products"
  ON product_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE oi.product_id = product_files.product_id
        AND o.user_id = auth.uid()
        AND o.payment_status = 'pagado'
        AND (
          NOT EXISTS (
            SELECT 1 FROM product_files pf2
            WHERE pf2.product_id = product_files.product_id
              AND pf2.file_type IS DISTINCT FROM product_files.file_type
          )
          OR product_files.file_type = public.formato_a_file_type(oi.formato)
        )
    )
  );

DROP POLICY IF EXISTS "product-files buyer read" ON storage.objects;
CREATE POLICY "product-files buyer read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-files'
    AND position('/' in name) > 0
    AND EXISTS (
      SELECT 1
      FROM product_files pf
      JOIN orders o ON o.payment_status = 'pagado' AND o.user_id = auth.uid()
      JOIN order_items oi ON oi.order_id = o.id AND oi.product_id = pf.product_id
      WHERE pf.file_url = name
        AND (
          NOT EXISTS (
            SELECT 1 FROM product_files pf2
            WHERE pf2.product_id = pf.product_id
              AND pf2.file_type IS DISTINCT FROM pf.file_type
          )
          OR pf.file_type = public.formato_a_file_type(oi.formato)
        )
    )
  );
