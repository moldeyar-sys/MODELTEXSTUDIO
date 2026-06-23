import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLocale } from '../../lib/locale';
import { ConsultButtons } from './ConsultButtons';
import {
  cartonPrice, pdfPrice, ploterPrice, cartonAvailable, pdfAvailable, showOtroFormato, PLOTER_SIZES,
} from '../../lib/productFormats';
import type { Product } from '../../lib/types';

interface FormatOptionsProps {
  product: Product;
}

/**
 * Las 4 opciones de formato:
 *  1) Moldes en Cartón (Solo Argentina)
 *  2) Moldes en PDF-A4 (Global)
 *  3) Moldes en PDF Plóter (3 medidas, mismo precio)
 *  4) ¿Necesitás otro formato? → WhatsApp / Telegram
 * Tocar 1-3 agrega al carrito con su precio.
 */
export function FormatOptions({ product }: FormatOptionsProps) {
  const { addItem, itemCount } = useCart();
  const { formatPrice } = useLocale();
  const [ploterSize, setPloterSize] = useState(PLOTER_SIZES[0]);
  const [added, setAdded] = useState<string | null>(null);

  const carton = cartonPrice(product);
  const pdf = pdfPrice(product);
  const ploter = ploterPrice(product);

  const add = (format: string, unitPrice: number) => {
    addItem(product, { format, unitPrice });
    setAdded(format);
    setTimeout(() => setAdded(cur => (cur === format ? null : cur)), 1800);
  };

  const AddButton = ({ format, price, disabled }: { format: string; price: number | null; disabled?: boolean }) => {
    if (disabled || price === null) {
      return <span className="text-sm font-semibold text-petroleum-600">Consultar</span>;
    }
    const isAdded = added === format;
    return (
      <button
        type="button"
        onClick={() => add(format, price)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          isAdded ? 'bg-green-500 text-white' : 'bg-primary-800 text-white hover:bg-primary-700'
        }`}
      >
        {isAdded ? <><Check className="w-3.5 h-3.5" /> Agregado</> : <><ShoppingCart className="w-3.5 h-3.5" /> Agregar</>}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* 1) Cartón */}
      <div className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Moldes en Cartón</p>
          <p className="text-[11px] text-gray-400">Solo Argentina</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {cartonAvailable(product) && carton !== null && (
            <span className="text-sm font-bold text-primary-900 whitespace-nowrap">{formatPrice(carton)}</span>
          )}
          {!cartonAvailable(product)
            ? <span className="text-xs font-medium text-gray-400">No disponible</span>
            : <AddButton format="Moldes en Cartón" price={carton} />}
        </div>
      </div>

      {/* 2) PDF-A4 */}
      <div className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Moldes en PDF-A4</p>
          <p className="text-[11px] text-gray-400">Global</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {pdfAvailable(product) && pdf !== null && (
            <span className="text-sm font-bold text-primary-900 whitespace-nowrap">{formatPrice(pdf)}</span>
          )}
          {!pdfAvailable(product)
            ? <span className="text-xs font-medium text-gray-400">No disponible</span>
            : <AddButton format="Moldes en PDF-A4" price={pdf} />}
        </div>
      </div>

      {/* 3) PDF Plóter (3 medidas, mismo precio) */}
      <div className="border border-gray-100 rounded-xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">Moldes en PDF Plóter</p>
            <p className="text-[11px] text-gray-400">Elegí la medida</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {ploter !== null && (
              <span className="text-sm font-bold text-primary-900 whitespace-nowrap">{formatPrice(ploter)}</span>
            )}
            <AddButton format={`Moldes en PDF Plóter (${ploterSize})`} price={ploter} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {PLOTER_SIZES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setPloterSize(s)}
              className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                ploterSize === s
                  ? 'bg-primary-50 border-primary-300 text-primary-800'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              Plóter {s}
            </button>
          ))}
        </div>
      </div>

      {/* 4) ¿Otro formato? */}
      {showOtroFormato(product) && (
        <div className="border border-gray-100 rounded-xl p-3">
          <p className="text-sm font-semibold text-gray-900 leading-tight">¿Necesitás otro formato?</p>
          <p className="text-[11px] text-gray-400 mb-2.5">Consultá por WhatsApp o Telegram</p>
          <ConsultButtons product={product} format="otro" />
        </div>
      )}

      {/* Botón COMPRAR permanente: aparece apenas hay algo en el carrito */}
      {itemCount > 0 && (
        <Link
          to="/carrito"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors active:scale-[0.98] shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" /> Comprar ({itemCount})
        </Link>
      )}
    </div>
  );
}
