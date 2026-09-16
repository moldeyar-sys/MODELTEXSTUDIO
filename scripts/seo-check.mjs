// Validacion SEO tecnica automatizada.
//
//   node scripts/seo-check.mjs                  -> corre el middleware local (necesita `npm run build`)
//   node scripts/seo-check.mjs --live           -> prueba https://modeltex.com.ar
//   node scripts/seo-check.mjs --live https://x -> prueba otra URL (preview de Vercel)
//   node scripts/seo-check.mjs --no-report      -> no escribe seo-validation-report.md
//
// Sale con codigo != 0 si hay fallas, para poder usarlo en CI.

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  ORIGIN,
  UA,
  loadMiddleware,
  loadSitemap,
  seoOf,
  internalLinks,
  jsonLdOf,
  hasType,
  duplicateSchemaIds,
  parseRobots,
  robotsAllows,
  makeReporter,
  writeReport,
  mdEscape,
} from './seo-lib.mjs';

const args = process.argv.slice(2);
const liveIdx = args.indexOf('--live');
const LIVE = liveIdx !== -1;
const BASE = LIVE ? args[liveIdx + 1] && !args[liveIdx + 1].startsWith('--') ? args[liveIdx + 1] : ORIGIN : ORIGIN;
const WRITE_REPORT = !args.includes('--no-report');

const R = makeReporter();

// --- Rutas publicas principales (las que tienen que estar impecables) -------
const PAGINAS = [
  { path: '/', schema: ['Organization', 'WebSite'] },
  { path: '/molderia-digital', schema: ['WebPage', 'BreadcrumbList', 'FAQPage'] },
  { path: '/moldes-pdf', schema: ['CollectionPage', 'FAQPage', 'BreadcrumbList'] },
  { path: '/moldes-pdf-a4', schema: ['CollectionPage', 'FAQPage', 'BreadcrumbList'] },
  { path: '/moldes-para-plotter', schema: ['CollectionPage', 'FAQPage', 'BreadcrumbList'] },
  { path: '/moldes-gratis', schema: ['CollectionPage', 'FAQPage', 'BreadcrumbList'] },
  { path: '/moldes-para-emprendedores', schema: ['CollectionPage', 'FAQPage'] },
  { path: '/catalogo', schema: ['ItemList', 'BreadcrumbList'] },
  { path: '/catalogo?categoria=dama', schema: ['ItemList', 'BreadcrumbList'] },
  { path: '/guias', schema: ['CollectionPage', 'BreadcrumbList'] },
  { path: '/guias/formatos-de-molderia-digital', schema: ['Article', 'BreadcrumbList'] },
  { path: '/lab', schema: ['CollectionPage', 'BreadcrumbList', 'ItemList'] },
  { path: '/preguntas-frecuentes', schema: ['FAQPage', 'BreadcrumbList'] },
  { path: '/contacto', schema: ['ContactPage', 'BreadcrumbList'] },
  { path: '/quienes-somos', schema: ['AboutPage', 'BreadcrumbList', 'Person'] },
];

// --- Rutas que NO deben ser indexables --------------------------------------
const NO_INDEXABLES = [
  { path: '/lab/ia', status: 200, motivo: 'chat interactivo' },
  { path: '/login', status: 200, motivo: 'ruta de sesión' },
  { path: '/carrito', status: 200, motivo: 'ruta de compra' },
  { path: '/checkout', status: 200, motivo: 'ruta de compra' },
  { path: '/mi-cuenta', status: 200, motivo: 'ruta privada' },
  { path: '/admin', status: 200, motivo: 'panel privado' },
];

const CUATROCIENTOS_CUATRO = [
  { path: '/producto/no-existe-este-molde-xyz', motivo: 'producto inexistente' },
  { path: '/guias/no-existe-esta-guia-xyz', motivo: 'guía inexistente' },
  { path: '/lab/no-existe-este-curso-xyz', motivo: 'curso del Lab inexistente' },
  { path: '/lab/glosario/no-existe-xyz', motivo: 'término del glosario inexistente' },
  { path: '/ruta-inventada-que-no-existe-xyz', motivo: 'ruta general inexistente' },
  { path: '/catalogo?categoria=no-existe', motivo: 'categoría inexistente' },
  { path: '/catalogo?categoria=dama&pagina=99', motivo: 'paginación fuera de rango' },
  { path: '/catalogo?categoria=dama&pagina=0', motivo: 'paginación 0' },
  { path: '/catalogo?categoria=dama&pagina=abc', motivo: 'paginación no numérica' },
  { path: '/catalogo?categoria=dama&pagina=-2', motivo: 'paginación negativa' },
];

