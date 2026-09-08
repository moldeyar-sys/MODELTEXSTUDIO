import { useState } from 'react';
import { Gift, Mail, CheckCircle2 } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Captación de email ("desbloqueá el mini-curso gratis"). Por ahora es solo
 * maqueta: valida el formato y muestra una confirmación local, pero no manda
 * el email a ningún lado todavía — falta decidir a qué servicio conectarlo
 * (Supabase, un ESP externo, etc.) antes de sumarle backend real.
 */
export function LabLeadMagnet() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const valid = EMAIL_RE.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    // TODO: conectar a un servicio real de captación (Supabase table + Resend,
    // Mailchimp, etc.) cuando se defina. Por ahora solo confirma en pantalla.
    setSent(true);
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
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/95 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
                  />
                  {touched && !valid && <p className="text-xs text-accent-200 mt-1">Ingresá un email válido.</p>}
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary-900 text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors active:scale-[0.98] flex-shrink-0"
                >
                  Desbloquear
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
