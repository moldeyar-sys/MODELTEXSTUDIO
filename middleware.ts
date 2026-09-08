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
//
// IMPORTANTE — convencion de ids de schema: los strings 'schema-breadcrumb',
// 'schema-faq', 'schema-collection', 'schema-article', 'schema-course',
// 'schema-definedterm', 'schema-product', 'schema-itemlist',
// 'schema-contactpage' que aparecen mas abajo tienen que ser IDENTICOS a los
// que exporta src/lib/schemaIds.ts (SCHEMA_IDS), que es lo que usa cada
// pagina .tsx del lado React. Si no coinciden exacto, el schema se duplica o
// desaparece al hidratar (useStructuredData en src/lib/seo.ts solo limpia el
// script viejo cuando el id coincide). Este archivo no puede importar la
// constante porque generaria un ciclo de tipos con .js en algunos bundlers
// del edge runtime; si cambias un id, cambialo en LOS DOS lugares.

import { FAQ_ITEMS } from './src/lib/faqData.js';
import { CATEGORY_SEO, CATEGORY_TITLE_SUFFIX } from './src/lib/categorySeo.js';
import { GUIAS, GUIAS_TITLE, GUIAS_DESCRIPTION, getRelatedGuias, type Guia } from './src/lib/guiasData.js';
import { buildProductFaq, descriptionParagraphs, garmentPhrase, productTitle, PRODUCT_GUIDE_LINKS } from './src/lib/productContent.js';
import { SLUG_REDIRECTS } from './src/lib/slugRedirects.js';
import { getArticleAuthor } from './src/lib/siteConfig.js';

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
    '/guias',
    '/guias/:path*',
    '/lab',
    '/lab/:path*',
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
      'La categoría más grande del catálogo: vestidos, blusas, tops, shorts, calzas, buzos, camperas, abrigos, blazers, bikinis, pantalones y palazzos de dama, con curva de talles industrial (XS a 4XL) disponible en cada molde.',
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
    intro: 'Camperas deportivas, buzos y remeras unisex para adultos, con curva de talles completa.',
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
  id: string;
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
  'id,name,slug,codigo,short_description,long_description,main_image_url,gallery,category,garment_type,season,sizes,formats,recommended_fabrics,' +
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
  const title = `${productTitle(p)} | ${SITE_NAME}`;
  const base = (p.short_description || p.long_description || '').toString().trim() || `Molde digital de ${garmentPhrase(p) || p.name}.`;
  const precios = productFormats(p).map((f) => f.ars).filter((v): v is number => v !== null);
  const desde = precios.length ? ` Desde ${fmtArs(Math.min(...precios))}.` : '';
  const formatos = (p.formats || []).length ? ` Formatos: ${(p.formats || []).join(', ')}.` : '';
  const description = cortar(`${base}${desde}${formatos}`, 160);
  return { title, description };
}

