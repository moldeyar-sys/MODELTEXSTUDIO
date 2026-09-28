import { createClient } from '@supabase/supabase-js';

// Claves PUBLICAS de Supabase.
// La "anon key" esta disenada para vivir en el cliente (va en el bundle del sitio):
// la seguridad real la dan las policies RLS de la base, no el secreto de esta clave.
// Se usan las variables de entorno si estan definidas; si no, se cae a estos valores
// para que el build SIEMPRE tenga conexion y no quede la pantalla en blanco cuando
// el hosting no tiene cargadas las env vars.
const FALLBACK_SUPABASE_URL = 'https://jotibqgyrcgwctiolhcw.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ¿Está activado un provider OAuth (ej. 'google') en el panel de Supabase?
 * Consulta el endpoint público /auth/v1/settings. Hace falta porque
 * signInWithOAuth NO devuelve error cuando el provider está apagado:
 * redirige el navegador a una página JSON cruda de Supabase con el 400
 * ("provider is not enabled") y el usuario queda fuera del sitio.
 * Si el chequeo falla (sin conexión, etc.) devuelve true: se sigue con el
 * flujo normal y en el peor caso se ve el comportamiento de siempre.
 */
export async function isOAuthProviderEnabled(provider: string): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey } });
    if (!res.ok) return true;
    const settings = await res.json() as { external?: Record<string, boolean> };
    return settings.external?.[provider] !== false;
  } catch {
    return true;
  }
}
