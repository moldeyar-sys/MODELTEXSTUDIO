// Sitemap dinamico: se genera al vuelo consultando Supabase, con cache de 1 hora.
// Reemplaza al sitemap estatico de build (scripts/generate-sitemap.mjs): antes,
// un producto nuevo no aparecia en el sitemap hasta el proximo deploy; ahora
// aparece solo, como mucho una hora despues de cargarlo.

const SITE_URL = 'https://modeltex.com.ar';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/catalogo', changefreq: 'daily', priority: '0.95' },
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
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function fetchProducts(): Promise<RouteEntry[]> {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?select=slug,created_at&is_active=eq.true&order=created_at.desc&limit=2000`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ slug?: string; created_at?: string }>;
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((item) => item?.slug)
      .map((item) => ({
        path: `/producto/${item.slug}`,
        changefreq: 'weekly',
        priority: '0.80',
        lastmod: item.created_at || undefined,
      }));
  } catch {
    return [];
  }
}

export default async function handler(_req: unknown, res: any) {
  const productRoutes = await fetchProducts();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticRoutes.map(toUrlNode),
    ...productRoutes.map(toUrlNode),
    '</urlset>',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
