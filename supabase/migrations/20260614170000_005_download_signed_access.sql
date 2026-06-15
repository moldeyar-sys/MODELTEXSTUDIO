/*
  # Descargas protegidas: acceso del comprador a archivos del bucket privado

  Permite que un usuario autenticado genere un signed URL (createSignedUrl)
  SOLO de los archivos de productos que compro y que estan PAGADOS.

  Como los archivos se guardan con la ruta `{product_id}/{archivo}`, el
  product_id se extrae con split_part(name, '/', 1). La policy verifica que
  exista una orden pagada del usuario que incluya ese producto.

  Seguridad:
  - Sin esta policy, solo el admin podia tocar product-files.
  - El usuario NO puede listar ni leer archivos de productos no comprados.
  - Los signed URLs se generan en el cliente con expiracion corta (120s),
    asi no quedan enlaces permanentes ni compartibles a largo plazo.
*/

DROP POLICY IF EXISTS "product-files buyer read" ON storage.objects;
CREATE POLICY "product-files buyer read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-files'
    AND position('/' in name) > 0
    AND EXISTS (
      SELECT 1
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = auth.uid()
        AND o.payment_status = 'pagado'
        AND oi.product_id::text = split_part(name, '/', 1)
    )
  );
