import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BrandLogo } from '../components/brand/BrandLogo';

/**
 * Pantalla del link de "recuperar contraseña" (ver ForgotPasswordPage.tsx +
 * AuthContext.resetPassword, que ahora manda el mail acá con redirectTo).
 * Antes esta página NO EXISTÍA: el link de recuperación no tenía adónde
 * caer, y no había ningún código que escuchara el evento PASSWORD_RECOVERY
 * de Supabase ni llamara a updateUser({password}) — la única vía de
 * recuperación del sitio no cerraba el círculo.
 *
 * auth-js abre la sesión de recuperación solo con el link del mail (via el
 * hash #access_token=...&type=recovery de la URL) y dispara el evento
 * PASSWORD_RECOVERY. Mientras no confirmamos ese evento (o que ya hay
 * sesión), no mostramos el formulario: entrar acá sin un link válido no
 * debe dejar "cambiar la contraseña de quien sea que esté logueado" por
 * accidente.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // Si el evento ya se disparó antes de montar este listener (carrera
    // posible), una sesión activa alcanza para mostrar el formulario.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }

    setIsLoading(true);
    const { error: updateError } = await updatePassword(password);
    if (updateError) {
      setError(updateError);
    } else {
      setDone(true);
      setTimeout(() => navigate('/mi-cuenta'), 2000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex justify-center mb-6" aria-label="Modeltex - Inicio">
              <BrandLogo variant="full" size={96} />
            </Link>
            <h1 className="font-display text-3xl font-bold text-primary-900 mb-2">Nueva contraseña</h1>
          </div>

          {done ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">Contraseña actualizada. Te llevamos a tu cuenta...</p>
            </div>
          ) : !ready ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-sm">
                Este link no es válido o ya venció. Pedí uno nuevo desde{' '}
                <Link to="/recuperar-contrasena" className="underline font-medium">recuperar contraseña</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repetí la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
                {isLoading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