const BOTS = ['navegador', 'googlebot', 'bingbot', 'gptbot', 'claudebot', 'perplexitybot', 'oaisearchbot'];

// --- Cliente ----------------------------------------------------------------
let get;
if (LIVE) {
  get = async (p, ua = UA.navegador) => {
    const res = await fetch(`${BASE}${p}`, { headers: { 'user-agent': ua }, redirect: 'manual' });
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      html: res.status >= 300 && res.status < 400 ? '' : await res.text(),
      location: res.headers.get('location') || undefined,
    };
  };
} else {
  get = await loadMiddleware();
}

const isIndexable = (robots) => !/noindex/i.test(robots || '');

console.log(`\n\x1b[1mValidación SEO — ${LIVE ? `sitio publicado ${BASE}` : 'middleware local (dist/)'}\x1b[0m`);

// ---------------------------------------------------------------------------
// 1. HTML inicial de las páginas principales
// ---------------------------------------------------------------------------
const seoPorPagina = new Map();
for (const p of PAGINAS) {
  const res = await get(p.path);
  const s = seoOf(res.html);
  seoPorPagina.set(p.path, { res, s });
  const a = `HTML inicial — ${p.path}`;

  R.check(a, 'responde 200', res.status === 200, `status ${res.status}`);
  R.check(a, 'tiene <title> propio', s.title.length > 10 && !/^\s*$/.test(s.title), s.title.slice(0, 70));
  R.check(a, 'tiene meta description', s.description.length >= 50, `${s.description.length} caracteres`);
  R.check(a, 'description <= 165 caracteres', s.description.length <= 165, `${s.description.length}`);
  R.check(a, 'canonical propio y absoluto', s.canonical.startsWith('http') && s.canonical.includes(p.path.split('?')[0]), s.canonical);
  R.check(a, 'es indexable', isIndexable(s.robots), s.robots);
  R.check(a, 'tiene exactamente un H1', s.h1.length === 1, s.h1.length ? s.h1[0].slice(0, 60) : 'sin H1');
  R.check(a, 'contenido legible sin JavaScript (>1.200 car.)', s.bodyText.length > 1200, `${s.bodyText.length} caracteres`);
  // 8 es el minimo para que una pagina no sea un callejon sin salida: al menos
  // el catalogo, una categoria, un formato hermano, una guia y un CTA.
  R.check(a, 'al menos 8 enlaces internos en el HTML inicial', internalLinks(res.html).length >= 8, `${internalLinks(res.html).length} enlaces`);
  R.check(a, 'Open Graph coherente con el title', s.ogTitle === s.title, s.ogTitle.slice(0, 50));
  R.check(a, 'og:url coincide con el canonical', s.ogUrl === s.canonical, s.ogUrl);

  const blocks = jsonLdOf(res.html);
  R.check(a, 'JSON-LD parseable', blocks.every((b) => !b.error), blocks.find((b) => b.error)?.error || '');
  const dups = duplicateSchemaIds(blocks);
  R.check(a, 'sin JSON-LD duplicado', dups.length === 0, dups.join(', '));
  for (const t of p.schema) R.check(a, `schema ${t} presente`, hasType(blocks, t));
}

// ---------------------------------------------------------------------------
// 2. Misma respuesta para navegador, buscadores y bots de IA (no cloaking)
// ---------------------------------------------------------------------------
const PARIDAD = ['/', '/moldes-pdf', '/molderia-digital', '/catalogo?categoria=dama', '/guias/formatos-de-molderia-digital', '/ruta-inventada-que-no-existe-xyz'];
for (const p of PARIDAD) {
  const a = `Paridad por User-Agent — ${p}`;
  const vistas = [];
  for (const bot of BOTS) {
    const res = await get(p, UA[bot]);
    const s = seoOf(res.html);
    vistas.push({ bot, status: res.status, canonical: s.canonical, robots: s.robots, h1: s.h1[0] || '' });
  }
  const ref = vistas[0];
  for (const key of ['status', 'canonical', 'robots', 'h1']) {
    const distintos = vistas.filter((v) => v[key] !== ref[key]);
    R.check(
      a,
      `mismo ${key} para los ${BOTS.length} agentes`,
      distintos.length === 0,
      distintos.length ? `${ref.bot}="${ref[key]}" vs ${distintos.map((d) => `${d.bot}="${d[key]}"`).join(' / ')}` : String(ref[key]).slice(0, 60),
    );
  }
}

