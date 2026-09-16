// Textos de producto derivados de los datos, compartidos entre la app
// (ProductDetailPage) y middleware.ts (lo que leen Google y los asistentes de
// IA). Todo sale de campos reales del producto: nada se inventa. Sin
// dependencias de React ni del DOM, porque middleware.ts corre en el edge.

import { CATEGORIES } from './types.js';
import { CATEGORY_TITLE_SUFFIX } from './categorySeo.js';

export interface ProductContentInput {
  name: string;
  category?: string | null;
  garment_type?: string | null;
  sizes?: string[] | null;
  formats?: string[] | null;
  recommended_fabrics?: string[] | null;
  short_description?: string | null;
  long_description?: string | null;
  codigo?: string | null;
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

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Palabras que no pueden quedar al final de un titulo recortado: sin esto
// salian cosas como "Buzo canguro con capucha y — molde PDF...".
const COLGADAS = /\s+(y|e|o|u|de|del|con|sin|al|a|en|para|por|la|el|los|las|un|una|unos|unas|que|su|sus|tipo)$/i;

/** Recorta en el ultimo espacio para no cortar una palabra (ni dejarla colgada). */
function recortar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const esp = corte.lastIndexOf(' ');
  let out = (esp > max * 0.55 ? corte.slice(0, esp) : corte).replace(/[,;:\s]+$/, '');
  while (COLGADAS.test(out)) out = out.replace(COLGADAS, '');
  return out;
}

/**
 * Referencia de modelo que distingue dos fichas con la misma frase de prenda:
 * el codigo interno si existe, o los tokens con numero del nombre ("TOP DAMA
 * 79" -> "79") que no esten ya en la frase. Es lo que evita que el titulo se
 * repita entre fichas cuando la frase descriptiva coincide.
 */
function modelRef(p: ProductContentInput, phrase: string): string {
  const codigo = (p.codigo || '').trim();
  if (codigo && codigo.length <= 14) return codigo;
  const f = phrase.toLowerCase();
  return (p.name || '')
    .split(/\s+/)
    .filter((w) => /\d/.test(w) && w.length <= 12 && !f.includes(w.toLowerCase()))
    .slice(0, 2)
    .join(' ');
}

/** True si el molde se vende en PDF (A4, plotter o el precio general). */
function tienePdf(p: ProductContentInput): boolean {
  return !!(num(p.precio_pdf_a4) || num(p.precio_pdf_ploter) || num(p.price));
}

/**
 * <title> de la ficha: "Top deportivo con espalda de tiras — molde PDF para
 * dama (79)".
 *
 * Antes era "TOP DAMA 79 — top deportivo con espalda de tiras, molde digital
 * para dama": el promedio daba 85 caracteres y 1.552 de las 2.044 fichas
 * pasaban los 80, asi que Google cortaba el titulo justo ANTES de "molde
 * digital para dama", que es la parte que la gente busca. Encima arrancaba con
 * el nombre interno ("TOP DAMA", repetido en 43 fichas, y en algunos casos un
 * identificador de importacion ilegible), no con lo que distingue al molde.
 *
 * Ahora arranca por la frase real de la prenda (lo distintivo y lo buscado),
 * sigue con la palabra clave comercial y termina con la referencia de modelo
 * entre parentesis, que es lo unico descartable si se corta. El promedio baja
 * a 74 y la cantidad de titulos unicos queda igual (2.038 de 2.044: los 6 que
 * se repiten son fichas duplicadas de verdad en el catalogo, listadas en
 * seo-audit-products-report.md).
 *
 * El H1 visible (productH1) sigue mostrando el nombre interno primero: ahi el
 * largo no molesta y a Denis le sirve para reconocer la ficha.
 */
export function productTitle(p: ProductContentInput): string {
  const phrase = garmentPhrase(p);
  const sufijo = categorySuffix(p.category);
  const cola = `— ${tienePdf(p) ? 'molde PDF' : 'molde digital'}${sufijo ? ` ${sufijo}` : ''}`;
  const ref = phrase ? modelRef(p, phrase) : '';
  const cierre = ref ? ` (${ref})` : '';
  const base = phrase ? capitalizar(phrase) : (p.name || '').trim();
  // Techo de 95 caracteres para el titulo completo (el " | Modeltex" que
  // agrega cada pagina suma 11 mas), y se recorta la frase, nunca la cola: la
  // cola es donde esta la palabra clave.
  //
  // El techo es holgado a proposito. Una primera version apretaba a 75 y
  // bajaba el promedio a 69, pero al cortar la frase dos moldes distintos
  // ("campera aviador con cuello de piel" y "...de pelo") terminaban con el
  // MISMO titulo: cambiaba un problema real por otro peor. Google igual
  // muestra unos 60 caracteres; lo que importaba era el orden, no el largo.
  const disponible = 95 - 11 - cola.length - cierre.length - 1;
  return `${recortar(base, Math.max(40, disponible))} ${cola}${cierre}`;
}

/**
 * H1 real de la ficha ("SHORT 09 — short deportivo con bolsillos"), igual al
 * que arma middleware.ts para bots. Antes ProductDetailPage.tsx mostraba solo
 * p.name a secas: como muchos moldes comparten nombre ("TOP DAMA" x43), el H1
 * que veía cualquier usuario o el renderizador de Google quedaba duplicado
 * entre decenas de fichas, aunque el <title> sí las distinguía.
 */
export function productH1(p: ProductContentInput): string {
  const phrase = garmentPhrase(p);
  return `${p.name}${phrase ? ` — ${phrase}` : ''}${p.codigo ? ` (cód. ${p.codigo})` : ''}`;
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
