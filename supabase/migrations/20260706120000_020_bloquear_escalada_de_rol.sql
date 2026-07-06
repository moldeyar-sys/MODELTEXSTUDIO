/*
  020_bloquear_escalada_de_rol — FIX DE SEGURIDAD CRÍTICO

  ## Problema
  La policy "Users can update own profile" (migración 001) permite a un usuario
  actualizar su propio perfil con WITH CHECK (auth.uid() = id), SIN restringir
  qué columnas puede cambiar. Como profiles tiene la columna `role`, cualquier
  usuario autenticado podía hacerse admin con:
      supabase.from('profiles').update({ role: 'admin' }).eq('id', <su id>)
  y a partir de ahí acceder a TODO (pedidos, archivos pagos, datos de clientes).

  ## Fix
  Un trigger BEFORE UPDATE que, si un NO-admin intenta cambiar su `role`,
  descarta el cambio y deja el rol anterior. Los admins reales sí pueden
  cambiar roles (para nombrar otros admins desde el panel/SQL).

  Reutiliza public.is_admin() (SECURITY DEFINER), que ya existe.

  ## Notas
  - No rompe nada del flujo actual: los usuarios siguen pudiendo editar su
    nombre, whatsapp, país, etc. Solo se les ignora el intento de tocar `role`.
  - Idempotente: se puede correr más de una vez sin efectos secundarios.
*/

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si el rol cambia y quien edita NO es admin, se revierte al rol previo.
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();
