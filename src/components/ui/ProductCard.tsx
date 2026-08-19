import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Ruler, FileText } from 'lucide-react';
import type { Product } from '../../lib/types';
import { CATEGORIES } from '../../lib/types';
import { useLocale } from '../../lib/locale';
import { cartonPrice, pdfPrice, ploterPrice } from '../../lib/productFormats';
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
    CATEGORIES.find((c) => c.value === product.category)?.label || product.category.replace('-', ' ');

  const carton = cartonPrice(product);
  const pdf = pdfPrice(product);
  const ploter = ploterPrice(product);
  const showUsd = !isArgentina && (product.precio_usd_carton != null || product.precio_usd_pdf_a4 != null || product.precio_usd_pdf_ploter != null);

  const localPrices = [carton, pdf, ploter].filter((value): value is number => value !== null);
  const usdPrices = [product.precio_usd_carton, product.precio_usd_pdf_a4, product.precio_usd_pdf_ploter].filter(
    (value): value is number => value != null,
  );
  const startingPrice = showUsd ? (usdPrices.length ? Math.min(...usdPrices) : null) : (localPrices.length ? Math.min(...localPrices) : null);
  const visibleFormats = (product.formats || []).slice(0, 2);
  const extraFormats = Math.max((product.formats || []).length - visibleFormats.length, 0);
  const hasManySizes = (product.sizes || []).length > 0;

  return (
    <article className="card group overflow-hidden flex flex-col h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <Link to={`/producto/${product.slug}`} className="block">
          <div className="aspect-[3/4] sm:aspect-[4/3] bg-gray-50 relative overflow-hidden">
            {product.main_image_url ? (
              <img
                src={product.main_image_url}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4V19L13.292 9.706a1 1 0 011.414 0L20 15.01V5zM2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM8 11a2 2 0 110-4 2 2 0 010 4z"/></svg>
              </div>
            )}

            <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-wrap gap-1 sm:gap-1.5 pr-3">
              <span className="text-[10px] sm:text-[11px] font-semibold text-petroleum-700 bg-white/95 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                {categoryLabel}
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                Descarga rapida
              </span>
            </div>
          </div>
        </Link>

        {/* Mobile: la foto manda, asi que comprar es un boton flotante sobre la imagen en vez de una fila de texto abajo */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowOptions(true);
          }}
          aria-label="Comprar"
          className="sm:hidden absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary-800 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile: pie minimo, solo nombre + precio */}
      <Link to={`/producto/${product.slug}`} className="sm:hidden px-2.5 pt-1.5 pb-2">
        <h3 className="text-[11px] leading-tight text-gray-500 line-clamp-1">{product.name}</h3>
        <p className="text-sm font-bold text-primary-900 leading-tight mt-0.5">
          {startingPrice !== null
            ? showUsd
              ? `USD ${startingPrice.toFixed(2)}`
              : formatPrice(startingPrice)
            : 'Consultar'}
        </p>
      </Link>

      {/* Desktop: pie completo con formatos, talles, codigo y botones */}
      <div className="hidden sm:flex p-3 sm:p-4 flex-col flex-1">
        <Link to={`/producto/${product.slug}`}>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-primary-800 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleFormats.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              <FileText className="w-3 h-3" /> {item}
            </span>
          ))}
          {extraFormats > 0 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
              +{extraFormats} formatos
            </span>
          )}
          {hasManySizes && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700">
              <Ruler className="w-3 h-3" /> {product.sizes.length} talles
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-lg sm:text-xl font-bold text-primary-900 leading-none">
            {startingPrice !== null
              ? showUsd
                ? `USD ${startingPrice.toFixed(2)}`
                : formatPrice(startingPrice)
              : 'Consultar'}
          </p>
          {product.codigo && (
            <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">Cod. {product.codigo}</span>
          )}
        </div>

        <div className="mt-auto pt-3 flex gap-2">
          <button
            onClick={() => setShowOptions(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-800 px-3 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-700 transition-colors active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" /> Comprar
          </button>
          <ConsultButtons product={product} format="general" variant="icon" />
        </div>
      </div>

      {showOptions && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setShowOptions(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Elegi el formato</p>
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
    </article>
  );
}
