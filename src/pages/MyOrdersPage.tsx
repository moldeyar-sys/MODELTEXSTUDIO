import { useState, useEffect } from 'react';
import { ShoppingBag, Download, Loader2, FileText, MessageCircle, ImageOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { PAYMENT_METHODS } from '../lib/types';
import { createSignedDownloadUrl, isStoragePath } from '../lib/storage';
import { WHATSAPP_NUMBER } from '../lib/whatsapp';

interface OrderItemRow {
  id: string;
  quantity: number;
  price: number;
  formato: string | null;
  product_id: string | null;
  products: { id: string; name: string; slug: string; main_image_url: string } | null;
}
interface OrderRow {
  id: string;
  created_at: string;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  order_items: OrderItemRow[];
}
interface PurchasedFile {
  id: string;
  file_name: string;
  file_url: string;
}
interface PurchasedProduct {
  productId: string;
  name: string;
  slug: string;
  image: string;
  formats: string[];
  lastPurchase: string;
  files: PurchasedFile[];
}

const consultWhatsApp = (productName: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola Modeltex, necesito que me reenvíen los archivos de mi compra: ${productName}. Gracias.`
  )}`;

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [purchased, setPurchased] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, created_at, total, payment_method, payment_status, order_status, order_items(id, quantity, price, formato, product_id, products(id, name, slug, main_image_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const ordersData = (data as unknown as OrderRow[]) || [];
    setOrders(ordersData);

    // Agrupar productos de pedidos PAGADOS
    const groups = new Map<string, PurchasedProduct>();
    for (const o of ordersData) {
      if (o.payment_status !== 'pagado') continue;
      for (const it of o.order_items || []) {
        if (!it.product_id) continue;
        let g = groups.get(it.product_id);
        if (!g) {
          g = {
            productId: it.product_id,
            name: it.products?.name || 'Producto',
            slug: it.products?.slug || '',
            image: it.products?.main_image_url || '',
            formats: [],
            lastPurchase: o.created_at,
            files: [],
          };
          groups.set(it.product_id, g);
        }
        if (it.formato && !g.formats.includes(it.formato)) g.formats.push(it.formato);
        if (new Date(o.created_at) > new Date(g.lastPurchase)) g.lastPurchase = o.created_at;
      }
    }

    const pids = Array.from(groups.keys());
    if (pids.length > 0) {
      const { data: files } = await supabase
        .from('product_files')
        .select('id, product_id, file_name, file_url')
        .in('product_id', pids);
      for (const f of (files as Array<{ id: string; product_id: string; file_name: string; file_url: string }>) || []) {
        groups.get(f.product_id)?.files.push({ id: f.id, file_name: f.file_name, file_url: f.file_url });
      }
    }

    const list = Array.from(groups.values()).sort(
      (a, b) => new Date(b.lastPurchase).getTime() - new Date(a.lastPurchase).getTime()
    );
    setPurchased(list);
    setLoading(false);
  };

  const triggerDownload = (url: string, filename?: string, newTab = false) => {
    const a = document.createElement('a');
    a.href = url;
    if (newTab) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    else if (filename) { a.download = filename; }
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownload = async (file: PurchasedFile) => {
    setDownloadError('');
    if (!isStoragePath(file.file_url)) {
      triggerDownload(file.file_url, undefined, true);
      return;
    }
    setDownloadingId(file.id);
    try {
      const url = await createSignedDownloadUrl(file.file_url);
      if (!url) {
        setDownloadError('No se pudo generar el enlace. Verificá que tu compra esté confirmada (pagada).');
        return;
      }
      triggerDownload(url, file.file_name);
    } finally {
      setDownloadingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      pagado: 'bg-green-100 text-green-700',
      entregado: 'bg-green-100 text-green-700',
      rechazado: 'bg-red-100 text-red-700',
      cancelado: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };
  const paymentLabel = (method: string) => PAYMENT_METHODS.find(m => m.value === method)?.label || method;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
      </div>
    );
  }

  const hasOrders = orders.length > 0;

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-primary-900 mb-2">Mis compras</h1>
          <p className="text-gray-500 mb-8">Descargá tus moldes las veces que quieras, siempre disponibles en tu cuenta.</p>

          {downloadError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{downloadError}</div>
          )}

          {!hasOrders ? (
            <div className="card p-12 text-center">
              <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
              <h2 className="font-display text-2xl font-bold text-primary-900 mb-2">Aún no tenés compras</h2>
              <p className="text-gray-500 mb-6">Descubrí nuestros moldes digitales</p>
              <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
            </div>
          ) : (
            <>
              {/* Tus moldes para descargar */}
              <section className="mb-10">
                <h2 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary-700" /> Tus moldes para descargar
                </h2>

                {purchased.length === 0 ? (
                  <div className="card p-6 text-sm text-gray-500">
                    Cuando confirmemos el pago de tu pedido, tus moldes van a aparecer acá para descargar siempre que quieras.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchased.map(p => (
                      <div key={p.productId} className="card p-4 sm:p-5">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff className="w-6 h-6" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{p.name}</h3>
                            {p.formats.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {p.formats.map(f => (
                                  <span key={f} className="text-[10px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">{f}</span>
                                ))}
                              </div>
                            )}

                            {p.files.length > 0 ? (
                              <div className="mt-3 space-y-2">
                                {p.files.map(f => (
                                  <div key={f.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                                    <span className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">{f.file_name}</span>
                                    </span>
                                    <button
                                      onClick={() => handleDownload(f)}
                                      disabled={downloadingId === f.id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-800 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 flex-shrink-0"
                                    >
                                      {downloadingId === f.id ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando...</>
                                      ) : (
                                        <><Download className="w-3.5 h-3.5" /> Descargar</>
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <p className="text-xs text-amber-700 flex-1">Archivos en preparación. Si los necesitás ya, pedilos por WhatsApp.</p>
                                <a href={consultWhatsApp(p.name)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-lg px-2.5 py-1 hover:bg-green-50 self-start">
                                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Historial de pedidos */}
              <section>
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Historial de pedidos</h2>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="card p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Pedido <span className="font-mono font-semibold text-gray-900">#{order.id.slice(0, 8)}</span></p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {paymentLabel(order.payment_method)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusBadge(order.payment_status)}`}>Pago: {order.payment_status}</span>
                          <span className="text-sm font-bold text-primary-900 ml-1">${Number(order.total).toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                      {order.payment_status === 'pendiente' && (order.payment_method === 'transfer' || order.payment_method === 'binance') && (
                        <p className="text-amber-600 text-xs mt-2"><span className="font-semibold">Pendiente:</span> estamos verificando tu pago (hasta 24 hs).</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
