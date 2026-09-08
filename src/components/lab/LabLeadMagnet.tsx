import { useState } from 'react';
import { Gift, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { trackLeadGenerated } from '../../lib/analytics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Simula la petición al proveedor de email marketing (1.5s de "red"). Cuando
 * se elija un proveedor real (Resend, Mailchimp, un Edge Function propio,
 * etc.), reemplazar el cuerpo de esta función por el fetch correspondiente
 * — el resto del componente (loading, error, éxito) ya queda listo tal cual.
 */
function submitLeadEmail(email: string): Promise<void> {
  void email; // se usa cuando esto sea un fetch real; por ahora solo simula la latencia de red.
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1500);
  });
}

/** Captación de email ("desbloqueá el mini-curso gratis"), con estado de carga real mientras "se envía". */
export function LabLeadMagnet() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const valid = EMAIL_RE.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || sending) return;
    setSending(true);
    await submitLeadEmail(email.trim());
    setSending(false);
    setSent(true);
    trackLeadGenerated(email.trim());
  };

  return (
    <section className="bg-gradient-to-r from-primary-800 to-petroleum-800 text-white">
      <div className="container-custom py-6 sm:py-7">
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">Desbloqueá el mini-curso gratuito</p>
              <p className="text-sm text-white/75 leading-tight mt-0.5">Dejá tu email y te avisamos apenas suman clases nuevas.</p>
            </div>
          </div>

          <div className="flex-1 w-full md:max-w-md md:ml-auto">
            {sent ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 rounded-xl px-4 py-3 w-full">
                <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" /> ¡Listo! Ya quedaste anotado/a.
              </p>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Mail className="w-4 h-4 text-primary-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    disabled={sending}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/95 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-70"
                  />
                  {touched && !valid && <p className="text-xs text-accent-200 mt-1">Ingresá un email válido.</p>}
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary-900 text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors active:scale-[0.98] flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                    </>
                  ) : (
                    'Desbloquear'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