async function productReviewSummary(productId: string): Promise<{ avg: number; count: number }> {
  // Mismo calculo que src/lib/reviews.ts (reviewSummary), pero via fetch
  // directo a PostgREST: middleware.ts no importa el cliente supabase-js del
  // resto de la app, sigue el mismo patron que usa para leer productos.
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews?target_type=eq.product&target_id=eq.${encodeURIComponent(productId)}&select=rating`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!res.ok) return { avg: 0, count: 0 };
    const rows = (await res.json()) as Array<{ rating: number }>;
    if (!rows.length) return { avg: 0, count: 0 };
    const sum = rows.reduce((s, r) => s + r.rating, 0);
    return { avg: Math.round((sum / rows.length) * 10) / 10, count: rows.length };
  } catch {
    return { avg: 0, count: 0 };
  }
}

async function productBody(p: ProductRow, pageUrl: string, origin: string): Promise<{ inner: string; schemas: Schema[] }> {
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
    sizes.length ? `<li>Talles disponibles (${sizes.length}, se eligen en la ficha; la curva completa se puede llevar en una sola compra): ${escapeHtml(sizes.join(', '))}</li>` : '',
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

  const phrase = garmentPhrase(p);
  const short = (p.short_description || '').toString().trim();
  const largos = descriptionParagraphs(p);
  const faq = buildProductFaq(p);

  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(p.name)}${phrase ? ` — ${escapeHtml(phrase)}` : ''}${p.codigo ? ` (cód. ${escapeHtml(p.codigo)})` : ''}</h1>`,
    short ? `<p>${escapeHtml(short.slice(0, 600))}</p>` : '',
    ...largos.map((par) => `<p>${escapeHtml(par)}</p>`),
    !short && !largos.length && desc ? `<p>${escapeHtml(desc.slice(0, 600))}</p>` : '',
    `<p>Molde ${cat ? escapeHtml(cat.sufijo) + ' ' : ''}profesional aprobado con muestra confeccionada, con curva de talles industrial completa disponible. En la ficha se eligen los talles (el precio base cubre la selección estándar y cada talle extra suma un adicional); los formatos CAD incluyen la curva completa.</p>`,
    `<h2>Ficha técnica</h2><ul>${ficha.join('')}</ul>`,
    lineas.length ? `<h2>Precios</h2><ul>${lineas.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>` : '',
    `<p>Disponible también en otros formatos a pedido (${FORMATOS_TXT}). Pagos con Mercado Pago, transferencia, PayPal o cripto; se puede comprar con o sin cuenta.</p>`,
    `<h2>Cómo se usa</h2><p>PDF A4: se imprime en casa al 100% (tamaño real), se verifica el cuadrado de control con una regla y se pegan las hojas numeradas. PDF plotter: se imprime en ancho real en cualquier servicio de ploteo. DXF/AAMA, PDS, MRK y ADS: se abren directo en el sistema CAD (Optitex, Audaces, Gerber, Lectra) para cortar sin trazar.</p>`,
    faq.length
      ? `<h2>Preguntas frecuentes sobre ${escapeHtml(p.name)}</h2>` +
        faq.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('')
      : '',
    `<h2>Guías para producir con este molde</h2><ul>${PRODUCT_GUIDE_LINKS.map(
      (g) => `<li><a href="${origin}${g.to}">${escapeHtml(g.label)}</a></li>`,
    ).join('')}<li><a href="${origin}/guias">Todas las guías para producción</a></li></ul>`,
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
  const propiedades = [
    { name: 'Talles incluidos', value: sizes.join(', ') },
    { name: 'Formatos', value: formats.join(', ') },
    { name: 'Telas recomendadas', value: fabrics.join(', ') },
  ]
    .filter((pr) => pr.value)
    .map((pr) => ({ '@type': 'PropertyValue', ...pr }));

  const ratingSummary = await productReviewSummary(p.id);

  const schemas: Schema[] = [
    {
      id: 'schema-product',
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
        ...(propiedades.length ? { additionalProperty: propiedades } : {}),
        // Solo si hay reseñas reales (nunca un rating inventado): mismo
        // criterio que ProductDetailPage.tsx del lado React.
        ...(ratingSummary.count > 0
          ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: ratingSummary.avg, reviewCount: ratingSummary.count } }
          : {}),
      },
    },
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    ...(faq.length
      ? [
          {
            id: 'schema-faq',
            data: {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          },
        ]
      : []),
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
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-itemlist',
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
    `<p>Moldes de ropa profesionales para producción, aprobados con muestra, con curva de talles completa disponible. Categorías: dama, hombre, niña, niño, bebés y unisex. Formatos: ${FORMATOS_TXT}. Descarga digital inmediata, precios en pesos argentinos y en dólares.</p>`,
    secciones,
    `<p>Este listado es parcial: el catálogo completo tiene ${CATALOGO_TXT} con búsqueda por prenda, categoría, temporada y formato en <a href="${pageUrl}">${pageUrl}</a>. También hay <a href="${origin}/moldes-gratis">moldes gratis</a> para probar la calidad antes de comprar.</p>`,
  ]
    .filter(Boolean)
    .join('\n');

  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-itemlist',
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
    `Más de 2.000 moldes de ropa digitales para dama, hombre, niños y bebés. Curva de talles completa, en PDF A4, plotter y formatos CAD (DXF/AAMA, Optitex, Audaces). Descarga inmediata.`,
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
<p>Vendemos moldes de ropa digitales listos para producción: ${CATALOGO_TXT} aprobados con muestra real, con curva de talles industrial completa disponible en cada molde (los talles se eligen en la ficha). Más de 18 años en la industria textil argentina. Entrega por descarga digital a todo el mundo.</p>
<h2>Qué ofrecemos</h2>
<ul>
<li><a href="${o}/catalogo">Catálogo completo</a>: moldes de dama, hombre, niños y bebés en ${FORMATOS_TXT}.</li>
<li>Por categoría: <a href="${o}/catalogo?categoria=dama">dama</a>, <a href="${o}/catalogo?categoria=hombre">hombre</a>, <a href="${o}/catalogo?categoria=nina">niña</a>, <a href="${o}/catalogo?categoria=nino">niño</a>, <a href="${o}/catalogo?categoria=bebes">bebés</a>, <a href="${o}/catalogo?categoria=adultos-unisex">unisex adultos</a> y <a href="${o}/catalogo?categoria=ninos-unisex">unisex niños</a>.</li>
<li><a href="${o}/moldes-pdf">Moldes PDF para imprimir</a> en A4 o plotter, listos para producir.</li>
<li><a href="${o}/moldes-gratis">Moldes gratis</a> para probar la calidad antes de comprar.</li>
<li><a href="${o}/lab">Modeltex Lab</a>: curso gratis de moldería textil, desde fundamentos hasta producción industrial.</li>
<li><a href="${o}/diseno-a-pedido">Moldería a pedido</a>: desarrollamos tu molde a medida en el formato que uses.</li>
<li>Tizadas computarizadas (MRK) optimizadas al ancho de tu tela.</li>
<li><a href="${o}/guias">Guías para producción</a>: formatos de moldería, telas por prenda, curva de talles, tizadas, consumo de tela, costeo, plotter, uniformes y sublimación.</li>
</ul>
<p>Precios en pesos argentinos y en dólares para el exterior. Pagos con Mercado Pago, transferencia, PayPal y cripto. Se puede comprar con o sin cuenta. Más info en <a href="${o}/preguntas-frecuentes">preguntas frecuentes</a>, <a href="${o}/como-funciona">cómo funciona</a> y <a href="${o}/contacto">contacto</a> (WhatsApp ${WHATSAPP_DISPLAY}).</p>`,
  },
  '/moldes-pdf': {
    title: 'Moldes PDF para imprimir: listos para producir | Modeltex',
    description: 'Moldes de ropa en PDF para imprimir en A4 o plotter, listos para producir, con todos los talles y descarga inmediata. Para emprendedores, talleres y fabricantes.',
    body: (o) => `
