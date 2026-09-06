// Sirve HTML con contenido REAL a los robots (redes sociales, buscadores y
// asistentes de IA como ChatGPT/Claude/Perplexity). Los usuarios reales nunca
// pasan por aca: siguen de largo hacia la SPA de siempre. Esto existe porque
// el sitio es una SPA (Vite/React) y la mayoria de esos robots no ejecutan
// JavaScript: sin esto verian un <body> vacio en TODAS las paginas y las IA
// no podrian leer (ni recomendar) ni un solo producto.
//
// Los schemas JSON-LD que se inyectan llevan el mismo data-seo-schema que usa
// la app (src/lib/seo.ts): si Google renderiza la pagina con JavaScript, la
// app reemplaza el schema en vez de duplicarlo. El bloque de texto para robots
// lo saca src/main.tsx antes de montar la app.

import { FAQ_ITEMS } from './src/lib/faqData';
import { CATEGORY_SEO, CATEGORY_TITLE_SUFFIX } from './src/lib/categorySeo';

export const config = {
  matcher: [
    '/producto/:path*',
    '/',
    '/catalogo',
    '/moldes-pdf',
    '/moldes-pdf-a4',
    '/moldes-para-plotter',
    '/moldes-para-emprendedores',
    '/moldes-gratis',
    '/como-funciona',
    '/ayuda-impresion',
    '/preguntas-frecuentes',
    '/diseno-a-pedido',
    '/contacto',
    '/ia-textil',
    '/politica-descargas',
    '/terminos',
    '/privacidad',
  ],
};

// Sociales + buscadores + crawlers de IA (AEO) + herramientas SEO: si no estan
// aca, ven la SPA vacia. Google-InspectionTool es lo que usa Search Console
// al "probar URL publicada".
const BOT_UA =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|vkShare|redditbot|Applebot|SkypeUriPreview|Snapchat|W3C_Validator|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|CCBot|Bingbot|bingbot|BingPreview|msnbot|Googlebot|Google-InspectionTool|Storebot-Google|AdsBot-Google|Mediapartners-Google|APIs-Google|Google-Extended|GoogleOther|Amazonbot|meta-externalagent|Meta-ExternalFetcher|Bytespider|DuckAssistBot|DuckDuckBot|YouBot|cohere-ai|MistralAI-User|Yandex|Baiduspider|PetalBot|SeznamBot|Qwantify|AhrefsBot|SemrushBot|Screaming Frog|Diffbot|ImagesiftBot|archive\.org_bot|ia_archiver/i;

// Mismas claves publicas que src/lib/supabase.ts (la "anon key" esta pensada
// para vivir en el cliente; la seguridad la dan las policies RLS de la tabla).
const SUPABASE_URL = 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const SITE_NAME = 'Modeltex';
const DEFAULT_IMAGE = 'https://modeltex.com.ar/brand/og-image.png';
const WHATSAPP_DISPLAY = '+54 9 11 6653 1086';
const WHATSAPP_LINK = 'https://wa.me/5491166531086';

const FORMATOS_TXT =
  'PDF A4, PDF plotter, DXF/AAMA, PDS (Optitex), MRK (tizadas), ADS (Audaces), PLT, CDR y sublimación';
const CATALOGO_TXT = 'más de 2.000 moldes';

// Mismos valores que CATEGORIES en src/lib/types.ts. Titulo, descripcion y
// sufijo vienen de src/lib/categorySeo.ts (compartido con la app).
interface CategoriaSeo {
  label: string;
  sufijo: string;
  title: string;
  description: string;
  intro: string;
}
const CATEGORIA_INTRO: Record<string, { label: string; intro: string }> = {
  dama: {
    label: 'Dama',
    intro:
      'La categoría más grande del catálogo: vestidos, blusas, tops, shorts, calzas, buzos, camperas, abrigos, blazers, bikinis, pantalones y palazzos de dama, con curva de talles industrial (XS a 4XL) incluida en cada compra.',
  },
  hombre: {
    label: 'Hombre',
    intro:
      'Remeras, chombas, buzos, joggers, shorts, camisas, camperas y pantalones de hombre, con todos los talles (XS a 4XL) incluidos y listos para producir.',
  },
  nina: {
    label: 'Niña',
    intro: 'Vestidos, tops, faldas, shorts, calzas, buzos y blazers de niña, con la curva completa de talles infantiles (2 a 18) en cada molde.',
  },
  nino: {
    label: 'Niño',
    intro: 'Remeras, buzos, joggers, shorts, pijamas y blazers de niño, con la curva completa de talles infantiles (2 a 18) en cada molde.',
  },
  bebes: {
    label: 'Bebés',
    intro: 'Bodies y prendas de bebé con la curva de talles completa incluida, listos para imprimir o cortar en CAD.',
  },
  'adultos-unisex': {
    label: 'Adultos unisex',
    intro: 'Camperas deportivas, buzos y remeras unisex para adultos, con todos los talles incluidos.',
  },
  'ninos-unisex': {
    label: 'Niños unisex',
    intro: 'Buzos, remeras, camperas, shorts escolares y blazers unisex infantiles, con la curva completa de talles.',
  },
};
const CATEGORIAS: Record<string, CategoriaSeo> = Object.fromEntries(
  Object.entries(CATEGORIA_INTRO).map(([k, v]) => [
    k,
    {
      label: v.label,
      intro: v.intro,
      sufijo: CATEGORY_TITLE_SUFFIX[k],
      title: `${CATEGORY_SEO[k].title} | ${SITE_NAME}`,
      description: CATEGORY_SEO[k].description,
    },
  ]),
);

