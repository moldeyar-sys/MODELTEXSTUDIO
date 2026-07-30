import { useState } from 'react';
import { Mail, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '../../lib/newsletter';

interface Props {
  source?: string;
  className?: string;
}

/**
 * Captura de email para avisar de moldes gratis nuevos.
 * Mas liviano que crear cuenta: solo el mail, sin contraseña.
 */
export function NewsletterSignup({ source = 'moldes-gratis', className = '' }: Props) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    const res = await subscribeToNewsletter(email, source);
    setSending(false);
    if (!res.ok) {
      setError(res.error || 'No se pudo guardar tu email.');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className={`rounded-2xl border-2 border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3 ${className}`}>
        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-800 font-medium">
          ¡Listo! Te vamos a avisar por mail apenas subamos moldes gratis nuevos.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 border-primary-100 bg-white px-5 py-4 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-primary-700" />
        <p className="text-sm font-bold text-primary-900">Enterate primero de los moldes gratis nuevos</p>
      </div>
      <p className="text-xs text-gray-500 mb-3">Un mail cuando sumamos moldes gratis. Sin spam, te das de baja cuando quieras.</p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
          className="input-field flex-1 py-2.5"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 flex-shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Avisame
        </button>
      </form>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
