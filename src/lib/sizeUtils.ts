/**
 * Lógica de talles compartida entre FormatOptions (modal de compra)
 * y CartPage (editor de talles en el carrito).
 */

// ── Detección de defaults ─────────────────────────────────────────────────────
const ADULT_LETTERS = new Set(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']);
const DEFAULT_ADULT  = new Set(['S', 'M', 'L', 'XL', '2XL']);
const DEFAULT_CHILD  = new Set(['4', '6', '8', '10', '12', '14', '16']);
const DEFAULT_BABY   = new Set(['1', '2', '3', '4', '5']);
const CHILD_ONLY     = new Set(['10', '12', '14', '16', '18']); // solo niños, no bebés

export function getDefaultSizes(availableSizes: string[]): string[] {
  if (!availableSizes || availableSizes.length === 0) return [];
  if (availableSizes.some(s => ADULT_LETTERS.has(s))) {
    const defs = availableSizes.filter(s => DEFAULT_ADULT.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }
  if (availableSizes.some(s => CHILD_ONLY.has(s))) {
    const defs = availableSizes.filter(s => DEFAULT_CHILD.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }
  const allNumeric = availableSizes.every(s => /^\d+$/.test(s));
  if (allNumeric && Math.max(...availableSizes.map(Number)) <= 9) {
    const defs = availableSizes.filter(s => DEFAULT_BABY.has(s));
    return defs.length > 0 ? defs : availableSizes;
  }
  return availableSizes;
}

// ── Precios por talle ─────────────────────────────────────────────────────────
export const TALLE_ARS = { carton: 10_000, pdf: 3_000, ploter: 4_000 };
export const TALLE_USD = { carton: 7,      pdf: 3,     ploter: 5     };

export type FormatType = 'carton' | 'pdf' | 'ploter';

/** Detecta el tipo de formato a partir del string (ej: "Moldes en PDF Plóter (90 cm)"). */
export function getFormatType(format: string): FormatType {
  const f = (format || '').toLowerCase();
  if (f.includes('cart')) return 'carton';
  if (f.includes('pl')) return 'ploter'; // plóter / ploter
  return 'pdf';
}

/**
 * Precio base del producto para un formato dado (sin ajuste de talles).
 * Es el precio almacenado en la DB para la curva predeterminada.
 */
export function getBasePrice(
  product: {
    price: number;
    precio_carton?: number | null;
    precio_pdf_a4?: number | null;
    precio_pdf_ploter?: number | null;
    precio_usd_carton?: number | null;
    precio_usd_pdf_a4?: number | null;
    precio_usd_pdf_ploter?: number | null;
  },
  formatType: FormatType,
  isArgentina: boolean,
): number {
  if (isArgentina) {
    if (formatType === 'carton') return product.precio_carton ?? 0;
    if (formatType === 'ploter') return product.precio_pdf_ploter ?? 0;
    return (product.precio_pdf_a4 ?? product.price) || 0; // fallback al precio base
  } else {
    if (formatType === 'carton') return product.precio_usd_carton ?? 0;
    if (formatType === 'ploter') return product.precio_usd_pdf_ploter ?? 0;
    return product.precio_usd_pdf_a4 ?? 0;
  }
}

/**
 * Calcula el precio ajustado según la diferencia de talles respecto al default.
 *   diff > 0 → agrega talles → sube precio
 *   diff < 0 → quita talles → baja precio
 */
export function calcAdjustedPrice(
  basePrice: number,
  defaultCount: number,
  selectedCount: number,
  formatType: FormatType,
  isArgentina: boolean,
): number {
  const diff = selectedCount - defaultCount;
  const perTalle = isArgentina ? TALLE_ARS[formatType] : TALLE_USD[formatType];
  return Math.max(0, basePrice + diff * perTalle);
}
