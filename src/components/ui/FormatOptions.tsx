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

// ─── Lógica de talles predeterminados ────────────────────────────────────────
// Adultos: curva completa XS–4XL → predeterminados S–2XL
// Niños:   curva completa 2–18   → predeterminados 4–16
// Bebés:   curva completa 1–9    → predeterminados 1–5
const ADULT_LETTERS = new Set(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']);
const DEFAULT_ADULT = new Set(['S', 'M', 'L', 'XL', '2XL']);
const DEFAULT_CHILD = new Set(['4', '6', '8', '10', '12', '14', '16']);
const DEFAULT_BABY  = new Set(['1', '2', '3', '4', '5']);
// Tamaños que solo aparecen en niños (no en bebés): 10, 12, 14, 16, 18
const CHILD_ONLY    = new Set(['10', '12', '14', '16', '18']);

function getDefaultSizes(availableSizes: string[]): string[] {
  if (!availableSizes || availableSizes.length === 0) return [];

  // Adultos: tiene letras (S, M, XL, etc.)
  if (availableSizes.some(s => ADULT_LETTERS.has(s))) {
    const defs = availableSizes.filter(s => DEFAULT_ADULT.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }

  // Niños: tiene talles de dos dígitos (10, 12, 14, 16, 18)
  if (availableSizes.some(s => CHILD_ONLY.has(s))) {
    const defs = availableSizes.filter(s => DEFAULT_CHILD.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }

  // Bebés: todos numéricos y el mayor es ≤ 9
  const allNumeric = availableSizes.every(s => /^\d+$/.test(s));
  if (allNumeric && Math.max(...availableSizes.map(Number)) <= 9) {
    const defs = availableSizes.filter(s => DEFAULT_BABY.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }

  // Fallback: todos seleccionados
  return availableSizes;
}
// ─────────────────────────────────────────────────────────────────────────────

interface FormatOptionsProps {
  product: Product;
}

/**
 * Selector de talles + opciones de formato:
 *  0) Talles (selector con defaults inteligentes)
 *  1) Moldes en Cartón (Solo Argentina)
 *  2) Moldes en PDF-A4 (Global)
 *  3) Moldes en PDF Plóter (3 medidas, mismo precio)
 *  4) ¿Necesitás otro formato? → WhatsApp / Telegram
 */
export function FormatOptions({ product }: FormatOptionsProps) {
  const { addItem, itemCount } = useCart();
  const { formatPrice } = useLocale();
  const [ploterSize, setPloterSize] = useState(PLOTER_SIZES[0]);
  const [added, setAdded] = useState<string | null>(null);

  // Talles disponibles del producto
  const availableSizes: string[] = product.sizes ?? [];
  const hasSizes = availableSizes.length > 0;

  // Talles seleccionados (defaults inteligentes al montar)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => getDefaultSizes(availableSizes));

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const carton = cartonPrice(product);
  const pdf = pdfPrice(product);
  const ploter = ploterPrice(product);

  const canAdd = !hasSizes || selectedSizes.length > 0;

  const add = (format: string, unitPrice: number) => {
    if (!canAdd) return;
    addItem(product, { format, unitPrice, sizes: hasSizes ? selectedSizes : undefined });
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
        disabled={!canAdd}
        title={!canAdd ? 'Seleccioná al menos un talle' : undefined}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          !canAdd
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isAdded
              ? 'bg-green-500 text-white'
              : 'bg-primary-800 text-white hover:bg-primary-700'
        }`}
      >
        {isAdded ? <><Check className="w-3.5 h-3.5" /> Agregado</> : <><ShoppingCart className="w-3.5 h-3.5" /> Agregar</>}
      </button>
    );
  };

  return (
    <div className="space-y-3">

      {/* 0) Selector de talles */}
      {hasSizes && (
        <div className="border border-primary-100 bg-primary-50/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-semibold text-gray-900">Talles del pedido</p>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              selectedSizes.length > 0
                ? 'bg-primary-100 text-primary-800'
                : 'bg-red-100 text-red-600'
            }`}>
              {selectedSizes.length > 0 ? `${selectedSizes.length} seleccionado${selectedSizes.length > 1 ? 's' : ''}` : 'Seleccioná al menos 1'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2.5">
            Los azules están incluidos · tocá para agregar o quitar
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(size => {
              const isSelected = selectedSizes.includes(size);
              const isDefault = DEFAULT_ADULT.has(size) || DEFAULT_CHILD.has(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-primary-800 text-white border-primary-800 shadow-sm'
                      : isDefault
                        ? 'border-primary-200 text-primary-400 hover:bg-primary-50'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {!canAdd && (
            <p className="text-[11px] text-red-500 mt-2">⚠ Seleccioná al menos un talle para poder agregar al carrito.</p>
          )}
        </div>
      )}

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
