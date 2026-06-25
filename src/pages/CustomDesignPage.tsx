import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useSeo } from '../lib/seo';
import { FORMATS } from '../lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CustomDesignPage() {
  const { user, profile } = useAuth();
  useSeo({
    title: 'Diseño a pedido — moldes personalizados',
    description: 'Solicitá un molde digital a medida. Contanos la prenda, los talles y el formato que necesitás y nuestro equipo lo prepara para vos.',
    path: '/diseno-a-pedido',
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    country: '',
    garment_type: '',
    sizes_needed: '',
    format_required: '',
    comments: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Autocompletar datos del perfil si el usuario está logueado.
  useEffect(() => {
    if (!profile) return;
    setForm(prev => ({
      ...prev,
      name: prev.name || profile.full_name || '',
      email: prev.email || profile.email || '',
      whatsapp: prev.whatsapp || profile.whatsapp || '',
      country: prev.country || profile.country || '',
    }));
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = 'Ingresá tu nombre.';
    if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Ingresá un email válido.';
    if (form.garment_type.trim().length < 2) errors.garment_type = 'Indicá qué prenda necesitás.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSending(true);
    try {
      const insertData: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        country: form.country.trim(),
        garment_type: form.garment_type.trim(),
        sizes_needed: form.sizes_needed.trim(),
        format_required: form.format_required,
        comments: form.comments.trim(),
      };

      // Solo se setea user_id si está logueado (la RLS exige null para invitados).
      if (user) {
        insertData.user_id = user.id;
      }

      const { error: insertError } = await supabase
        .from('custom_requests')
        .insert(insertData);

      if (insertError) throw insertError;
      setSent(true);
    } catch {
      setError('Error al enviar la solicitud. Intentá de nuevo en unos minutos.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="relative min-h-screen bg-petroleum-50 flex items-center justify-center overflow-hidden">
        <FloatingPatterns variant="dark" />
        <div className="card p-8 max-w-lg w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-petroleum-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-primary-900 mb-2">
            Solicitud enviada
          </h2>
          <p className="text-gray-600 mb-6">
            Recibimos tu solicitud de diseño personalizado. Nos contactaremos a la brevedad por WhatsApp o email para coordinar los detalles.
          </p>
          <button onClick={() => setSent(false)} className="btn-secondary mr-3">
            Enviar otra solicitud
          </button>
          <a href="/" className="btn-primary">Volver al inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-petroleum-50 overflow-hidden">
      <FloatingPatterns variant="dark" />
      {/* Header */}
      <div className="bg-primary-900 text-white">
        <div className="container-custom py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Diseño a pedido</h1>
          <p className="text-primary-200 text-lg max-w-2xl leading-relaxed">
            Necesitás un molde personalizado? Contanos qué prenda buscás, los talles y formatos que necesitás, y nuestro equipo de diseño lo prepara para vos.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          {/* Info */}
          <div className="card p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">Cómo funciona</h2>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Completá el formulario con los detalles del molde que necesitás</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Nuestro equipo revisa la solicitud y se contacta con vos</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Coordinamos el diseño, talles y formatos</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span>Una vez aprobado, recibís los archivos digitales</span>
              </li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="card p-6">
            <h2 className="font-semibold text-gray-900 text-lg mb-6">Solicitar molde personalizado</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`input-field ${fieldErrors.name ? 'border-red-400' : ''}`}
                  placeholder="Tu nombre completo"
                />
                {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`input-field ${fieldErrors.email ? 'border-red-400' : ''}`}
                  placeholder="tu@email.com"
                />
                {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+54 9 11 ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">País</label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Argentina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de prenda *</label>
                <input
                  name="garment_type"
                  value={form.garment_type}
                  onChange={handleChange}
                  className={`input-field ${fieldErrors.garment_type ? 'border-red-400' : ''}`}
                  placeholder="Ej: Remera, Pantalón, Buzo..."
                />
                {fieldErrors.garment_type && <p className="text-xs text-red-600 mt-1">{fieldErrors.garment_type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Talles necesarios</label>
                <input
                  name="sizes_needed"
                  value={form.sizes_needed}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej: S, M, L, XL"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Formato requerido</label>
                <select
                  name="format_required"
                  value={form.format_required}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Seleccionar formato</option>
                  {FORMATS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Comentarios</label>
                <textarea
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Contanos más detalles sobre lo que necesitás..."
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="btn-accent w-full mt-6"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Enviar solicitud
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
