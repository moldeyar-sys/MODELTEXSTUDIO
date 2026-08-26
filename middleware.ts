// Sirve HTML con contenido REAL a los robots (redes sociales, buscadores y
// asistentes de IA como ChatGPT/Claude/Perplexity). Los usuarios reales nunca
// pasan por aca: siguen de largo hacia la SPA de siempre. Esto existe porque
// el sitio es una SPA (Vite/React) y la mayoria de esos robots no ejecutan
// JavaScript: sin esto verian un <body> vacio en TODAS las paginas y las IA
// no podrian leer (ni recomendar) ni un solo producto.

import { FAQ_ITEMS } from './src/lib/faqData';

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
  ],
};

// Sociales + buscadores + crawlers de IA (AEO): si no estan aca, ven la SPA vacia.
const BOT_UA =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|vkShare|redditbot|Applebot|SkypeUriPreview|Snapchat|W3C_Validator|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|CCBot|Bingbot|bingbot|Googlebot|Google-Extended|GoogleOther|Amazonbot|meta-externalagent|Bytespider|DuckAssistBot|DuckDuckBot|YouBot|cohere-ai|MistralAI-User|Yandex|Baiduspider/i;

// Mismas claves publicas que src/lib/supabase.ts (la "anon key" esta pensada
// para vivir en el cliente; la seguridad la dan las policies RLS de la tabla).
const SUPABASE_URL = 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const SITE_NAME = 'Modeltex';
const DEFAULT_IMAGE = 'https://modeltex.com.ar/brand/og-image.png';

