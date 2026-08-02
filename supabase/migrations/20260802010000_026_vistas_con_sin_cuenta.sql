/*
  026_vistas_con_sin_cuenta — Desglose de "Productos mas vistos"

  view_count (de la migracion 025) queda intacto como el total general.
  Se suman dos columnas para ver, igual que en descargas de Moldes Gratis,
  cuanto de ese trafico es gente logueada vs. gente sin cuenta.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count_account integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count_no_account integer DEFAULT 0;

-- Se reemplaza la funcion (dropeando la version vieja de 1 argumento primero,
-- para no dejar dos versiones ambiguas conviviendo) por una que recibe si
-- quien mira esta logueado y suma al contador que corresponda ademas del total.
DROP FUNCTION IF EXISTS public.increment_product_view(uuid);

CREATE OR REPLACE FUNCTION public.increment_product_view(p_id uuid, p_has_account boolean DEFAULT false)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE products SET
    view_count = view_count + 1,
    view_count_account = view_count_account + (CASE WHEN p_has_account THEN 1 ELSE 0 END),
    view_count_no_account = view_count_no_account + (CASE WHEN p_has_account THEN 0 ELSE 1 END)
  WHERE id = p_id AND is_active = true;
$$;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid, boolean) TO anon, authenticated;
