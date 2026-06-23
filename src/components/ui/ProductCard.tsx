import { Link } from 'react-router-dom';
import type { Product } from '../../lib/types';
import { CATEGORIES } from '../../lib/types';
import { FormatPrices } from './FormatPrices';
import { ConsultButtons } from './ConsultButtons';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const categoryLabel =
    CATEGORIES.find(c => c.value === product.category)?.label || product.category.replace('-', ' ');

  return (
    <div className="card group overflow-hidden flex flex-col">
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
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium text-petroleum-600 bg-petroleum-50 px-2 py-0.5 rounded-md capitalize">
            {categoryLabel}
          </span>
        </div>

        <Link to={`/producto/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.short_description}</p>
        )}

        {/* Precios por formato */}
        <div className="mt-3 bg-gray-50 rounded-xl p-3">
          <FormatPrices product={product} />
        </div>

        {/* Consultar por WhatsApp / Telegram */}
        <div className="mt-auto pt-3">
          <ConsultButtons product={product} format="general" />
        </div>
      </div>
    </div>
  );
}
