import { Link } from 'react-router-dom';
import type { Product } from '../../lib/types';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLocale } from '../../lib/locale';
import { WHATSAPP_NUMBER } from '../../lib/whatsapp';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t, formatPrice } = useLocale();
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola Modeltex, tengo una consulta sobre el molde: ${product.name}`)}`;

  return (
    <div className="card group overflow-hidden">
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {product.main_image_url ? (
            <img
              src={product.main_image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
              {t('common.offer', 'OFERTA')}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium text-petroleum-600 bg-petroleum-50 px-2 py-0.5 rounded-md capitalize">
            {product.category === 'nino' ? 'Nino' : product.category === 'nina' ? 'Nina' : product.category.replace('-', ' ')}
          </span>
        </div>

        <Link to={`/producto/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.short_description}</p>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {product.formats.slice(0, 3).map(f => (
            <span key={f} className="text-[10px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
              {f}
            </span>
          ))}
          {product.formats.length > 3 && (
            <span className="text-[10px] text-gray-400">+{product.formats.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-900">
              {formatPrice(hasDiscount ? product.sale_price! : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-800 text-white hover:bg-primary-700 transition-colors active:scale-95"
            title={t('common.addToCart', 'Agregar al carrito')}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Consulta por WhatsApp (fina) */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {t('product.whatsapp', 'Consultar por WhatsApp')}
        </a>
      </div>
    </div>
  );
}
