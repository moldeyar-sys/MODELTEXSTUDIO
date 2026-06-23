import { useLocale } from '../../lib/locale';
import { cartonPrice, pdfPrice, cartonAvailable, pdfAvailable } from '../../lib/productFormats';
import type { Product } from '../../lib/types';

function PriceValue({ price, available, formatPrice }: { price: number | null; available: boolean; formatPrice: (n: number) => string }) {
  if (!available) return <span className="text-sm font-medium text-gray-400">No disponible</span>;
  if (price !== null) return <span className="text-base font-bold text-primary-900 whitespace-nowrap">{formatPrice(price)}</span>;
  return <span className="text-sm font-semibold text-petroleum-600">Consultar</span>;
}

function Row({ label, sub, price, available, formatPrice }: { label: string; sub: string; price: number | null; available: boolean; formatPrice: (n: number) => string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
        <p className="text-[11px] text-gray-400 leading-tight">{sub}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <PriceValue price={price} available={available} formatPrice={formatPrice} />
      </div>
    </div>
  );
}

/** Bloque con los 2 precios principales: Cartón (Solo Argentina) y PDF-A4 (Global). */
export function FormatPrices({ product }: { product: Product }) {
  const { formatPrice } = useLocale();
  return (
    <div className="space-y-2.5">
      <Row label="Moldes en Cartón" sub="Solo Argentina" price={cartonPrice(product)} available={cartonAvailable(product)} formatPrice={formatPrice} />
      <div className="border-t border-gray-100" />
      <Row label="Moldes en PDF-A4" sub="Global" price={pdfPrice(product)} available={pdfAvailable(product)} formatPrice={formatPrice} />
    </div>
  );
}
