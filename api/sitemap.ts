// Sitemap dinamico: se genera al vuelo consultando Supabase, con cache de 1 hora.
// Reemplaza al sitemap estatico de build (scripts/generate-sitemap.mjs): antes,
// un producto nuevo no aparecia en el sitemap hasta el proximo deploy; ahora
// aparece solo, como mucho una hora despues de cargarlo.
//
// Incluye ademas las paginas por categoria (/catalogo?categoria=...) y, por
// cada producto, su imagen principal (extension de sitemap de imagenes de
// Google) para que el catalogo aparezca tambien en Google Imagenes.
//
// SIN <priority> NI <changefreq>: Google los ignora desde hace anios y Bing
// tambien. Lo unico que lee un buscador de este archivo son <loc>, <lastmod>
// y las imagenes. Un <lastmod> falso (o uno que nunca cambia) es peor que no
// ponerlo: si miente, el buscador deja de confiar en el y reduce el rastreo.
// Por eso cada fecha de aca sale de un dato real:
//   - productos: products.updated_at, con created_at como respaldo
//   - categorias: la fecha mas reciente de los productos que contienen
//   - Lab: updated_at de cursos, clases y terminos
//   - guias: la fecha `updated` de cada guia (src/lib/guias/<slug>.ts)
//   - paginas fijas: la fecha real de la ultima edicion de su contenido

// Slugs y fechas de las guias de src/lib/guias/ duplicados a proposito (no se
// importan desde src/): las funciones serverless de Vercel de este proyecto
// fallan en produccion (FUNCTION_INVOCATION_FAILED) al importar codigo fuera
// de api/, aunque el build y el typecheck locales no muestren ningun error.
//
// Para que esta copia no se desincronice, scripts/seo-check.mjs compara estas
// fechas contra las de src/lib/guiasData.ts y falla si alguna no coincide.
const GUIAS: Record<string, string> = {
  'como-hacer-moldes-de-ropa-paso-a-paso': '2026-09-07',
  'formatos-de-molderia-digital': '2026-09-06',
  'telas-por-tipo-de-prenda': '2026-09-06',
  'medidas-corporales-para-moldes-de-ropa': '2026-09-07',
  'curva-de-talles-industrial': '2026-09-06',
  'tabla-de-medidas-industriales': '2026-09-08',
  'tabla-de-medidas-s-a-xl-dama-hombre-nino': '2026-09-07',
  'como-hacer-el-molde-base-de-un-pantalon': '2026-09-08',
  'como-hacer-el-molde-base-de-una-falda': '2026-09-08',
  'consumo-de-tela-por-prenda': '2026-09-06',
  'como-calcular-consumo-de-tela-con-el-rinde': '2026-09-07',
  'costeo-de-una-prenda': '2026-09-06',
  'como-escalar-patrones-de-costura': '2026-09-08',
  'reglas-de-escalado-de-sisa-y-escote': '2026-09-08',
  'tizada-computarizada-mrk': '2026-09-06',
  'impresion-de-moldes-en-plotter': '2026-09-06',
  'abrir-moldes-dxf-en-optitex-audaces-gerber-lectra': '2026-09-06',
  'exportar-y-convertir-dxf-entre-optitex-y-audaces': '2026-09-08',
  'que-es-el-patronaje-industrial': '2026-09-07',
  'diferencia-entre-molderia-y-patronaje': '2026-09-08',
  'programas-gratis-de-molderia-digital': '2026-09-07',
  'como-digitalizar-patrones-de-papel': '2026-09-08',
  'ficha-tecnica-de-diseno-para-taller-de-confeccion': '2026-09-08',
  'arrugas-en-el-tiro-del-pantalon-causas-y-correccion': '2026-09-08',
  'conversion-de-pulgadas-a-centimetros-para-molderia': '2026-09-08',
  'diccionario-ingles-espanol-de-molderia-y-costura': '2026-09-08',
  'armar-una-coleccion-con-moldes-digitales': '2026-09-06',
  'como-elegir-el-nombre-de-una-marca-de-moldes-o-ropa': '2026-09-08',
  'copy-para-vender-moldes-digitales-en-instagram': '2026-09-08',
  'uniformes-escolares-y-de-trabajo': '2026-09-06',
  'moldes-para-sublimacion': '2026-09-06',
  'glosario-de-molderia': '2026-09-06',
};

const SITE_URL = 'https://modeltex.com.ar';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

// Mismos valores que CATEGORIES en src/lib/types.ts.
const CATEGORY_VALUES = ['dama', 'hombre', 'nina', 'nino', 'bebes', 'adultos-unisex', 'ninos-unisex'];

