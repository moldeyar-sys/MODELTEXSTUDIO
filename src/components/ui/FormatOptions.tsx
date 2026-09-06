import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLocale } from '../../lib/locale';
import { useCountry } from '../../hooks/useCountry';
import { ConsultButtons } from './ConsultButtons';
import {
  cartonPrice, pdfPrice, ploterPrice, cartonAvailable, pdfAvailable, showOtroFormato, PLOTER_SIZES,
  INDUSTRIAL_FORMATS, industrialPriceArs, industrialPriceUsd,
} from '../../lib/productFormats';
import { getDefaultSizes, TALLE_ARS, TALLE_USD } from '../../lib/sizeUtils';
import { SizeGuide } from './SizeGuide';
import type { Product } from '../../lib/types';

interface FormatOptionsProps {
  product: Product;
}

export function FormatOptions({ product }: FormatOptionsProps) {
  const { addItem, itemCount } = useCart();
  const { formatPrice, t } = useLocale();
  const { isArgentina } = useCountry();
  const [ploterSize, setPloterSize] = useState(PLOTER_SIZES[0]);
  const [added, setAdded] = useState<string | null>(null);

  // Talles disponibles del producto
  const availableSizes: string[] = product.sizes ?? [];
  const hasSizes = availableSizes.length > 0;

  // Defaults y estado de selección
  const defaultSizes = getDefaultSizes(availableSizes);
  const defaultCount = defaultSizes.length;
  const [selectedSizes, setSelectedSizes] = useState<string[]>(defaultSizes);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const canAdd = !hasSizes || selectedSizes.length > 0;

  // Diferencia de talles respecto al default
  const talleDiff = hasSizes ? selectedSizes.length - defaultCount : 0;

  // ── Precios base (ARS) ──
  const baseCarton = cartonPrice(product);   // null → Consultar
  const basePdf    = pdfPrice(product);
  const basePloter = ploterPrice(product);

  // ── Precios base (USD) ──
  const baseCartonUsd = product.precio_usd_carton  ?? null;
  const basePdfUsd    = product.precio_usd_pdf_a4  ?? null;
  const basePloterUsd = product.precio_usd_pdf_ploter ?? null;

  // ── Precios ajustados según talles seleccionados ──
  const adjCarton  = baseCarton  !== null ? Math.max(0, baseCarton  + talleDiff * TALLE_ARS.carton)  : null;
  const adjPdf     = basePdf     !== null ? Math.max(0, basePdf     + talleDiff * TALLE_ARS.pdf)     : null;
  const adjPloter  = basePloter  !== null ? Math.max(0, basePloter  + talleDiff * TALLE_ARS.ploter)  : null;

  const adjCartonUsd = baseCartonUsd !== null ? Math.max(0, baseCartonUsd + talleDiff * TALLE_USD.carton) : null;
  const adjPdfUsd    = basePdfUsd    !== null ? Math.max(0, basePdfUsd    + talleDiff * TALLE_USD.pdf)    : null;
  const adjPloterUsd = basePloterUsd !== null ? Math.max(0, basePloterUsd + talleDiff * TALLE_USD.ploter) : null;

  // ── Precio efectivo que se pasa al carrito (ARS o USD según país) ──
  const effectiveCarton  = isArgentina ? adjCarton  : adjCartonUsd;
  const effectivePdf     = isArgentina ? adjPdf     : adjPdfUsd;
  const effectivePloter  = isArgentina ? adjPloter  : adjPloterUsd;

  // Etiqueta de cambio de precio (ej: "+$10.000" / "-$10.000")
  const priceTag = (diff: number, perTalle: number, usdPerTalle: number) => {
    if (!hasSizes || diff === 0) return null;
    const amount = isArgentina
      ? Math.abs(diff) * perTalle
      : Math.abs(diff) * usdPerTalle;
    const sign = diff > 0 ? '+' : '−';
    const talleWord = Math.abs(diff) === 1 ? 'talle' : 'talles';
    return {
      sign,
      label: `${sign}${isArgentina ? formatPrice(amount) : `USD ${amount}`} (${sign === '+' ? '+' : ''}${diff} ${talleWord})`,
      positive: diff > 0,
    };
  };

  const add = (format: string, unitPrice: number, withSizes = true) => {
    if (withSizes && !canAdd) return;
    // Los formatos industriales incluyen la curva completa: no llevan talles elegidos.
    addItem(product, { format, unitPrice, sizes: withSizes && hasSizes ? selectedSizes : undefined });
    setAdded(format);
    setTimeout(() => setAdded(cur => (cur === format ? null : cur)), 1800);
  };

  // ── AddButton reutilizable ──
  const AddButton = ({
    format,
    price,
    disabled,
    withSizes = true,
  }: {
    format: string;
    price: number | null;
    disabled?: boolean;
    /** false = formato industrial: no exige ni adjunta talles elegidos. */
    withSizes?: boolean;
  }) => {
    if (disabled || price === null) {
      return <span className="text-sm font-semibold text-petroleum-600">{t('common.consult', 'Consultar')}</span>;
    }
    const blocked = withSizes && !canAdd;
    const isAdded = added === format;
    return (
      <button
        type="button"
        onClick={() => add(format, price, withSizes)}
        disabled={blocked}
        title={blocked ? t('fmt.selectSizeTitle', 'Seleccioná al menos un talle') : undefined}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          blocked
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isAdded
              ? 'bg-green-500 text-white'
              : 'bg-primary-800 text-white hover:bg-primary-700'
        }`}
      >
        {isAdded
          ? <><Check className="w-3.5 h-3.5" /> {t('common.added', 'Agregado')}</>
          : <><ShoppingCart className="w-3.5 h-3.5" /> {t('common.add', 'Agregar')}</>}
      </button>
    );
  };

  // ── Fila de precio + ajuste ──
  const PriceDisplay = ({
    base,
    adjusted,
    perTalleArs,
    perTalleUsd,
  }: {
    base: number | null;
    adjusted: number | null;
    perTalleArs: number;
    perTalleUsd: number;
  }) => {
    if (adjusted === null) return null;
    const tag = priceTag(talleDiff, perTalleArs, perTalleUsd);
    const changed = base !== null && adjusted !== base;
    return (
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className={`text-sm font-bold whitespace-nowrap ${changed ? 'text-primary-900' : 'text-primary-900'}`}>
          {isArgentina ? formatPrice(adjusted) : `USD ${adjusted.toFixed(2)}`}
        </span>
        {tag && (
          <span className={`text-[10px] font-medium ${tag.positive ? 'text-orange-500' : 'text-green-600'}`}>
            {tag.label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">

      {/* Badge de entrega + guía de talles */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700 flex-1">
          <span>⚡</span> {t('fmt.delivery', 'Descarga inmediata después del pago')}
        </div>
        <SizeGuide />
      </div>

      {/* 0) Selector de talles */}
      {hasSizes && (
        <div className="border border-primary-100 bg-primary-50/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-semibold text-gray-900">{t('fmt.orderSizes', 'Talles del pedido')}</p>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              selectedSizes.length > 0
                ? 'bg-primary-100 text-primary-800'
                : 'bg-red-100 text-red-600'
            }`}>
              {selectedSizes.length > 0
                ? `${selectedSizes.length} ${selectedSizes.length > 1 ? t('card.sizes', 'talles') : t('card.size', 'talle')}`
                : t('fmt.selectOne', 'Seleccioná al menos 1')}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2.5">
            {t('fmt.sizeHint', 'Azul = incluido · tocá para agregar o quitar · el precio se ajusta automáticamente')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-primary-800 text-white border-primary-800 shadow-sm'
                      : 'border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {!canAdd && (
            <p className="text-[11px] text-red-500 mt-2">
              {t('fmt.sizeWarn', '⚠ Seleccioná al menos un talle para poder agregar al carrito.')}
            </p>
          )}
        </div>
      )}

      {/* 1) Cartón */}
      <div className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{t('fmt.carton', 'Moldes en Cartón')}</p>
          <p className="text-[11px] text-gray-400">{t('fmt.argOnly', 'Solo Argentina')}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {cartonAvailable(product) && effectiveCarton !== null && (
            <PriceDisplay
              base={isArgentina ? baseCarton : baseCartonUsd}
              adjusted={effectiveCarton}
              perTalleArs={TALLE_ARS.carton}
              perTalleUsd={TALLE_USD.carton}
            />
          )}
          {!cartonAvailable(product)
            ? <span className="text-xs font-medium text-gray-400">No disponible</span>
            : <AddButton format="Moldes en Cartón" price={effectiveCarton} />}
        </div>
      </div>

      {/* 2) PDF-A4 */}
      <div className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{t('fmt.pdfA4', 'Moldes en PDF-A4')}</p>
          <p className="text-[11px] text-gray-400">{t('fmt.global', 'Global')}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {pdfAvailable(product) && effectivePdf !== null && (
            <PriceDisplay
              base={isArgentina ? basePdf : basePdfUsd}
              adjusted={effectivePdf}
              perTalleArs={TALLE_ARS.pdf}
              perTalleUsd={TALLE_USD.pdf}
            />
          )}
          {!pdfAvailable(product)
            ? <span className="text-xs font-medium text-gray-400">No disponible</span>
            : <AddButton format="Moldes en PDF-A4" price={effectivePdf} />}
        </div>
      </div>

      {/* 3) PDF Plóter */}
      <div className="border border-gray-100 rounded-xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{t('fmt.ploter', 'Moldes en PDF Plóter')}</p>
            <p className="text-[11px] text-gray-400">{t('fmt.chooseWidth', 'Elegí la medida')}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {effectivePloter !== null && (
              <PriceDisplay
                base={isArgentina ? basePloter : basePloterUsd}
                adjusted={effectivePloter}
                perTalleArs={TALLE_ARS.ploter}
                perTalleUsd={TALLE_USD.ploter}
              />
            )}
            <AddButton format={`Moldes en PDF Plóter (${ploterSize})`} price={effectivePloter} />
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
              {t('fmt.ploterWord', 'Plóter')} {s}
            </button>
          ))}
        </div>
      </div>

      {/* 3b) Formatos industriales CAD: DXF/AAMA, PDS, MRK, ADS — para fábricas y patronaje */}
      {INDUSTRIAL_FORMATS.some(fmt => industrialPriceArs(product, fmt.key) !== null || industrialPriceUsd(product, fmt.key) !== null) && (
        <div className="border border-primary-100 bg-primary-50/30 rounded-xl p-3">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{t('fmt.industrial', 'Formatos industriales (CAD)')}</p>
          <p className="text-[11px] text-gray-400 mb-2.5">{t('fmt.industrialHint', 'Archivos nativos para fábricas y departamentos de patronaje. Incluye la curva completa de talles.')}</p>
          <div className="space-y-2">
            {INDUSTRIAL_FORMATS.map(fmt => {
              const priceArs = industrialPriceArs(product, fmt.key);
              const priceUsd = industrialPriceUsd(product, fmt.key);
              const effective = isArgentina ? priceArs : priceUsd;
              if (effective === null) return null;
              return (
                <div key={fmt.key} className="flex items-center justify-between gap-3 border border-gray-100 bg-white rounded-lg p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{fmt.label}</p>
                    <p className="text-[10px] text-gray-400 leading-snug">{t(`fmt.${fmt.key}.detail`, fmt.detailEs)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-primary-900 whitespace-nowrap">
                      {isArgentina ? formatPrice(effective) : `USD ${effective.toFixed(2)}`}
                    </span>
                    <AddButton format={fmt.label} price={effective} withSizes={false} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">{t('fmt.fullSet', 'Incluye la curva completa de talles')}</p>
        </div>
      )}

      {/* 4) ¿Otro formato? */}
      {showOtroFormato(product) && (
        <div className="border border-gray-100 rounded-xl p-3">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{t('fmt.other', '¿Necesitás otro formato?')}</p>
          <p className="text-[11px] text-gray-400 mb-2.5">{t('fmt.otherHint', 'Consultá por WhatsApp o Telegram')}</p>
          <ConsultButtons product={product} format="otro" />
        </div>
      )}

      {/* Botón IR A COMPRAR: aparece cuando hay algo en el carrito */}
      {itemCount > 0 && (
        <Link
          to="/carrito"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors active:scale-[0.98] shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" /> {t('common.buy', 'Comprar')} ({itemCount})
        </Link>
      )}
    </div>
  );
}
