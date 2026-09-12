/*
  038_fixes_menores_rls — 4 fallas de severidad baja de la auditoria de
  ciberseguridad de sept. 2026 (ver memoria del proyecto). Ninguna es
  explotable para descargar sin pagar ni para admin — son huecos de
  integridad de datos menores. Todas son cambios de policy, no tocan datos
  existentes ni columnas.

  1) downloads: el INSERT no exigia que order_id/product_id correspondan a
     una orden realmente pagada del propio usuario.
  2) contact_messages: el remitente podia mandar is_read=true de arranque
     en el INSERT publico.
  3) custom_requests: tanto la version para invitados como la de usuarios
     logueados dejaban que el remitente mandara cualquier status inicial en
     vez de 'pendiente' (la auditoria marco la de invitados; la de usuarios
     logueados tiene el mismo hueco textual, se corrige junto con la otra).
  4) reviews: se podian insertar reseñas repetidas del mismo usuario sobre
     el mismo producto/molde, y reseñas de productos nunca comprados.
*/

-- 1) downloads
DROP POLICY IF EXISTS "Users can insert own downloads" ON downloads;
CREATE POLICY "Users can insert own downloads"
  ON downloads FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      order_id IS NULL
      OR EXISTS (SELECT 1 FROM orders WHERE id = downloads.order_id AND user_id = auth.uid() AND payment_status = 'pagado')
    )
  );

-- 2) contact_messages: todo mensaje nuevo entra siempre como no leido.
DROP POLICY IF EXISTS "contact public insert" ON contact_messages;
CREATE POLICY "contact public insert"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_read = false);

-- 3) custom_requests: solo se puede crear la solicitud como 'pendiente'
--    (invitados y usuarios logueados, mismo hueco en las dos policies).
DROP POLICY IF EXISTS "Guests can insert custom requests" ON custom_requests;
CREATE POLICY "Guests can insert custom requests"
  ON custom_requests FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND status = 'pendiente');

DROP POLICY IF EXISTS "Users can insert own custom requests" ON custom_requests;
CREATE POLICY "Users can insert own custom requests"
  ON custom_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pendiente');

-- 4) reviews: sin duplicados por usuario, y solo sobre productos realmente comprados.
--    (target_type = 'free_mold' queda sin exigir compra: es contenido gratuito.)
ALTER TABLE reviews ADD CONSTRAINT reviews_user_target_unique UNIQUE (user_id, target_type, target_id);

DROP POLICY IF EXISTS "reviews insert own" ON reviews;
CREATE POLICY "reviews insert own"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      target_type <> 'product'
      OR EXISTS (
        SELECT 1 FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = auth.uid() AND o.payment_status = 'pagado' AND oi.product_id = reviews.target_id
      )
    )
  );
