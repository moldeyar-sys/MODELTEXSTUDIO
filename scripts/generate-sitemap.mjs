import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchProducts() {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?select=slug,created_at&is_active=eq.true&order=created_at.desc&limit=1000`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      const details = await res.text();
      console.warn('[sitemap] No se pudieron traer productos:', res.status, details);
      return [];
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows
      .filter((item) => item?.slug)
      .map((item) => ({
        path: `/producto/${item.slug}`,
        changefreq: 'weekly',
        priority: '0.80',
        lastmod: item.created_at || undefined,
      }));
  } catch (error) {
    console.warn('[sitemap] Error generando sitemap dinamico:', error instanceof Error ? error.message : error);
    return [];
  }
}

function toUrlNode(entry) {
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

async function main() {
  const productRoutes = await fetchProducts();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticRoutes.map(toUrlNode),
    ...productRoutes.map(toUrlNode),
    '</urlset>',
    '',
  ].join('\n');

  const output = resolve(process.cwd(), 'public', 'sitemap.xml');
  await writeFile(output, xml, 'utf8');
  console.log(`[sitemap] Generado con ${staticRoutes.length} rutas fijas y ${productRoutes.length} productos.`);
}

main().catch((error) => {
  console.error('[sitemap] Error fatal:', error);
  process.exit(1);
});