// ---------------------------------------------------------------------------
// 3. 404 reales con noindex
// ---------------------------------------------------------------------------
for (const t of CUATROCIENTOS_CUATRO) {
  const a = '404 / noindex';
  const res = await get(t.path);
  const s = seoOf(res.html);
  R.check(a, `${t.motivo} responde 404`, res.status === 404, `${t.path} -> ${res.status}`);
  R.check(a, `${t.motivo} lleva noindex`, /noindex/i.test(s.robots), s.robots || '(sin meta robots)');
  R.check(a, `${t.motivo} NO canonicaliza a la home`, s.canonical !== `${ORIGIN}/`, s.canonical);
  R.check(a, `${t.motivo} lleva X-Robots-Tag`, /noindex/i.test(res.headers['x-robots-tag'] || ''), res.headers['x-robots-tag'] || '(sin cabecera)');
}

// ---------------------------------------------------------------------------
// 4. Rutas no indexables que sí existen
// ---------------------------------------------------------------------------
for (const t of NO_INDEXABLES) {
  const a = 'Rutas no indexables';
  const res = await get(t.path);
  const s = seoOf(res.html);
  R.check(a, `${t.path} (${t.motivo}) responde ${t.status}`, res.status === t.status, `status ${res.status}`);
  R.check(a, `${t.path} lleva noindex en el HTML inicial`, /noindex/i.test(s.robots), s.robots || '(sin meta robots)');
  R.check(a, `${t.path} NO canonicaliza a la home`, s.canonical !== `${ORIGIN}/`, s.canonical);
}

// ---------------------------------------------------------------------------
// 5. Paginación válida
// ---------------------------------------------------------------------------
{
  const a = 'Paginación del catálogo';
  const p2 = await get('/catalogo?categoria=dama&pagina=2');
  const s2 = seoOf(p2.html);
  R.check(a, 'página 2 de dama responde 200', p2.status === 200, `status ${p2.status}`);
  R.check(a, 'página 2 es indexable', isIndexable(s2.robots), s2.robots);
  R.check(a, 'página 2 tiene canonical propio', s2.canonical.includes('pagina=2'), s2.canonical);
  R.check(a, 'página 2 declara rel=prev', /rel="prev"/.test(p2.html));
  R.check(a, 'página 2 declara rel=next', /rel="next"/.test(p2.html));
  R.check(a, 'el H1 de la página 2 dice el total real', /página 2 de \d+/i.test(s2.h1[0] || ''), s2.h1[0] || '');

  const p1 = await get('/catalogo?categoria=dama&pagina=1');
  R.check(a, '?pagina=1 redirige 301 a la URL sin el parámetro', p1.status === 301 && !/pagina=/.test(p1.location || ''), `${p1.status} -> ${p1.location || ''}`);

  const filtrado = await get('/catalogo?formato=PDF%20A4');
  const sf = seoOf(filtrado.html);
  R.check(a, 'vista filtrada (?formato=) lleva noindex', /noindex/i.test(sf.robots), sf.robots);
  R.check(a, 'vista filtrada canonicaliza al catálogo limpio', sf.canonical === `${ORIGIN}/catalogo`, sf.canonical);
}

// ---------------------------------------------------------------------------
// 6. Ficha de producto y schema Product
// ---------------------------------------------------------------------------
{
  const a = 'Ficha de producto';
  const sitemapXml = LIVE ? await (await fetch(`${BASE}/sitemap.xml`)).text() : await loadSitemap();
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  const productos = locs.filter((u) => u.includes('/producto/'));
  const muestra = productos.slice(0, 3).concat(productos.slice(-2));

  for (const url of muestra) {
    const p = new URL(url).pathname;
    const res = await get(p);
    const s = seoOf(res.html);
    const blocks = jsonLdOf(res.html);
    const prod = blocks.find((b) => b.types.includes('Product'))?.data;
    R.check(a, `${p} responde 200`, res.status === 200, `status ${res.status}`);
    R.check(a, `${p} tiene schema Product`, !!prod);
    if (!prod) continue;
    R.check(a, `${p} Product tiene name/description/image/url`, !!(prod.name && prod.description && prod.image && prod.url));
    R.check(a, `${p} Product tiene sku y brand`, !!(prod.sku && prod.brand));
    const offers = [].concat(prod.offers || []);
    const monedas = [...new Set(offers.map((o) => o.priceCurrency))];
    R.check(a, `${p} una sola moneda en offers`, monedas.length <= 1, monedas.join(', ') || 'sin offers');
    R.check(a, `${p} la moneda es ARS`, monedas.length === 0 || monedas[0] === 'ARS', monedas.join(', '));
    R.check(a, `${p} offers con availability e itemCondition`, offers.every((o) => o.availability && o.itemCondition));
    R.check(a, `${p} sin JSON-LD duplicado`, duplicateSchemaIds(blocks).length === 0, duplicateSchemaIds(blocks).join(', '));
    R.check(a, `${p} canonical propio`, s.canonical === `${ORIGIN}${p}`, s.canonical);
  }
}

