/*
  034 — Crear cuenta después de comprar como invitado: reclamar el pedido

  CheckoutPage ahora ofrece, en la pantalla de éxito de una compra SIN
  cuenta, crear la cuenta con el mismo email en un paso (solo elegir una
  contraseña). Esta función vincula ese pedido recién hecho a la cuenta
  nueva (orders.user_id) para que aparezca en "Mis compras" en vez de
  quedar huérfano como pedido de invitado.

  Seguridad: quien llama tiene que estar autenticado, conocer el UUID del
  pedido (solo lo tiene quien hizo la compra: nunca se lista públicamente)
  Y el email de su cuenta tiene que coincidir con el guest_email del
  pedido. SECURITY DEFINER porque los usuarios no tienen (a propósito,
  migraciones 028/033) permiso de UPDATE sobre orders.

  guest_email se conserva: el link de "mi-pedido" que llegó por email
  sigue funcionando igual después de reclamar el pedido.

  El front lo llama best-effort: si esta migración todavía no se corrió,
  la cuenta se crea igual y el pedido sigue accesible como invitado.
*/

CREATE OR REPLACE FUNCTION public.claim_guest_order(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_updated integer := 0;
BEGIN
  IF auth.uid() IS NULL OR v_email = '' THEN
    RETURN false;
  END IF;

  UPDATE public.orders
     SET user_id = auth.uid()
   WHERE id = p_order_id
     AND user_id IS NULL
     AND lower(coalesce(guest_email, '')) = v_email;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_guest_order(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_guest_order(uuid) TO authenticated;