const TEMPORADA_LABEL: Record<string, string> = {
  verano: 'Verano',
  invierno: 'Invierno',
  'todo-el-anio': 'Todo el año',
};

type Schema = { id: string; data: Record<string, unknown> };

function next() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceAttr(html: string, matchAttr: string, content: string) {
  const pattern = new RegExp(`(${matchAttr}content=")[^"]*(")`, 'i');
  return html.replace(pattern, `$1${content}$2`);
}

function setHeadSeo(html: string, title: string, description: string, pageUrl: string) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(pageUrl);
  html = html
    .replace(/<title>.*?<\/title>/s, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${u}$2`);
  html = replaceAttr(html, 'property="og:title" ', t);
  html = replaceAttr(html, 'property="og:description" ', d);
  html = replaceAttr(html, 'property="og:url" ', u);
  html = replaceAttr(html, 'name="twitter:title" ', t);
  html = replaceAttr(html, 'name="twitter:description" ', d);
  return html;
}

function setRobots(html: string, value: string) {
  if (/<meta name="robots" /i.test(html)) return replaceAttr(html, 'name="robots" ', value);
  return html.replace('</head>', `<meta name="robots" content="${value}" />\n</head>`);
}

// El contenido para robots va despues del div de la app: los usuarios reales
// nunca reciben este HTML, y aunque lo recibieran main.tsx lo saca antes de
// montar React.
function injectBody(html: string, inner: string, schemas?: Schema[]) {
  const scripts = schemas?.length
    ? schemas
        .map((s) => `<script type="application/ld+json" data-seo-schema="${s.id}">${JSON.stringify(s.data)}</script>`)
        .join('\n')
    : '';
  if (scripts) html = html.replace('</head>', `${scripts}\n</head>`);
  return html.replace(/(<div id="root"><\/div>)/, `$1\n<main data-bot-content>\n${inner}\n</main>`);
}

function respond(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': status === 200 ? 'public, max-age=300, s-maxage=300' : 'public, max-age=60',
    },
  });
}

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function fmtArs(n: number) {
  return `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ARS`;
}

function fmtUsd(n: number) {
  return `USD ${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

function cortar(texto: string, max: number) {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const ultimoEspacio = corte.lastIndexOf(' ');
  return (ultimoEspacio > max * 0.6 ? corte.slice(0, ultimoEspacio) : corte).replace(/[,;:\s]+$/, '') + '…';
}

function breadcrumb(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

function breadcrumbHtml(items: Array<{ name: string; url: string }>) {
  return `<nav aria-label="Ruta">${items
    .map((it, i) => (i === items.length - 1 ? escapeHtml(it.name) : `<a href="${it.url}">${escapeHtml(it.name)}</a>`))
    .join(' › ')}</nav>`;
}

// ---------- Supabase (lectura publica, misma anon key que la app) ----------

async function pg<T>(query: string, withCount = false): Promise<{ rows: T[]; total: number | null; ok: boolean }> {
  try {
    const headers: Record<string, string> = { apikey: SUPABASE_ANON_KEY };
    if (withCount) headers.Prefer = 'count=exact';
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?${query}`, { headers });
    if (!res.ok) return { rows: [], total: null, ok: false };
    const rows = (await res.json()) as T[];
    const range = res.headers.get('content-range') || '';
    const total = withCount ? parseInt(range.split('/')[1] || '', 10) : NaN;
    return { rows: Array.isArray(rows) ? rows : [], total: Number.isFinite(total) ? total : null, ok: true };
  } catch {
    return { rows: [], total: null, ok: false };
  }
}

interface ProductRow {
  name: string;
  slug: string;
  codigo?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  main_image_url?: string | null;
  gallery?: string[] | null;
  category?: string | null;
  garment_type?: string | null;
  season?: string | null;
  sizes?: string[] | null;
  formats?: string[] | null;
  recommended_fabrics?: string[] | null;
  price?: number | null;
  precio_carton?: number | null;
  precio_pdf_a4?: number | null;
  precio_pdf_ploter?: number | null;
  precio_dxf?: number | null;
  precio_pds?: number | null;
  precio_mrk?: number | null;
  precio_ads?: number | null;
  precio_usd_carton?: number | null;
  precio_usd_pdf_a4?: number | null;
  precio_usd_pdf_ploter?: number | null;
  precio_usd_dxf?: number | null;
  precio_usd_pds?: number | null;
  precio_usd_mrk?: number | null;
  precio_usd_ads?: number | null;
  entrega_inmediata?: boolean | null;
}

const PRODUCT_SELECT =
  'name,slug,codigo,short_description,long_description,main_image_url,gallery,category,garment_type,season,sizes,formats,recommended_fabrics,' +
  'price,precio_carton,precio_pdf_a4,precio_pdf_ploter,precio_dxf,precio_pds,precio_mrk,precio_ads,' +
  'precio_usd_carton,precio_usd_pdf_a4,precio_usd_pdf_ploter,precio_usd_dxf,precio_usd_pds,precio_usd_mrk,precio_usd_ads,entrega_inmediata';

type ListRow = { name: string; slug: string; precio_pdf_a4?: number | null; price?: number | null; category?: string | null };
const LIST_SELECT = 'name,slug,precio_pdf_a4,price,category';

// ---------- Paginas de producto ----------

function productFormats(p: ProductRow) {
  return [
    { nombre: 'Moldes en cartón', ars: num(p.precio_carton), usd: num(p.precio_usd_carton) },
    { nombre: 'PDF A4 (descarga digital)', ars: num(p.precio_pdf_a4) ?? num(p.price), usd: num(p.precio_usd_pdf_a4) },
    { nombre: 'PDF plotter (descarga digital)', ars: num(p.precio_pdf_ploter), usd: num(p.precio_usd_pdf_ploter) },
    { nombre: 'DXF / AAMA (CAD universal)', ars: num(p.precio_dxf), usd: num(p.precio_usd_dxf) },
    { nombre: 'PDS (Optitex)', ars: num(p.precio_pds), usd: num(p.precio_usd_pds) },
    { nombre: 'MRK (tizado Optitex)', ars: num(p.precio_mrk), usd: num(p.precio_usd_mrk) },
    { nombre: 'ADS (Audaces)', ars: num(p.precio_ads), usd: num(p.precio_usd_ads) },
  ].filter((f) => f.ars || f.usd);
}

function productSeo(p: ProductRow) {
  const cat = CATEGORIAS[p.category || ''];
  const title = `${p.name} — molde digital ${cat?.sufijo || ''}`.replace(/\s+$/, '') + ` | ${SITE_NAME}`;
  const base = (p.short_description || p.long_description || '').toString().trim() || `Molde digital de ${p.garment_type || p.name}.`;
  const precios = productFormats(p).map((f) => f.ars).filter((v): v is number => v !== null);
  const desde = precios.length ? ` Desde ${fmtArs(Math.min(...precios))}.` : '';
  const formatos = (p.formats || []).length ? ` Formatos: ${(p.formats || []).join(', ')}.` : '';
  const description = cortar(`${base}${desde}${formatos}`, 160);
  return { title, description };
}

function productBody(p: ProductRow, pageUrl: string, origin: string): { inner: string; schemas: Schema[] } {
  const cat = CATEGORIAS[p.category || ''];
  const catUrl = `${origin}/catalogo?categoria=${p.category || ''}`;
  const desc = (p.short_description || p.long_description || '').toString().trim();
  const sizes = p.sizes || [];
  const formats = p.formats || [];
  const fabrics = p.recommended_fabrics || [];
  const temporada = TEMPORADA_LABEL[p.season || ''] || '';
  const lineas = productFormats(p).map(
    (f) => `${f.nombre}: ${[f.ars ? fmtArs(f.ars) : '', f.usd ? `${fmtUsd(f.usd)} para el exterior` : ''].filter(Boolean).join(' · ')}`,
  );

  const ficha = [
    cat ? `<li>Categoría: <a href="${catUrl}">${escapeHtml(cat.label)}</a></li>` : '',
    p.garment_type && p.garment_type !== p.name ? `<li>Tipo de prenda: ${escapeHtml(p.garment_type)}</li>` : '',
    temporada ? `<li>Temporada: ${temporada}</li>` : '',
    sizes.length ? `<li>Talles incluidos (${sizes.length}, todos en la misma compra): ${escapeHtml(sizes.join(', '))}</li>` : '',
    formats.length ? `<li>Formatos disponibles: ${escapeHtml(formats.join(', '))}</li>` : '',
    fabrics.length ? `<li>Telas recomendadas: ${escapeHtml(fabrics.join(', '))}</li>` : '',
    p.codigo ? `<li>Código: ${escapeHtml(p.codigo)}</li>` : '',
    `<li>Entrega: ${p.entrega_inmediata ? 'descarga inmediata al confirmar el pago' : 'descarga digital dentro de las 24 horas de confirmado el pago'}</li>`,
  ].filter(Boolean);

  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Catálogo', url: `${origin}/catalogo` },
    ...(cat ? [{ name: cat.label, url: catUrl }] : []),
    { name: p.name, url: pageUrl },
  ];

  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(p.name)}${p.codigo ? ` (cód. ${escapeHtml(p.codigo)})` : ''}</h1>`,
    desc ? `<p>${escapeHtml(desc.slice(0, 600))}</p>` : '',
    `<p>Molde ${cat ? escapeHtml(cat.sufijo) + ' ' : ''}profesional aprobado con muestra confeccionada, con curva de talles industrial completa. Se compra una vez y se descargan todos los talles.</p>`,
    `<h2>Ficha técnica</h2><ul>${ficha.join('')}</ul>`,
    lineas.length ? `<h2>Precios</h2><ul>${lineas.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>` : '',
    `<p>Disponible también en otros formatos a pedido (${FORMATOS_TXT}). Pagos con Mercado Pago, transferencia, PayPal o cripto; se puede comprar con o sin cuenta.</p>`,
    `<h2>Cómo se usa</h2><p>PDF A4: se imprime en casa al 100% (tamaño real), se verifica el cuadrado de control con una regla y se pegan las hojas numeradas. PDF plotter: se imprime en ancho real en cualquier servicio de ploteo. DXF/AAMA, PDS, MRK y ADS: se abren directo en el sistema CAD (Optitex, Audaces, Gerber, Lectra) para cortar sin trazar.</p>`,
    `<p>Comprar online en <a href="${pageUrl}">${pageUrl}</a> — ${SITE_NAME}, moldería digital para producción textil, envíos digitales a todo el mundo.` +
      (cat ? ` Ver más <a href="${catUrl}">moldes ${escapeHtml(cat.sufijo)}</a>,` : ' Ver') +
      ` el <a href="${origin}/catalogo">catálogo completo</a> (${CATALOGO_TXT}) o las <a href="${origin}/preguntas-frecuentes">preguntas frecuentes</a>.</p>`,
  ]
    .filter(Boolean)
    .join('\n');

  const offers: Array<Record<string, unknown>> = [];
  for (const f of productFormats(p)) {
    const base = {
      '@type': 'Offer',
      name: f.nombre,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: pageUrl,
      seller: { '@type': 'Organization', name: SITE_NAME },
    };
    if (f.ars) offers.push({ ...base, price: f.ars, priceCurrency: 'ARS' });
    if (f.usd) offers.push({ ...base, name: `${f.nombre} (internacional)`, price: f.usd, priceCurrency: 'USD' });
  }
  const imagenes = [p.main_image_url, ...(p.gallery || [])].filter(Boolean);

  const schemas: Schema[] = [
    {
      id: 'product-schema',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        sku: p.codigo || p.slug,
        description: (desc || `Molde digital de ${p.garment_type || p.name} con talles y formatos profesionales.`).slice(0, 500),
        image: imagenes.length ? imagenes : DEFAULT_IMAGE,
        url: pageUrl,
        category: cat?.label || undefined,
        brand: { '@type': 'Brand', name: SITE_NAME },
        ...(offers.length ? { offers } : {}),
      },
    },
    { id: 'breadcrumb-schema', data: breadcrumb(migas) },
  ];
  return { inner, schemas };
}

// ---------- Catalogo y paginas por categoria ----------

function listadoHtml(rows: ListRow[], origin: string) {
  return `<ul>\n${rows
    .map((p) => {
      const precio = num(p.precio_pdf_a4) ?? num(p.price);
      return `<li><a href="${origin}/producto/${encodeURIComponent(p.slug)}">${escapeHtml(p.name)}</a>${precio ? ` — desde ${fmtArs(precio)}` : ''}</li>`;
    })
    .join('\n')}\n</ul>`;
}

function fmtCantidad(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function otrasCategoriasHtml(origin: string, actual: string) {
  return `<ul>${Object.entries(CATEGORIAS)
    .filter(([k]) => k !== actual)
    .map(([k, c]) => `<li><a href="${origin}/catalogo?categoria=${k}">Moldes ${escapeHtml(c.sufijo)}</a></li>`)
    .join('')}</ul>`;
}

async function categoriaPage(html: string, origin: string, cat: string) {
  const c = CATEGORIAS[cat];
  const pageUrl = `${origin}/catalogo?categoria=${cat}`;
  const { rows, total } = await pg<ListRow>(
    `is_active=eq.true&category=eq.${cat}&select=${LIST_SELECT}&order=created_at.desc&limit=100`,
    true,
  );
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Catálogo', url: `${origin}/catalogo` },
    { name: c.label, url: pageUrl },
  ];
  const inner = [
    breadcrumbHtml(migas),
    `<h1>Moldes de ropa ${escapeHtml(c.sufijo)}${total ? ` (${fmtCantidad(total)} moldes)` : ''}</h1>`,
    `<p>${escapeHtml(c.intro)} Todos aprobados con muestra confeccionada, con descarga digital inmediata en PDF A4 y plotter, y disponibles a pedido en ${FORMATOS_TXT}. Precios en pesos argentinos y en dólares para el exterior.</p>`,
    rows.length ? `<h2>Moldes ${escapeHtml(c.sufijo)} disponibles</h2>\n${listadoHtml(rows, origin)}` : '',
    total && total > rows.length
      ? `<p>Se muestran los ${rows.length} más recientes de ${fmtCantidad(total)}. El listado completo, con búsqueda por prenda, temporada y formato, está en <a href="${pageUrl}">${pageUrl}</a>.</p>`
      : '',
    `<h2>Otras categorías</h2>${otrasCategoriasHtml(origin, cat)}`,
    `<p>Ver el <a href="${origin}/catalogo">catálogo completo</a> (${CATALOGO_TXT}), <a href="${origin}/moldes-gratis">moldes gratis</a> para probar la calidad o las <a href="${origin}/preguntas-frecuentes">preguntas frecuentes</a>.</p>`,
  ]
    .filter(Boolean)
    .join('\n');

  const schemas: Schema[] = [
    { id: 'breadcrumb-schema', data: breadcrumb(migas) },
    {
      id: 'catalog-schema',
      data: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: c.title.replace(` | ${SITE_NAME}`, ''),
        url: pageUrl,
        numberOfItems: total ?? rows.length,
        itemListElement: rows.slice(0, 50).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: `${origin}/producto/${encodeURIComponent(p.slug)}`,
        })),
      },
    },
  ];
  html = setHeadSeo(html, c.title, c.description, pageUrl);
  return injectBody(html, inner, schemas);
}

