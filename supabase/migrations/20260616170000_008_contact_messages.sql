/*
  008_contact_messages — Sección pública "Contacto"

  Tabla para guardar los mensajes del formulario público.
  RLS: cualquiera puede ENVIAR (insert); solo admin puede leer/editar/borrar.
  Reutiliza public.is_admin().
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT '',
  whatsapp text DEFAULT '',
  email text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Público: solo puede ENVIAR mensajes (no leer los de otros)
DROP POLICY IF EXISTS "contact public insert" ON contact_messages;
CREATE POLICY "contact public insert" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin: lee, actualiza y borra
DROP POLICY IF EXISTS "contact admin read" ON contact_messages;
CREATE POLICY "contact admin read" ON contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "contact admin update" ON contact_messages;
CREATE POLICY "contact admin update" ON contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact admin delete" ON contact_messages;
CREATE POLICY "contact admin delete" ON contact_messages FOR DELETE
  TO authenticated USING (public.is_admin());
