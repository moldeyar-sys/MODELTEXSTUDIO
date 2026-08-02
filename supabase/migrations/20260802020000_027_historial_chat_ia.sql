/*
  027_historial_chat_ia — Historial de conversaciones + limite sin cuenta

  Guarda cada mensaje del asistente IA (usuario y respuesta) para que el
  admin pueda ver que le preguntan a la IA. Ademas habilita el limite de
  10 preguntas para quien no tiene cuenta: se cuenta por sesion (session_id
  que genera el navegador), nunca por contenido, asi el admin ve el
  historial completo pero nadie mas puede leer conversaciones ajenas.
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Publico: solo puede ESCRIBIR (el propio endpoint /api/chat registra los
-- mensajes con la anon key). Nadie puede leer conversaciones ajenas.
DROP POLICY IF EXISTS "chat_messages public insert" ON chat_messages;
CREATE POLICY "chat_messages public insert" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin: lee todo, para ver que pregunta la gente.
DROP POLICY IF EXISTS "chat_messages admin read" ON chat_messages;
CREATE POLICY "chat_messages admin read" ON chat_messages FOR SELECT
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);

-- Cuenta cuantas preguntas (mensajes de usuario) mando una sesion SIN cuenta.
-- SECURITY DEFINER: asi /api/chat puede saber "cuantas lleva" sin necesitar
-- permiso de lectura general sobre la tabla (que sigue siendo solo-admin).
CREATE OR REPLACE FUNCTION public.count_session_messages(p_session_id text)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT count(*)::integer FROM chat_messages
  WHERE session_id = p_session_id AND role = 'user' AND user_id IS NULL;
$$;
GRANT EXECUTE ON FUNCTION public.count_session_messages(text) TO anon, authenticated;
