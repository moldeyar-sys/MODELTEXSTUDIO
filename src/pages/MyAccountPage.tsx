import { useState, useEffect, type FormEvent } from 'react';
import { AlertCircle, Check, ShoppingBag, Download, ArrowRight, UserRound, MapPin, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CUSTOMER_TYPES, PAYMENT_METHODS } from '../lib/types';
import type { CustomerType } from '../lib/types';

interface AccountOrderSummary {
  id: string;
  created_at: string;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
}

interface AccountStats {
  totalOrders: number;
  paidOrders: number;
  totalDownloads: number;
  lastOrder: AccountOrderSummary | null;
}

const emptyStats: AccountStats = {
  totalOrders: 0,
  paidOrders: 0,
  totalDownloads: 0,
  lastOrder: null,
};

export default function MyAccountPage() {
  const { user, profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AccountStats>(emptyStats);
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

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      setLoadingStats(true);

      const [{ data: orders }, { data: downloads }] = await Promise.all([
        supabase
          .from('orders')
          .select('id, created_at, total, payment_method, payment_status, order_status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('downloads').select('id').eq('user_id', user.id),
      ]);

      const orderList = (orders as AccountOrderSummary[]) || [];
      setStats({
        totalOrders: orderList.length,
        paidOrders: orderList.filter((order) => order.payment_status === 'pagado').length,
        totalDownloads: downloads?.length || 0,
        lastOrder: orderList[0] || null,
      });
      setLoadingStats(false);
    };

    fetchStats();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const customerTypeLabel =
    CUSTOMER_TYPES.find((item) => item.value === (profile?.customer_type || formData.customer_type))?.label || 'Cliente';
  const paymentMethodLabel = stats.lastOrder
    ? PAYMENT_METHODS.find((item) => item.value === stats.lastOrder?.payment_method)?.label || stats.lastOrder.payment_method
    : '';

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700">Centro de cliente</p>
              <h1 className="font-display text-3xl font-bold text-primary-900 mt-1">Mi cuenta</h1>
              <p className="text-gray-500 mt-2">
                Revisa tu actividad, tus descargas y manten tus datos listos para comprar mas rapido.
              </p>
            </div>
            <div className="rounded-2xl border border-primary-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-400">Perfil actual</p>
              <p className="text-sm font-semibold text-primary-900 mt-1">{profile?.full_name || user?.email || 'Tu cuenta'}</p>
              <p className="text-xs text-gray-500 mt-1">{customerTypeLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Pedidos totales</p>
                  <p className="text-3xl font-bold text-primary-900 mt-1">
                    {loadingStats ? '...' : stats.totalOrders}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Pedidos pagados</p>
                  <p className="text-3xl font-bold text-primary-900 mt-1">
                    {loadingStats ? '...' : stats.paidOrders}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Descargas directas</p>
                  <p className="text-3xl font-bold text-primary-900 mt-1">
                    {loadingStats ? '...' : stats.totalDownloads}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Email de acceso</p>
                  <p className="text-sm font-semibold text-primary-900 mt-2 break-all">{user?.email || '-'}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-petroleum-50 text-petroleum-700 flex items-center justify-center">
                  <UserRound className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
            <div className="space-y-6">
              <div className="card p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-lg">Resumen de actividad</h2>
                    <p className="text-sm text-gray-500 mt-1">Tu cuenta, tus compras y tus accesos rapidos en un solo lugar.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Link to="/mis-compras" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 hover:border-primary-200 hover:bg-white transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary-900">Mis pedidos</p>
                        <p className="text-sm text-gray-500 mt-1">Consulta estados, compras y archivos entregados.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </Link>

                  <Link to="/descargas" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 hover:border-primary-200 hover:bg-white transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary-900">Mis descargas</p>
                        <p className="text-sm text-gray-500 mt-1">Accede de nuevo a los archivos de tus compras.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </div>
              </div>

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

                <div className="mb-6">
                  <h2 className="font-semibold text-gray-900 text-lg">Datos del cliente</h2>
                  <p className="text-sm text-gray-500 mt-1">Mantener este perfil completo te ayuda a comprar y recibir soporte mas rapido.</p>
                </div>

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
                      {CUSTOMER_TYPES.map((ct) => (
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

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg">Ultimo pedido</h2>
                {!stats.lastOrder ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                    Todavia no hay compras registradas en esta cuenta.
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Pedido</p>
                        <p className="text-sm font-semibold text-primary-900 mt-1">#{stats.lastOrder.id.slice(0, 8)}</p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-primary-100 text-primary-800">
                        {stats.lastOrder.payment_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Fecha</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {new Date(stats.lastOrder.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-medium text-gray-900 mt-1">
                          ${Number(stats.lastOrder.total).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Pago</p>
                        <p className="font-medium text-gray-900 mt-1">{paymentMethodLabel}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Entrega</p>
                        <p className="font-medium text-gray-900 mt-1">{stats.lastOrder.order_status}</p>
                      </div>
                    </div>
                    <Link to="/mis-compras" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900">
                      Ver historial completo <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg">Datos de contacto</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                      <UserRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-gray-400">Nombre</p>
                      <p className="font-medium text-gray-900 mt-0.5">{formData.full_name || 'Completa tu nombre'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-petroleum-50 text-petroleum-700 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-gray-400">Ubicacion</p>
                      <p className="font-medium text-gray-900 mt-0.5">
                        {[formData.city, formData.country].filter(Boolean).join(', ') || 'Completa tu ciudad y pais'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
