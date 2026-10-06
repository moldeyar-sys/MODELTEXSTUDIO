import { useState } from 'react';
import { CheckCircle2, Loader2, Mail, MessageCircle, Undo2 } from 'lucide-react';
import { useLocale } from '../../lib/locale';
import { CONTACT_INFO, submitContactMessage } from '../../lib/contact';
import { whatsappWebLink } from '../../lib/whatsapp';
import { trackWhatsAppClick } from '../../lib/analytics';

/**
 * "Botón de arrepentimiento" de /devoluciones (Resolución 424/2020 de la
 * Secretaría de Comercio Interior: toda tienda online argentina debe tener
 * un enlace visible que permita revocar la compra). En Modeltex sirve para
 * cancelar un pedido todavía no entregado y para la garantía (molde
 * equivocado, archivo que no abre, molde que no sale como se prometió). Los
 * moldes, digitales o en cartón, NO se devuelven por arrepentimiento: un
 * molde se puede copiar y devolver (decisión de Denis, 2026-10-06).
 *
 * Qué hace: guarda el pedido en contact_messages (best-effort, igual que el
 * formulario de /contacto, así queda en el panel) y abre WhatsApp con todo
 * prearmado. Si WhatsApp no se abre, queda el botón de email con el mismo
 * texto. No pide contraseña ni datos de tarjeta: nunca hacen falta para un
 * reembolso.
 */

type Motivo = 'distinto' | 'archivo' | 'no-prometido' | 'sin-descarga' | 'duplicado' | 'otro';

export function ReturnRequestForm() {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: '', email: '', order: '', reason: 'distinto' as Motivo, message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const motivos: Array<{ value: Motivo; label: string }> = [
    { value: 'distinto', label: t('rr.m.wrong', 'Recibí un molde, formato o talles distintos a los que compré') },
    { value: 'archivo', label: t('rr.m.file', 'El archivo no abre o está dañado') },
    { value: 'no-prometido', label: t('rr.m.notAsPromised', 'El molde no sale como se prometió en la ficha') },
    { value: 'sin-descarga', label: t('rr.m.noDownload', 'Pagué y no puedo descargar (los recibís por email o WhatsApp)') },
    { value: 'duplicado', label: t('rr.m.double', 'Me cobraron dos veces') },
    { value: 'otro', label: t('rr.m.other', 'Otro motivo') },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const buildText = () => {
    const motivo = motivos.find((m) => m.value === form.reason)?.label || form.reason;
    return (
      `${t('rr.msg.title', 'Solicitud de devolución / arrepentimiento')}\n\n` +
      `${t('rr.msg.name', 'Nombre')}: ${form.name.trim()}\n` +
      `${t('rr.msg.email', 'Email de la compra')}: ${form.email.trim()}\n` +
      `${t('rr.msg.order', 'Pedido')}: ${form.order.trim() || '-'}\n` +
      `${t('rr.msg.reason', 'Motivo')}: ${motivo}\n` +
      (form.message.trim() ? `\n${form.message.trim()}` : '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSending(true);
    const text = buildText();
    // 1) Queda registrado en el panel (best-effort). 2) Se abre WhatsApp.
    await submitContactMessage({
      name: form.name.trim(),
      whatsapp: '',
      email: form.email.trim(),
      subject: 'Devolución / arrepentimiento',
      message: `Pedido: ${form.order.trim() || '-'}\nMotivo: ${form.reason}\n${form.message.trim()}`,
    });
    trackWhatsAppClick('returns');
    window.open(whatsappWebLink(text), '_blank', 'noopener,noreferrer');
    setSending(false);
    setSent(text);
  };

  const mailto = (text: string) =>
    `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent('Devolución / arrepentimiento')}&body=${encodeURIComponent(text)}`;

  return (
    <section id="arrepentimiento" className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm scroll-mt-24">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center flex-shrink-0">
          <Undo2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-primary-900 leading-tight">
            {t('rr.title', 'Botón de arrepentimiento')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
            {t(
              'rr.text',
              'Es el enlace que exige la Resolución 424/2020 a toda tienda online. En Modeltex sirve para pedir la garantía: molde equivocado, archivo que no abre, molde que no sale como se prometió o pago sin descarga (te mandamos los archivos por email o WhatsApp). Completá el formulario y te respondemos dentro de las 24 horas hábiles con la constancia del trámite.',
            )}
          </p>
        </div>
      </div>

      {sent ? (
        <div className="mt-5 rounded-xl bg-green-50 border border-green-100 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-primary-900">{t('rr.sentTitle', 'Solicitud registrada')}</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {t('rr.sentText', 'Te abrimos WhatsApp con la solicitud prearmada. Si no se abrió, mandala por email con el botón de abajo. Te respondemos dentro de las 24 horas hábiles.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a href={whatsappWebLink(sent)} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center justify-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4" /> {t('rr.sendWa', 'Enviar por WhatsApp')}
                </a>
                <a href={mailto(sent)} className="btn-secondary inline-flex items-center justify-center gap-2 text-sm">
                  <Mail className="w-4 h-4" /> {t('rr.sendMail', 'Enviar por email')}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rr-name" className="block text-sm font-medium text-gray-700 mb-1">{t('rr.name', 'Nombre y apellido')} *</label>
              <input id="rr-name" name="name" value={form.name} onChange={handleChange} required className="input-field" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="rr-email" className="block text-sm font-medium text-gray-700 mb-1">{t('rr.email', 'Email con el que compraste')} *</label>
              <input id="rr-email" name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" autoComplete="email" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rr-order" className="block text-sm font-medium text-gray-700 mb-1">{t('rr.order', 'Número de pedido')}</label>
              <input id="rr-order" name="order" value={form.order} onChange={handleChange} className="input-field font-mono" placeholder={t('rr.orderPh', 'Ej: #A1B2C3D4 (figura en tu compra)')} />
            </div>
            <div>
              <label htmlFor="rr-reason" className="block text-sm font-medium text-gray-700 mb-1">{t('rr.reason', 'Motivo')} *</label>
              <select id="rr-reason" name="reason" value={form.reason} onChange={handleChange} className="input-field">
                {motivos.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="rr-message" className="block text-sm font-medium text-gray-700 mb-1">{t('rr.message', 'Contanos qué pasó')}</label>
            <textarea id="rr-message" name="message" value={form.message} onChange={handleChange} rows={4} className="input-field resize-none" placeholder={t('rr.messagePh', 'Molde, formato comprado y qué problema tuviste. Si es un archivo, después nos mandás una captura por WhatsApp.')} />
          </div>
          <p className="text-xs text-gray-500">
            {t('rr.privacy', 'No te pedimos contraseña ni datos de tarjeta: no hacen falta para un reembolso. Solo usamos estos datos para resolver tu pedido.')}
          </p>
          <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
            {t('rr.submit', 'Enviar solicitud')}
          </button>
        </form>
      )}
    </section>
  );
}
