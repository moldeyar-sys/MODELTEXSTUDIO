/*
  023_newsletter_subscribers — Captura de email en "Moldes Gratis"

  Lista propia de correos: a diferencia de crear cuenta (que pide contraseña),
  esto es un compromiso minimo para avisar por mail cuando hay moldes gratis
  nuevos. Mismo patron de RLS que contact_messages: cualquiera puede sumarse,
  solo el admin puede leer la lista.
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text DEFAULT 'moldes-gratis',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Público: solo puede SUMARSE (no leer la lista de otros)
DROP POLICY IF EXISTS "newsletter public insert" ON newsletter_subscribers;
CREATE POLICY "newsletter public insert" ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin: lee y borra (para dar de baja a pedido)
DROP POLICY IF EXISTS "newsletter admin read" ON newsletter_subscribers;
CREATE POLICY "newsletter admin read" ON newsletter_subscribers FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "newsletter admin delete" ON newsletter_subscribers;
CREATE POLICY "newsletter admin delete" ON newsletter_subscribers FOR DELETE
  TO authenticated USING (public.is_admin());
