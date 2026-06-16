import { useState } from 'react';
import { MessageCircle, Mail, Instagram, MapPin, Clock, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { CONTACT_INFO, submitContactMessage, buildContactWhatsApp } from '../lib/contact';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', whatsapp: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useSeo({
    title: 'Contacto — Hablá con Modeltex',
    description:
      'Contactá a Modeltex por WhatsApp, email o redes. Consultas sobre moldes digitales, diseño a pedido y producción textil. Respondemos a la brevedad.',
    path: '/contacto',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSending(true);
    // 1) Guarda el lead (best-effort). 2) Abre WhatsApp con todo prearmado.
    await submitContactMessage(form);
    window.open(buildContactWhatsApp(form), '_blank', 'noopener,noreferrer');
    setSending(false);
    setSent(true);
  };

  const methods = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: '+54 9 11 6653 1086',
      href: `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Hola Modeltex, quiero hacer una consulta.')}`,
      color: 'text-green-700 bg-green-50',
    },
    {
      icon: Mail,
      label: 'Email',
      value: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
      color: 'text-primary-700 bg-primary-50',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: `@${CONTACT_INFO.instagram}`,
      href: `https://instagram.com/${CONTACT_INFO.instagram}`,
      color: 'text-accent-700 bg-accent-50',
    },
  ];

  return (
    <div className="min-h-screen bg-petroleum-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-800 text-white">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 85% 0%, rgba(203,110,231,0.35), transparent 45%)' }}
        />
        <div className="container-custom relative py-14 md:py-18">
          <h1 className="font-display text-3xl md:text-5xl font-bold max-w-3xl text-balance">Contacto</h1>
          <p className="text-lg text-white/90 mt-4 max-w-2xl">
            ¿Tenés una consulta sobre moldes, diseño a pedido o producción? Escribinos y te respondemos a la brevedad.
          </p>
        </div>
      </section>

      <section className="container-custom py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Medios de contacto */}
          <div>
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-5">Hablemos</h2>
            <div className="space-y-3">
              {methods.map(m => {
                const Icon = m.icon;
                return (
                  <a
                    key={m.label}
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card flex items-center gap-4 p-4 hover:-translate-y-0.5 transition-transform"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                      <p className="text-sm text-gray-500 truncate">{m.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="card p-5 mt-3 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-petroleum-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Ubicación</p>
                  <p className="text-sm text-gray-500">{CONTACT_INFO.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-petroleum-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Horario de atención</p>
                  <p className="text-sm text-gray-500">{CONTACT_INFO.hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="card p-6 md:p-8">
            {sent ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-5">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-primary-900 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 mb-6">
                  Te abrimos WhatsApp para terminar de enviarlo. Si no se abrió, escribinos directo por WhatsApp.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', whatsapp: '', email: '', subject: '', message: '' }); }} className="btn-secondary">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-primary-900 mb-1">Escribinos</h2>
                <p className="text-sm text-gray-500 mb-6">Completá el formulario y lo enviás por WhatsApp en un clic.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                      <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                      <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="input-field" placeholder="+54 9 11 ..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Asunto</label>
                    <input name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="Ej: Consulta por un molde" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="input-field resize-none" placeholder="Contanos en qué te ayudamos..." />
                  </div>
                  <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-50">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    {sending ? 'Enviando...' : 'Enviar por WhatsApp'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
