import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BrandLogo } from '../components/brand/BrandLogo';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: resetError } = await resetPassword(email);
    if (resetError) {
      setError(resetError);
    } else {
      setSubmitted(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-petroleum-600 hover:text-petroleum-700 font-medium text-sm">
              <ArrowLeft className="w-4 h-4" /> Volver a iniciar sesion
            </Link>
          </div>

          <div className="mb-8 text-center">
            <div className="inline-flex justify-center mb-6">
              <BrandLogo variant="full" size={96} />
            </div>
            <h1 className="font-display text-3xl font-bold text-primary-900 mb-2">Recuperar contrasena</h1>
            <p className="text-gray-500 text-sm">Te enviamos un enlace para restablecer tu contrasena</p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 text-sm font-medium">
                  Si el email existe, recibiras un enlace para restablecer tu contrasena
                </p>
              </div>
              <button onClick={() => setSubmitted(false)} className="btn-secondary w-full">
                Intentar con otro email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" required placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
