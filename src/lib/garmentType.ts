// Normalización no-destructiva de "garment_type". La columna en Supabase es
// texto libre (frases descriptivas tipo "remera básica de cuello redondo" o
// códigos viejos tipo "CHALECO DAMA"): 2044 productos activos, ~1900 valores
// distintos. Nunca se reescribe la columna original; esto solo deriva una
// familia de prenda controlada para usar en filtros, agrupaciones y las
// futuras rutas /moldes/:categoria/:prenda/:formato (Programmatic SEO, aún
// sin publicar — ver src/lib/programmaticSeo.ts).
//
// Cobertura verificada contra el catálogo real: ~99% de los productos activos
// matchean alguna keyword. Lo que no matchea devuelve null y ese producto
// simplemente no participa de agrupaciones por prenda (no rompe nada más).

export interface GarmentTypeDef {
  slug: string;
  label: string;
  /** Keywords en minúscula/sin tildes, buscadas como substring. La primera que matchea gana. */
  keywords: string[];
}

// Orden importante: términos más específicos primero para evitar que una
// keyword genérica capture un caso que debería ir a una más específica
// (ej. "calza short" debe quedar en "calza", no en "short").
export const GARMENT_TYPES: GarmentTypeDef[] = [
  { slug: 'vestido', label: 'Vestido', keywords: ['vestido'] },
  { slug: 'calza', label: 'Calza', keywords: ['calza', 'legging', 'leggins'] },
  { slug: 'jogger', label: 'Jogger / Jogging', keywords: ['jogger', 'jogging'] },
  { slug: 'pantalon', label: 'Pantalón', keywords: ['pantalon', 'jean'] },
  { slug: 'short', label: 'Short', keywords: ['short'] },
  { slug: 'bermuda', label: 'Bermuda', keywords: ['bermuda'] },
  { slug: 'campera', label: 'Campera', keywords: ['campera', 'chaqueta'] },
  { slug: 'buzo', label: 'Buzo', keywords: ['buzo', 'poleron', 'sweater', 'sueter'] },
  { slug: 'blusa', label: 'Blusa', keywords: ['blusa'] },
  { slug: 'camisa', label: 'Camisa', keywords: ['camisa', 'camiseta'] },
  { slug: 'remera', label: 'Remera', keywords: ['remera', 'remeron'] },
  { slug: 'musculosa', label: 'Musculosa', keywords: ['musculosa'] },
  { slug: 'top', label: 'Top', keywords: ['top'] },
  { slug: 'falda', label: 'Falda / Pollera', keywords: ['falda', 'pollera'] },
  { slug: 'chaleco', label: 'Chaleco', keywords: ['chaleco'] },
  { slug: 'blazer', label: 'Blazer / Saco', keywords: ['blazer', 'saco'] },
  { slug: 'abrigo', label: 'Abrigo / Tapado', keywords: ['abrigo', 'tapado', 'capa'] },
  { slug: 'body', label: 'Body / Enterito', keywords: ['body', 'enterito', 'jumpsuit', 'jumper', 'mono'] },
  { slug: 'conjunto', label: 'Conjunto', keywords: ['conjunto', 'ambo'] },
  { slug: 'bikini', label: 'Bikini / Malla', keywords: ['bikini', 'malla', 'traje de bano'] },
  { slug: 'ropa-interior', label: 'Ropa interior', keywords: ['boxer', 'slip', 'bombacha', 'vedetina', 'corset', 'corpino'] },
  { slug: 'polo', label: 'Polo / Chomba', keywords: ['polo', 'chomba', 'cardigan'] },
  { slug: 'pijama', label: 'Pijama / Bata', keywords: ['pijama', 'bata'] },
  { slug: 'uniforme', label: 'Uniforme / Delantal', keywords: ['delantal', 'guardapolvo', 'pechera', 'uniforme'] },
  { slug: 'accesorio', label: 'Accesorio', keywords: ['bolso', 'disfraz', 'balaclava'] },
];

const KNOWN_SLUGS = new Set(GARMENT_TYPES.map((g) => g.slug));

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Deriva la familia de prenda canónica a partir del garment_type libre y,
 * como respaldo, del nombre del producto (que suele traer el mismo dato en
 * mayúsculas, ej. "VESTIDO 243"). Devuelve null si ningún keyword matchea:
 * el producto sigue funcionando en todos lados, solo no entra en
 * agrupaciones/rutas por prenda.
 */
export function normalizeGarmentType(input: { garment_type?: string | null; name?: string | null }): string | null {
  const haystack = stripAccents(`${input.garment_type || ''} ${input.name || ''}`.toLowerCase());
  if (!haystack.trim()) return null;
  for (const def of GARMENT_TYPES) {
    if (def.keywords.some((kw) => haystack.includes(kw))) return def.slug;
  }
  return null;
}

export function garmentTypeLabel(slug: string | null): string | null {
  if (!slug) return null;
  return GARMENT_TYPES.find((g) => g.slug === slug)?.label ?? null;
}

export function isKnownGarmentTypeSlug(slug: string): boolean {
  return KNOWN_SLUGS.has(slug);
}
