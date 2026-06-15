import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { PAYMENT_METHODS } from '../lib/types';
import type { Order, OrderItem } from '../lib/types';

interface OrderWithItems extends Omit<Order, 'order_items'> {
  order_items?: OrderItem[];
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOrders((data as OrderWithItems[]) || []);
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-primary-900 mb-8">Mis compras</h1>

          {orders.length === 0 ? (
            <div className="card p-12 text-center">
              <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
              <h2 className="font-display text-2xl font-bold text-primary-900 mb-2">Aun no tienes compras</h2>
              <p className="text-gray-500 mb-6">Descubri nuestros moldes digitales</p>
              <Link to="/catalogo" className="btn-primary">Ver catalogo</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">Pedido <span className="font-mono font-semibold text-gray-900">#{order.id.slice(0, 8)}</span></p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusBadge(order.payment_status)}`}>
                        Pago: {order.payment_status}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">Producto x{item.quantity}</span>
                        <span className="text-gray-900 font-medium">${Number(item.price).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Metodo: {paymentLabel(order.payment_method)}</span>
                    <span className="text-lg font-bold text-primary-900">${Number(order.total).toLocaleString('es-AR')}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {order.payment_status === 'pagado' && (
                      <Link to="/descargas" className="btn-primary text-sm py-2">
                        Descargar archivos
                      </Link>
                    )}
                    {order.payment_status === 'pendiente' && (order.payment_method === 'transfer' || order.payment_method === 'binance') && (
                      <p className="text-amber-600 text-sm">
                        <span className="font-semibold">Pendiente de confirmacion:</span> Estamos verificando tu pago. Puede tardar hasta 24 horas.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