// ---------------------------------------------------------------------------
// 5 bis. Toda ruta real de la app responde 200 (el control anti-regresion mas
// importante de todos)
// ---------------------------------------------------------------------------
//
// Ahora que el middleware responde para TODOS los visitantes y no solo para
// robots, una ruta que exista en src/App.tsx pero que el middleware no conozca
// cae en el catch-all y le devuelve un 404 a un usuario de verdad. Este bloque
// lee las rutas directo de App.tsx y verifica que ninguna de las estaticas
// devuelva 404. Si manana alguien agrega una pagina a la SPA y se olvida del
// middleware, esto falla antes de que lo note un cliente.
{
  const a = 'Rutas de la app';
  const app = await readFile(path.join(ROOT, 'src', 'App.tsx'), 'utf8');
  const rutas = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
  const estaticas = rutas.filter((r) => r !== '*' && !r.includes(':'));
  const dinamicas = rutas.filter((r) => r.includes(':'));

  R.check(a, 'se leyeron las rutas de src/App.tsx', estaticas.length > 10, `${estaticas.length} estáticas, ${dinamicas.length} con parámetro`);

  const roto = [];
  for (const r of estaticas) {
    const res = await get(r);
    if (res.status === 404) roto.push(`${r} -> 404`);
    else if (res.status >= 500) roto.push(`${r} -> ${res.status}`);
  }
  R.check(
    a,
    `las ${estaticas.length} rutas estáticas de la SPA no devuelven 404`,
    roto.length === 0,
    roto.length ? roto.join(' | ') : 'todas responden',
  );

  // Las rutas privadas no deben quedar cacheadas por el CDN.
  for (const r of ['/mi-cuenta', '/mis-compras', '/descargas', '/checkout', '/carrito', '/admin', '/login']) {
    const res = await get(r);
    R.check(a, `${r} no se cachea en el CDN`, /no-store|private/.test(res.headers['cache-control'] || ''), res.headers['cache-control'] || '(sin cabecera)');
  }

  // /mi-pedido lleva el email del comprador invitado en la query string.
  const pedido = await get('/mi-pedido?pedido=123&email=alguien%40ejemplo.com');
  R.check(a, '/mi-pedido con query responde 200', pedido.status === 200, `status ${pedido.status}`);
  R.check(a, '/mi-pedido con query lleva noindex', /noindex/i.test(seoOf(pedido.html).robots), seoOf(pedido.html).robots);
  R.check(a, '/mi-pedido no filtra el email en el canonical', !(seoOf(pedido.html).canonical || '').includes('email'), seoOf(pedido.html).canonical);
}

