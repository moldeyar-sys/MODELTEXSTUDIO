import { useState, useEffect, type FormEvent } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CUSTOMER_TYPES } from '../lib/types';
import type { CustomerType } from '../lib/types';

export default function MyAccountPage() {
  const { user, profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp: '',
    country: '',
    city: '',
    customer_type: 'otro' as CustomerType,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        whatsapp: profile.whatsapp || '',
        country: profile.country || '',
        city: profile.city || '',
        customer_type: profile.customer_type || 'otro',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const { error: updateError } = await updateProfile({
      full_name: formData.full_name,
      whatsapp: formData.whatsapp,
      country: formData.country,
      city: formData.city,
      customer_type: formData.customer_type,
    });

    if (updateError) {
      setError(updateError);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-primary-900 mb-8">Mi cuenta</h1>

          <div className="card p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-green-700 text-sm">Los cambios se guardaron correctamente</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-field" placeholder="Tu nombre completo" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={user?.email || ''} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">El email no puede ser modificado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="input-field" placeholder="+54 9 11 ..." />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pais</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className="input-field" placeholder="Argentina" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Buenos Aires" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de cliente</label>
                <select name="customer_type" value={formData.customer_type} onChange={handleChange} className="input-field">
                  {CUSTOMER_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
