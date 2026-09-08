// Preparación de datos para futuras páginas programáticas de catálogo
// (ej. /moldes/dama/pantalon/pdf-a4). Este módulo NO registra rutas ni
// genera páginas: solo define la convención de slugs/URL y calcula, a partir
// del catálogo real, qué combinaciones tienen suficientes productos como
// para justificar una landing propia (protección anti thin-content).
//
// Cuando se decida publicar, el router puede consumir buildProgrammaticPath /
// parseProgrammaticPath / getEligibleCombinations sin tener que rediseñar
// esta capa.

import type { Product, ProductCategory } from './types';
import { CATEGORIES } from './types';
import { normalizeGarmentType, GARMENT_TYPES, isKnownGarmentTypeSlug } from './garmentType';
import { pdfAvailable, cartonAvailable } from './productFormats';

export type ProgrammaticFormatSlug = 'pdf-a4' | 'pdf-ploter' | 'carton';

export const PROGRAMMATIC_FORMATS: { slug: ProgrammaticFormatSlug; label: string }[] = [
  { slug: 'pdf-a4', label: 'PDF A4' },
  { slug: 'pdf-ploter', label: 'PDF Plóter' },
  { slug: 'carton', label: 'Cartón' },
];

const KNOWN_FORMAT_SLUGS = new Set(PROGRAMMATIC_FORMATS.map((f) => f.slug));
const KNOWN_CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.value));

/** Debajo de este umbral, la combinación se considera thin content: no amerita landing propia. */
export const MIN_PRODUCTS_FOR_PROGRAMMATIC_PAGE = 8;

export interface ProgrammaticRouteParams {
  category: ProductCategory;
  garmentSlug: string;
  formatSlug: ProgrammaticFormatSlug;
}

export function buildProgrammaticPath({ category, garmentSlug, formatSlug }: ProgrammaticRouteParams): string {
  return `/moldes/${category}/${garmentSlug}/${formatSlug}`;
}

/** Valida y parsea una URL candidata. Devuelve null si algún segmento no es un valor controlado (evita rutas inventadas/duplicadas). */
export function parseProgrammaticPath(path: string): ProgrammaticRouteParams | null {
  const match = path.match(/^\/moldes\/([^/]+)\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;
  const [, category, garmentSlug, formatSlug] = match;
  if (!KNOWN_CATEGORY_SLUGS.has(category as ProductCategory)) return null;
  if (!isKnownGarmentTypeSlug(garmentSlug)) return null;
  if (!KNOWN_FORMAT_SLUGS.has(formatSlug as ProgrammaticFormatSlug)) return null;
  return { category: category as ProductCategory, garmentSlug, formatSlug: formatSlug as ProgrammaticFormatSlug };
}

function productHasFormat(p: Product, formatSlug: ProgrammaticFormatSlug): boolean {
  if (formatSlug === 'pdf-a4' || formatSlug === 'pdf-ploter') return pdfAvailable(p);
  return cartonAvailable(p);
}

export interface ProgrammaticCombination extends ProgrammaticRouteParams {
  path: string;
  productCount: number;
  indexable: boolean;
}

/**
 * Calcula, a partir del catálogo activo real, qué combinaciones
 * categoría × prenda × formato tienen productCount suficiente. No escribe
 * nada ni genera páginas: es la fuente de verdad para cuando se decida
 * habilitar rutas/sitemap de a poco.
 */
export function getEligibleCombinations(products: Product[]): ProgrammaticCombination[] {
  const counts = new Map<string, number>();

  for (const p of products) {
    const garmentSlug = normalizeGarmentType(p);
    if (!garmentSlug) continue;
    for (const { slug: formatSlug } of PROGRAMMATIC_FORMATS) {
      if (!productHasFormat(p, formatSlug)) continue;
      const key = `${p.category}::${garmentSlug}::${formatSlug}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  const combinations: ProgrammaticCombination[] = [];
  for (const [key, productCount] of counts) {
    const [category, garmentSlug, formatSlug] = key.split('::') as [ProductCategory, string, ProgrammaticFormatSlug];
    combinations.push({
      category,
      garmentSlug,
      formatSlug,
      path: buildProgrammaticPath({ category, garmentSlug, formatSlug }),
      productCount,
      indexable: productCount >= MIN_PRODUCTS_FOR_PROGRAMMATIC_PAGE,
    });
  }

  return combinations.sort((a, b) => b.productCount - a.productCount);
}

export { GARMENT_TYPES };
