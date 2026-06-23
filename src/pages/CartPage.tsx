import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart, cartItemKey, cartUnitPrice } from '../contexts/CartContext';
import { useLocale } from '../lib/locale';
import { WhatsAppConsultButton } from '../components/ui/WhatsAppConsultButton';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { t, formatPrice } = useLocale();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-primary-900 mb-2">{t('cart.emptyTitle', 'Tu carrito está vacío')}</h2>
          <p className="text-gray-500 mb-6">{t('cart.emptySubtitle', 'Explorá nuestro catálogo y encontrá los moldes que necesitás')}</p>
          <Link to="/catalogo" className="btn-primary">{t('common.viewCatalog', 'Ver catálogo')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('cart.keepShopping', 'Seguir comprando')}
        </Link>

        <h1 className="font-display text-3xl font-bold text-primary-900 mb-8">{t('cart.title', 'Carrito de compras')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const price = cartUnitPrice(item);
              const key = cartItemKey(item);

              return (
                <div key={key} className="card p-4 sm:p-6">
                  <div className="flex gap-4">
                    <Link to={`/producto/${item.product.slug}`} className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100">
                        {item.product.main_image_url ? (
                          <img src={item.product.main_image_url} alt={item.product.name} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/producto/${item.product.slug}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-primary-800 transition-colors truncate">
                          {item.product.name}
                        </h3>
                      </Link>
                      {item.format && (
                        <span className="inline-block mt-1 text-[11px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {item.format}
                        </span>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary-900">{formatPrice(price)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(key, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-800"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(key, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-800"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(key)}
                            className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 text-lg mb-6">{t('cart.summary', 'Resumen de compra')}</h3>

              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={cartItemKey(item)} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.product.name}{item.format ? ` — ${item.format}` : ''}
                    </span>
                    <span className="text-gray-900 font-medium flex-shrink-0">
                      {formatPrice(cartUnitPrice(item) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 mb-4" />

              <div className="flex justify-between items-baseline mb-6">
                <span className="text-lg font-semibold text-gray-900">{t('cart.total', 'Total')}</span>
                <span className="text-2xl font-bold text-primary-900">{formatPrice(total)}</span>
              </div>

              <Link to="/checkout" className="btn-primary w-full text-center block">
                {t('cart.checkout', 'Ir a pagar')}
              </Link>

              <WhatsAppConsultButton
                className="mt-3"
                message="Hola Modeltex, tengo una duda con mi compra antes de pagar."
              />

              <button
                onClick={clearCart}
                className="w-full mt-3 text-sm text-gray-500 hover:text-red-500 transition-colors py-2"
              >
                {t('cart.clear', 'Vaciar carrito')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
