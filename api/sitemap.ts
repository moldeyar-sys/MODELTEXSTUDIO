// Sitemap dinamico: se genera al vuelo consultando Supabase, con cache de 1 hora.
// Reemplaza al sitemap estatico de build (scripts/generate-sitemap.mjs): antes,
// un producto nuevo no aparecia en el sitemap hasta el proximo deploy; ahora
// aparece solo, como mucho una hora despues de cargarlo.
//
// Incluye ademas las paginas por categoria (/catalogo?categoria=...) y, por
// cada producto, su imagen principal (extension de sitemap de imagenes de
// Google) para que el catalogo aparezca tambien en Google Imagenes.

const SITE_URL = 'https://modeltex.com.ar';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

// Mismos valores que CATEGORIES en src/lib/types.ts.
const CATEGORY_VALUES = ['dama', 'hombre', 'nina', 'nino', 'bebes', 'adultos-unisex', 'ninos-unisex'];

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/catalogo', changefreq: 'daily', priority: '0.95' },
  ...CATEGORY_VALUES.map((c) => ({ path: `/catalogo?categoria=${c}`, changefreq: 'daily', priority: '0.90' })),
  { path: '/moldes-pdf', changefreq: 'weekly', priority: '0.90' },
  { path: '/moldes-pdf-a4', changefreq: 'weekly', priority: '0.88' },
  { path: '/moldes-para-plotter', changefreq: 'weekly', priority: '0.88' },
  { path: '/moldes-para-emprendedores', changefreq: 'weekly', priority: '0.84' },
  { path: '/moldes-gratis', changefreq: 'weekly', priority: '0.85' },
  { path: '/diseno-a-pedido', changefreq: 'monthly', priority: '0.80' },
  { path: '/preguntas-frecuentes', changefreq: 'monthly', priority: '0.78' },
  { path: '/como-funciona', changefreq: 'monthly', priority: '0.75' },
  { path: '/ayuda-impresion', changefreq: 'monthly', priority: '0.75' },
  { path: '/politica-descargas', changefreq: 'monthly', priority: '0.65' },
  { path: '/contacto', changefreq: 'monthly', priority: '0.60' },
  { path: '/ia-textil', changefreq: 'monthly', priority: '0.55' },
  { path: '/privacidad', changefreq: 'yearly', priority: '0.45' },
  { path: '/terminos', changefreq: 'yearly', priority: '0.45' },
];

interface RouteEntry {
  path: string;
  changefreq: string;
  priority: string;
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
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    entry.image
      ? `    <image:image><image:loc>${escapeXml(entry.image.loc)}</image:loc><image:title>${escapeXml(entry.image.title)}</image:title></image:image>`
      : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

const PAGE = 1000;

async function fetchProducts(): Promise<RouteEntry[]> {
  const out: RouteEntry[] = [];
  try {
    // Paginado: antes habia un limit=2000 fijo y todo producto por encima de
    // ese numero quedaba fuera del sitemap sin aviso.
    for (let offset = 0; ; offset += PAGE) {
      const url =
        `${SUPABASE_URL}/rest/v1/products` +
        `?select=slug,name,main_image_url,created_at&is_active=eq.true&order=created_at.desc&limit=${PAGE}&offset=${offset}`;
      const res = await fetch(url, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });
      if (!res.ok) break;
      const rows = (await res.json()) as Array<{ slug?: string; name?: string; main_image_url?: string; created_at?: string }>;
      if (!Array.isArray(rows)) break;
      for (const item of rows) {
        if (!item?.slug) continue;
        out.push({
          path: `/producto/${item.slug}`,
          changefreq: 'weekly',
          priority: '0.80',
          lastmod: item.created_at || undefined,
          image: item.main_image_url ? { loc: item.main_image_url, title: item.name || item.slug } : undefined,
        });
      }
      if (rows.length < PAGE) break;
    }
  } catch {
    /* se devuelve lo que se alcanzo a juntar */
  }
  return out;
}

export default async function handler(_req: unknown, res: any) {
  const productRoutes = await fetchProducts();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...staticRoutes.map(toUrlNode),
    ...productRoutes.map(toUrlNode),
    '</urlset>',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