// Fecha real de la ultima edicion de contenido de cada pagina fija. Cuando se
// reescriba una de estas paginas, actualizar la fecha aca (es el unico lugar).
const PAGE_UPDATED: Record<string, string> = {
  '/': '2026-09-15',
  '/molderia-digital': '2026-09-15',
  '/moldes-pdf': '2026-09-15',
  '/moldes-pdf-a4': '2026-09-15',
  '/moldes-para-plotter': '2026-09-15',
  '/moldes-para-emprendedores': '2026-09-15',
  '/moldes-gratis': '2026-09-15',
  '/lab': '2026-09-15',
  '/lab/glosario': '2026-09-14',
  '/diseno-a-pedido': '2026-09-13',
  '/preguntas-frecuentes': '2026-09-15',
  '/guias': '2026-09-15',
  '/como-funciona': '2026-09-13',
  '/quienes-somos': '2026-09-14',
  '/ayuda-impresion': '2026-09-15',
  '/politica-descargas': '2026-09-13',
  '/contacto': '2026-09-14',
  '/ia-textil': '2026-09-13',
  '/privacidad': '2026-09-13',
  '/terminos': '2026-09-13',
};

interface RouteEntry {
  path: string;
  lastmod?: string;
  image?: { loc: string; title: string };
}

function escapeXml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toUrlNode(entry: RouteEntry) {
  return [
    '  <url>',
    `    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`,
    entry.lastmod ? `    <lastmod>${escapeXml(new Date(entry.lastmod).toISOString())}</lastmod>` : null,
    entry.image
      ? `    <image:image><image:loc>${escapeXml(entry.image.loc)}</image:loc><image:title>${escapeXml(entry.image.title)}</image:title></image:image>`
      : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

const PAGE = 1000;

// Supabase/PostgREST corta CUALQUIER respuesta a "Max Rows" (1000 por
// defecto) sin avisar, sin importar el limit= pedido. Este helper pagina con
// offset hasta agotar los resultados, en vez de confiar en un limit fijo
// (eso fue justo el bug que dejaba productos fuera del sitemap sin aviso).
async function fetchAllRows<T>(baseUrl: string): Promise<T[]> {
  const out: T[] = [];
  const sep = baseUrl.includes('?') ? '&' : '?';
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${baseUrl}${sep}limit=${PAGE}&offset=${offset}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) break;
    const rows = (await res.json()) as T[];
    if (!Array.isArray(rows)) break;
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

interface ProductRow {
  slug?: string;
  name?: string;
  main_image_url?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
}

/**
 * Trae los productos pidiendo `updated_at`. Esa columna la agrega la
 * migracion 041 (supabase/migrations/...041_products_updated_at.sql): hasta
 * que se ejecute, PostgREST responde 400 porque la columna no existe, asi que
 * se reintenta sin ella y el sitemap sigue funcionando con created_at. Cuando
 * la migracion este aplicada, el lastmod pasa a reflejar de verdad el ultimo
 * cambio de titulo, descripcion, precio, imagen o categoria.
 */
async function fetchProductRows(): Promise<ProductRow[]> {
  const base = `${SUPABASE_URL}/rest/v1/products?is_active=eq.true&order=created_at.desc&select=`;
  const conUpdated = await fetchAllRows<ProductRow>(`${base}slug,name,main_image_url,created_at,updated_at,category`);
  if (conUpdated.length) return conUpdated;
  return fetchAllRows<ProductRow>(`${base}slug,name,main_image_url,created_at,category`);
}

/** Fecha util de un producto: la de modificacion si existe, si no la de alta. */
const productDate = (p: ProductRow) => p.updated_at || p.created_at;

/** La mas reciente de una lista de fechas (ISO), o undefined si no hay ninguna. */
function maxDate(dates: Array<string | undefined>): string | undefined {
  const valid = dates.filter((d): d is string => !!d && !Number.isNaN(Date.parse(d)));
  if (!valid.length) return undefined;
  return valid.reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b));
}

async function fetchLabRoutes(): Promise<RouteEntry[]> {
  const out: RouteEntry[] = [];
  try {
    const courses = await fetchAllRows<{ id: string; slug: string; updated_at?: string }>(
      `${SUPABASE_URL}/rest/v1/lab_courses?select=id,slug,updated_at&status=eq.published`,
    );

    for (const course of courses) {
      const modules = await fetchAllRows<{ id: string; slug: string }>(
        `${SUPABASE_URL}/rest/v1/lab_modules?select=id,slug&course_id=eq.${course.id}&status=eq.published`,
      );
      if (modules.length === 0) {
        out.push({ path: `/lab/${course.slug}`, lastmod: course.updated_at });
        continue;
      }

      const lessons = await fetchAllRows<{ module_id: string; slug: string; updated_at?: string }>(
        `${SUPABASE_URL}/rest/v1/lab_lessons?select=module_id,slug,updated_at&module_id=in.(${modules.map((m) => m.id).join(',')})&status=eq.published`,
      );
      // El curso cambia cuando cambia cualquiera de sus clases.
      out.push({ path: `/lab/${course.slug}`, lastmod: maxDate([course.updated_at, ...lessons.map((l) => l.updated_at)]) });

      const moduleSlugById = new Map(modules.map((m) => [m.id, m.slug]));
      for (const lesson of lessons) {
        const moduleSlug = moduleSlugById.get(lesson.module_id);
        if (!moduleSlug) continue;
        out.push({ path: `/lab/${course.slug}/${moduleSlug}/${lesson.slug}`, lastmod: lesson.updated_at });
      }
    }

    const terms = await fetchAllRows<{ slug: string; updated_at?: string }>(
      `${SUPABASE_URL}/rest/v1/lab_glossary_terms?select=slug,updated_at&status=eq.published`,
    );
    for (const t of terms) out.push({ path: `/lab/glosario/${t.slug}`, lastmod: t.updated_at });
  } catch {
    /* se devuelve lo que se alcanzo a juntar */
  }
  return out;
}

