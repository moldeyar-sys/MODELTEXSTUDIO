import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, ArrowLeft, CheckCircle, AlertCircle, Banknote, Wallet, Copy, Check } from 'lucide-react';
import { useCart, cartUnitPrice, cartItemKey } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../lib/locale';
import { supabase } from '../lib/supabase';
import type { PaymentMethod } from '../lib/types';
import { PAYMENT_METHODS } from '../lib/types';
import { WhatsAppConsultButton } from '../components/ui/WhatsAppConsultButton';

// Link de pago de Mercado Pago (monto fijo). Cambialo acá si lo regenerás.
const MP_PAYMENT_LINK = 'https://link.mercadopago.com.ar/modeltex';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useLocale();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const copyAmount = () => {
    navigator.clipboard.writeText(confirmedTotal.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'transfer' || paymentMethod === 'binance' ? 'pendiente' : 'pendiente',
          order_status: 'pendiente',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const baseItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        price: cartUnitPrice(item),
        quantity: item.quantity,
      }));
      const orderItems = baseItems.map((b, idx) => ({ ...b, formato: items[idx].format ?? null }));

      // Resiliente: si la columna 'formato' aún no existe, reintenta sin ella.
      let { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError && itemsError.message?.includes('formato')) {
        ({ error: itemsError } = await supabase.from('order_items').insert(baseItems));
      }
      if (itemsError) throw itemsError;

      // Mercado Pago: intentar redirigir ANTES de mostrar cualquier pantalla.
      // Solo si falla la API se muestra la pantalla de pago manual.
      if (paymentMethod === 'mercadopago') {
        const mpItems = items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unit_price: cartUnitPrice(item),
        }));
        try {
          const prefRes = await fetch('/api/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: mpItems, orderId: order.id, payerEmail: user.email }),
          });
          if (prefRes.ok) {
            const { init_point } = await prefRes.json();
            if (init_point) {
              clearCart();
              window.location.href = init_point; // redirige sin mostrar pantalla de éxito
              return;
            }
          }
        } catch { /* si la API de preferencia falla, caemos al flujo manual */ }
      }

      // Para todos los demás métodos (o si MP falló): mostrar pantalla de confirmación
      setConfirmedTotal(total);
      setOrderId(order.id);
      clearCart();
    } catch {
      setError('Hubo un error al procesar tu pedido. Intentá de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const AmountBox = () => (
    <div className="bg-white border-2 border-primary-200 rounded-xl p-4 mb-4 text-center">
      <p className="text-xs text-gray-500 mb-1">Monto exacto a pagar</p>
      <p className="text-3xl font-bold text-primary-900 mb-3">{formatPrice(confirmedTotal)}</p>
      <button
        onClick={copyAmount}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-800 text-sm font-medium transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        {copied ? '¡Copiado!' : 'Copiar monto'}
      </button>
    </div>
  );

  if (items.length === 0 && !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
          <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
        </div>
      </div>
    );
  }

  // Success state
  if (orderId) {
    const isManual = paymentMethod === 'transfer' || paymentMethod === 'binance' || paymentMethod === 'paypal' || paymentMethod === 'mercadopago';
    return (
      <div className="min-h-screen bg-petroleum-50 flex items-center justify-center">
        <div className="card p-8 max-w-lg w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-primary-900 mb-2">
            {isManual ? 'Pedido recibido' : 'Pedido creado'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isManual
              ? 'Tu pedido fue creado correctamente. Debemos confirmar tu pago manualmente, esto puede demorar hasta 24 horas.'
              : 'Tu pedido fue creado correctamente. Serás redirigido al pago.'}
          </p>

          {isManual && paymentMethod === 'transfer' && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Datos para transferencia</h3>
              <AmountBox />
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <p><span className="font-medium text-gray-700">Alias:</span> MOLDEY.DIGITAL</p>
                <p><span className="font-medium text-gray-700">Titular:</span> Modeltex</p>
                <p><span className="font-medium text-gray-700">Banco:</span> (Por confirmar)</p>
                <p><span className="font-medium text-gray-700">CBU/CVU:</span> (Por confirmar)</p>
              </div>
              <p className="text-xs text-petroleum-600">
                Una vez realizada la transferencia, envianos el comprobante por WhatsApp para agilizar la confirmación.
              </p>
            </div>
          )}

          {isManual && paymentMethod === 'binance' && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Pago con criptomonedas</h3>
              <AmountBox />
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                <p className="text-xs text-amber-800 font-medium">
                  ⚠️ El monto en pesos es referencial. Convertilo al equivalente en USDT antes de enviar.
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <p><span className="font-medium text-gray-700">Wallet:</span> (Por confirmar)</p>
                <p><span className="font-medium text-gray-700">Red:</span> BSC (BEP20)</p>
              </div>
              <p className="text-xs text-petroleum-600">
                Una vez realizado el pago, envianos el hash de la transacción por WhatsApp para confirmar.
              </p>
            </div>
          )}

          {isManual && paymentMethod === 'paypal' && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Pagá con PayPal</h3>
              <AmountBox />
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-amber-800 font-medium">
                  ⚠️ El monto en pesos es referencial. Ingresá el equivalente en USD al escanear el QR.
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Escaneá el código con la app de PayPal o tu cámara para pagar.
              </p>
              <img
                src="/brand/paypal-qr.png"
                alt="QR de PayPal para pagar a Modeltex"
                className="w-56 max-w-full mx-auto rounded-xl border border-gray-200"
              />
              <p className="mt-4 text-xs text-petroleum-600">
                Después de pagar, envianos el comprobante por WhatsApp para confirmar tu compra y habilitar la descarga.
              </p>
            </div>
          )}

          {isManual && paymentMethod === 'mercadopago' && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Pagá con Mercado Pago</h3>

              <AmountBox />

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-amber-800 font-medium">
                  ⚠️ Al abrir el link de Mercado Pago, ingresá exactamente <strong>{formatPrice(confirmedTotal)}</strong> como monto a pagar.
                </p>
              </div>

              <a
                href={MP_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" /> Abrir Mercado Pago
              </a>
              <p className="mt-4 text-xs text-petroleum-600">
                Después de pagar, envianos el comprobante por WhatsApp para confirmar tu compra y habilitar la descarga.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link to="/mis-compras" className="btn-primary">Ver mis compras</Link>
            <Link to="/catalogo" onClick={() => { /* Navigate cleanly without filter params */ }} className="btn-secondary">Seguir comprando</Link>
            <WhatsAppConsultButton
              message={`Hola Modeltex, tengo una consulta sobre mi pedido #${orderId.slice(0, 8)} (pago por ${PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label || paymentMethod}).`}
            />
          </div>
        </div>
      </div>
    );
  }

  const paymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'mercadopago': return <Wallet className="w-5 h-5" />;
      case 'paypal': return <CreditCard className="w-5 h-5" />;
      case 'stripe': return <CreditCard className="w-5 h-5" />;
      case 'transfer': return <Banknote className="w-5 h-5" />;
      case 'binance': return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <Link to="/carrito" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al carrito
        </Link>

        <h1 className="font-display text-3xl font-bold text-primary-900 mb-8">Finalizar compra</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Client info */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Datos del cliente</h2>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-800 font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user?.email}</p>
                  <p className="text-xs text-gray-500">Verificá tus datos en tu perfil antes de pagar</p>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Método de pago</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === method.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === method.value ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {paymentIcon(method.value)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      paymentMethod === method.value ? 'border-primary-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === method.value && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              {(paymentMethod === 'paypal' || paymentMethod === 'mercadopago') && (
                <div className="mt-4 p-4 bg-petroleum-50 rounded-xl border border-petroleum-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-petroleum-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-petroleum-700">
                      Al confirmar te mostramos cómo pagar ({paymentMethod === 'paypal' ? 'QR de PayPal' : 'link de Mercado Pago'}). La descarga se habilita cuando confirmamos tu pago.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      Esta pasarela se habilitará pronto. Por ahora podés pagar con Mercado Pago, transferencia o PayPal.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order items */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Productos</h2>
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={cartItemKey(item)} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.product.main_image_url ? (
                          <img src={item.product.main_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">...</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        {item.format && <p className="text-xs text-primary-700">{item.format}</p>}
                        <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-3">
                      {formatPrice(cartUnitPrice(item) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 text-lg mb-6">Resumen</h3>
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-900">{formatPrice(total)}</span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={processing || (paymentMethod !== 'transfer' && paymentMethod !== 'binance' && paymentMethod !== 'paypal' && paymentMethod !== 'mercadopago')}
                className="btn-primary w-full disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Procesando...
                  </span>
                ) : (
                  'Confirmar pedido'
                )}
              </button>

              <WhatsAppConsultButton
                className="mt-3"
                message={`Hola Modeltex, tengo una duda para finalizar mi compra (total ${formatPrice(total)}).`}
              />

              <p className="text-xs text-gray-400 text-center mt-3">
                Al confirmar, aceptás los términos de compra de Modeltex
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
