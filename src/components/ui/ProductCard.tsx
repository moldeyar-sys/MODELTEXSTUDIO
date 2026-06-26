import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import type { Product } from '../../lib/types';
import { CATEGORIES } from '../../lib/types';
import { useLocale } from '../../lib/locale';
import { cartonPrice, pdfPrice } from '../../lib/productFormats';
import { ConsultButtons } from './ConsultButtons';
import { FormatOptions } from './FormatOptions';
import { useCountry } from '../../hooks/useCountry';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useLocale();
  const { isArgentina } = useCountry();
  const [showOptions, setShowOptions] = useState(false);
  const categoryLabel =
    CATEGORIES.find(c => c.value === product.category)?.label || product.category.replace('-', ' ');

  const carton = cartonPrice(product);
  const pdf = pdfPrice(product);
  const showUsd = !isArgentina && (product.precio_usd_carton != null || product.precio_usd_pdf_a4 != null || product.precio_usd_pdf_ploter != null);

  return (
    <div className="card group overflow-hidden flex flex-col">
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
          {product.main_image_url ? (
            <img
              src={product.main_image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-xs font-medium text-petroleum-600 bg-petroleum-50 px-2 py-0.5 rounded-md capitalize">
            {categoryLabel}
          </span>
          {product.entrega_inmediata
            ? <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">⚡ Descarga inmediata</span>
            : <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">🕐 Disponible en 24 hs</span>
          }
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
        <div className="mt-3 text-sm space-y-1">
          {showUsd ? (
            // Cliente internacional: mostrar precios en USD por formato
            <>
              {product.precio_usd_carton != null && (
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-gray-500">Moldes en Cartón</span>
                  <span className="font-bold text-green-700">USD {product.precio_usd_carton.toFixed(2)}</span>
                </div>
              )}
              {product.precio_usd_pdf_a4 != null && (
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-gray-500">Digital - PDF-A4</span>
                  <span className="font-bold text-green-700">USD {product.precio_usd_pdf_a4.toFixed(2)}</span>
                </div>
              )}
              {product.precio_usd_pdf_ploter != null && (
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-gray-500">PDF Plóter</span>
                  <span className="font-bold text-green-700">USD {product.precio_usd_pdf_ploter.toFixed(2)}</span>
                </div>
              )}
            </>
          ) : (
            // Cliente Argentina: mostrar precios en ARS por formato
            <>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-gray-500">Moldes en Cartón</span>
                <span className="font-bold text-primary-900">{carton !== null ? formatPrice(carton) : 'Consultar'}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-gray-500">Digital - PDF-A4</span>
                <span className="font-bold text-primary-900">{pdf !== null ? formatPrice(pdf) : 'Consultar'}</span>
              </div>
            </>
          )}
        </div>

        {/* Comprar (despliega opciones) */}
        <button
          onClick={() => setShowOptions(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-800 text-white text-sm font-semibold hover:bg-primary-700 transition-colors active:scale-[0.98]"
        >
          <ShoppingCart className="w-4 h-4" /> Comprar
        </button>

        {/* WhatsApp + Telegram */}
        <div className="mt-auto pt-3">
          <ConsultButtons product={product} format="general" />
        </div>
      </div>

      {/* Modal de opciones de formato */}
      {showOptions && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setShowOptions(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Elegí el formato</p>
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              </div>
              <button onClick={() => setShowOptions(false)} aria-label="Cerrar" className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <FormatOptions product={product} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