const FORMATOS_TXT =
  'PDF A4, PDF plotter, DXF/AAMA, PDS (Optitex), MRK (tizadas), ADS (Audaces), PLT, CDR y sublimación';

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
  html = html
    .replace(/<title>.*?<\/title>/s, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${pageUrl}$2`);
  html = replaceAttr(html, 'property="og:title" ', t);
  html = replaceAttr(html, 'property="og:description" ', d);
  html = replaceAttr(html, 'property="og:url" ', pageUrl);
  html = replaceAttr(html, 'name="twitter:title" ', t);
  html = replaceAttr(html, 'name="twitter:description" ', d);
  return html;
}

// El contenido para robots va despues del div de la app: los usuarios reales
// nunca reciben este HTML, y aunque lo recibieran React monta en #root y esto
// queda simplemente debajo.
function injectBody(html: string, inner: string, jsonLd?: Array<Record<string, unknown>>) {
  const schemas = jsonLd?.length
    ? jsonLd.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')
    : '';
  if (schemas) html = html.replace('</head>', `${schemas}\n</head>`);
  return html.replace(
    /(<div id="root"><\/div>)/,
    `$1\n<main data-bot-content>\n${inner}\n</main>`,
  );
}

function respond(html: string) {
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}

interface ProductRow {
  name: string;
  slug: string;
  codigo?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  main_image_url?: string | null;
  category?: string | null;
  garment_type?: string | null;
  sizes?: string[] | null;
  formats?: string[] | null;
  recommended_fabrics?: string[] | null;
  price?: number | null;
  precio_carton?: number | null;
  precio_pdf_a4?: number | null;
  precio_pdf_ploter?: number | null;
  precio_usd_pdf_a4?: number | null;
  entrega_inmediata?: boolean | null;
}

function productBody(p: ProductRow, pageUrl: string): { inner: string; schemas: Array<Record<string, unknown>> } {
  const desc = (p.short_description || p.long_description || '').toString();
  const sizes = (p.sizes || []).join(', ');
  const fabrics = (p.recommended_fabrics || []).join(', ');
  const offers: Array<Record<string, unknown>> = [];
  const lineas: string[] = [];
  if (p.precio_carton != null) {
    lineas.push(`Moldes en cartón: $${p.precio_carton} ARS`);
    offers.push({ '@type': 'Offer', price: p.precio_carton, priceCurrency: 'ARS', name: 'Moldes en cartón', availability: 'https://schema.org/InStock', url: pageUrl });
  }
  const pdfA4 = p.precio_pdf_a4 ?? p.price;
  if (pdfA4 != null) {
    lineas.push(`PDF A4 (descarga digital): $${pdfA4} ARS`);
    offers.push({ '@type': 'Offer', price: pdfA4, priceCurrency: 'ARS', name: 'PDF A4', availability: 'https://schema.org/InStock', url: pageUrl });
  }
  if (p.precio_pdf_ploter != null) {
    lineas.push(`PDF plotter (descarga digital): $${p.precio_pdf_ploter} ARS`);
    offers.push({ '@type': 'Offer', price: p.precio_pdf_ploter, priceCurrency: 'ARS', name: 'PDF plotter', availability: 'https://schema.org/InStock', url: pageUrl });
  }
  if (p.precio_usd_pdf_a4 != null) {
    lineas.push(`Compradores del exterior: USD ${p.precio_usd_pdf_a4} (PDF A4)`);
    offers.push({ '@type': 'Offer', price: p.precio_usd_pdf_a4, priceCurrency: 'USD', name: 'PDF A4 (internacional)', availability: 'https://schema.org/InStock', url: pageUrl });
  }

  const inner = [
    `<h1>${escapeHtml(p.name)}${p.codigo ? ` (cód. ${escapeHtml(p.codigo)})` : ''}</h1>`,
    desc ? `<p>${escapeHtml(desc.slice(0, 600))}</p>` : '',
    sizes ? `<p>Talles incluidos (todos en la misma compra): ${escapeHtml(sizes)}</p>` : '',
    lineas.length ? `<h2>Precios</h2><ul>${lineas.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>` : '',
    fabrics ? `<p>Telas recomendadas: ${escapeHtml(fabrics)}</p>` : '',
    `<p>${p.entrega_inmediata ? 'Descarga inmediata al confirmar el pago.' : 'Entrega digital dentro de las 24 horas de confirmado el pago.'} Molde profesional aprobado con muestra, con curva de talles industrial completa. Disponible también en otros formatos a pedido (${FORMATOS_TXT}).</p>`,
    `<p>Comprar online en <a href="${pageUrl}">${pageUrl}</a> — Modeltex, moldería digital para producción textil, envíos digitales a todo el mundo.</p>`,
  ].filter(Boolean).join('\n');

  const schemas: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      sku: p.codigo || undefined,
      description: desc.slice(0, 500),
      image: p.main_image_url || DEFAULT_IMAGE,
      url: pageUrl,
      brand: { '@type': 'Brand', name: SITE_NAME },
      ...(offers.length ? { offers } : {}),
    },
  ];
  return { inner, schemas };
}

const STATIC_PAGES: Record<string, { title: string; description: string; body: () => string; schemas?: () => Array<Record<string, unknown>> }> = {
  '/': {
    title: 'Modeltex | Moldes PDF, moldes para imprimir y moldería digital',
    description:
      'Moldería digital profesional para producción textil: más de 500 moldes de ropa con curva de talles completa, en PDF A4, plotter, DXF/AAMA, Optitex y Audaces. Descarga inmediata.',
    body: () => `
<h1>Modeltex — Moldería digital profesional para producir ropa</h1>
<p>Vendemos moldes de ropa digitales listos para producción: más de 500 modelos aprobados con muestra real, con curva de talles industrial completa incluida en cada compra. Más de 18 años en la industria textil argentina. Entrega por descarga digital a todo el mundo.</p>
<h2>Qué ofrecemos</h2>
<ul>
<li><a href="https://modeltex.com.ar/catalogo">Catálogo completo</a>: moldes de dama, hombre, niños y bebés en ${FORMATOS_TXT}.</li>
<li><a href="https://modeltex.com.ar/moldes-gratis">Moldes gratis</a> para probar la calidad antes de comprar.</li>
<li><a href="https://modeltex.com.ar/diseno-a-pedido">Moldería a pedido</a>: desarrollamos tu molde a medida en el formato que uses.</li>
<li>Tizadas computarizadas (MRK) optimizadas al ancho de tu tela.</li>
</ul>
<p>Precios en pesos argentinos y en dólares para el exterior. Pagos con Mercado Pago, transferencia, PayPal y cripto. Se puede comprar con o sin cuenta. Más info en <a href="https://modeltex.com.ar/preguntas-frecuentes">preguntas frecuentes</a> y <a href="https://modeltex.com.ar/como-funciona">cómo funciona</a>.</p>`,
  },
  '/moldes-pdf': {
    title: 'Moldes PDF para imprimir | Modeltex',
    description: 'Moldes de ropa en PDF para imprimir en A4 o plotter, con todos los talles y descarga inmediata. Para emprendedores, talleres y fabricantes.',
    body: () => `
<h1>Moldes PDF para imprimir, cortar y producir</h1>
<p>Moldes de ropa en PDF listos para imprimir: en hojas A4 (imprimís en casa y pegás siguiendo la guía numerada) o en PDF plotter (imprimís en ancho real en cualquier servicio de ploteo). Todos incluyen la curva completa de talles y control de medida para verificar la escala.</p>
<p><a href="https://modeltex.com.ar/catalogo">Ver el catálogo completo</a> — también disponibles en ${FORMATOS_TXT}.</p>`,
  },
  '/moldes-pdf-a4': {
    title: 'Moldes PDF A4 para imprimir en casa | Modeltex',
    description: 'Moldes de ropa en PDF A4: imprimí en tu impresora hogareña, pegá las hojas numeradas y cortá. Todos los talles incluidos.',
    body: () => `
<h1>Moldes PDF A4 — imprimí tus moldes en casa</h1>
<p>El formato ideal para emprendedores: imprimís el molde en hojas A4 comunes al 100% de escala, pegás siguiendo la numeración y obtenés el molde en tamaño real con todos sus talles. Cada archivo incluye cuadrado de control de medida.</p>
<p><a href="https://modeltex.com.ar/catalogo?formato=PDF%20A4">Ver moldes PDF A4 disponibles</a> · <a href="https://modeltex.com.ar/ayuda-impresion">Guía para imprimir sin perder escala</a></p>`,
  },
  '/moldes-para-plotter': {
    title: 'Moldes para plotter en ancho real | Modeltex',
    description: 'Moldes de ropa en PDF plotter para imprimir en ancho real (90 a 150 cm). Curva de talles completa, listos para taller y producción.',
    body: () => `
<h1>Moldes para plotter — impresión en ancho real</h1>
<p>PDF preparados para plotter textil en anchos de 90, 120 o 150 cm según el molde: llevás el archivo a cualquier servicio de ploteo e imprimís el molde completo sin pegar hojas. La opción más usada por talleres y fábricas que cortan a mano.</p>
<p><a href="https://modeltex.com.ar/catalogo?formato=PDF%20Plotter">Ver moldes para plotter</a> — ¿cortás en CAD? Pedilos en DXF/AAMA, Optitex o Audaces.</p>`,
  },
  '/moldes-para-emprendedores': {
    title: 'Moldes de ropa para emprendedores | Modeltex',
    description: 'Moldes digitales probados con muestra para arrancar tu marca de ropa: todos los talles, descarga inmediata y soporte por WhatsApp.',
    body: () => `
<h1>Moldes de ropa para emprendedores</h1>
<p>Si estás armando tu marca de ropa, empezás con moldes ya probados en producción: cada molde de Modeltex se aprueba con una muestra confeccionada antes de publicarse, e incluye todos los talles. Descargás, imprimís (A4 o plotter) y cortás. Soporte directo por WhatsApp si te trabás.</p>
<p><a href="https://modeltex.com.ar/moldes-gratis">Probá primero un molde gratis</a> · <a href="https://modeltex.com.ar/catalogo">Ver catálogo</a></p>`,
  },
  '/moldes-gratis': {
    title: 'Moldes de ropa gratis para descargar | Modeltex',
    description: 'Descargá moldes de ropa reales gratis y comprobá la calidad de Modeltex antes de comprar. PDF listos para imprimir.',
    body: () => `
<h1>Moldes gratis — probá la calidad antes de comprar</h1>
<p>Publicamos moldes reales de nuestro catálogo para descarga gratuita: el mismo nivel de terminación, talles y prolijidad que los moldes pagos. Descargalos, imprimilos y comprobá cómo trabajamos antes de hacer tu primera compra.</p>
<p><a href="https://modeltex.com.ar/moldes-gratis">Entrá a la sección Moldes Gratis</a> (algunos se descargan sin cuenta; otros pidiendo una cuenta gratuita).</p>`,
  },
  '/como-funciona': {
    title: 'Cómo funciona la compra de moldes | Modeltex',
    description: 'Elegís el molde y formato, pagás (Mercado Pago, transferencia, PayPal o cripto) y descargás. Moldes aprobados con muestra y todos los talles.',
    body: () => `
<h1>Cómo funciona Modeltex</h1>
<ol>
<li>Elegís el molde en el <a href="https://modeltex.com.ar/catalogo">catálogo</a> y el formato (cartón, PDF A4 o PDF plotter; otros formatos CAD a pedido).</li>
<li>Elegís los talles — la curva completa viene incluida.</li>
<li>Pagás con Mercado Pago, transferencia bancaria, PayPal o criptomonedas. Podés comprar sin crear cuenta.</li>
<li>Descargás tus archivos: los de descarga rápida al confirmarse el pago, el resto dentro de las 24 hs.</li>
</ol>
<p>Dudas: <a href="https://modeltex.com.ar/preguntas-frecuentes">preguntas frecuentes</a>.</p>`,
  },
  '/ayuda-impresion': {
    title: 'Cómo imprimir moldes PDF sin perder escala | Modeltex',
    description: 'Guía para imprimir moldes PDF en A4 o plotter: escala al 100%, cuadrado de control de medida y pegado de hojas numeradas.',
    body: () => `
<h1>Cómo imprimir tu molde PDF sin perder la escala</h1>
<ul>
<li>Configurá la impresión al <strong>100% / tamaño real</strong> — nunca "ajustar a la página".</li>
<li>Imprimí primero la hoja con el <strong>cuadrado de control</strong> y verificá su medida con regla.</li>
<li>Pegá las hojas A4 siguiendo la numeración de la guía.</li>
<li>Para plotter: llevá el PDF a cualquier servicio de ploteo e indicá impresión al 100%.</li>
</ul>
<p>Más ayuda en <a href="https://modeltex.com.ar/preguntas-frecuentes">preguntas frecuentes</a> o por WhatsApp desde <a href="https://modeltex.com.ar/contacto">contacto</a>.</p>`,
  },
  '/diseno-a-pedido': {
    title: 'Moldería a pedido y moldes a medida | Modeltex',
    description: 'Desarrollamos tu molde a medida desde tu prenda, foto o idea, con curva de talles y el formato que uses (PDF, DXF/AAMA, Optitex, Audaces).',
    body: () => `
<h1>Moldería a pedido — tu molde a medida</h1>
<p>Nos mandás una prenda, foto o idea y desarrollamos la moldería completa: molde base, curva de talles a tu tabla de medidas y entrega en el formato que uses (PDF A4, plotter, DXF/AAMA, Optitex PDS, Audaces ADS). Servicio pensado para marcas, talleres y fábricas.</p>
<p>Pedilo desde <a href="https://modeltex.com.ar/diseno-a-pedido">Diseño a pedido</a>.</p>`,
  },
  '/preguntas-frecuentes': {
    title: 'Preguntas frecuentes sobre moldes digitales | Modeltex',
    description: 'Respuestas sobre formatos de moldes (PDF, DXF/AAMA, Optitex, Audaces), talles, impresión, pagos y entrega de moldería digital.',
    body: () =>
      `<h1>Preguntas frecuentes — moldes digitales Modeltex</h1>\n` +
      FAQ_ITEMS.map((f) => `<h2>${escapeHtml(f.q)}</h2>\n<p>${escapeHtml(f.a)}</p>`).join('\n'),
    schemas: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  },
};

async function catalogBody(origin: string): Promise<string> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?is_active=eq.true&select=name,slug,codigo,precio_pdf_a4,price,category&order=created_at.desc&limit=60`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!res.ok) return '';
    const rows = (await res.json()) as ProductRow[];
    if (!Array.isArray(rows) || !rows.length) return '';
    const items = rows
      .map((p) => {
        const precio = p.precio_pdf_a4 ?? p.price;
        return `<li><a href="${origin}/producto/${encodeURIComponent(p.slug)}">${escapeHtml(p.name)}</a>${precio != null ? ` — desde $${precio} ARS` : ''}</li>`;
      })
      .join('\n');
    return `<h2>Últimos moldes publicados</h2>\n<ul>\n${items}\n</ul>\n<p>Este listado es parcial: el catálogo completo tiene más de 500 moldes con búsqueda por categoría (dama, hombre, niña, niño, bebés), temporada y formato.</p>`;
  } catch {
    return '';
  }
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

      const apiUrl =
        `${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}` +
        `&is_active=eq.true&select=name,slug,codigo,short_description,long_description,main_image_url,category,garment_type,sizes,formats,recommended_fabrics,price,precio_carton,precio_pdf_a4,precio_pdf_ploter,precio_usd_pdf_a4,entrega_inmediata&limit=1`;

      const [productRes, htmlRes] = await Promise.all([
        fetch(apiUrl, { headers: { apikey: SUPABASE_ANON_KEY } }),
        fetch(`${url.origin}/index.html`),
      ]);

      let html = await htmlRes.text();
      const products = productRes.ok ? await productRes.json() : [];
      const product = (Array.isArray(products) ? products[0] : null) as ProductRow | null;

      if (product) {
        const pageUrl = `${url.origin}/producto/${slug}`;
        const description =
          (product.short_description || product.long_description || '').toString().slice(0, 160) ||
          'Molde digital profesional con descarga inmediata.';
        html = setHeadSeo(html, `${product.name} | ${SITE_NAME}`, description, pageUrl);
        html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1product$2`);
        html = replaceAttr(html, 'property="og:image" ', escapeHtml(product.main_image_url || DEFAULT_IMAGE));
        html = replaceAttr(html, 'name="twitter:image" ', escapeHtml(product.main_image_url || DEFAULT_IMAGE));
        const { inner, schemas } = productBody(product, pageUrl);
        html = injectBody(html, inner, schemas);
      }
      return respond(html);
    }

    // ---------- Home, catalogo, landings y guias ----------
    const page = STATIC_PAGES[path];
    const isCatalog = path === '/catalogo';
    if (!page && !isCatalog) return next();

    const htmlRes = await fetch(`${url.origin}/index.html`);
    let html = await htmlRes.text();
    const pageUrl = `${url.origin}${path === '/' ? '/' : path}`;

    if (isCatalog) {
      const listado = await catalogBody(url.origin);
      html = setHeadSeo(
        html,
        'Catálogo de moldes digitales | Modeltex',
        'Más de 500 moldes de ropa digitales para dama, hombre, niños y bebés. Todos los talles incluidos, en PDF A4, plotter y formatos CAD.',
        pageUrl,
      );
      html = injectBody(
        html,
        `<h1>Catálogo de moldes digitales Modeltex</h1>\n<p>Moldes de ropa profesionales para producción, aprobados con muestra, con curva de talles completa. Formatos: ${FORMATOS_TXT}.</p>\n${listado}`,
      );
    } else if (page) {
      html = setHeadSeo(html, page.title, page.description, pageUrl);
      html = injectBody(html, page.body(), page.schemas?.());
    }
    return respond(html);
  } catch {
    return next();
  }
}