<h1>Moldes PDF para imprimir, cortar y producir</h1>
<p>Moldes de ropa en PDF listos para imprimir: en hojas A4 (imprimís en casa y pegás siguiendo la guía numerada) o en PDF plotter (imprimís en ancho real en cualquier servicio de ploteo). Todos incluyen la curva completa de talles y control de medida para verificar la escala.</p>
<p><a href="${o}/catalogo">Ver el catálogo completo</a> (${CATALOGO_TXT}) — también disponibles en ${FORMATOS_TXT}.</p>
<h2>Moldes listos para imprimir: qué incluye cada archivo</h2>
<p>Un molde listo para imprimir no necesita ningún ajuste antes de usarse: las piezas ya vienen ordenadas a escala real, numeradas si es PDF A4, y con un cuadrado de control de medida para verificar con una regla que la impresión no perdió escala. Guías relacionadas: <a href="${o}/ayuda-impresion">ayuda para imprimir</a> y <a href="${o}/guias/impresion-de-moldes-en-plotter">cómo imprimir moldes en plotter para un taller</a>.</p>
<h2>Preguntas frecuentes sobre moldes PDF</h2>
<h3>¿Qué son los moldes en PDF?</h3>
<p>Son moldes de ropa digitales entregados en un archivo PDF, listos para imprimir y cortar: incluyen todas las piezas de la prenda a escala real, la curva de talles completa y un cuadrado de control para verificar que la impresión no perdió medida.</p>
<h3>¿Los moldes PDF ya están listos para imprimir?</h3>
<p>Sí: cada archivo se descarga, se imprime al 100% de escala y se corta, sin ningún paso de edición previo. En PDF A4 se pegan las hojas numeradas; en PDF plotter sale en una sola lámina de ancho real.</p>
<h3>¿Qué diferencia hay entre un molde PDF A4 y uno para plotter?</h3>
<p>El PDF A4 viene partido en hojas carta u oficio para imprimir en cualquier impresora casera y pegar siguiendo la numeración. El PDF plotter es la misma pieza completa en una sola lámina de 90, 120 o 150 cm de ancho, pensada para una gráfica de ploteo.</p>
<h3>¿Los moldes PDF incluyen todos los talles?</h3>
<p>Sí, cada molde PDF incluye la curva de talles completa (XS a 4XL en adultos, 2 a 18 en niños) ya escalada y aprobada con una muestra confeccionada.</p>
<h3>¿Puedo usar los moldes PDF para producir y vender ropa?</h3>
<p>Sí, la licencia es de uso productivo: podés confeccionar y vender las prendas hechas con el molde sin límite de unidades.</p>
<h3>¿Qué significa que un molde esté "listo para imprimir"?</h3>
<p>Que no hace falta ningún paso de edición ni ajuste antes de imprimirlo: el archivo ya viene con las piezas ordenadas, a escala real y con un cuadrado de control de medida. Solo hay que abrirlo, imprimirlo al 100% de escala y cortar.</p>
<h3>¿Dónde consigo moldes listos en PDF para imprimir hoy mismo?</h3>
<p>En el catálogo de Modeltex: elegís el molde, lo comprás y lo tenés disponible para descargar al momento (los marcados como "descarga rápida" se habilitan apenas se confirma el pago).</p>`,
    schemas: (o) => [
      {
        id: 'schema-collection',
        data: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Moldes PDF para imprimir y producir',
          url: `${o}/moldes-pdf`,
          description: 'Moldes de ropa en PDF para imprimir en A4 o plotter. Moldería digital profesional con descarga inmediata.',
        },
      },
      {
        id: 'schema-faq',
        data: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: '¿Qué son los moldes en PDF?',
              acceptedAnswer: { '@type': 'Answer', text: 'Son moldes de ropa digitales entregados en un archivo PDF, listos para imprimir y cortar: incluyen todas las piezas de la prenda a escala real, la curva de talles completa y un cuadrado de control para verificar que la impresión no perdió medida.' },
            },
            {
              '@type': 'Question',
              name: '¿Los moldes PDF ya están listos para imprimir?',
              acceptedAnswer: { '@type': 'Answer', text: 'Sí: cada archivo se descarga, se imprime al 100% de escala y se corta, sin ningún paso de edición previo. En PDF A4 se pegan las hojas numeradas; en PDF plotter sale en una sola lámina de ancho real.' },
            },
            {
              '@type': 'Question',
              name: '¿Qué diferencia hay entre un molde PDF A4 y uno para plotter?',
              acceptedAnswer: { '@type': 'Answer', text: 'El PDF A4 viene partido en hojas carta u oficio para imprimir en cualquier impresora casera y pegar siguiendo la numeración. El PDF plotter es la misma pieza completa en una sola lámina de 90, 120 o 150 cm de ancho, pensada para una gráfica de ploteo.' },
            },
            {
              '@type': 'Question',
              name: '¿Los moldes PDF incluyen todos los talles?',
              acceptedAnswer: { '@type': 'Answer', text: 'Sí, cada molde PDF incluye la curva de talles completa (XS a 4XL en adultos, 2 a 18 en niños) ya escalada y aprobada con una muestra confeccionada.' },
            },
            {
              '@type': 'Question',
              name: '¿Puedo usar los moldes PDF para producir y vender ropa?',
              acceptedAnswer: { '@type': 'Answer', text: 'Sí, la licencia es de uso productivo: podés confeccionar y vender las prendas hechas con el molde sin límite de unidades.' },
            },
            {
              '@type': 'Question',
              name: '¿Qué significa que un molde esté "listo para imprimir"?',
              acceptedAnswer: { '@type': 'Answer', text: 'Que no hace falta ningún paso de edición ni ajuste antes de imprimirlo: el archivo ya viene con las piezas ordenadas, a escala real y con un cuadrado de control de medida. Solo hay que abrirlo, imprimirlo al 100% de escala y cortar.' },
            },
            {
              '@type': 'Question',
              name: '¿Dónde consigo moldes listos en PDF para imprimir hoy mismo?',
              acceptedAnswer: { '@type': 'Answer', text: 'En el catálogo de Modeltex: elegís el molde, lo comprás y lo tenés disponible para descargar al momento (los marcados como "descarga rápida" se habilitan apenas se confirma el pago).' },
            },
          ],
        },
      },
      {
        id: 'schema-breadcrumb',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${o}/` },
            { '@type': 'ListItem', position: 2, name: 'Moldes PDF', item: `${o}/moldes-pdf` },
          ],
        },
      },
    ],
  },
  '/moldes-pdf-a4': {
    title: 'Moldes PDF A4 para imprimir en casa | Modeltex',
    description: 'Moldes de ropa en PDF A4: imprimí en tu impresora hogareña, pegá las hojas numeradas y cortá. Curva de talles completa.',
    body: (o) => `
<h1>Moldes PDF A4 — imprimí tus moldes en casa</h1>
<p>El formato ideal para emprendedores: imprimís el molde en hojas A4 comunes al 100% de escala, pegás siguiendo la numeración y obtenés el molde en tamaño real con todos sus talles. Cada archivo incluye cuadrado de control de medida.</p>
<p><a href="${o}/catalogo?formato=PDF%20A4">Ver moldes PDF A4 disponibles</a> · <a href="${o}/ayuda-impresion">Guía para imprimir sin perder escala</a></p>
<h2>Preguntas frecuentes</h2>
<h3>¿Qué necesito para imprimir un molde PDF A4?</h3>
<p>Solo una impresora casera u de oficina común, configurada al 100% de escala, y hojas A4 u oficio.</p>
<h3>¿Cómo se arma el molde después de imprimirlo?</h3>
<p>Cada hoja sale numerada: se pegan en orden hasta formar la pieza completa a tamaño real, verificando el cuadrado de control con una regla.</p>
<h3>¿El PDF A4 incluye todos los talles?</h3>
<p>Sí, la curva completa (XS a 4XL en adultos, 2 a 18 en niños) viene incluida en el archivo.</p>`,
    schemas: (o) => [
      { id: 'schema-breadcrumb', data: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: `${o}/` }, { '@type': 'ListItem', position: 2, name: 'Moldes PDF A4', item: `${o}/moldes-pdf-a4` }] } },
      { id: 'schema-collection', data: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Moldes PDF A4 para imprimir', url: `${o}/moldes-pdf-a4`, description: 'Moldes PDF A4 para imprimir en casa o en tu taller, con talles completos y descarga inmediata.' } },
      {
        id: 'schema-faq',
        data: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: '¿Qué necesito para imprimir un molde PDF A4?', acceptedAnswer: { '@type': 'Answer', text: 'Solo una impresora casera u de oficina común, configurada al 100% de escala, y hojas A4 u oficio.' } },
            { '@type': 'Question', name: '¿Cómo se arma el molde después de imprimirlo?', acceptedAnswer: { '@type': 'Answer', text: 'Cada hoja sale numerada: se pegan en orden hasta formar la pieza completa a tamaño real, verificando el cuadrado de control con una regla.' } },
            { '@type': 'Question', name: '¿El PDF A4 incluye todos los talles?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, la curva completa (XS a 4XL en adultos, 2 a 18 en niños) viene incluida en el archivo.' } },
          ],
        },
      },
    ],
  },
  '/moldes-para-plotter': {
    title: 'Moldes para plotter en ancho real | Modeltex',
    description: 'Moldes de ropa en PDF plotter para imprimir en ancho real (90 a 150 cm). Curva de talles completa, listos para taller y producción.',
    body: (o) => `
<h1>Moldes para plotter — impresión en ancho real</h1>
<p>PDF preparados para plotter textil en anchos de 90, 120 o 150 cm según el molde: llevás el archivo a cualquier servicio de ploteo e imprimís el molde completo sin pegar hojas. La opción más usada por talleres y fábricas que cortan a mano.</p>
<p><a href="${o}/catalogo?formato=PDF%20Plotter">Ver moldes para plotter</a> — ¿cortás en CAD? Pedilos en DXF/AAMA, Optitex o Audaces.</p>
<h2>Preguntas frecuentes</h2>
<h3>¿En qué anchos vienen los moldes para plotter?</h3>
<p>En 90, 120 o 150 cm según el molde — la ficha de cada producto indica el ancho exacto.</p>
<h3>¿Dónde imprimo un molde PDF plotter?</h3>
<p>En cualquier gráfica o servicio de ploteo textil, al 100% de escala, en una sola lámina.</p>
<h3>¿Puedo pedir el mismo molde en DXF/AAMA?</h3>
<p>Sí, si cortás con un sistema CAD el molde también está disponible en DXF/AAMA con la curva completa.</p>`,
    schemas: (o) => [
      { id: 'schema-breadcrumb', data: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: `${o}/` }, { '@type': 'ListItem', position: 2, name: 'Moldes para plotter', item: `${o}/moldes-para-plotter` }] } },
      { id: 'schema-collection', data: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Moldes para plotter y producción textil', url: `${o}/moldes-para-plotter`, description: 'Moldes para plotter en PDF listos para imprimir en rollo, para talleres, gráficas y producción textil.' } },
      {
        id: 'schema-faq',
        data: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: '¿En qué anchos vienen los moldes para plotter?', acceptedAnswer: { '@type': 'Answer', text: 'En 90, 120 o 150 cm según el molde — la ficha de cada producto indica el ancho exacto.' } },
            { '@type': 'Question', name: '¿Dónde imprimo un molde PDF plotter?', acceptedAnswer: { '@type': 'Answer', text: 'En cualquier gráfica o servicio de ploteo textil, al 100% de escala, en una sola lámina.' } },
            { '@type': 'Question', name: '¿Puedo pedir el mismo molde en DXF/AAMA?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, si cortás con un sistema CAD el molde también está disponible en DXF/AAMA con la curva completa.' } },
          ],
        },
      },
    ],
  },
  '/moldes-para-emprendedores': {
    title: 'Moldes de ropa para emprendedores | Modeltex',
    description: 'Moldes digitales probados con muestra para arrancar tu marca de ropa: todos los talles, descarga inmediata y soporte por WhatsApp.',
    body: (o) => `
<h1>Moldes de ropa para emprendedores</h1>
<p>Moldes digitales ya probados con muestra confeccionada, con la curva de talles completa incluida: la base para producir tu primera tanda sin desarrollar moldería desde cero. Descargás, imprimís (A4 o plotter) y cortás. Soporte directo por WhatsApp si te trabás.</p>
<p><a href="${o}/moldes-gratis">Probá primero un molde gratis</a> · <a href="${o}/catalogo">Ver catálogo</a></p>
<h2>Preguntas frecuentes</h2>
<h3>¿Qué moldes convienen para arrancar una marca de ropa?</h3>
<p>Moldes ya aprobados con muestra confeccionada y con la curva de talles completa, para evitar el desarrollo desde cero.</p>
<h3>¿Necesito plotter para empezar a producir?</h3>
<p>No, para una primera tanda alcanza con PDF A4; el plotter conviene más adelante, cuando el volumen crece.</p>`,
    schemas: (o) => [
      { id: 'schema-breadcrumb', data: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: `${o}/` }, { '@type': 'ListItem', position: 2, name: 'Moldes para emprendedores', item: `${o}/moldes-para-emprendedores` }] } },
      { id: 'schema-collection', data: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Moldes para emprendedores de indumentaria', url: `${o}/moldes-para-emprendedores`, description: 'Moldes para emprendedores que quieren lanzar o crecer una marca de ropa, con talles listos para producir.' } },
      {
        id: 'schema-faq',
        data: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: '¿Qué moldes convienen para arrancar una marca de ropa?', acceptedAnswer: { '@type': 'Answer', text: 'Moldes ya aprobados con muestra confeccionada y con la curva de talles completa, para evitar el desarrollo desde cero.' } },
            { '@type': 'Question', name: '¿Necesito plotter para empezar a producir?', acceptedAnswer: { '@type': 'Answer', text: 'No, para una primera tanda alcanza con PDF A4; el plotter conviene más adelante, cuando el volumen crece.' } },
          ],
        },
      },
    ],
  },
  '/moldes-gratis': {
    title: 'Moldes gratis en PDF para descargar e imprimir | Modeltex',
    description: 'Moldes de ropa gratis para descargar en PDF, listos para imprimir. Moldería gratis real, mismo nivel de calidad que el catálogo pago de Modeltex.',
    body: (o) => `
<h1>Moldes gratis — probá la calidad antes de comprar</h1>
<p>Publicamos moldes reales de nuestro catálogo para descarga gratuita, en PDF listos para imprimir: el mismo nivel de terminación, talles y prolijidad que los moldes pagos. Descargalos, imprimilos y comprobá cómo trabajamos antes de hacer tu primera compra.</p>
<p><a href="${o}/moldes-gratis">Entrá a la sección Moldes Gratis</a> (algunos se descargan sin cuenta; otros pidiendo una cuenta gratuita).</p>
<h2>Preguntas frecuentes sobre moldes gratis</h2>
<h3>¿Los moldes gratis son moldes reales o solo de muestra?</h3>
<p>Son moldes reales de nuestro catálogo, no versiones recortadas ni de muestra: mismo nivel de terminación, talles y prolijidad que los moldes pagos.</p>
<h3>¿Cómo descargo un molde gratis para imprimir?</h3>
<p>Entrás a la sección Moldes Gratis, elegís el que te interesa y lo descargás: algunos se bajan sin necesidad de cuenta, otros piden crear una cuenta gratuita en Modeltex. En los dos casos la descarga es inmediata.</p>
<h3>¿Los moldes gratis vienen en PDF listos para imprimir?</h3>
<p>Sí, se entregan en PDF, listos para imprimir en A4 o plotter según el molde, con el mismo cuadrado de control de medida que traen los moldes pagos.</p>
<h3>¿Cada cuánto suben moldes nuevos gratis para descargar?</h3>
<p>Sumamos moldes gratuitos nuevos de forma periódica, en general cada semana.</p>
<h3>¿Puedo usar un molde gratis para producir y vender ropa?</h3>
<p>Sí, tiene la misma licencia de uso productivo que los moldes pagos: podés confeccionar y vender las prendas sin límite de unidades.</p>
<h3>¿Qué diferencia hay entre los moldes gratis y los moldes pagos?</h3>
<p>Ninguna en calidad: la diferencia es que el catálogo gratis es una selección chica y rotativa, mientras que el catálogo completo tiene más de 2.000 moldes con curva de talles completa.</p>
<h3>¿Los moldes gratis en PDF son moldes completos o solo una parte?</h3>
<p>Son el molde completo, con todas sus piezas y su curva de talles, igual que un molde pago: no es una versión parcial ni un recorte del archivo.</p>
<h3>¿Cómo descargo moldes gratis para imprimir sin pagar nada?</h3>
<p>Entrás a la sección Moldes Gratis, elegís uno de la selección gratuita y lo descargás: no se pide ningún dato de pago, algunos sin necesidad de cuenta y otros pidiendo una cuenta gratuita de Modeltex.</p>`,
    schemas: (o) => [
      {
        id: 'schema-collection',
        data: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Moldes gratis para descargar',
          url: `${o}/moldes-gratis`,
          description: 'Moldes de ropa gratis para descargar en PDF, listos para imprimir. Mismo nivel de calidad que el catálogo pago de Modeltex.',
        },
      },
      {
        id: 'schema-faq',
        data: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: '¿Los moldes gratis son moldes reales o solo de muestra?',
              acceptedAnswer: { '@type': 'Answer', text: 'Son moldes reales de nuestro catálogo, no versiones recortadas ni de muestra: mismo nivel de terminación, talles y prolijidad que los moldes pagos.' },
            },
            {
              '@type': 'Question',
              name: '¿Cómo descargo un molde gratis para imprimir?',
              acceptedAnswer: { '@type': 'Answer', text: 'Entrás a la sección Moldes Gratis, elegís el que te interesa y lo descargás: algunos se bajan sin necesidad de cuenta, otros piden crear una cuenta gratuita en Modeltex. En los dos casos la descarga es inmediata.' },
            },
            {
              '@type': 'Question',
              name: '¿Los moldes gratis vienen en PDF listos para imprimir?',
              acceptedAnswer: { '@type': 'Answer', text: 'Sí, se entregan en PDF, listos para imprimir en A4 o plotter según el molde, con el mismo cuadrado de control de medida que traen los moldes pagos.' },
            },
            {
              '@type': 'Question',
              name: '¿Cada cuánto suben moldes nuevos gratis para descargar?',
              acceptedAnswer: { '@type': 'Answer', text: 'Sumamos moldes gratuitos nuevos de forma periódica, en general cada semana.' },
            },
            {
              '@type': 'Question',
              name: '¿Puedo usar un molde gratis para producir y vender ropa?',
              acceptedAnswer: { '@type': 'Answer', text: 'Sí, tiene la misma licencia de uso productivo que los moldes pagos: podés confeccionar y vender las prendas sin límite de unidades.' },
            },
            {
              '@type': 'Question',
              name: '¿Qué diferencia hay entre los moldes gratis y los moldes pagos?',
              acceptedAnswer: { '@type': 'Answer', text: 'Ninguna en calidad: la diferencia es que el catálogo gratis es una selección chica y rotativa, mientras que el catálogo completo tiene más de 2.000 moldes con curva de talles completa.' },
            },
            {
              '@type': 'Question',
              name: '¿Los moldes gratis en PDF son moldes completos o solo una parte?',
              acceptedAnswer: { '@type': 'Answer', text: 'Son el molde completo, con todas sus piezas y su curva de talles, igual que un molde pago: no es una versión parcial ni un recorte del archivo.' },
            },
            {
              '@type': 'Question',
              name: '¿Cómo descargo moldes gratis para imprimir sin pagar nada?',
              acceptedAnswer: { '@type': 'Answer', text: 'Entrás a la sección Moldes Gratis, elegís uno de la selección gratuita y lo descargás: no se pide ningún dato de pago, algunos sin necesidad de cuenta y otros pidiendo una cuenta gratuita de Modeltex.' },
            },
          ],
        },
      },
      {
        id: 'schema-breadcrumb',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${o}/` },
            { '@type': 'ListItem', position: 2, name: 'Moldes gratis', item: `${o}/moldes-gratis` },
          ],
        },
      },
    ],
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
    body: (o) =>
      breadcrumbHtml([{ name: 'Inicio', url: `${o}/` }, { name: 'Preguntas frecuentes', url: `${o}/preguntas-frecuentes` }]) +
      `\n<h1>Preguntas frecuentes — moldes digitales Modeltex</h1>\n` +
      FAQ_ITEMS.map((f) => `<h2>${escapeHtml(f.q)}</h2>\n<p>${escapeHtml(f.a)}</p>`).join('\n'),
    schemas: (o) => [
      {
        id: 'schema-faq',
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
      {
        id: 'schema-breadcrumb',
        data: breadcrumb([{ name: 'Inicio', url: `${o}/` }, { name: 'Preguntas frecuentes', url: `${o}/preguntas-frecuentes` }]),
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
<li>Facebook: <a href="https://www.facebook.com/modeltex.ar">facebook.com/modeltex.ar</a></li>
<li>Formulario de contacto en <a href="${o}/contacto">${o}/contacto</a></li>
<li>Horario de atención: lunes a sábado, 9 a 18 hs (Argentina)</li>
<li>Ubicación: Argentina — envíos digitales a todo el mundo</li>
</ul>
<p>Antes de escribir, quizás tu duda ya esté respondida en las <a href="${o}/preguntas-frecuentes">preguntas frecuentes</a> o en la <a href="${o}/ayuda-impresion">ayuda de impresión</a>.</p>`,
    schemas: (o) => [
      {
        id: 'schema-contactpage',
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

// ---------- Guias para produccion ----------

function guiasIndexPage(html: string, origin: string) {
  const pageUrl = `${origin}/guias`;
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Guías', url: pageUrl },
  ];
  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(GUIAS_TITLE)}</h1>`,
    `<p>${escapeHtml(GUIAS_DESCRIPTION)}</p>`,
    `<ul>${GUIAS.map(
      (g) => `<li><a href="${origin}/guias/${g.slug}">${escapeHtml(g.title)}</a>: ${escapeHtml(g.description)}</li>`,
    ).join('')}</ul>`,
    `<p>Los moldes de ${SITE_NAME} para aplicar estas guías están en el <a href="${origin}/catalogo">catálogo completo</a> (${CATALOGO_TXT}).</p>`,
  ].join('\n');
  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-collection',
      data: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: GUIAS_TITLE,
        description: GUIAS_DESCRIPTION,
        url: pageUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: GUIAS.map((g, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: g.title,
            url: `${origin}/guias/${g.slug}`,
          })),
        },
      },
    },
  ];
  html = setHeadSeo(html, `${GUIAS_TITLE} | ${SITE_NAME}`, GUIAS_DESCRIPTION, pageUrl);
  return injectBody(html, inner, schemas);
}

function guiaPage(html: string, origin: string, g: Guia) {
  const pageUrl = `${origin}/guias/${g.slug}`;
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Guías', url: `${origin}/guias` },
    { name: g.title, url: pageUrl },
  ];
  const secciones = g.sections
    .map(
      (s) =>
        `<h2>${escapeHtml(s.h2)}</h2>` +
        s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('') +
        (s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''),
    )
    .join('\n');
  const otras = getRelatedGuias(g.slug, 6);
  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(g.title)}</h1>`,
    `<p>${escapeHtml(g.intro)}</p>`,
    `<p>Guía para producción de ${SITE_NAME}. Actualizada el ${escapeHtml(g.updated)}.</p>`,
    secciones,
    g.faqs.length ? `<h2>Preguntas frecuentes</h2>` + g.faqs.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('') : '',
    g.related.length
      ? `<h2>Relacionado</h2><ul>${g.related.map((r) => `<li><a href="${origin}${r.to}">${escapeHtml(r.label)}</a></li>`).join('')}</ul>`
      : '',
    `<h2>Más guías</h2><ul>${otras.map((x) => `<li><a href="${origin}/guias/${x.slug}">${escapeHtml(x.title)}</a></li>`).join('')}</ul>`,
    `<p>Moldes listos para producir, con curva de talles completa, en el <a href="${origin}/catalogo">catálogo de ${SITE_NAME}</a>.</p>`,
  ]
    .filter(Boolean)
    .join('\n');
  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-article',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: g.title,
        description: g.description,
        image: `${origin}/brand/og-image.png`,
        inLanguage: 'es-AR',
        datePublished: g.updated,
        dateModified: g.updated,
        keywords: g.keywords.join(', '),
        mainEntityOfPage: pageUrl,
        author: getArticleAuthor(),
        publisher: { '@type': 'Organization', name: SITE_NAME, url: `${origin}/`, logo: { '@type': 'ImageObject', url: `${origin}/brand/modeltex-logo-full.png` } },
      },
    },
    ...(g.faqs.length
      ? [
          {
            id: 'schema-faq',
            data: {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: g.faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          },
        ]
      : []),
  ];
  html = setHeadSeo(html, `${g.seoTitle} | ${SITE_NAME}`, g.description, pageUrl);
  html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`);
  return injectBody(html, inner, schemas);
}

// ---------- MODELTEX LAB (curso gratis de moldería textil) ----------
// Contenido dinámico (Supabase, no código estático como las guías), por eso
// se trae por REST igual que los productos, con un fetch genérico por tabla.

async function sb<T>(table: string, query: string): Promise<T[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: { apikey: SUPABASE_ANON_KEY } });
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? (rows as T[]) : [];
  } catch {
    return [];
  }
}

interface LabCourseRow {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  objectives?: string[] | null;
  order_index?: number | null;
}
interface LabModuleRow {
  id: string;
  course_id: string;
  slug: string;
  level_label?: string | null;
  title: string;
  description?: string | null;
  order_index?: number | null;
}
interface LabLessonRow {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  objective?: string | null;
  before_start?: string | null;
  concept?: string | null;
  development?: { h3?: string; paragraphs?: string[]; bullets?: string[] }[] | null;
  steps?: string[] | null;
  example?: string | null;
  common_mistakes?: { mistake: string; fix: string }[] | null;
  modeltex_tip?: string | null;
  exercise_instructions?: string | null;
  faqs?: { q: string; a: string }[] | null;
  summary?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}
interface LabGlossaryRow {
  slug: string;
  term: string;
  short_definition?: string | null;
  explanation?: string | null;
  example?: string | null;
}

const LAB_TITLE = 'MODELTEX LAB — Curso Gratis de Moldería Textil';
const LAB_DESCRIPTION =
  'Aprendé moldería textil gratis, desde cero hasta producción profesional: clases gratuitas, moldes para practicar y una IA especializada que te acompaña durante todo el curso.';

async function labIndexPage(html: string, origin: string) {
  const pageUrl = `${origin}/lab`;
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Modeltex Lab', url: pageUrl },
  ];
  const courses = await sb<LabCourseRow>(
    'lab_courses',
    'select=slug,title,subtitle,description&status=eq.published&order=order_index.asc',
  );
  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(LAB_TITLE)}</h1>`,
    `<p>${escapeHtml(LAB_DESCRIPTION)}</p>`,
    courses.length
      ? `<ul>${courses
          .map(
            (c) =>
              `<li><a href="${origin}/lab/${c.slug}">${escapeHtml(c.title)}</a>${
                c.subtitle ? `: ${escapeHtml(c.subtitle)}` : ''
              }</li>`,
          )
          .join('')}</ul>`
      : '<p>Estamos preparando el contenido del curso.</p>',
    `<p>También disponible: <a href="${origin}/lab/glosario">glosario de moldería</a> y la <a href="${origin}/lab/ia">IA de Modeltex Lab</a>.</p>`,
    `<p>Los moldes de ${SITE_NAME} para practicar están en <a href="${origin}/moldes-gratis">Moldes Gratis</a>.</p>`,
  ].join('\n');
  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-collection',
      data: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: LAB_TITLE,
        description: LAB_DESCRIPTION,
        url: pageUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: courses.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.title,
            url: `${origin}/lab/${c.slug}`,
          })),
        },
      },
    },
  ];
  html = setHeadSeo(html, `${LAB_TITLE} | ${SITE_NAME}`, LAB_DESCRIPTION, pageUrl);
  return injectBody(html, inner, schemas);
}