async function catalogoPage(html: string, origin: string) {
  const pageUrl = `${origin}/catalogo`;
  const keys = Object.keys(CATEGORIAS);
  const porCategoria = await Promise.all(
    keys.map((k) => pg<ListRow>(`is_active=eq.true&category=eq.${k}&select=${LIST_SELECT}&order=created_at.desc&limit=12`, true)),
  );
  const total = porCategoria.reduce((sum, r) => sum + (r.total || 0), 0);
  const secciones = keys
    .map((k, i) => {
      const c = CATEGORIAS[k];
      const r = porCategoria[i];
      if (!r.rows.length) return '';
      const catUrl = `${origin}/catalogo?categoria=${k}`;
      return (
        `<h2><a href="${catUrl}">Moldes ${escapeHtml(c.sufijo)}</a>${r.total ? ` (${fmtCantidad(r.total)})` : ''}</h2>\n` +
        `<p>${escapeHtml(c.intro)}</p>\n${listadoHtml(r.rows, origin)}\n<p><a href="${catUrl}">Ver todos los moldes ${escapeHtml(c.sufijo)}</a></p>`
      );
    })
    .filter(Boolean)
    .join('\n');

  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Catálogo', url: pageUrl },
  ];
  const inner = [
    breadcrumbHtml(migas),
    `<h1>Catálogo de moldes digitales Modeltex${total ? `: ${fmtCantidad(total)} moldes` : ''}</h1>`,
    `<p>Moldes de ropa profesionales para producción, aprobados con muestra, con curva de talles completa incluida. Categorías: dama, hombre, niña, niño, bebés y unisex. Formatos: ${FORMATOS_TXT}. Descarga digital inmediata, precios en pesos argentinos y en dólares.</p>`,
    secciones,
    `<p>Este listado es parcial: el catálogo completo tiene ${CATALOGO_TXT} con búsqueda por prenda, categoría, temporada y formato en <a href="${pageUrl}">${pageUrl}</a>. También hay <a href="${origin}/moldes-gratis">moldes gratis</a> para probar la calidad antes de comprar.</p>`,
  ]
    .filter(Boolean)
    .join('\n');

  const schemas: Schema[] = [
    { id: 'breadcrumb-schema', data: breadcrumb(migas) },
    {
      id: 'catalog-schema',
      data: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Catálogo de moldes digitales Modeltex',
        url: pageUrl,
        itemListElement: keys.map((k, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `Moldes ${CATEGORIAS[k].sufijo}`,
          url: `${origin}/catalogo?categoria=${k}`,
        })),
      },
    },
  ];
  html = setHeadSeo(
    html,
    `Catálogo de moldes digitales: ${CATALOGO_TXT} | ${SITE_NAME}`,
    `Más de 2.000 moldes de ropa digitales para dama, hombre, niños y bebés. Todos los talles incluidos, en PDF A4, plotter y formatos CAD (DXF/AAMA, Optitex, Audaces). Descarga inmediata.`,
    pageUrl,
  );
  return injectBody(html, inner, schemas);
}

