// Formatos de los archivos de moldes gratis, slugs de sus páginas y armado de
// las secciones de descarga. Módulo puro (sin imports): lo usan la app,
// middleware.ts, api/sitemap.ts y api/utils.ts.
//
// Los archivos viven en free_molds.files (JSON). Los cargados antes de que
// existieran format/size/width no los tienen: se deducen del nombre del
// archivo ("VST414 TALLE L A4-.pdf" -> PDF A4, talle L).

export type FreeFileFormat = 'pdf-a4' | 'pdf-plotter' | 'editable' | 'dxf' | 'pds' | 'mrk' | 'ads' | 'plt' | 'otro';

export interface FreeFileFormatInfo {
  id: FreeFileFormat;
  label: string;
  short: string;
  description: string;
  /** Carpeta dentro del ZIP. */
  folder: string;
}

// El orden de este array es el orden de las secciones en la página.
export const FREE_FILE_FORMATS: FreeFileFormatInfo[] = [
  {
    id: 'pdf-a4', label: 'PDF para imprimir en A4', short: 'PDF A4', folder: 'PDF A4',
    description: 'Un archivo por talle. Se imprime en hojas A4 al 100% (tamaño real) y se pegan siguiendo la numeración.',
  },
  {
    id: 'pdf-plotter', label: 'PDF para imprimir en plotter', short: 'PDF plotter', folder: 'PDF plotter',
    description: 'Elegí el archivo según el ancho de papel de tu plotter: 60, 90, 100, 120 o 150 cm.',
  },
  {
    id: 'editable', label: 'Editable PDF + CDR (sublimación / Corel)', short: 'CDR editable', folder: 'Editable PDF y CDR',
    description: 'Archivos editables, ideales para sublimación o para modificar piezas en CorelDRAW.',
  },
  {
    id: 'dxf', label: 'DXF / AAMA (sistemas CAD)', short: 'DXF', folder: 'DXF',
    description: 'Estándar industrial compatible con Gerber, Lectra, Optitex y Audaces.',
  },
  { id: 'pds', label: 'PDS (Optitex)', short: 'PDS', folder: 'PDS', description: 'Archivo nativo de Optitex.' },
  { id: 'mrk', label: 'MRK (tizada Optitex)', short: 'MRK', folder: 'MRK', description: 'Tizada computarizada lista para el corte.' },
  { id: 'ads', label: 'ADS (Audaces)', short: 'ADS', folder: 'ADS', description: 'Archivo nativo de Audaces.' },
  { id: 'plt', label: 'PLT (plotter de corte)', short: 'PLT', folder: 'PLT', description: 'Formato vectorial para plotter de corte.' },
  { id: 'otro', label: 'Otros archivos', short: 'Otros', folder: 'Otros', description: 'Guías y archivos complementarios.' },
];

export const PLOTTER_WIDTHS = [60, 90, 100, 120, 150];

export function formatInfo(id: FreeFileFormat): FreeFileFormatInfo {
  return FREE_FILE_FORMATS.find((f) => f.id === id) || FREE_FILE_FORMATS[FREE_FILE_FORMATS.length - 1];
}

/** Mismo shape que FreeMoldFile de types.ts (repetido acá para no importar nada). */
export interface FreeFileLike {
  label?: string;
  name: string;
  url: string;
  free?: boolean;
  format?: FreeFileFormat;
  size?: string;
  width?: number | null;
  bytes?: number;
}

export interface NormalizedFreeFile extends FreeFileLike {
  format: FreeFileFormat;
  size: string;
  width: number | null;
  ext: string;
  /** Texto del botón; groupFiles lo desambigua si dos archivos quedarían iguales. */
  display: string;
}

export function fileExt(name: string) {
  return (name.split('.').pop() || '').toLowerCase();
}

export function inferFormat(name: string): FreeFileFormat {
  const ext = fileExt(name);
  if (ext === 'cdr') return 'editable';
  if (ext === 'dxf' || ext === 'rul') return 'dxf';
  if (ext === 'pds') return 'pds';
  if (ext === 'mrk') return 'mrk';
  if (ext === 'ads') return 'ads';
  if (ext === 'plt' || ext === 'hpgl') return 'plt';
  if (ext === 'pdf') {
    if (/plot|ploter|plotter/i.test(name) || inferWidth(name)) return 'pdf-plotter';
    if (/sublim|editable|corel/i.test(name)) return 'editable';
    return 'pdf-a4';
  }
  return 'otro';
}

const SIZE_RE = /talle[\s_.-]*([0-9]{1,2}|[0-9]x[sl]|x{1,4}[sl]|xs|s|m|l|xl|u|unico|único)(?![a-z0-9])/gi;

export function inferSize(name: string): string {
  const base = name.replace(/\.[a-z0-9]+$/i, '');
  let last = '';
  for (const m of base.matchAll(SIZE_RE)) last = m[1];
  if (!last) return '';
  const s = last.toUpperCase();
  if (s === 'UNICO' || s === 'ÚNICO' || s === 'U') return 'Único';
  if (/^X{2,4}[SL]$/.test(s)) return `${s.length - 1}X${s.slice(-1)}`;
  return s;
}