async function labCoursePage(html: string, origin: string, course: LabCourseRow) {
  const pageUrl = `${origin}/lab/${course.slug}`;
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Modeltex Lab', url: `${origin}/lab` },
    { name: course.title, url: pageUrl },
  ];
  const modules = await sb<LabModuleRow>(
    'lab_modules',
    `select=id,course_id,slug,level_label,title,description,order_index&course_id=eq.${course.id}&status=eq.published&order=level_order.asc,order_index.asc`,
  );
  const moduleIds = modules.map((m) => m.id);
  const lessons = moduleIds.length
    ? await sb<LabLessonRow>(
        'lab_lessons',
        `select=module_id,slug,title&module_id=in.(${moduleIds.join(',')})&status=eq.published&order=order_index.asc`,
      )
    : [];
  const lessonsByModule = new Map<string, LabLessonRow[]>();
  for (const l of lessons) lessonsByModule.set(l.module_id, [...(lessonsByModule.get(l.module_id) || []), l]);

  const description = course.description || course.subtitle || LAB_DESCRIPTION;
  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(course.title)}</h1>`,
    course.subtitle ? `<p>${escapeHtml(course.subtitle)}</p>` : '',
    course.description ? `<p>${escapeHtml(course.description)}</p>` : '',
    course.objectives?.length
      ? `<h2>Qué vas a aprender</h2><ul>${course.objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ul>`
      : '',
    ...modules.map((m) => {
      const mLessons = lessonsByModule.get(m.id) || [];
      return [
        `<h2>${m.level_label ? `${escapeHtml(m.level_label)} — ` : ''}${escapeHtml(m.title)}</h2>`,
        m.description ? `<p>${escapeHtml(m.description)}</p>` : '',
        mLessons.length
          ? `<ul>${mLessons.map((l) => `<li><a href="${origin}/lab/${course.slug}/${m.slug}/${l.slug}">${escapeHtml(l.title)}</a></li>`).join('')}</ul>`
          : '',
      ].join('\n');
    }),
    `<p>Consultá dudas en la <a href="${origin}/lab/ia">IA de Modeltex Lab</a>.</p>`,
  ]
    .filter(Boolean)
    .join('\n');

  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-course',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description,
        url: pageUrl,
        isAccessibleForFree: true,
        inLanguage: 'es-AR',
        provider: { '@type': 'Organization', name: SITE_NAME, url: `${origin}/`, sameAs: ['https://www.facebook.com/modeltex.ar', 'https://t.me/+5491166531086'] },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS', category: 'Free' },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: course.estimated_duration || undefined },
      },
    },
  ];
  html = setHeadSeo(html, `${course.title} — Curso gratis | ${SITE_NAME}`, cortar(description, 160), pageUrl);
  html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`);
  return injectBody(html, inner, schemas);
}

