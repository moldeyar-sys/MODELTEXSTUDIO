import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, Edit3, Trash2,
  CheckCircle, XCircle, Search,
  LayoutDashboard, Box, ShoppingCart, UserCheck, ClipboardList,
  Upload, ImagePlus, X, FileText, Loader2, Gift
} from 'lucide-react';
import type { Product, ProductFile, Order, Profile, CustomRequest, CustomRequestStatus, FreeMold } from '../lib/types';
import { CATEGORIES, PAYMENT_METHODS, SIZE_GROUPS, FABRICS } from '../lib/types';
import { uploadProductImage, uploadProductFile, removeProductFile, inferFileType } from '../lib/storage';
import { fetchAllFreeMolds } from '../lib/freeMolds';
import { FreeMoldForm } from '../components/admin/FreeMoldForm';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'requests' | 'free';

export default function AdminPage() {
  useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [freeMolds, setFreeMolds] = useState<FreeMold[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFreeForm, setShowFreeForm] = useState(false);
  const [editingFree, setEditingFree] = useState<FreeMold | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [prodRes, orderRes, custRes, reqRes, freeRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('custom_requests').select('*').order('created_at', { ascending: false }),
      fetchAllFreeMolds(), // resiliente: si la tabla no existe, devuelve [] sin romper el admin
    ]);
    setProducts((prodRes.data as Product[]) || []);
    setOrders((orderRes.data as Order[]) || []);
    setCustomers((custRes.data as Profile[]) || []);
    setRequests((reqRes.data as CustomRequest[]) || []);
    setFreeMolds(freeRes);
    setLoading(false);
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Productos', icon: <Box className="w-4 h-4" /> },
    { id: 'orders', label: 'Pedidos', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'customers', label: 'Clientes', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'requests', label: 'Solicitudes', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'free', label: 'Moldes Gratis', icon: <Gift className="w-4 h-4" /> },
  ];

  const updateOrderStatus = async (orderId: string, field: 'payment_status' | 'order_status', value: string) => {
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));
    }
  };

  const updateRequestStatus = async (id: string, status: CustomRequestStatus) => {
    const { error } = await supabase.from('custom_requests').update({ status }).eq('id', id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } as CustomRequest : r));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Eliminar este producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('products').update({ is_active }).eq('id', id);
    if (!error) setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active } : p));
  };

  const toggleProductFeatured = async (id: string, is_featured: boolean) => {
    const { error } = await supabase.from('products').update({ is_featured }).eq('id', id);
    if (!error) setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured } : p));
  };

  const deleteFreeMold = async (id: string) => {
    if (!confirm('¿Eliminar este molde gratis?')) return;
    const { error } = await supabase.from('free_molds').delete().eq('id', id);
    if (!error) setFreeMolds(prev => prev.filter(m => m.id !== id));
  };

  const toggleFreeActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('free_molds').update({ is_active }).eq('id', id);
    if (!error) setFreeMolds(prev => prev.map(m => m.id === id ? { ...m, is_active } : m));
  };

  const paidOrders = orders.filter(o => o.payment_status === 'pagado');
  const pendingOrders = orders.filter(o => o.payment_status === 'pendiente');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const statusColor = (status: string) => {
    switch (status) {
      case 'pagado': case 'entregado': case 'completado': return 'bg-green-100 text-green-700';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'rechazado': case 'cancelado': return 'bg-red-100 text-red-700';
      case 'contactando': case 'en_proceso': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const paymentLabel = (method: string) => PAYMENT_METHODS.find(m => m.value === method)?.label || method;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <h1 className="font-display text-3xl font-bold text-primary-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-500 mb-8">Gestioná productos, pedidos y clientes de Modeltex</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary-800 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card p-6">
                <p className="text-sm text-gray-500 mb-1">Productos</p>
                <p className="text-3xl font-bold text-primary-900">{products.length}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500 mb-1">Pedidos</p>
                <p className="text-3xl font-bold text-primary-900">{orders.length}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500 mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500 mb-1">Ingresos</p>
                <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString('es-AR')}</p>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ultimos pedidos</h3>
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">${Number(o.total).toLocaleString('es-AR')}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor(o.payment_status)}`}>
                      {o.payment_status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Clientes recientes</h3>
                {customers.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.full_name || c.email}</p>
                      <p className="text-xs text-gray-500">{c.customer_type}</p>
                    </div>
                    <span className="text-xs text-gray-400">{c.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..."
                  className="input-field pl-10"
                />
              </div>
              <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="btn-primary ml-4">
                <Plus className="w-4 h-4 mr-1" /> Nuevo producto
              </button>
            </div>

            {showProductForm && (
              <ProductForm
                product={editingProduct}
                onRefresh={fetchAll}
                onClose={() => { setShowProductForm(false); fetchAll(); }}
              />
            )}

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Categoría</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Activo</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Destacado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products
                      .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {p.main_image_url ? (
                                <img src={p.main_image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">M</div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-400">/{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          ${Number(p.price).toLocaleString('es-AR')}
                          {p.sale_price && (
                            <div className="text-xs text-red-500">${Number(p.sale_price).toLocaleString('es-AR')}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize hidden sm:table-cell">{p.category}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleProductActive(p.id, !p.is_active)}>
                            {p.is_active ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleProductFeatured(p.id, !p.is_featured)}>
                            {p.is_featured ? <CheckCircle className="w-5 h-5 text-amber-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                              className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pedido <span className="font-mono font-semibold text-gray-900">#{o.id.slice(0, 8)}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusColor(o.payment_status)}`}>
                      Pago: {o.payment_status}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusColor(o.order_status)}`}>
                      Estado: {o.order_status}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Método</p>
                    <p className="text-sm font-medium text-gray-700">{paymentLabel(o.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-sm font-bold text-primary-900">${Number(o.total).toLocaleString('es-AR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Items</p>
                    <p className="text-sm text-gray-700">{o.order_items?.length || 0} producto(s)</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {o.payment_status !== 'pagado' && (
                    <button
                      onClick={() => updateOrderStatus(o.id, 'payment_status', 'pagado')}
                      className="text-xs font-medium px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Marcar pagado
                    </button>
                  )}
                  {o.payment_status === 'pendiente' && (
                    <button
                      onClick={() => updateOrderStatus(o.id, 'payment_status', 'rechazado')}
                      className="text-xs font-medium px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Rechazar pago
                    </button>
                  )}
                  {o.order_status !== 'entregado' && o.payment_status === 'pagado' && (
                    <button
                      onClick={() => updateOrderStatus(o.id, 'order_status', 'entregado')}
                      className="text-xs font-medium px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Marcar entregado
                    </button>
                  )}
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-gray-500 text-center py-8">No hay pedidos todavía</p>}
          </div>
        )}

        {/* Customers */}
        {activeTab === 'customers' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">País</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">WhatsApp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{c.full_name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize hidden sm:table-cell">{c.customer_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{c.country || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{c.whatsapp || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          c.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Custom Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r.id} className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.email} - {r.created_at && new Date(r.created_at).toLocaleDateString('es-AR')}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg self-start ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div><p className="text-xs text-gray-400">Prenda</p><p className="text-sm text-gray-700">{r.garment_type}</p></div>
                  <div><p className="text-xs text-gray-400">Talles</p><p className="text-sm text-gray-700">{r.sizes_needed || '-'}</p></div>
                  <div><p className="text-xs text-gray-400">Formato</p><p className="text-sm text-gray-700">{r.format_required || '-'}</p></div>
                  <div><p className="text-xs text-gray-400">WhatsApp</p><p className="text-sm text-gray-700">{r.whatsapp || '-'}</p></div>
                </div>

                {r.comments && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">{r.comments}</p>
                )}

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {r.status !== 'contactando' && (
                    <button onClick={() => updateRequestStatus(r.id, 'contactando')} className="text-xs font-medium px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                      Contactando
                    </button>
                  )}
                  {r.status !== 'en_proceso' && (
                    <button onClick={() => updateRequestStatus(r.id, 'en_proceso')} className="text-xs font-medium px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">
                      En proceso
                    </button>
                  )}
                  {r.status !== 'completado' && (
                    <button onClick={() => updateRequestStatus(r.id, 'completado')} className="text-xs font-medium px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                      Completado
                    </button>
                  )}
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-gray-500 text-center py-8">No hay solicitudes de diseño</p>}
          </div>
        )}

        {/* Moldes Gratis */}
        {activeTab === 'free' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Moldes Gratis</h2>
                <p className="text-sm text-gray-500">Se muestran en la sección pública <span className="font-mono">/moldes-gratis</span></p>
              </div>
              <button onClick={() => { setEditingFree(null); setShowFreeForm(true); }} className="btn-primary">
                <Plus className="w-4 h-4 mr-1" /> Nuevo molde gratis
              </button>
            </div>

            {showFreeForm && (
              <FreeMoldForm
                mold={editingFree}
                onClose={() => { setShowFreeForm(false); setEditingFree(null); fetchAll(); }}
              />
            )}

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Molde</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Categoría</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Archivos</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Descargas</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Activo</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {freeMolds.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {m.image_url
                                ? <img src={m.image_url} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">M</div>}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{m.title}</p>
                              <p className="text-xs text-gray-400">{m.code || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize hidden sm:table-cell">{m.category}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{m.files?.length || 0}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{m.download_count || 0}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleFreeActive(m.id, !m.is_active)}>
                            {m.is_active ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditingFree(m); setShowFreeForm(true); }} className="p-1.5 text-gray-400 hover:text-primary-600 rounded">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteFreeMold(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {freeMolds.length === 0 && (
                <p className="text-gray-500 text-center py-8 text-sm">
                  Todavía no hay moldes gratis. Tocá "Nuevo molde gratis" para cargar el primero.
                  <br />(Si da error al guardar, falta correr el SQL de Moldes Gratis en Supabase.)
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Form Component
function ProductForm({
  product,
  onRefresh,
  onClose,
}: {
  product: Product | null;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    short_description: product?.short_description || '',
    long_description: product?.long_description || '',
    price: product?.price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    category: product?.category || 'dama',
    garment_type: product?.garment_type || '',
    sizes: product?.sizes?.join(', ') || '',
    formats: product?.formats?.join(', ') || '',
    recommended_fabrics: product?.recommended_fabrics?.join(', ') || '',
    main_image_url: product?.main_image_url || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  });
  const [gallery, setGallery] = useState<string[]>(product?.gallery || []);
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFiles = async () => {
      if (!currentProduct) { setFiles([]); return; }
      const { data } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', currentProduct.id)
        .order('created_at', { ascending: true });
      setFiles((data as ProductFile[]) || []);
    };
    loadFiles();
  }, [currentProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Agrega valores (sin duplicar) a un campo separado por comas: talles o telas.
  const appendCsv = (field: 'sizes' | 'recommended_fabrics', values: string[]) => {
    setForm(prev => {
      const current = prev[field].split(',').map(s => s.trim()).filter(Boolean);
      const merged = [...current];
      for (const v of values) {
        if (!merged.some(c => c.toLowerCase() === v.toLowerCase())) merged.push(v);
      }
      return { ...prev, [field]: merged.join(', ') };
    });
  };

  const clearCsv = (field: 'sizes' | 'recommended_fabrics') =>
    setForm(prev => ({ ...prev, [field]: '' }));

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadProductImage(file);
      setForm(prev => ({ ...prev, main_image_url: url }));
    } catch {
      setError('Error al subir la imagen principal. Revisá que sea una imagen de menos de 5 MB.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    setUploadingGallery(true);
    setError('');
    try {
      const urls: string[] = [];
      for (const f of list) urls.push(await uploadProductImage(f));
      setGallery(prev => [...prev, ...urls]);
    } catch {
      setError('Error al subir imágenes de la galería.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (url: string) => setGallery(prev => prev.filter(u => u !== url));

  const reloadFiles = async (productId: string) => {
    const { data } = await supabase
      .from('product_files')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });
    setFiles((data as ProductFile[]) || []);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length || !currentProduct) return;
    setUploadingFile(true);
    setError('');
    try {
      for (const f of list) {
        const path = await uploadProductFile(currentProduct.id, f);
        const { error: insErr } = await supabase.from('product_files').insert({
          product_id: currentProduct.id,
          file_name: f.name,
          file_url: path,
          file_type: inferFileType(f.name),
        });
        if (insErr) throw insErr;
      }
      await reloadFiles(currentProduct.id);
    } catch {
      setError('Error al subir archivos descargables.');
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteFile = async (f: ProductFile) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    await removeProductFile(f.file_url);
    await supabase.from('product_files').delete().eq('id', f.id);
    setFiles(prev => prev.filter(x => x.id !== f.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const slug = form.slug || generateSlug(form.name);
    // Campos base que SIEMPRE existen en la base.
    const baseData = {
      name: form.name,
      slug,
      short_description: form.short_description,
      long_description: form.long_description,
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      category: form.category,
      garment_type: form.garment_type,
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      formats: form.formats.split(',').map(s => s.trim()).filter(Boolean),
      main_image_url: form.main_image_url,
      gallery,
      is_active: form.is_active,
      is_featured: form.is_featured,
    };
    // Telas recomendadas: solo se guardan si la columna ya existe en la base.
    const fabrics = form.recommended_fabrics.split(',').map(s => s.trim()).filter(Boolean);
    const fullData = { ...baseData, recommended_fabrics: fabrics };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const save = (payload: any) =>
      currentProduct
        ? supabase.from('products').update(payload).eq('id', currentProduct.id).select().single()
        : supabase.from('products').insert(payload).select().single();

    try {
      // 1er intento: con telas. Si la columna todavia no existe, reintenta sin ellas.
      let { data, error: saveError } = await save(fullData);
      if (saveError && saveError.message?.includes('recommended_fabrics')) {
        ({ data, error: saveError } = await save(baseData));
      }
      if (saveError) throw saveError;
      setCurrentProduct(data as Product);
      onRefresh();
    } catch (err) {
      const msg = (err as { message?: string })?.message || '';
      if (msg.toLowerCase().includes('duplicate') || msg.includes('slug')) {
        setError('El slug ya está en uso. Cambiá el slug por uno distinto.');
      } else {
        setError(`Error al guardar el producto: ${msg || 'desconocido'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 mb-6">
      <h3 className="font-semibold text-gray-900 text-lg mb-6">
        {currentProduct ? 'Editar producto' : 'Nuevo producto'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre - Código *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Ej: BUZO - 99M" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
            <div className="flex gap-2">
              <input name="slug" value={form.slug} onChange={handleChange} className="input-field flex-1" placeholder="Auto-generado" />
              <button type="button" onClick={() => setForm(prev => ({ ...prev, slug: generateSlug(form.name) }))} className="btn-secondary text-xs px-3">
                Generar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio *</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio oferta</label>
            <input name="sale_price" type="number" step="0.01" value={form.sale_price} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de prenda</label>
            <input name="garment_type" value={form.garment_type} onChange={handleChange} className="input-field" placeholder="Remera, Pantalón..." />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Talles</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SIZE_GROUPS.map(g => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => appendCsv('sizes', g.sizes)}
                  className="text-xs font-medium px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  + {g.label}
                </button>
              ))}
              {form.sizes && (
                <button
                  type="button"
                  onClick={() => clearCsv('sizes')}
                  className="text-xs font-medium px-3 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
            <input name="sizes" value={form.sizes} onChange={handleChange} className="input-field" placeholder="Tocá un grupo o escribí manual: S, M, L, XL" />
            <p className="text-xs text-gray-400 mt-1">Tocá un botón para cargar el grupo completo, o escribí los talles separados por coma.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Formatos (separados por coma)</label>
            <input name="formats" value={form.formats} onChange={handleChange} className="input-field" placeholder="PDF A4, PDF Plotter, DXF" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telas recomendadas</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {FABRICS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => appendCsv('recommended_fabrics', [f])}
                  className="text-xs font-medium px-3 py-1.5 bg-petroleum-50 text-petroleum-700 border border-petroleum-200 rounded-lg hover:bg-petroleum-100 transition-colors"
                >
                  + {f}
                </button>
              ))}
              {form.recommended_fabrics && (
                <button
                  type="button"
                  onClick={() => clearCsv('recommended_fabrics')}
                  className="text-xs font-medium px-3 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
            <input name="recommended_fabrics" value={form.recommended_fabrics} onChange={handleChange} className="input-field" placeholder="Tocá una tela o escribí manual: Frisa, Morley..." />
          </div>
        </div>

        {/* Imagen principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen principal</label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
              {form.main_image_url ? (
                <img src={form.main_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImagePlus className="w-7 h-7" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer text-sm">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} disabled={uploadingImage} />
              </label>
              <input
                name="main_image_url"
                value={form.main_image_url}
                onChange={handleChange}
                className="input-field text-xs"
                placeholder="...o pegá una URL https://"
              />
            </div>
          </div>
        </div>

        {/* Galería */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Galería de imágenes</label>
          <div className="flex flex-wrap gap-3">
            {gallery.map(url => (
              <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Quitar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 cursor-pointer transition-colors">
              {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
              <span className="text-[10px] mt-1">{uploadingGallery ? 'Subiendo' : 'Agregar'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción corta</label>
          <input name="short_description" value={form.short_description} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción larga</label>
          <textarea name="long_description" value={form.long_description} onChange={handleChange} rows={4} className="input-field resize-none" />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            Activo
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            Destacado
          </label>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Guardando...' : currentProduct ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            {currentProduct ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </form>

      {/* Archivos descargables (bucket privado) */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-700" /> Archivos descargables
        </h4>
        {!currentProduct ? (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            Guardá el producto primero para poder subir los archivos del molde (PDF, PLT, DXF, CDR, etc.).
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Se guardan en un bucket privado. Los clientes solo accederán con un enlace temporal tras pagar.
            </p>
            {files.length > 0 && (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{f.file_name}</span>
                      <span className="text-[10px] uppercase font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{f.file_type}</span>
                    </div>
                    <button type="button" onClick={() => deleteFile(f)} className="p-1.5 text-gray-400 hover:text-red-600 rounded flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer text-sm">
              {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingFile ? 'Subiendo...' : 'Subir archivos'}
              <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
