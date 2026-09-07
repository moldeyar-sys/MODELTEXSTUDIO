// Textos de producto derivados de los datos, compartidos entre la app
// (ProductDetailPage) y middleware.ts (lo que leen Google y los asistentes de
// IA). Todo sale de campos reales del producto: nada se inventa. Sin
// dependencias de React ni del DOM, porque middleware.ts corre en el edge.

import { CATEGORIES } from './types';
import { CATEGORY_TITLE_SUFFIX } from './categorySeo';

export interface ProductContentInput {
  name: string;
  category?: string | null;
  garment_type?: string | null;
  sizes?: string[] | null;
  formats?: string[] | null;
  recommended_fabrics?: string[] | null;
  short_description?: string | null;
  long_description?: string | null;
  entrega_inmediata?: boolean | null;
  price?: number | null;
  precio_carton?: number | null;
  precio_pdf_a4?: number | null;
  precio_pdf_ploter?: number | null;
  precio_dxf?: number | null;
  precio_pds?: number | null;
  precio_mrk?: number | null;
  precio_ads?: number | null;
}

export interface ProductFaqItem {
  q: string;
  a: string;
}

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function fmtArs(n: number): string {
  return `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ARS`;
}

export function categoryLabel(category?: string | null): string {
  return CATEGORIES.find((c) => c.value === category)?.label || '';
}

export function categorySuffix(category?: string | null): string {
  return CATEGORY_TITLE_SUFFIX[category || ''] || '';
}

/**
 * Frase descriptiva de la prenda ("short deportivo con bolsillos laterales")
 * guardada en garment_type. Los productos viejos tienen ahí un código en
 * mayúsculas ("SHORT 019", "BUZO DAMA") que no aporta nada al título: se
 * ignora hasta que se cargue una descripción real.
 */
export function garmentPhrase(p: ProductContentInput): string | null {
  const g = (p.garment_type || '').trim().replace(/\s+/g, ' ');
  if (g.length < 4 || g.length > 90) return null;
  if (/\d/.test(g)) return null;
  if (!/[a-záéíóúñü]/.test(g)) return null; // todo mayúsculas = código viejo
  if (g.toLowerCase() === p.name.trim().toLowerCase()) return null;
  return g;
}

/** "SHORT 09 — short deportivo con bolsillos, molde digital para hombre" */
export function productTitle(p: ProductContentInput): string {
  const phrase = garmentPhrase(p);
  const sufijo = categorySuffix(p.category);
  return `${p.name} — ${phrase ? `${phrase}, ` : ''}molde digital${sufijo ? ` ${sufijo}` : ''}`;
}

export function productImageAlt(p: ProductContentInput): string {
  const phrase = garmentPhrase(p);
  const sufijo = categorySuffix(p.category);
  return `${p.name}: ${phrase || 'molde de ropa digital'}${sufijo ? ` ${sufijo}` : ''} — Modeltex`;
}