export function inferWidth(name: string): number | null {
  const m =
    name.match(/(?:^|[^0-9])(60|90|100|120|150)\s*cm(?![a-z])/i) ||
    name.match(/ancho[\s_.-]*(60|90|100|120|150)(?![0-9])/i);
  return m ? Number(m[1]) : null;
}

export function normalizeFile(f: FreeFileLike): NormalizedFreeFile {
  const format = f.format || inferFormat(f.name || f.label || '');
  const width = format === 'pdf-plotter' ? f.width ?? inferWidth(f.name || '') : null;
  const n = { ...f, format, size: f.size ?? inferSize(f.name || f.label || ''), width, ext: fileExt(f.name || ''), display: '' };
  n.display = fileLabel(n);
  return n;
}

const ALPHA_SIZES = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL'];

/** Orden natural de talles: 2 < 4 < 16, XS < S < M < ... < 4XL. */
export function compareSizes(a: string, b: string) {
  const na = Number(a), nb = Number(b);
  if (a && b && !Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  const ia = ALPHA_SIZES.indexOf(a.toUpperCase()), ib = ALPHA_SIZES.indexOf(b.toUpperCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b, 'es');
}

/** Texto del botón de descarga de cada archivo. */
export function fileLabel(f: NormalizedFreeFile): string {
  const talle = f.size ? (f.size === 'Único' ? 'Talle único' : `Talle ${f.size}`) : '';
  switch (f.format) {
    case 'pdf-a4':
      return talle || f.name;
    case 'pdf-plotter':
      return f.width ? `Ancho ${f.width} cm${talle ? ` · ${talle}` : ''}` : talle || f.name;
    case 'editable':
      return `${f.ext.toUpperCase() || 'Archivo'} editable${talle ? ` · ${talle}` : ''}`;
    case 'otro':
      return f.label && !/^(PDF|DXF|CDR|ZIP|Archivo|Plotter \(PLT\))$/.test(f.label) ? f.label : f.name;
    default:
      return `${formatInfo(f.format).short}${talle ? ` · ${talle}` : ''}`;
  }
}

export interface FreeFileSection {
  format: FreeFileFormatInfo;
  files: NormalizedFreeFile[];
}

/**
 * Archivos agrupados por formato, en el orden de FREE_FILE_FORMATS y ordenados
 * adentro. Si dos archivos de la misma sección quedarían con el mismo botón
 * (ej. molde y guía del mismo talle), se les agrega "Molde"/"Guía" o, si
 * igual se repiten, el nombre del archivo.
 */
export function groupFiles(files: FreeFileLike[]): FreeFileSection[] {
  const norm = (files || []).filter((f) => f && f.url).map(normalizeFile);
  return FREE_FILE_FORMATS.map((format) => {
    const list = norm
      .filter((f) => f.format === format.id)
      .sort((a, b) => (a.width ?? 0) - (b.width ?? 0) || compareSizes(a.size, b.size) || a.name.localeCompare(b.name, 'es'));
    const repeated = () => {
      const seen = new Map<string, number>();
      for (const f of list) seen.set(f.display, (seen.get(f.display) || 0) + 1);
      return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
    };
    let dup = repeated();
    for (const f of list) {
      if (dup.has(f.display)) f.display = `${f.display} · ${/gu[ií]a/i.test(f.name) ? 'Guía' : 'Molde'}`;
    }
    dup = repeated();
    for (const f of list) {
      if (dup.has(f.display)) f.display = f.name;
    }
    return { format, files: list };
  }).filter((s) => s.files.length > 0);
}

// ---------------------------------------------------------------- slugs / nombres

export function slugify(s: string) {
  return (
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'molde'
  );
}

/**
 * Slug de la página de cada molde, a partir del título. Se calcula sobre los
 * moldes ACTIVOS ordenados por fecha de alta: si dos tienen el mismo nombre,
 * el más nuevo lleva "-2". Así el slug no necesita columna en la base.
 */
export function assignFreeMoldSlugs<T extends { id: string; title: string; created_at?: string }>(molds: T[]): Map<string, string> {
  const sorted = [...molds].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '') || a.id.localeCompare(b.id));
  const used = new Map<string, number>();
  const out = new Map<string, string>();
  for (const m of sorted) {
    const base = slugify(m.title);
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    out.set(m.id, n === 1 ? base : `${base}-${n}`);
  }
  return out;
}

export function freeMoldPath(slug: string) {
  return `/moldes-gratis/${slug}`;
}

/** "SHORT ESCOLAR UNISEX" -> "Short escolar unisex", "short 125-L" -> "Short 125-L". */
export function freeMoldName(title: string) {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (/\d/.test(w) ? w.toUpperCase() : w))
    .join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
