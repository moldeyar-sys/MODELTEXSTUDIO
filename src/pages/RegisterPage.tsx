import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogo } from '../components/brand/BrandLogo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  // Mismo patrón que LoginPage: si el registro se originó desde una ruta
  // protegida (ej. /descargas sin cuenta), volver ahí después, no siempre a
  // /mi-cuenta.
  const next = (location.state as { next?: string } | null)?.next ?? '/mi-cuenta';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!name.trim()) { setError('Ingresa tu nombre completo'); return; }
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Las contrasenas no coinciden'); return; }

    setIsLoading(true);
    const { error: signUpError, hasSession } = await signUp(email, password, name);
    if (signUpError) {
      // Antes: "Este email ya esta registrado" cuando Supabase devolvía
      // exactamente ese error — confirmaba o negaba, para cualquiera que
      // probara una lista de emails, cuáles ya son clientes de Modeltex.
      // Un mensaje neutro (con salida a login/recuperar) resuelve el mismo
      // caso real sin filtrar ese dato.
      setError(signUpError === 'User already registered'
        ? 'No pudimos crear la cuenta con ese email. Si ya tenés cuenta, ingresá o recuperá tu contraseña.'
        : signUpError);
    } else if (!hasSession) {
      // Hoy no pasa (mailer_autoconfirm activo en Supabase), pero si algún
      // día se activa "Confirm email" sin tocar código, signUp deja de
      // devolver sesión: antes esto igual navegaba a /mi-cuenta y el usuario
      // rebotaba a /login sin entender por qué.
      setInfo('Te mandamos un mail para confirmar tu cuenta. Confirmalo y después iniciá sesión.');
    } else {
      navigate(next);
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
            <h1 className="font-display text-3xl font-bold text-primary-900 mb-2">Crear cuenta</h1>
            <p className="text-gray-500">Unite a Modeltex y compra moldes digitales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {info && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-blue-700 text-sm">{info}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" required placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" required placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="Minimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="Repeti tu contrasena" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field pl-10" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm">
              Ya tenes cuenta?{' '}
              <Link to="/login" state={{ next }} className="font-semibold text-petroleum-600 hover:text-petroleum-700">Ingresa</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
