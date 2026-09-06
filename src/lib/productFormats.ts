import { whatsappWebLink } from './whatsapp';
import type { Product } from './types';

// ===== Configuración central de formatos comerciales y consultas =====
export const SITE_URL = 'https://modeltex.com.ar';

export type ConsultFormat = 'carton' | 'pdf' | 'otro' | 'general';

export function productUrl(slug: string): string {
  return `${SITE_URL}/producto/${slug}`;
}

/** Código del producto. Si no hay columna/valor, cae al nombre (que suele incluir el código). */
export function productCode(p: Product): string {
  const c = (p.codigo ?? '').trim();
  return c || p.name;
}

/** Precio Cartón. Devuelve null (→ "Consultar") si falta o es 0. Nunca devuelve 0. */
export function cartonPrice(p: Product): number | null {
  const v = p.precio_carton;
  return typeof v === 'number' && v > 0 ? v : null;
}

/** Precio PDF-A4. Si falta, cae al precio general (price). null → "Consultar". Nunca 0. */
export function pdfPrice(p: Product): number | null {
  const v = p.precio_pdf_a4;
  if (typeof v === 'number' && v > 0) return v;
  return typeof p.price === 'number' && p.price > 0 ? p.price : null;
}

/** Precio PDF Plóter (mismo para las 3 medidas). null → "Consultar". Nunca 0. */
export function ploterPrice(p: Product): number | null {
  const v = p.precio_pdf_ploter;
  return typeof v === 'number' && v > 0 ? v : null;
}

/** Medidas de plóter disponibles (mismo precio). */
export const PLOTER_SIZES = ['90 cm', '120 cm', '150 cm'];

// ===== Formatos industriales CAD (para fábricas y departamentos de patronaje) =====
// Se venden con la curva completa de talles incluida (sin ajuste por talle).
export type IndustrialKey = 'dxf' | 'pds' | 'mrk' | 'ads';

export interface IndustrialFormat {
  key: IndustrialKey;
  /** Nombre comercial: se muestra y queda guardado en el pedido. */
  label: string;
  /** Clave de traducción del detalle (fmt.<key>.detail). */
  detailEs: string;
}

export const INDUSTRIAL_FORMATS: IndustrialFormat[] = [
  { key: 'dxf', label: 'DXF / AAMA', detailEs: 'Estándar universal CAD (Gerber, Lectra, Optitex, Audaces)' },
  { key: 'pds', label: 'PDS (Optitex)', detailEs: 'Archivo nativo de Optitex, listo para tu sistema' },
  { key: 'mrk', label: 'MRK (Tizado Optitex)', detailEs: 'Tizado computarizado listo para el corte' },
  { key: 'ads', label: 'ADS (Audaces)', detailEs: 'Archivo nativo de Audaces' },
];

/** Precio ARS de un formato industrial. null → "Consultar". Nunca 0. */
export function industrialPriceArs(p: Product, key: IndustrialKey): number | null {
  const v = p[`precio_${key}`];
  return typeof v === 'number' && v > 0 ? v : null;
}

/** Precio USD de un formato industrial. null → "Consultar". Nunca 0. */
export function industrialPriceUsd(p: Product, key: IndustrialKey): number | null {
  const v = p[`precio_usd_${key}`];
  return typeof v === 'number' && v > 0 ? v : null;
}

/**
 * Detecta si un formato del carrito es industrial (CAD). Estos ítems incluyen
 * la curva completa de talles, así que el carrito no debe reajustar su precio.
 */
export function isIndustrialFormat(format: string): boolean {
  const f = (format || '').toLowerCase();
  return f.includes('dxf') || f.includes('aama') || f.includes('pds')
    || f.includes('mrk') || f.includes('tizado') || f.includes('audaces');
}

export function cartonAvailable(p: Product): boolean {
  return p.disponible_carton !== false; // undefined = disponible
}
export function pdfAvailable(p: Product): boolean {
  return p.disponible_pdf_a4 !== false;
}
export function showOtroFormato(p: Product): boolean {
  return p.mostrar_consulta_otro_formato !== false;
}

function buildMessage(
  p: Product,
  fmt: ConsultFormat,
  fmtPrice: (n: number) => string,
  includeLink: boolean,
): string {
  const code = productCode(p);
  const link = includeLink ? `\nEnlace: ${productUrl(p.slug)}` : '';
  if (fmt === 'carton') {
    const pr = cartonPrice(p);
    return `Hola, quiero consultar por este producto en Moldes en Cartón:\nProducto: ${p.name}\nCódigo: ${code}\nPrecio: ${pr ? fmtPrice(pr) : 'a confirmar'}${link}`;
  }
  if (fmt === 'pdf') {
    const pr = pdfPrice(p);
    return `Hola, quiero consultar por este producto en Moldes en PDF-A4:\nProducto: ${p.name}\nCódigo: ${code}\nPrecio: ${pr ? fmtPrice(pr) : 'a confirmar'}${link}`;
  }
  if (fmt === 'otro') {
    return `Hola, quiero consultar por este producto en otro formato:\nProducto: ${p.name}\nCódigo: ${code}${link}`;
  }
  return `Hola, quiero consultar por este producto:\nProducto: ${p.name}\nCódigo: ${code}${link}`;
}

/** Mensaje de WhatsApp con producto, código y enlace prearmado según el formato. */
export function whatsappMessage(p: Product, fmt: ConsultFormat, fmtPrice: (n: number) => string): string {
  return buildMessage(p, fmt, fmtPrice, true);
}

/** Link web de WhatsApp con mensaje prearmado según el formato. */
export function whatsappLink(p: Product, fmt: ConsultFormat, fmtPrice: (n: number) => string): string {
  return whatsappWebLink(whatsappMessage(p, fmt, fmtPrice));
}
/**
 * Link de Telegram con mensaje prearmado. Telegram no permite prefijar texto a
 * un chat por teléfono, así que usamos el share (t.me/share) que prellena el
 * mensaje y deja elegir el chat de Modeltex. El enlace va en el parámetro url.
 */
export function telegramLink(p: Product, fmt: ConsultFormat, fmtPrice: (n: number) => string): string {
  const text = buildMessage(p, fmt, fmtPrice, false);
  return `https://t.me/share/url?url=${encodeURIComponent(productUrl(p.slug))}&text=${encodeURIComponent(text)}`;
}