function labDevToHtml(dev: LabLessonRow['development']) {
  return (dev || [])
    .map(
      (b) =>
        (b.h3 ? `<h3>${escapeHtml(b.h3)}</h3>` : '') +
        (b.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('') +
        (b.bullets?.length ? `<ul>${b.bullets.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''),
    )
    .join('\n');
}

async function labLessonPage(
  html: string,
  origin: string,
  course: LabCourseRow,
  moduleItem: LabModuleRow,
  lesson: LabLessonRow,
) {
  const pageUrl = `${origin}/lab/${course.slug}/${moduleItem.slug}/${lesson.slug}`;
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Modeltex Lab', url: `${origin}/lab` },
    { name: course.title, url: `${origin}/lab/${course.slug}` },
    { name: lesson.title, url: pageUrl },
  ];
  const description = cortar(lesson.objective || lesson.summary || lesson.concept || LAB_DESCRIPTION, 160);
  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(lesson.title)}</h1>`,
    lesson.objective ? `<h2>Qué vas a aprender</h2><p>${escapeHtml(lesson.objective)}</p>` : '',
    lesson.before_start ? `<h2>Antes de empezar</h2><p>${escapeHtml(lesson.before_start)}</p>` : '',
    lesson.concept ? `<h2>Concepto</h2><p>${escapeHtml(lesson.concept)}</p>` : '',
    lesson.development?.length ? `<h2>Desarrollo</h2>${labDevToHtml(lesson.development)}` : '',
    lesson.steps?.length
      ? `<h2>Paso a paso</h2><ol>${lesson.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`
      : '',
    lesson.example ? `<h2>Ejemplo práctico</h2><p>${escapeHtml(lesson.example)}</p>` : '',
    lesson.common_mistakes?.length
      ? `<h2>Errores frecuentes</h2>${lesson.common_mistakes.map((m) => `<p><strong>${escapeHtml(m.mistake)}</strong>: ${escapeHtml(m.fix)}</p>`).join('')}`
      : '',
    lesson.modeltex_tip ? `<h2>Consejo Modeltex</h2><p>${escapeHtml(lesson.modeltex_tip)}</p>` : '',
    lesson.exercise_instructions ? `<h2>Ejercicio</h2><p>${escapeHtml(lesson.exercise_instructions)}</p>` : '',
    lesson.faqs?.length
      ? `<h2>Preguntas frecuentes</h2>${lesson.faqs.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('')}`
      : '',
    lesson.summary ? `<h2>Resumen</h2><p>${escapeHtml(lesson.summary)}</p>` : '',
    `<p>Volvé al <a href="${origin}/lab/${course.slug}">curso completo</a> o preguntá en la <a href="${origin}/lab/ia">IA de Modeltex Lab</a>.</p>`,
  ]
    .filter(Boolean)
    .join('\n');

  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-article',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: lesson.title,
        description,
        image: `${origin}/brand/og-image.png`,
        inLanguage: 'es-AR',
        datePublished: lesson.created_at,
        dateModified: lesson.updated_at,
        mainEntityOfPage: pageUrl,
        isAccessibleForFree: true,
        author: getArticleAuthor(),
        publisher: { '@type': 'Organization', name: SITE_NAME, url: `${origin}/`, logo: { '@type': 'ImageObject', url: `${origin}/brand/modeltex-logo-full.png` } },
      },
    },
    ...(lesson.faqs?.length
      ? [
          {
            id: 'schema-faq',
            data: {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: lesson.faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          },
        ]
      : []),
    ...(lesson.steps?.length >= 2
      ? [
          {
            id: 'schema-howto',
            data: {
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: lesson.title,
              description,
              step: lesson.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
            },
          },
        ]
      : []),
  ];
  html = setHeadSeo(html, `${lesson.title} — ${course.title} | ${SITE_NAME}`, description, pageUrl);
  html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`);
  return injectBody(html, inner, schemas);
}

async function labGlossaryIndexPage(html: string, origin: string) {
  const pageUrl = `${origin}/lab/glosario`;
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Modeltex Lab', url: `${origin}/lab` },
    { name: 'Glosario', url: pageUrl },
  ];
  const terms = await sb<LabGlossaryRow>(
    'lab_glossary_terms',
    'select=slug,term,short_definition&status=eq.published&order=order_index.asc',
  );
  const description = 'Glosario con los términos más usados de moldería textil: holgura, piquetes, tiro, tizada y más.';
  const inner = [
    breadcrumbHtml(migas),
    `<h1>Glosario de moldería</h1>`,
    `<p>${escapeHtml(description)}</p>`,
    `<ul>${terms.map((t) => `<li><a href="${origin}/lab/glosario/${t.slug}">${escapeHtml(t.term)}</a>${t.short_definition ? `: ${escapeHtml(t.short_definition)}` : ''}</li>`).join('')}</ul>`,
  ].join('\n');
  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-collection',
      data: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Glosario de moldería',
        description,
        url: pageUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: terms.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.term, url: `${origin}/lab/glosario/${t.slug}` })),
        },
      },
    },
  ];
  html = setHeadSeo(html, `Glosario de moldería | ${SITE_NAME}`, description, pageUrl);
  return injectBody(html, inner, schemas);
}

async function labGlossaryTermPage(html: string, origin: string, term: LabGlossaryRow) {
  const pageUrl = `${origin}/lab/glosario/${term.slug}`;
  const migas = [
    { name: 'Inicio', url: `${origin}/` },
    { name: 'Modeltex Lab', url: `${origin}/lab` },
    { name: 'Glosario', url: `${origin}/lab/glosario` },
    { name: term.term, url: pageUrl },
  ];
  const description = cortar(term.short_definition || term.explanation || term.term, 160);
  const inner = [
    breadcrumbHtml(migas),
    `<h1>${escapeHtml(term.term)}</h1>`,
    term.short_definition ? `<p><strong>${escapeHtml(term.short_definition)}</strong></p>` : '',
    term.explanation ? `<p>${escapeHtml(term.explanation)}</p>` : '',
    term.example ? `<h2>Ejemplo</h2><p>${escapeHtml(term.example)}</p>` : '',
    `<p><a href="${origin}/lab/glosario">Ver todo el glosario</a>.</p>`,
  ]
    .filter(Boolean)
    .join('\n');
  const schemas: Schema[] = [
    { id: 'schema-breadcrumb', data: breadcrumb(migas) },
    {
      id: 'schema-definedterm',
      data: {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: term.term,
        description: term.short_definition || term.explanation,
        inDefinedTermSet: `${origin}/lab/glosario`,
      },
    },
  ];
  html = setHeadSeo(html, `${term.term} — Glosario de moldería | ${SITE_NAME}`, description, pageUrl);
  return injectBody(html, inner, schemas);
}

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

      const newSlug = SLUG_REDIRECTS[slug];
      if (newSlug) return Response.redirect(`${url.origin}/producto/${newSlug}`, 301);

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
      const { inner, schemas } = await productBody(product, pageUrl, url.origin);
      return respond(injectBody(html, inner, schemas));
    }

    // ---------- Guias para produccion ----------
    if (path === '/guias' || path.startsWith('/guias/')) {
      const htmlRes = await fetch(`${url.origin}/index.html`);
      let html = await htmlRes.text();
      if (path === '/guias') return respond(guiasIndexPage(html, url.origin));
      const slug = decodeURIComponent(path.replace(/^\/guias\//, ''));
      const g = GUIAS.find((x) => x.slug === slug);
      if (!g) {
        html = setHeadSeo(html, `Guía no encontrada | ${SITE_NAME}`, GUIAS_DESCRIPTION, `${url.origin}/guias`);
        html = setRobots(html, 'noindex, follow');
        html = injectBody(html, `<h1>Guía no encontrada</h1>\n<p><a href="${url.origin}/guias">Ver todas las guías para producción</a>.</p>`);
        return respond(html, 404);
      }
      return respond(guiaPage(html, url.origin, g));
    }


    // ---------- MODELTEX LAB ----------
    if (path === '/lab' || path.startsWith('/lab/')) {
      const segments = path.replace(/^\/lab\/?/, '').split('/').filter(Boolean);
      const htmlRes = await fetch(`${url.origin}/index.html`);
      let html = await htmlRes.text();

      if (segments.length === 0) return respond(await labIndexPage(html, url.origin));

      // /lab/ia no se prerenderiza: es un chat interactivo, cada conversación
      // es distinta y no hay una respuesta canónica que valga la pena indexar
      // en esta URL (a diferencia de /ia-textil, que sí tiene contenido
      // estático propio en STATIC_PAGES). El .tsx (src/pages/LabAiPage.tsx)
      // ademas pone noindex explicito por si un bot ejecuta JavaScript.
      if (segments[0] === 'ia') return next();

      if (segments[0] === 'glosario') {
        if (segments.length === 1) return respond(await labGlossaryIndexPage(html, url.origin));
        const slug = decodeURIComponent(segments[1]);
        const [term] = await sb<LabGlossaryRow>(
          'lab_glossary_terms',
          `select=slug,term,short_definition,explanation,example&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
        );
        if (!term) {
          html = setHeadSeo(html, `Término no encontrado | ${SITE_NAME}`, LAB_DESCRIPTION, `${url.origin}/lab/glosario`);
          html = setRobots(html, 'noindex, follow');
          html = injectBody(html, `<h1>Término no encontrado</h1>\n<p><a href="${url.origin}/lab/glosario">Ver el glosario completo</a>.</p>`);
          return respond(html, 404);
        }
        return respond(await labGlossaryTermPage(html, url.origin, term));
      }

      const cursoSlug = decodeURIComponent(segments[0]);
      const [course] = await sb<LabCourseRow>(
        'lab_courses',
        `select=id,slug,title,subtitle,description,objectives&slug=eq.${encodeURIComponent(cursoSlug)}&status=eq.published&limit=1`,
      );
      if (!course) {
        html = setHeadSeo(html, `Curso no encontrado | ${SITE_NAME}`, LAB_DESCRIPTION, `${url.origin}/lab`);
        html = setRobots(html, 'noindex, follow');
        html = injectBody(html, `<h1>Curso no encontrado</h1>\n<p><a href="${url.origin}/lab">Ver Modeltex Lab</a>.</p>`);
        return respond(html, 404);
      }

      if (segments.length === 1) return respond(await labCoursePage(html, url.origin, course));

      if (segments.length === 3) {
        const moduloSlug = decodeURIComponent(segments[1]);
        const claseSlug = decodeURIComponent(segments[2]);
        const [moduleItem] = await sb<LabModuleRow>(
          'lab_modules',
          `select=id,course_id,slug,level_label,title,description&course_id=eq.${course.id}&slug=eq.${encodeURIComponent(moduloSlug)}&status=eq.published&limit=1`,
        );
        const [lesson] = moduleItem
          ? await sb<LabLessonRow>(
              'lab_lessons',
              `select=module_id,slug,title,objective,before_start,concept,development,steps,example,common_mistakes,modeltex_tip,exercise_instructions,faqs,summary,created_at,updated_at&module_id=eq.${moduleItem.id}&slug=eq.${encodeURIComponent(claseSlug)}&status=eq.published&limit=1`,
            )
          : [];
        if (!moduleItem || !lesson) {
          html = setHeadSeo(html, `Clase no encontrada | ${SITE_NAME}`, LAB_DESCRIPTION, `${url.origin}/lab/${course.slug}`);
          html = setRobots(html, 'noindex, follow');
          html = injectBody(html, `<h1>Clase no encontrada</h1>\n<p><a href="${url.origin}/lab/${course.slug}">Ver el curso completo</a>.</p>`);
          return respond(html, 404);
        }
        return respond(await labLessonPage(html, url.origin, course, moduleItem, lesson));
      }

      return next();
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