export default async function handler(_req: unknown, res: any) {
  let products: ProductRow[] = [];
  let labRoutes: RouteEntry[] = [];
  try {
    [products, labRoutes] = await Promise.all([fetchProductRows(), fetchLabRoutes()]);
  } catch {
    /* se publica lo que haya */
  }

  const productRoutes: RouteEntry[] = [];
  const fechasPorCategoria = new Map<string, Array<string | undefined>>();
  for (const item of products) {
    if (!item?.slug) continue;
    productRoutes.push({
      path: `/producto/${item.slug}`,
      lastmod: productDate(item),
      image: item.main_image_url ? { loc: item.main_image_url, title: item.name || item.slug } : undefined,
    });
    if (item.category) fechasPorCategoria.set(item.category, [...(fechasPorCategoria.get(item.category) || []), productDate(item)]);
  }

  const todasLasFechas = products.map(productDate);
  const hoy = new Date().toISOString().slice(0, 10);
  const fechaDe = (path: string) => PAGE_UPDATED[path] || hoy;

  const staticRoutes: RouteEntry[] = [
    { path: '/', lastmod: maxDate([fechaDe('/'), ...todasLasFechas]) },
    { path: '/catalogo', lastmod: maxDate([fechaDe('/catalogo'), ...todasLasFechas]) },
    ...CATEGORY_VALUES.map((c) => ({
      path: `/catalogo?categoria=${c}`,
      lastmod: maxDate(fechasPorCategoria.get(c) || []) || fechaDe('/catalogo'),
    })),
    { path: '/molderia-digital', lastmod: fechaDe('/molderia-digital') },
    { path: '/moldes-pdf', lastmod: fechaDe('/moldes-pdf') },
    { path: '/moldes-pdf-a4', lastmod: fechaDe('/moldes-pdf-a4') },
    { path: '/moldes-para-plotter', lastmod: fechaDe('/moldes-para-plotter') },
    { path: '/moldes-para-emprendedores', lastmod: fechaDe('/moldes-para-emprendedores') },
    { path: '/moldes-gratis', lastmod: fechaDe('/moldes-gratis') },
    // /lab/ia queda fuera a proposito: es un chat interactivo con noindex real
    // (ver middleware.ts y src/pages/LabAiPage.tsx) — no tiene sentido pedirle
    // a Google que indexe una URL que le va a devolver "noindex".
    { path: '/lab', lastmod: maxDate([fechaDe('/lab'), ...labRoutes.map((r) => r.lastmod)]) },
    { path: '/lab/glosario', lastmod: fechaDe('/lab/glosario') },
    { path: '/diseno-a-pedido', lastmod: fechaDe('/diseno-a-pedido') },
    { path: '/preguntas-frecuentes', lastmod: fechaDe('/preguntas-frecuentes') },
    { path: '/guias', lastmod: maxDate(Object.values(GUIAS)) || fechaDe('/guias') },
    ...Object.entries(GUIAS).map(([slug, updated]) => ({ path: `/guias/${slug}`, lastmod: updated })),
    { path: '/como-funciona', lastmod: fechaDe('/como-funciona') },
    { path: '/quienes-somos', lastmod: fechaDe('/quienes-somos') },
    { path: '/ayuda-impresion', lastmod: fechaDe('/ayuda-impresion') },
    { path: '/politica-descargas', lastmod: fechaDe('/politica-descargas') },
    { path: '/contacto', lastmod: fechaDe('/contacto') },
    { path: '/ia-textil', lastmod: fechaDe('/ia-textil') },
    { path: '/privacidad', lastmod: fechaDe('/privacidad') },
    { path: '/terminos', lastmod: fechaDe('/terminos') },
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...staticRoutes.map(toUrlNode),
    ...productRoutes.map(toUrlNode),
    ...labRoutes.map(toUrlNode),
    '</urlset>',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