// ---------------------------------------------------------------------------
// 6 ter. MODELTEX LAB como curso (schema Course) y Organization global
// ---------------------------------------------------------------------------
{
  const a = 'Lab como curso y datos de empresa';

  // /lab: ItemList cuyos items son Course (formato de "course list page").
  const lab = await get('/lab');
  const blocksLab = jsonLdOf(lab.html);
  const lista = blocksLab.find((b) => b.types.includes('ItemList'))?.data;
  const items = lista ? [].concat(lista.itemListElement || []) : [];
  const cursos = items.map((it) => it.item).filter((x) => x && [].concat(x['@type']).includes('Course'));
  R.check(a, '/lab declara un ItemList', !!lista, lista ? `${items.length} items` : 'sin ItemList');
  R.check(a, '/lab: los items del ItemList son Course', cursos.length > 0 && cursos.length === items.length, `${cursos.length}/${items.length} son Course`);
  R.check(
    a,
    '/lab: cada Course es gratis (isAccessibleForFree + Offer en 0)',
    cursos.length > 0 && cursos.every((c) => c.isAccessibleForFree === true && String(c.offers?.price) === '0'),
  );
  R.check(a, '/lab: cada Course tiene provider y url', cursos.every((c) => c.provider?.name && c.url));

  // Página de un curso: Course completo.
  const slugCurso = cursos[0]?.url ? new URL(cursos[0].url).pathname : null;
  if (slugCurso) {
    const cur = await get(slugCurso);
    const c = jsonLdOf(cur.html).find((b) => b.types.includes('Course'))?.data;
    R.check(a, `${slugCurso}: tiene Course`, !!c);
    if (c) {
      R.check(a, `${slugCurso}: Course con name, url y description`, !!(c.name && c.url && c.description));
      R.check(a, `${slugCurso}: hasCourseInstance con courseMode`, c.hasCourseInstance?.courseMode === 'online');
      R.check(a, `${slugCurso}: declara la duración (courseWorkload)`, !!c.hasCourseInstance?.courseWorkload, c.hasCourseInstance?.courseWorkload || '');
      R.check(a, `${slugCurso}: declara el programa (syllabusSections)`, [].concat(c.syllabusSections || []).length > 0, `${[].concat(c.syllabusSections || []).length} módulos`);
      R.check(a, `${slugCurso}: declara qué enseña (teaches)`, [].concat(c.teaches || []).length > 0);
    }
  } else {
    R.check(a, 'hay al menos un curso publicado para verificar', false, 'ningún Course en /lab');
  }

  // Glosario: DefinedTerm.
  const term = await get('/lab/glosario');
  const listaTerm = jsonLdOf(term.html).find((b) => b.types.includes('CollectionPage'))?.data;
  const primer = [].concat(listaTerm?.mainEntity?.itemListElement || [])[0];
  if (primer?.url) {
    const t = await get(new URL(primer.url).pathname);
    R.check(a, 'término del glosario tiene DefinedTerm', hasType(jsonLdOf(t.html), 'DefinedTerm'));
  }

  // Organization de index.html contra buildOrganizationSchema(): el modulo
  // src/lib/siteConfig.ts dice ser la fuente unica de los datos
  // institucionales, pero el JSON-LD de index.html es una copia escrita a
  // mano. Este control es lo que impide que se separen sin que nadie lo note.
  const orgIndex = jsonLdOf(await readFile(path.join(ROOT, 'index.html'), 'utf8')).find((b) => b.types.includes('Organization'))?.data;
  const esbuild = await import('esbuild');
  const outOrg = path.join(ROOT, 'node_modules', '.seo-check', 'siteConfig.mjs');
  await esbuild.build({
    entryPoints: [path.join(ROOT, 'src', 'lib', 'siteConfig.ts')],
    outfile: outOrg, bundle: true, format: 'esm', platform: 'neutral', target: 'es2022', logLevel: 'silent',
  });
  const sc = await import(`${new URL(`file:///${outOrg.replace(/\\/g, '/')}`).href}?t=${Date.now()}`);
  const orgEsperado = sc.buildOrganizationSchema();
  R.check(a, 'index.html trae el Organization', !!orgIndex);
  if (orgIndex) {
    const difs = ['name', 'alternateName', 'url', 'logo', 'description', 'telephone', '@id'].filter(
      (k) => JSON.stringify(orgIndex[k]) !== JSON.stringify(orgEsperado[k]),
    );
    R.check(a, 'el Organization de index.html coincide con siteConfig.ts', difs.length === 0, difs.join(', '));
    // Comparacion sin depender del orden de las claves del objeto.
    const norm = (o) => JSON.stringify(Object.fromEntries(Object.entries(o || {}).sort()));
    R.check(
      a,
      'la dirección del Organization coincide con siteConfig.ts',
      norm(orgIndex.address) === norm(orgEsperado.address),
      norm(orgIndex.address) === norm(orgEsperado.address) ? '' : `index: ${norm(orgIndex.address)} vs siteConfig: ${norm(orgEsperado.address)}`,
    );
    R.check(
      a,
      'el contactPoint del Organization coincide con siteConfig.ts',
      norm(orgIndex.contactPoint) === norm(orgEsperado.contactPoint),
      norm(orgIndex.contactPoint) === norm(orgEsperado.contactPoint) ? '' : 'difieren',
    );
    R.check(
      a,
      'los perfiles sociales (sameAs) coinciden con siteConfig.ts',
      JSON.stringify([...(orgIndex.sameAs || [])].sort()) === JSON.stringify([...orgEsperado.sameAs].sort()),
    );
  }
  R.check(a, 'index.html trae el WebSite con SearchAction', (() => {
    const w = jsonLdOf(lab.html).find((b) => b.types.includes('WebSite'))?.data;
    return !!w?.potentialAction?.target;
  })());
}

// ---------------------------------------------------------------------------
// 6 bis. FAQ visible y coherente con el FAQPage marcado
// ---------------------------------------------------------------------------
{
  const a = 'FAQ visible y coherente';
  // Se lee el modulo compartido como texto (es TypeScript): alcanza para sacar
  // las rutas y las preguntas, sin compilar nada.
  const src = await readFile(path.join(ROOT, 'src', 'lib', 'landingFaqs.ts'), 'utf8');
  const cuerpo = src.slice(src.indexOf('LANDING_FAQS'));
  const rutas = [...cuerpo.matchAll(/^ {2}'(\/[^']*)': \[$/gm)].map((m) => m[1]);
  R.check(a, 'landingFaqs.ts define rutas', rutas.length > 0, rutas.join(' '));

  const preguntasDe = (ruta) => {
    const ini = cuerpo.indexOf(`  '${ruta}': [`);
    const fin = cuerpo.indexOf('\n  ],', ini);
    return [...cuerpo.slice(ini, fin).matchAll(/q: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
  };

  for (const ruta of rutas) {
    const esperadas = preguntasDe(ruta);
    const res = await get(ruta);
    const blocks = jsonLdOf(res.html);
    const faqBlock = blocks.find((b) => b.types.includes('FAQPage'));
    const marcadas = faqBlock ? [].concat(faqBlock.data.mainEntity || []).map((q) => q.name) : [];
    const texto = seoOf(res.html).bodyText;

    R.check(a, `${ruta}: tiene FAQPage`, !!faqBlock, faqBlock ? `${marcadas.length} preguntas` : 'sin FAQPage');
    R.check(
      a,
      `${ruta}: las ${esperadas.length} preguntas marcadas son las de landingFaqs.ts`,
      marcadas.length === esperadas.length && esperadas.every((q) => marcadas.includes(q)),
      `marcadas ${marcadas.length} / definidas ${esperadas.length}`,
    );
    const invisibles = esperadas.filter((q) => !texto.includes(q));
    R.check(
      a,
      `${ruta}: toda respuesta marcada está visible en la página`,
      invisibles.length === 0,
      invisibles.length ? `no aparecen: ${invisibles.slice(0, 2).join(' | ')}` : '',
    );
  }

  // Ninguna pregunta repetida en muchas URLs distintas (FAQ copiada y pegada).
  const porPregunta = new Map();
  for (const ruta of rutas) for (const q of preguntasDe(ruta)) porPregunta.set(q, (porPregunta.get(q) || 0) + 1);
  const repetidas = [...porPregunta.entries()].filter(([, n]) => n > 1);
  R.check(a, 'ninguna pregunta repetida entre páginas', repetidas.length === 0, repetidas.map(([q, n]) => `${q.slice(0, 40)} (${n})`).join(' | '));
}

// ---------------------------------------------------------------------------
// 7. robots.txt
// ---------------------------------------------------------------------------
const PRIVADAS = ['/admin', '/checkout', '/carrito', '/mi-cuenta', '/mis-compras', '/mi-pedido', '/descargas', '/login', '/registro', '/recuperar-contrasena', '/lab/ia', '/api/chat', '/legal/respaldo-drive-denis'];
const PUBLICAS = ['/', '/catalogo', '/producto/algo', '/moldes-pdf', '/moldes-pdf-a4', '/moldes-para-plotter', '/moldes-gratis', '/molderia-digital', '/guias', '/guias/algo', '/lab', '/lab/curso/modulo/clase'];
{
  const a = 'robots.txt';
  const txt = LIVE ? await (await fetch(`${BASE}/robots.txt`)).text() : await readFile(path.join(ROOT, 'public', 'robots.txt'), 'utf8');
  const groups = parseRobots(txt);
  const agentes = Object.keys(groups);
  R.check(a, 'declara Sitemap', /^sitemap:/im.test(txt), (txt.match(/^Sitemap:.*/im) || [''])[0]);
  R.check(a, 'tiene grupo User-agent: *', !!groups['*']);

  for (const ruta of PRIVADAS) {
    const permiten = agentes.filter((ag) => robotsAllows(groups[ag], ruta));
    R.check(a, `${ruta} bloqueada para TODOS los grupos`, permiten.length === 0, permiten.length ? `la permiten: ${permiten.join(', ')}` : `${agentes.length} grupos`);
  }
  for (const ruta of PUBLICAS) {
    const bloquean = agentes.filter((ag) => !robotsAllows(groups[ag], ruta));
    R.check(a, `${ruta} permitida para todos los grupos`, bloquean.length === 0, bloquean.length ? `la bloquean: ${bloquean.join(', ')}` : '');
  }
}

// ---------------------------------------------------------------------------
// 8. Sitemap
// ---------------------------------------------------------------------------
let sitemapStats = null;
{
  const a = 'sitemap.xml';
  const xml = LIVE ? await (await fetch(`${BASE}/sitemap.xml`)).text() : await loadSitemap();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  const dups = locs.filter((u, i) => locs.indexOf(u) !== i);
  const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);

  R.check(a, 'es XML con urlset', /^<\?xml/.test(xml.trim()) && xml.includes('<urlset'));
  R.check(a, 'sin URLs duplicadas', dups.length === 0, dups.slice(0, 3).join(', '));
  R.check(a, 'todas las URLs son absolutas y del dominio', locs.every((u) => u.startsWith(ORIGIN)), locs.find((u) => !u.startsWith(ORIGIN)) || '');
  R.check(a, 'todas las URLs tienen lastmod', lastmods.length === locs.length, `${lastmods.length}/${locs.length}`);
  R.check(a, 'las fechas de lastmod son válidas', lastmods.every((d) => !Number.isNaN(Date.parse(d))), lastmods.find((d) => Number.isNaN(Date.parse(d))) || '');
  R.check(a, 'sin <priority> (Google lo ignora)', !xml.includes('<priority>'));
  R.check(a, 'sin <changefreq> (Google lo ignora)', !xml.includes('<changefreq>'));
  R.check(a, 'no incluye /lab/ia', !locs.some((u) => u.endsWith('/lab/ia')));
  R.check(a, 'no incluye rutas privadas', !locs.some((u) => PRIVADAS.some((p) => new URL(u).pathname === p)));
  R.check(a, 'no incluye URLs con ?pagina=', !locs.some((u) => u.includes('pagina=')));

  // api/sitemap.ts duplica a mano slugs y fechas de las guias (Vercel no deja
  // importar codigo de src/ desde api/). Este control es lo que hace segura
  // esa duplicacion: si alguien edita una guia y no toca el sitemap, falla.
  const srcSitemap = await readFile(path.join(ROOT, 'api', 'sitemap.ts'), 'utf8');
  const enSitemap = Object.fromEntries([...srcSitemap.matchAll(/^\s*'([a-z0-9-]+)':\s*'(\d{4}-\d{2}-\d{2})',$/gm)].map((m) => [m[1], m[2]]));
  const guiaFiles = (await readdir(path.join(ROOT, 'src', 'lib', 'guias'))).filter((f) => f.endsWith('.ts'));
  const desincronizadas = [];
  for (const file of guiaFiles) {
    const slug = file.replace(/\.ts$/, '');
    const src = await readFile(path.join(ROOT, 'src', 'lib', 'guias', file), 'utf8');
    const real = (src.match(/updated:\s*'(\d{4}-\d{2}-\d{2})'/) || [])[1];
    if (!enSitemap[slug]) desincronizadas.push(`${slug}: falta en api/sitemap.ts`);
    else if (enSitemap[slug] !== real) desincronizadas.push(`${slug}: sitemap ${enSitemap[slug]} vs guía ${real}`);
  }
  R.check(a, `las ${guiaFiles.length} fechas de guías coinciden con src/lib/guias/`, desincronizadas.length === 0, desincronizadas.slice(0, 3).join(' | '));

  // Muestreo: cada URL del sitemap tiene que responder 200 e indexable.
  const muestra = [
    ...locs.filter((u) => !u.includes('/producto/') && !u.includes('/lab/') && !u.includes('/guias/')),
    ...locs.filter((u) => u.includes('/producto/')).slice(0, 5),
    ...locs.filter((u) => u.includes('/guias/')).slice(0, 3),
    ...locs.filter((u) => u.includes('/lab/')).slice(0, 3),
  ];
  let malos = [];
  for (const u of muestra) {
    const { pathname, search } = new URL(u);
    const res = await get(`${pathname}${search}`);
    const s = seoOf(res.html);
    if (res.status !== 200) malos.push(`${pathname} -> ${res.status}`);
    else if (!isIndexable(s.robots)) malos.push(`${pathname} -> noindex`);
    else if (s.canonical && s.canonical !== u) malos.push(`${pathname} -> canonical a ${s.canonical}`);
  }
  R.check(a, `las ${muestra.length} URLs muestreadas responden 200, indexables y autocanónicas`, malos.length === 0, malos.slice(0, 4).join(' | '));
  sitemapStats = { total: locs.length, productos: locs.filter((u) => u.includes('/producto/')).length, muestreadas: muestra.length };
}

// ---------------------------------------------------------------------------
// 9. llms.txt
// ---------------------------------------------------------------------------
{
  const a = 'llms.txt';
  const txt = LIVE ? await (await fetch(`${BASE}/llms.txt`)).text() : await readFile(path.join(ROOT, 'public', 'llms.txt'), 'utf8');
  const urls = [...txt.matchAll(/https:\/\/modeltex\.com\.ar([^\s)]*)/g)].map((m) => m[1] || '/');
  const privadas = urls.filter((u) => PRIVADAS.some((p) => u.startsWith(p)));
  R.check(a, 'empieza con un H1', /^#\s+\S/m.test(txt));
  R.check(a, 'no enlaza rutas privadas', privadas.length === 0, privadas.join(', '));
  R.check(a, 'enlaza la página pilar de moldería digital', txt.includes('/molderia-digital'));
  R.check(a, 'enlaza moldes PDF A4 y plotter', txt.includes('/moldes-pdf-a4') && txt.includes('/moldes-para-plotter'));

  const unicas = [...new Set(urls.filter((u) => u !== '/' && !u.includes('sitemap') && !u.includes('llms')))];
  const rotas = [];
  for (const u of unicas) {
    const res = await get(u);
    if (res.status !== 200) rotas.push(`${u} -> ${res.status}`);
  }
  R.check(a, `las ${unicas.length} URLs enlazadas responden 200`, rotas.length === 0, rotas.slice(0, 4).join(' | '));
}

// ---------------------------------------------------------------------------
R.print();

if (WRITE_REPORT) {
  const porArea = new Map();
  for (const r of R.rows) porArea.set(r.area.split(' — ')[0], (porArea.get(r.area.split(' — ')[0]) || []).concat(r));
  const fecha = new Date().toISOString().slice(0, 10);
  const md = [
    '# Reporte de validación SEO — Modeltex',
    '',
    `Generado el ${fecha} con \`node scripts/seo-check.mjs${LIVE ? ` --live ${BASE}` : ''}\`.`,
    `Origen de las pruebas: **${LIVE ? `sitio publicado (${BASE})` : 'middleware local sobre `dist/`'}**.`,
    '',
    `**${R.rows.length - R.failed.length} de ${R.rows.length} controles OK.**` + (R.failed.length ? ` ${R.failed.length} fallas.` : ' Sin fallas.'),
    '',
    sitemapStats ? `Sitemap: ${sitemapStats.total} URLs (${sitemapStats.productos} fichas de producto), ${sitemapStats.muestreadas} verificadas una por una.` : '',
    '',
    '## Qué verifica cada bloque',
    '',
    '| Bloque | Qué comprueba |',
    '| --- | --- |',
    '| HTML inicial | title, description, canonical, robots, H1 único, texto legible sin JavaScript, enlaces internos, Open Graph y JSON-LD de cada página pública principal. |',
    '| Paridad por User-Agent | Que la misma URL devuelva el mismo estado HTTP, canonical, robots y H1 a un navegador, Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot y OAI-SearchBot. Es el control anti-cloaking. |',
    '| 404 / noindex | Que producto, guía, curso, término, categoría, paginación y rutas inventadas devuelvan 404 real con noindex, cabecera X-Robots-Tag y sin canonical a la home. |',
    '| Rutas no indexables | Que /lab/ia y las rutas de cuenta/compra/admin lleven noindex en el HTML inicial, sin depender de JavaScript. |',
    '| Paginación del catálogo | Que las páginas válidas sean indexables con rel=prev/next, que ?pagina=1 redirija y que las vistas filtradas no se indexen. |',
    '| Ficha de producto | Schema Product completo, una sola moneda (ARS), sin JSON-LD duplicado y canonical propio. |',
    '| robots.txt | Que las rutas privadas estén bloqueadas para TODOS los grupos de user-agent (incluidos los bots de IA) y las públicas permitidas para todos. |',
    '| sitemap.xml | XML válido, sin duplicados, con lastmod real, sin priority/changefreq, sin rutas privadas ni paginadas, y con cada URL muestreada respondiendo 200 e indexable. |',
    '| llms.txt | Que no enlace rutas privadas y que todas sus URLs respondan 200. |',
    '',
    '## Resultados',
    '',
  ];
  for (const [area, rows] of porArea) {
    const fallas = rows.filter((r) => !r.ok);
    md.push(`### ${area} — ${rows.length - fallas.length}/${rows.length}`, '');
    if (fallas.length) {
      md.push('| Control | Detalle |', '| --- | --- |');
      for (const f of fallas) md.push(`| ❌ ${mdEscape(f.nombre)} | ${mdEscape(f.detalle)} |`);
      md.push('');
    } else {
      md.push('Sin fallas.', '');
    }
  }
  if (R.failed.length === 0) md.push('## Conclusión', '', 'Todos los controles pasan.', '');
  await writeReport('seo-validation-report.md', md.join('\n'));
}

process.exit(R.failed.length ? 1 : 0);
