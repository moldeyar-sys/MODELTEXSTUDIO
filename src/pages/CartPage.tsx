import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart, cartItemKey, cartUnitPrice } from '../contexts/CartContext';
import { useLocale } from '../lib/locale';
import { useCountry } from '../hooks/useCountry';
import { WhatsAppConsultButton } from '../components/ui/WhatsAppConsultButton';
import type { CartItem } from '../lib/types';
import {
  getDefaultSizes, getFormatType, getBasePrice, calcAdjustedPrice,
  TALLE_ARS, TALLE_USD,
} from '../lib/sizeUtils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateSizes, total, clearCart } = useCart();
  const { t, formatPrice } = useLocale();
  const { isArgentina } = useCountry();

  // ── Lógica de toggle de talle en el carrito ────────────────────────────────
  const handleToggleSize = (item: CartItem, size: string) => {
    const key = cartItemKey(item);
    const availableSizes = item.product.sizes || [];
    const currentSizes = item.sizes ?? getDefaultSizes(availableSizes);

    const isSelected = currentSizes.includes(size);
    if (isSelected && currentSizes.length === 1) return; // mínimo 1 talle

    const newSizes = isSelected
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];

    const defaultCount  = getDefaultSizes(availableSizes).length;
    const formatType    = getFormatType(item.format || '');
    const basePrice     = getBasePrice(item.product, formatType, isArgentina);

    if (basePrice === 0) {
      updateSizes(key, newSizes, item.unitPrice ?? 0);
      return;
    }

    const newUnitPrice = calcAdjustedPrice(basePrice, defaultCount, newSizes.length, formatType, isArgentina);
    updateSizes(key, newSizes, newUnitPrice);
  };

  // ── Etiqueta de ajuste de precio por talles ────────────────────────────────
  const PriceTag = ({ item }: { item: CartItem }) => {
    const availableSizes = item.product.sizes || [];
    const currentSizes   = item.sizes ?? getDefaultSizes(availableSizes);
    if (availableSizes.length === 0 || currentSizes.length === 0) return null;
    const defaultCount = getDefaultSizes(availableSizes).length;
    const diff = currentSizes.length - defaultCount;
    if (diff === 0) return null;
    const formatType = getFormatType(item.format || '');
    const perTalle   = isArgentina ? TALLE_ARS[formatType] : TALLE_USD[formatType];
    const amount     = Math.abs(diff) * perTalle;
    const sign       = diff > 0 ? '+' : '−';
    const talleWord  = Math.abs(diff) === 1 ? 'talle' : 'talles';
    return (
      <span className={`text-xs font-medium ${diff > 0 ? 'text-orange-500' : 'text-green-600'}`}>
        {sign}{isArgentina ? formatPrice(amount) : `USD ${amount}`} ({sign}{diff} {talleWord})
      </span>
    );
  };

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
              const price    = cartUnitPrice(item);
              const key      = cartItemKey(item);
              const availSz  = item.product.sizes || [];
              const currSz   = item.sizes ?? getDefaultSizes(availSz);
              const hasSizes = availSz.length > 0;

              return (
                <div key={key} className="card p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Imagen */}
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

                      {/* Editor interactivo de talles */}
                      {hasSizes && (
                        <div className="mt-2.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-medium text-gray-500">Talles</span>
                            <span className="text-[10px] text-gray-400">· tocá para agregar o quitar</span>
                            <span className="ml-auto text-[10px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded-full">
                              {currSz.length} talle{currSz.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {availSz.map(size => {
                              const isSel = currSz.includes(size);
                              const isLast = isSel && currSz.length === 1;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => handleToggleSize(item, size)}
                                  disabled={isLast}
                                  title={isLast ? 'Mínimo 1 talle' : isSel ? 'Quitar talle' : 'Agregar talle'}
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                                    isSel
                                      ? 'bg-primary-800 text-white border-primary-800'
                                      : 'border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                                  } ${isLast ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Precio + ajuste + cantidad */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-lg font-bold text-primary-900">{formatPrice(price)}</span>
                          <PriceTag item={item} />
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

          {/* Resumen */}
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