/** Párrafos de la descripción larga (separados por línea en blanco). */
export function descriptionParagraphs(p: ProductContentInput): string[] {
  return (p.long_description || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function sizesRange(sizes: string[]): string {
  return sizes.length > 1 ? `${sizes[0]} a ${sizes[sizes.length - 1]}` : sizes[0] || '';
}

interface FormatoVenta {
  nombre: string;
  ars: number | null;
}

function formatosVenta(p: ProductContentInput): FormatoVenta[] {
  return [
    { nombre: 'PDF A4 para imprimir en casa', ars: num(p.precio_pdf_a4) ?? num(p.price) },
    { nombre: 'PDF plotter en ancho real (90, 120 o 150 cm)', ars: num(p.precio_pdf_ploter) },
    { nombre: 'moldes en cartón', ars: num(p.precio_carton) },
    { nombre: 'DXF/AAMA para cualquier sistema CAD', ars: num(p.precio_dxf) },
    { nombre: 'PDS de Optitex', ars: num(p.precio_pds) },
    { nombre: 'MRK (tizada computarizada)', ars: num(p.precio_mrk) },
    { nombre: 'ADS de Audaces', ars: num(p.precio_ads) },
  ].filter((f) => f.ars !== null);
}

/**
 * Preguntas y respuestas armadas solo con datos del producto (talles,
 * formatos, precios, telas, entrega). Sirven para el bloque de FAQ visible y
 * para el schema FAQPage de la ficha.
 */
export function buildProductFaq(p: ProductContentInput): ProductFaqItem[] {
  const out: ProductFaqItem[] = [];
  const sizes = (p.sizes || []).map((s) => String(s).trim()).filter(Boolean);
  const fabrics = (p.recommended_fabrics || []).map((s) => String(s).trim()).filter(Boolean);
  const formatos = formatosVenta(p);
  const cad = [p.precio_dxf, p.precio_pds, p.precio_mrk, p.precio_ads].some((v) => num(v) !== null);

  if (sizes.length) {
    out.push({
      q: `¿Qué talles tiene el molde ${p.name}?`,
      a:
        `El molde ${p.name} está disponible en ${sizes.length} talles (${sizesRange(sizes)}): ${sizes.join(', ')}, con la progresión industrial ya hecha. ` +
        'En la ficha se eligen los talles que se llevan (el precio base cubre la selección estándar y cada talle extra suma un adicional), así que se puede comprar la curva completa de una vez. ' +
        'Los formatos CAD incluyen siempre la curva completa.',
    });
  }

  if (formatos.length) {
    const lista = formatos.map((f) => `${f.nombre} (desde ${fmtArs(f.ars as number)})`).join(', ');
    out.push({
      q: `¿En qué formatos se vende ${p.name} y cuánto cuesta?`,
      a:
        `${p.name} se vende en ${lista}. Los precios son con la selección estándar de talles; los talles extra tienen un adicional por talle.` +
        (cad ? '' : ' También se puede pedir en DXF/AAMA, PDS (Optitex), MRK (tizada) o ADS (Audaces) para cortar directo en CAD.') +
        ' Los precios en dólares para el exterior se muestran en la ficha.',
    });
  }

  if (fabrics.length) {
    out.push({
      q: `¿Qué tela conviene para ${p.name}?`,
      a:
        `Para ${p.name} se recomienda ${fabrics.join(', ')}. ` +
        'Antes de cortar la producción conviene hacer una muestra con la tela elegida: el rinde, la caída y la holgura cambian según el gramaje y la elasticidad.',
    });
  }

  out.push({
    q: `¿Cómo se entrega ${p.name} después de comprar?`,
    a: p.entrega_inmediata
      ? 'Por descarga digital inmediata: apenas se confirma el pago, los archivos quedan disponibles en la cuenta de Modeltex, o en el link enviado por email si se compró sin cuenta.'
      : 'Por descarga digital: los archivos se habilitan dentro de las 24 horas de confirmado el pago, en la cuenta de Modeltex o en el link enviado por email si se compró sin cuenta.',
  });

  out.push({
    q: `¿Se puede usar ${p.name} para fabricar y vender ropa?`,
    a:
      'Sí. Los moldes de Modeltex se venden con licencia de uso productivo: se pueden confeccionar y vender las prendas sin límite de unidades. ' +
      'Lo que no está permitido es revender, publicar o redistribuir los archivos del molde.',
  });

  out.push({
    q: `¿Cómo se imprime ${p.name} en PDF sin perder la escala?`,
    a:
      'En PDF A4 se imprime en casa al 100% (tamaño real), se verifica el cuadrado de control con una regla y se pegan las hojas siguiendo la numeración. ' +
      'En PDF plotter se imprime en ancho real (90, 120 o 150 cm) en cualquier servicio de ploteo, siempre al 100% y nunca con "ajustar a la página".',
  });

  return out;
}

/** Guías para producción que se enlazan desde cada ficha de producto. */
export const PRODUCT_GUIDE_LINKS: Array<{ label: string; to: string }> = [
  { label: 'Qué formato de molde conviene para tu taller', to: '/guias/formatos-de-molderia-digital' },
  { label: 'Qué tela usar para cada tipo de prenda', to: '/guias/telas-por-tipo-de-prenda' },
  { label: 'Curva de talles para producción', to: '/guias/curva-de-talles-industrial' },
  { label: 'Cómo calcular el consumo de tela por prenda', to: '/guias/consumo-de-tela-por-prenda' },
  { label: 'Cómo imprimir moldes en plotter', to: '/guias/impresion-de-moldes-en-plotter' },
];
