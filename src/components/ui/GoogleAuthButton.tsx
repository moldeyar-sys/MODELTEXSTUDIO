import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../lib/locale';
import { isOAuthProviderEnabled } from '../../lib/supabase';
import { setNewsletterPending } from '../../lib/newsletter';

// Una sola consulta por carga de página, compartida entre Login y Registro.
let googleEnabled: Promise<boolean> | null = null;
function checkGoogleEnabled() {
  googleEnabled ??= isOAuthProviderEnabled('google');
  return googleEnabled;
}

/**
 * Botón "Continuar con Google" + separador "o con tu email", compartido por
 * LoginPage y RegisterPage. Con Google, registrarse e iniciar sesión son la
 * misma acción (Supabase crea la cuenta si no existe), por eso el mismo botón
 * sirve en ambas pantallas.
 *
 * Mientras el provider Google no esté activado en el panel de Supabase, el
 * bloque entero se oculta solo (en vez de ofrecer un botón que no funciona) y
 * aparece sin tocar código el día que se active.
 *
 * newsletterSource: si viene, quien entre con Google queda anotado en la lista
 * de novedades con ese origen (casilla tildada en RegisterPage).
 */
export function GoogleAuthButton({ next = '/', onError, newsletterSource = null }: { next?: string; onError: (msg: string) => void; newsletterSource?: string | null }) {
  const { signInWithGoogle } = useAuth();
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);
  // Optimista: una vez activado Google (el caso normal) no hay salto de diseño.
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    checkGoogleEnabled().then(ok => { if (!cancelled) setAvailable(ok); });
    return () => { cancelled = true; };
  }, []);

  if (!available) return null;

  const handleClick = async () => {
    setBusy(true);
    onError('');
    setNewsletterPending(newsletterSource);
    const { error } = await signInWithGoogle(next);
    if (error) {
      onError(/not enabled|unsupported provider/i.test(error)
        ? t('auth.googleOff', 'El ingreso con Google no está disponible por el momento. Usá tu email y contraseña.')
        : t('auth.googleFail', 'No pudimos conectar con Google. Probá de nuevo o usá tu email.'));
      setBusy(false);
    }
    // Sin error, el navegador ya se está yendo a Google: no reseteamos busy
    // para que el botón no vuelva a quedar clickeable durante la redirección.
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl py-3 px-4 font-medium text-gray-700 transition-colors disabled:opacity-60"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        {busy ? t('auth.googleBusy', 'Conectando con Google...') : t('auth.google', 'Continuar con Google')}
      </button>
      <div className="flex items-center gap-3 my-6" aria-hidden="true">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-gray-400 uppercase">{t('auth.or', 'o con tu email')}</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>
    </>
  );
}
