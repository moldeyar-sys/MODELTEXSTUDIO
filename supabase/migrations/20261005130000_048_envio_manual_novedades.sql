/*
  048_envio_manual_novedades — envío MANUAL del mail de moldes gratis

  El envío automático (cron diario) se eliminó el 2026-10-05. Ahora el admin
  manda el mail cuando quiere desde el panel (Novedades > "Enviar aviso"),
  eligiendo moldes y público. Dos tablas de apoyo, ambas escritas solo por el
  servidor (service role); el admin las lee desde el panel:

  - newsletter_sends: historial de envíos (qué moldes, a qué público, cuántos
    salieron, error de Resend si hubo). Sirve para no mandar dos veces lo mismo.
  - newsletter_optout: emails que apretaron "darme de baja". Se excluyen de
    TODOS los públicos (también "usuarios registrados" y "compradores", que no
    salen de newsletter_subscribers).

  Idempotente.
*/

CREATE TABLE IF NOT EXISTS newsletter_optout (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE newsletter_optout ENABLE ROW LEVEL SECURITY;
-- Sin policies: solo la service role (api/utils.ts) lee y escribe.

CREATE TABLE IF NOT EXISTS newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  audience text NOT NULL DEFAULT 'subscribers',
  mold_ids uuid[] DEFAULT '{}',
  mold_titles text[] DEFAULT '{}',
  recipients integer DEFAULT 0,
  sent integer DEFAULT 0,
  error text,
  test boolean DEFAULT false,
  sent_by text
);
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_sends admin read" ON newsletter_sends;
CREATE POLICY "newsletter_sends admin read"
  ON newsletter_sends FOR SELECT
  TO authenticated
  USING (public.is_admin());
-- INSERT solo por service role (sin policy).
