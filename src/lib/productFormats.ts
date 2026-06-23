import { WHATSAPP_NUMBER } from './whatsapp';
import type { Product } from './types';

// ===== Configuración central de formatos comerciales y consultas =====
export const SITE_URL = 'https://modeltexstudio.com';

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

/** Link de WhatsApp con mensaje prearmado según el formato. */
export function whatsappLink(p: Product, fmt: ConsultFormat, fmtPrice: (n: number) => string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(p, fmt, fmtPrice, true))}`;
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
