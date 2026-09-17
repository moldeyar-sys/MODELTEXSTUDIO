/*
  045_bloquear_cambio_de_email_en_profiles (auditoría 2026-09-16)

  ## Problema
  La policy "Users can update own profile" (migración 001) solo exige
  auth.uid() = id, sin restringir columnas — igual que pasaba con `role`
  antes de la migración 020 (prevent_role_escalation), que sí quedó
  protegido. `profiles.email` quedó afuera de esa protección: cualquier
  usuario autenticado puede hacer
      supabase.from('profiles').update({ email: 'otro@x.com' })
  y ese valor es justamente el que usa api/utils.ts (aviso de nueva compra al
  dueño) y api/create-preference.ts (a quién se le exige que coincida el
  payerEmail para generar el link de pago) para identificar al comprador. No
  hay ningún flujo en la app para cambiar el email real de la cuenta (el
  campo está deshabilitado en MyAccountPage.tsx) — el valor legítimo siempre
  debería ser el mismo que auth.users.email.

  ## Fix
  Mismo patrón que prevent_role_escalation (020): si un NO-admin intenta
  cambiar `email` o `created_at`, el trigger revierte al valor anterior en
  vez de rechazar todo el UPDATE (así el resto de los campos del formulario
  de "Mi cuenta" se siguen guardando igual). Los admins reales pueden seguir
  editando cualquier perfil desde el panel/SQL.

  Idempotente.
*/

CREATE OR REPLACE FUNCTION public.prevent_profile_email_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      NEW.email := OLD.email;
    END IF;
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      NEW.created_at := OLD.created_at;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_email_change ON public.profiles;
CREATE TRIGGER trg_prevent_profile_email_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_email_change();