// ---------- Home, landings, guias y legales ----------

const STATIC_PAGES: Record<
  string,
  { title: string; description: string; body: (origin: string) => string; schemas?: (origin: string) => Schema[] }
> = {
  '/': {
    title: 'Modeltex | Moldes PDF, moldes para imprimir y moldería digital',
    description:
      'Moldería digital profesional para producción textil: más de 2.000 moldes de ropa con curva de talles completa, en PDF A4, plotter, DXF/AAMA, Optitex y Audaces. Descarga inmediata.',
    body: (o) => `
<h1>Modeltex — Moldería digital profesional para producir ropa</h1>
<p>Vendemos moldes de ropa digitales listos para producción: ${CATALOGO_TXT} aprobados con muestra real, con curva de talles industrial completa incluida en cada compra. Más de 18 años en la industria textil argentina. Entrega por descarga digital a todo el mundo.</p>
<h2>Qué ofrecemos</h2>
<ul>
<li><a href="${o}/catalogo">Catálogo completo</a>: moldes de dama, hombre, niños y bebés en ${FORMATOS_TXT}.</li>
<li>Por categoría: <a href="${o}/catalogo?categoria=dama">dama</a>, <a href="${o}/catalogo?categoria=hombre">hombre</a>, <a href="${o}/catalogo?categoria=nina">niña</a>, <a href="${o}/catalogo?categoria=nino">niño</a>, <a href="${o}/catalogo?categoria=bebes">bebés</a>, <a href="${o}/catalogo?categoria=adultos-unisex">unisex adultos</a> y <a href="${o}/catalogo?categoria=ninos-unisex">unisex niños</a>.</li>
<li><a href="${o}/moldes-gratis">Moldes gratis</a> para probar la calidad antes de comprar.</li>
<li><a href="${o}/diseno-a-pedido">Moldería a pedido</a>: desarrollamos tu molde a medida en el formato que uses.</li>
<li>Tizadas computarizadas (MRK) optimizadas al ancho de tu tela.</li>
</ul>
<p>Precios en pesos argentinos y en dólares para el exterior. Pagos con Mercado Pago, transferencia, PayPal y cripto. Se puede comprar con o sin cuenta. Más info en <a href="${o}/preguntas-frecuentes">preguntas frecuentes</a>, <a href="${o}/como-funciona">cómo funciona</a> y <a href="${o}/contacto">contacto</a> (WhatsApp ${WHATSAPP_DISPLAY}).</p>`,
  },
  '/moldes-pdf': {
    title: 'Moldes PDF para imprimir | Modeltex',
    description: 'Moldes de ropa en PDF para imprimir en A4 o plotter, con todos los talles y descarga inmediata. Para emprendedores, talleres y fabricantes.',
    body: (o) => `
<h1>Moldes PDF para imprimir, cortar y producir</h1>
<p>Moldes de ropa en PDF listos para imprimir: en hojas A4 (imprimís en casa y pegás siguiendo la guía numerada) o en PDF plotter (imprimís en ancho real en cualquier servicio de ploteo). Todos incluyen la curva completa de talles y control de medida para verificar la escala.</p>
<p><a href="${o}/catalogo">Ver el catálogo completo</a> (${CATALOGO_TXT}) — también disponibles en ${FORMATOS_TXT}.</p>`,
  },
  '/moldes-pdf-a4': {
    title: 'Moldes PDF A4 para imprimir en casa | Modeltex',
    description: 'Moldes de ropa en PDF A4: imprimí en tu impresora hogareña, pegá las hojas numeradas y cortá. Todos los talles incluidos.',
    body: (o) => `
<h1>Moldes PDF A4 — imprimí tus moldes en casa</h1>
<p>El formato ideal para emprendedores: imprimís el molde en hojas A4 comunes al 100% de escala, pegás siguiendo la numeración y obtenés el molde en tamaño real con todos sus talles. Cada archivo incluye cuadrado de control de medida.</p>
<p><a href="${o}/catalogo?formato=PDF%20A4">Ver moldes PDF A4 disponibles</a> · <a href="${o}/ayuda-impresion">Guía para imprimir sin perder escala</a></p>`,
  },
  '/moldes-para-plotter': {
    title: 'Moldes para plotter en ancho real | Modeltex',
    description: 'Moldes de ropa en PDF plotter para imprimir en ancho real (90 a 150 cm). Curva de talles completa, listos para taller y producción.',
    body: (o) => `
<h1>Moldes para plotter — impresión en ancho real</h1>
<p>PDF preparados para plotter textil en anchos de 90, 120 o 150 cm según el molde: llevás el archivo a cualquier servicio de ploteo e imprimís el molde completo sin pegar hojas. La opción más usada por talleres y fábricas que cortan a mano.</p>
<p><a href="${o}/catalogo?formato=PDF%20Plotter">Ver moldes para plotter</a> — ¿cortás en CAD? Pedilos en DXF/AAMA, Optitex o Audaces.</p>`,
  },
  '/moldes-para-emprendedores': {
    title: 'Moldes de ropa para emprendedores | Modeltex',
    description: 'Moldes digitales probados con muestra para arrancar tu marca de ropa: todos los talles, descarga inmediata y soporte por WhatsApp.',
    body: (o) => `
<h1>Moldes de ropa para emprendedores</h1>
<p>Si estás armando tu marca de ropa, empezás con moldes ya probados en producción: cada molde de Modeltex se aprueba con una muestra confeccionada antes de publicarse, e incluye todos los talles. Descargás, imprimís (A4 o plotter) y cortás. Soporte directo por WhatsApp si te trabás.</p>
<p><a href="${o}/moldes-gratis">Probá primero un molde gratis</a> · <a href="${o}/catalogo">Ver catálogo</a></p>`,
  },
  '/moldes-gratis': {
    title: 'Moldes de ropa gratis para descargar | Modeltex',
    description: 'Descargá moldes de ropa reales gratis y comprobá la calidad de Modeltex antes de comprar. PDF listos para imprimir.',
    body: (o) => `
<h1>Moldes gratis — probá la calidad antes de comprar</h1>
<p>Publicamos moldes reales de nuestro catálogo para descarga gratuita: el mismo nivel de terminación, talles y prolijidad que los moldes pagos. Descargalos, imprimilos y comprobá cómo trabajamos antes de hacer tu primera compra.</p>
<p><a href="${o}/moldes-gratis">Entrá a la sección Moldes Gratis</a> (algunos se descargan sin cuenta; otros pidiendo una cuenta gratuita).</p>`,
  },
  '/como-funciona': {
    title: 'Cómo funciona la compra de moldes | Modeltex',
    description: 'Elegís el molde y formato, pagás (Mercado Pago, transferencia, PayPal o cripto) y descargás. Moldes aprobados con muestra y todos los talles.',
    body: (o) => `
<h1>Cómo funciona Modeltex</h1>
<ol>
<li>Elegís el molde en el <a href="${o}/catalogo">catálogo</a> y el formato (cartón, PDF A4 o PDF plotter; otros formatos CAD a pedido).</li>
<li>Elegís los talles — la curva completa viene incluida.</li>
<li>Pagás con Mercado Pago, transferencia bancaria, PayPal o criptomonedas. Podés comprar sin crear cuenta.</li>
<li>Descargás tus archivos: los de descarga rápida al confirmarse el pago, el resto dentro de las 24 hs.</li>
</ol>
<p>Dudas: <a href="${o}/preguntas-frecuentes">preguntas frecuentes</a>.</p>`,
  },
  '/ayuda-impresion': {
    title: 'Cómo imprimir moldes PDF sin perder escala | Modeltex',
    description: 'Guía para imprimir moldes PDF en A4 o plotter: escala al 100%, cuadrado de control de medida y pegado de hojas numeradas.',
    body: (o) => `
<h1>Cómo imprimir tu molde PDF sin perder la escala</h1>
<ul>
<li>Configurá la impresión al <strong>100% / tamaño real</strong> — nunca "ajustar a la página".</li>
<li>Imprimí primero la hoja con el <strong>cuadrado de control</strong> y verificá su medida con regla.</li>
<li>Pegá las hojas A4 siguiendo la numeración de la guía.</li>
<li>Para plotter: llevá el PDF a cualquier servicio de ploteo e indicá impresión al 100%.</li>
</ul>
<p>Más ayuda en <a href="${o}/preguntas-frecuentes">preguntas frecuentes</a> o por WhatsApp desde <a href="${o}/contacto">contacto</a>.</p>`,
  },
  '/diseno-a-pedido': {
    title: 'Moldería a pedido y moldes a medida | Modeltex',
    description: 'Desarrollamos tu molde a medida desde tu prenda, foto o idea, con curva de talles y el formato que uses (PDF, DXF/AAMA, Optitex, Audaces).',
    body: (o) => `
<h1>Moldería a pedido — tu molde a medida</h1>
<p>Nos mandás una prenda, foto o idea y desarrollamos la moldería completa: molde base, curva de talles a tu tabla de medidas y entrega en el formato que uses (PDF A4, plotter, DXF/AAMA, Optitex PDS, Audaces ADS). Servicio pensado para marcas, talleres y fábricas.</p>
<p>Pedilo desde <a href="${o}/diseno-a-pedido">Diseño a pedido</a> o por WhatsApp (${WHATSAPP_DISPLAY}).</p>`,
  },
  '/preguntas-frecuentes': {
    title: 'Preguntas frecuentes sobre moldes digitales | Modeltex',
    description: 'Respuestas sobre formatos de moldes (PDF, DXF/AAMA, Optitex, Audaces), talles, impresión, pagos y entrega de moldería digital.',
    body: () =>
      `<h1>Preguntas frecuentes — moldes digitales Modeltex</h1>\n` +
      FAQ_ITEMS.map((f) => `<h2>${escapeHtml(f.q)}</h2>\n<p>${escapeHtml(f.a)}</p>`).join('\n'),
    schemas: () => [
      {
        id: 'faq-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
      },
    ],
  },
  '/contacto': {
    title: 'Contacto — WhatsApp, Telegram y email | Modeltex',
    description:
      'Contactá a Modeltex por WhatsApp (+54 9 11 6653 1086), Telegram o email. Consultas sobre moldes digitales, diseño a pedido y producción textil. Lunes a sábado de 9 a 18 hs.',
    body: (o) => `
<h1>Contacto — hablá con Modeltex</h1>
<p>Consultas sobre moldes, formatos, diseño a pedido o producción textil. Respondemos a la brevedad.</p>
<ul>
<li>WhatsApp: <a href="${WHATSAPP_LINK}">${WHATSAPP_DISPLAY}</a> (la vía más rápida)</li>
<li>Telegram: <a href="https://t.me/+5491166531086">${WHATSAPP_DISPLAY}</a></li>
<li>Formulario de contacto en <a href="${o}/contacto">${o}/contacto</a></li>
<li>Horario de atención: lunes a sábado, 9 a 18 hs (Argentina)</li>
<li>Ubicación: Argentina — envíos digitales a todo el mundo</li>
</ul>
<p>Antes de escribir, quizás tu duda ya esté respondida en las <a href="${o}/preguntas-frecuentes">preguntas frecuentes</a> o en la <a href="${o}/ayuda-impresion">ayuda de impresión</a>.</p>`,
    schemas: (o) => [
      {
        id: 'page-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contacto Modeltex',
          url: `${o}/contacto`,
          about: { '@id': 'https://modeltex.com.ar/#organization' },
        },
      },
    ],
  },
  '/ia-textil': {
    title: 'IA Textil — asesor inteligente para producir y vender | Modeltex',
    description:
      'Usá la IA de Modeltex para saber qué fabricar, qué molde elegir, qué hacer con tu tela y cómo armar una colección vendible. Asesoría textil al instante.',
    body: (o) => `
<h1>IA Textil — asesor inteligente para producir y vender ropa</h1>
<p>Herramienta gratuita de Modeltex para fabricantes y emprendedores: contás qué tela tenés, qué querés producir o para qué público, y la IA te sugiere qué prendas conviene fabricar, qué moldes del catálogo usar y cómo armar una colección vendible.</p>
<p>Usala desde <a href="${o}/ia-textil">${o}/ia-textil</a> y después elegí los moldes en el <a href="${o}/catalogo">catálogo</a>.</p>`,
  },
  '/politica-descargas': {
    title: 'Política de descargas digitales y reembolsos | Modeltex',
    description: 'Condiciones de descarga, entrega digital y reembolsos para compras de moldes digitales en Modeltex.',
    body: (o) => `
<h1>Política de descargas digitales y reembolsos</h1>
<p>Los moldes de Modeltex son productos digitales: se entregan por descarga (inmediata en los marcados como descarga rápida; el resto dentro de las 24 horas de confirmado el pago) y quedan disponibles desde la cuenta del cliente o desde el link enviado por email en compras sin cuenta.</p>
<p>El texto completo de la política está en <a href="${o}/politica-descargas">${o}/politica-descargas</a>. Consultas: <a href="${o}/contacto">contacto</a>.</p>`,
  },
  '/terminos': {
    title: 'Términos y condiciones | Modeltex',
    description: 'Términos y condiciones de uso del sitio Modeltex y de compra de moldes digitales.',
    body: (o) => `
<h1>Términos y condiciones</h1>
<p>Condiciones de uso del sitio modeltex.com.ar y de compra de moldes digitales (licencia de uso de los archivos, entrega digital, pagos y soporte). Texto completo en <a href="${o}/terminos">${o}/terminos</a>.</p>`,
  },
  '/privacidad': {
    title: 'Política de privacidad | Modeltex',
    description: 'Política de privacidad de Modeltex: uso de datos personales, cuenta, compras y comunicaciones de soporte.',
    body: (o) => `
<h1>Política de privacidad</h1>
<p>Cómo Modeltex usa los datos personales necesarios para la cuenta, las compras y las comunicaciones de soporte. Texto completo en <a href="${o}/privacidad">${o}/privacidad</a>.</p>`,
  },
};

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return next();

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';

  try {
    // ---------- Paginas de producto ----------
    if (path.startsWith('/producto/')) {
      const slug = decodeURIComponent(path.replace(/^\/producto\//, ''));
      if (!slug) return next();

      const [productRes, htmlRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=${PRODUCT_SELECT}&limit=1`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        ),
        fetch(`${url.origin}/index.html`),
      ]);

      // Si Supabase falla, mejor la SPA de siempre que un 404 falso.
      if (!productRes.ok) return next();

      let html = await htmlRes.text();
      const products = (await productRes.json()) as ProductRow[];
      const product = Array.isArray(products) ? products[0] : null;

      if (!product) {
        // 404 real: sin esto Google indexaba como pagina valida cualquier slug
        // inventado o de producto dado de baja (soft 404).
        html = setHeadSeo(
          html,
          `Producto no encontrado | ${SITE_NAME}`,
          'Este molde ya no está disponible. Encontrá moldes similares en el catálogo de Modeltex.',
          `${url.origin}/catalogo`,
        );
        html = setRobots(html, 'noindex, follow');
        html = injectBody(
          html,
          `<h1>Producto no encontrado</h1>\n<p>Este molde ya no está disponible. <a href="${url.origin}/catalogo">Ver el catálogo completo</a> (${CATALOGO_TXT}).</p>`,
        );
        return respond(html, 404);
      }

      const pageUrl = `${url.origin}/producto/${slug}`;
      const { title, description } = productSeo(product);
      html = setHeadSeo(html, title, description, pageUrl);
      html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1product$2`);
      html = replaceAttr(html, 'property="og:image" ', escapeHtml(product.main_image_url || DEFAULT_IMAGE));
      html = replaceAttr(html, 'property="og:image:alt" ', escapeHtml(`${product.name} — molde digital Modeltex`));
      html = replaceAttr(html, 'name="twitter:image" ', escapeHtml(product.main_image_url || DEFAULT_IMAGE));
      const { inner, schemas } = productBody(product, pageUrl, url.origin);
      return respond(injectBody(html, inner, schemas));
    }

    // ---------- Home, catalogo, landings, guias y legales ----------
    const page = STATIC_PAGES[path];
    const isCatalog = path === '/catalogo';
    if (!page && !isCatalog) return next();

    const htmlRes = await fetch(`${url.origin}/index.html`);
    let html = await htmlRes.text();

    if (isCatalog) {
      const cat = url.searchParams.get('categoria') || '';
      return respond(CATEGORIAS[cat] ? await categoriaPage(html, url.origin, cat) : await catalogoPage(html, url.origin));
    }

    const pageUrl = `${url.origin}${path === '/' ? '/' : path}`;
    html = setHeadSeo(html, page.title, page.description, pageUrl);
    return respond(injectBody(html, page.body(url.origin), page.schemas?.(url.origin)));
  } catch {
    return next();
  }
}
