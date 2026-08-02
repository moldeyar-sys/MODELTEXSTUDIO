import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, Package, Loader2, Search, Clock, AlertCircle } from 'lucide-react';
import { useSeo } from '../lib/seo';

interface GuestFile {
  id: string;
  product_name: string;
  file_name: string;
  signed_url: string | null;
}

interface GuestOrderResult {
  order: { id: string; total: number; payment_method: string; payment_status: string; created_at: string };
  files: GuestFile[];
  pending?: boolean;
}

/**
 * Pagina publica para quien compro SIN CREAR CUENTA: con numero de pedido +
 * email (nunca contraseña) ve el estado y descarga sus archivos. Es el
 * equivalente a "Mis descargas" para invitados — el link llega por mail
 * cuando el admin confirma el pago (ver api/notify-buyer-paid.ts).
 */
export default function MyGuestOrderPage() {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(params.get('order') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GuestOrderResult | null>(null);

  useSeo({ title: 'Mi pedido', path: '/mi-pedido' });

  const lookup = useCallback(async (id: string, mail: string) => {
    if (!id.trim() || !mail.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/guest-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id.trim(), email: mail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo consultar el pedido.');
        return;
      }
      setResult(data);
    } catch {
      setError('No hay conexión en este momento. Probá de nuevo en un rato.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Si el link ya trae los dos datos (llegó por mail), busca solo.
  useEffect(() => {
    if (params.get('order') && params.get('email')) {
      lookup(params.get('order')!, params.get('email')!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-primary-900 mb-2">Mi pedido</h1>
          <p className="text-gray-500 mb-8">Consultá tu compra con el número de pedido y el email que usaste al comprar.</p>

          <form
            onSubmit={(e) => { e.preventDefault(); lookup(orderId, email); }}
            className="card p-5 sm:p-6 mb-6"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de pedido</label>
                <input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  placeholder="El que te llegó al confirmar la compra"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="El que usaste al comprar"
                  className="input-field"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Buscar mi pedido
            </button>
            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </form>

          {result && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Pedido #{result.order.id.slice(0, 8)}</p>
                  <p className="font-semibold text-gray-900">${Number(result.order.total).toLocaleString('es-AR')}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    result.order.payment_status === 'pagado'
                      ? 'bg-green-100 text-green-700'
                      : result.order.payment_status === 'rechazado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {result.order.payment_status === 'pagado' ? 'Pagado' : result.order.payment_status === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                </span>
              </div>

              {result.pending ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Todavía estamos confirmando tu pago</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Te va a llegar un mail apenas se acredite (puede tardar hasta 24 horas), con este mismo link para descargar. Volvé a esta página cuando quieras revisar el estado.
                    </p>
                  </div>
                </div>
              ) : result.files.length === 0 ? (
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <Package className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">No encontramos archivos para este pedido. Escribinos por WhatsApp con tu número de pedido y te ayudamos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{f.product_name}</p>
                        <p className="text-xs text-gray-500 truncate">{f.file_name}</p>
                      </div>
                      <a
                        href={f.signed_url || '#'}
                        className="btn-primary text-sm py-2 px-3 inline-flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" /> Descargar
                      </a>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 pt-1">
                    Los links de descarga vencen a los pocos minutos por seguridad — si se cortó, volvé a buscar tu pedido acá y se generan de nuevo.
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿Tenés cuenta? <Link to="/login" className="text-primary-700 font-medium hover:underline">Iniciá sesión</Link> para ver todas tus compras en un solo lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
