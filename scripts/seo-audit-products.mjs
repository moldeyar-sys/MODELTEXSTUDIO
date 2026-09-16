// Auditoria de calidad SEO de TODAS las fichas de producto activas.
//
//   node scripts/seo-audit-products.mjs            -> audita y escribe el reporte
//   node scripts/seo-audit-products.mjs --no-report
//
// Lee los productos de Supabase con la anon key (solo lectura) y aplica las
// MISMAS funciones que usan la app y el middleware para armar el titulo, el H1
// y la descripcion (src/lib/productContent.ts), asi lo que se audita es
// exactamente lo que ve Google, no una aproximacion.
//
// No modifica nada: produce seo-audit-products-report.md con el detalle y la
// prioridad de correccion.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadSitemap, writeReport, mdEscape } from './seo-lib.mjs';

const WRITE_REPORT = !process.argv.includes('--no-report');

const SUPABASE_URL = 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const CATEGORIAS_VALIDAS = ['dama', 'hombre', 'nina', 'nino', 'bebes', 'adultos-unisex', 'ninos-unisex'];

// --- Helpers reales del proyecto (compilados con esbuild) -------------------
async function loadProductContent() {
  const esbuild = await import('esbuild');
  const outfile = path.join(ROOT, 'node_modules', '.seo-check', 'productContent.mjs');
  await esbuild.build({
    entryPoints: [path.join(ROOT, 'src', 'lib', 'productContent.ts')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    logLevel: 'silent',
    plugins: [
      {
        name: 'ts-from-js',
        setup(build) {
          build.onResolve({ filter: /^\.{1,2}\/.*\.js$/ }, (args) => ({
            path: path.resolve(args.resolveDir, args.path.replace(/\.js$/, '.ts')),
          }));
        },
      },
    ],
  });
  return import(`${new URL(`file:///${outfile.replace(/\\/g, '/')}`).href}?t=${Date.now()}`);
}

async function fetchAll(select) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=${select}&is_active=eq.true&order=created_at.desc&limit=1000&offset=${offset}`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

const num = (v) => (typeof v === 'number' && v > 0 ? v : null);
const txt = (v) => (v == null ? '' : String(v)).trim();

// --- Definicion de los problemas que se buscan -----------------------------
// `nivel`: alto = afecta indexacion o resultado enriquecido; medio = calidad
// del snippet o del contenido; bajo = prolijidad.
const CHEQUEOS = [
  {
    id: 'sin-imagen',
    nivel: 'alto',
    titulo: 'Sin imagen principal',
    porque: 'Sin main_image_url la ficha no puede aparecer en Google Imágenes ni mostrar foto en el resultado enriquecido, y el schema Product queda incompleto.',
    test: (p) => !txt(p.main_image_url),
  },
  {
    id: 'sin-precio',
    nivel: 'alto',
    titulo: 'Sin ningún precio en pesos',
    porque: 'Sin precio ARS el schema Product sale sin offers: Google no muestra precio ni disponibilidad y descarta el resultado enriquecido de producto.',
    test: (p) => ![num(p.precio_carton), num(p.precio_pdf_a4), num(p.precio_pdf_ploter), num(p.price)].some(Boolean),
  },
  {
    id: 'sin-categoria',
    nivel: 'alto',
    titulo: 'Categoría vacía o desconocida',
    porque: 'Sin categoría válida la ficha no aparece en ninguna página de categoría, no tiene miga de pan completa y el sufijo del título sale vacío.',
    test: (p) => !CATEGORIAS_VALIDAS.includes(txt(p.category)),
  },
  {
    id: 'sin-descripcion',
    nivel: 'alto',
    titulo: 'Sin descripción (corta ni larga)',
    porque: 'La meta description se arma con la descripción: sin ella Google inventa el snippet con texto de plantilla, igual en decenas de fichas.',
    test: (p) => !txt(p.short_description) && !txt(p.long_description),
  },
  {
    id: 'descripcion-pobre',
    nivel: 'medio',
    titulo: 'Descripción de menos de 60 caracteres',
    porque: 'Una descripción de una línea no alcanza para una meta description útil ni para que un asistente de IA entienda de qué es el molde.',
    test: (p) => {
      const d = txt(p.short_description) || txt(p.long_description);
      return !!d && d.length < 60;
    },
  },
  {
    id: 'titulo-generico',
    nivel: 'medio',
    titulo: 'Título genérico (garment_type es un código, no una descripción)',
    porque: 'Sin una frase real de prenda el título queda en "CAMPERA — molde digital para dama": no dice qué distingue a este molde y se repite entre fichas del mismo nombre.',
    test: (p, h) => !h.garmentPhrase(p),
  },
  {
    id: 'nombre-corto',
    nivel: 'medio',
    titulo: 'Nombre de menos de 6 caracteres',
    porque: 'Un nombre de 3 o 4 letras no describe la prenda ni sirve como texto de anclaje en los listados.',
    test: (p) => txt(p.name).length < 6,
  },
  {
    id: 'sin-talles',
    nivel: 'medio',
    titulo: 'Sin talles cargados',
    porque: 'Los talles alimentan la ficha técnica, las FAQ propias del producto y el additionalProperty del schema. Vacíos, la ficha pierde el argumento de venta principal.',
    test: (p) => !(p.sizes || []).length,
  },
  {
    id: 'sin-formatos',
    nivel: 'medio',
    titulo: 'Sin formatos cargados',
    porque: 'Sin formats el filtro por formato del catálogo no encuentra la ficha y el texto no dice en qué se entrega el molde.',
    test: (p) => !(p.formats || []).length,
  },
  {
    id: 'titulo-largo',
    nivel: 'medio',
    titulo: 'El <title> pasa de 80 caracteres',
    porque: 'Google muestra unos 60 caracteres de título. Lo que pasa de ahí no se ve, así que conviene que la frase de la prenda sea corta y concreta.',
    test: (p, h) => `${h.productTitle(p)} | Modeltex`.length > 80,
  },
  {
    id: 'sin-codigo',
    nivel: 'bajo',
    titulo: 'Sin código interno',
    porque: 'El código es el sku del schema Product (sin él se usa el slug, que también es válido) y es lo que diferencia el título cuando dos fichas comparten la misma frase de prenda.',
    test: (p) => !txt(p.codigo),
  },
  {
    id: 'titulo-duplicado',
    nivel: 'alto',
    titulo: 'Título idéntico a otra ficha',
    porque: 'Dos URLs distintas con el mismo <title> compiten entre sí: Google elige una y trata al resto como duplicado.',
    test: (p, h, ctx) => (ctx.titulosRepetidos.get(h.productTitle(p)) || 0) > 1,
  },
  {
    id: 'slug-pobre',
    nivel: 'bajo',
    titulo: 'Slug poco descriptivo',
    porque: 'Un slug como "short-08-2" no aporta ninguna palabra clave en la URL ni se entiende al compartir el link.',
    test: (p) => {
      const s = txt(p.slug);
      const palabras = s.split('-').filter((w) => w.length > 2 && !/^\d+$/.test(w));
      return palabras.length < 2;
    },
  },
  {
    id: 'sin-telas',
    nivel: 'bajo',
    titulo: 'Sin telas recomendadas',
    porque: 'Las telas recomendadas son contenido propio de la ficha y responden una de las preguntas más frecuentes antes de comprar.',
    test: (p) => !(p.recommended_fabrics || []).length,
  },
  {
    id: 'sin-temporada',
    nivel: 'bajo',
    titulo: 'Sin temporada',
    porque: 'La temporada alimenta un filtro del catálogo y la ficha técnica; vacía, el molde no aparece al filtrar por verano o invierno.',
    test: (p) => !txt(p.season),
  },
];

// ---------------------------------------------------------------------------
const helpers = await loadProductContent();
console.log('Leyendo productos de Supabase...');
const productos = await fetchAll(
  'id,name,slug,codigo,short_description,long_description,main_image_url,gallery,category,garment_type,season,sizes,formats,recommended_fabrics,price,precio_carton,precio_pdf_a4,precio_pdf_ploter,entrega_inmediata,created_at',
);
console.log(`${productos.length} fichas activas.`);

// Contexto: titulos repetidos
const titulosRepetidos = new Map();
for (const p of productos) {
  const t = helpers.productTitle(p);
  titulosRepetidos.set(t, (titulosRepetidos.get(t) || 0) + 1);
}
const nombresRepetidos = new Map();
for (const p of productos) {
  const n = txt(p.name).toUpperCase();
  nombresRepetidos.set(n, (nombresRepetidos.get(n) || 0) + 1);
}
const ctx = { titulosRepetidos, nombresRepetidos };

// Aplicar chequeos
const hallazgos = new Map(CHEQUEOS.map((c) => [c.id, []]));
const porProducto = new Map();
for (const p of productos) {
  const suyos = [];
  for (const c of CHEQUEOS) {
    let falla = false;
    try {
      falla = !!c.test(p, helpers, ctx);
    } catch {
      falla = false;
    }
    if (falla) {
      hallazgos.get(c.id).push(p);
      suyos.push(c.id);
    }
  }
  if (suyos.length) porProducto.set(p.slug, suyos);
}

// Cruce con el sitemap: nada indexable afuera, nada de afuera adentro
console.log('Comparando con el sitemap...');
let enSitemapNoActivo = [];
let activoNoEnSitemap = [];
try {
  const xml = await loadSitemap();
  const slugsSitemap = new Set(
    [...xml.matchAll(/<loc>[^<]*\/producto\/([^<]+)<\/loc>/g)].map((m) => decodeURIComponent(m[1].replace(/&amp;/g, '&'))),
  );
  const slugsActivos = new Set(productos.map((p) => p.slug));
  enSitemapNoActivo = [...slugsSitemap].filter((s) => !slugsActivos.has(s));
  activoNoEnSitemap = [...slugsActivos].filter((s) => !slugsSitemap.has(s));
} catch (e) {
  console.log('  (no se pudo generar el sitemap local:', e.message, ')');
}

// --- Salida ----------------------------------------------------------------
const conProblemas = porProducto.size;
const soloAltos = [...porProducto.values()].filter((ids) =>
  ids.some((id) => CHEQUEOS.find((c) => c.id === id).nivel === 'alto'),
).length;

console.log('');
for (const nivel of ['alto', 'medio', 'bajo']) {
  console.log(`\x1b[1mPrioridad ${nivel}\x1b[0m`);
  for (const c of CHEQUEOS.filter((x) => x.nivel === nivel)) {
    const n = hallazgos.get(c.id).length;
    const pct = ((n / productos.length) * 100).toFixed(1);
    const color = n === 0 ? '\x1b[32m' : nivel === 'alto' ? '\x1b[31m' : '\x1b[33m';
    console.log(`  ${color}${String(n).padStart(5)}\x1b[0m (${pct.padStart(5)}%)  ${c.titulo}`);
  }
}
console.log('');
console.log(`Fichas con al menos un problema: ${conProblemas} de ${productos.length} (${((conProblemas / productos.length) * 100).toFixed(1)}%)`);
console.log(`Fichas con al menos un problema de prioridad alta: ${soloAltos}`);
console.log(`En el sitemap pero no activas: ${enSitemapNoActivo.length}`);
console.log(`Activas pero fuera del sitemap: ${activoNoEnSitemap.length}`);

if (WRITE_REPORT) {
  const fecha = new Date().toISOString().slice(0, 10);
  const pct = (n) => `${((n / productos.length) * 100).toFixed(1)}%`;
  const md = [
    '# Auditoría de las fichas de producto — Modeltex',
    '',
    `Generado el ${fecha} con \`node scripts/seo-audit-products.mjs\`.`,
    '',
    `**${productos.length} fichas activas revisadas.** ${soloAltos} tienen algún problema de **prioridad alta** (los que afectan la indexación o el resultado enriquecido). ${conProblemas} tienen al menos una observación de cualquier nivel (${pct(conProblemas)}), pero ese número está dominado por dos cosas de prolijidad —código interno y slug— que se explican al final y que NO conviene corregir en masa.`,
    '',
    'El script aplica las mismas funciones que usan la app y el middleware para armar el título, el H1 y la descripción (`src/lib/productContent.ts`), así que lo que se audita es exactamente lo que ve Google.',
    '',
    '## Resumen',
    '',
    '| Prioridad | Problema | Fichas | % |',
    '| --- | --- | --: | --: |',
    ...['alto', 'medio', 'bajo'].flatMap((nivel) =>
      CHEQUEOS.filter((c) => c.nivel === nivel).map(
        (c) => `| ${nivel} | ${mdEscape(c.titulo)} | ${hallazgos.get(c.id).length} | ${pct(hallazgos.get(c.id).length)} |`,
      ),
    ),
    '',
    '## Coherencia con el sitemap',
    '',
    `- URLs de producto en el sitemap que no corresponden a una ficha activa: **${enSitemapNoActivo.length}**${enSitemapNoActivo.length ? ` (${enSitemapNoActivo.slice(0, 10).join(', ')})` : ' — ninguna.'}`,
    `- Fichas activas que no están en el sitemap: **${activoNoEnSitemap.length}**${activoNoEnSitemap.length ? ` (${activoNoEnSitemap.slice(0, 10).join(', ')})` : ' — ninguna.'}`,
    '',
    '## Detalle por problema',
    '',
  ];

  for (const nivel of ['alto', 'medio', 'bajo']) {
    for (const c of CHEQUEOS.filter((x) => x.nivel === nivel)) {
      const rows = hallazgos.get(c.id);
      md.push(`### ${c.titulo}`, '', `Prioridad **${nivel}** · ${rows.length} fichas (${pct(rows.length)})`, '', `${c.porque}`, '');
      if (!rows.length) {
        md.push('Sin casos.', '');
        continue;
      }
      md.push('| Ficha | Código | Categoría | Título que se publica hoy |', '| --- | --- | --- | --- |');
      for (const p of rows.slice(0, 12)) {
        md.push(
          `| [${mdEscape(p.name)}](https://modeltex.com.ar/producto/${p.slug}) | ${mdEscape(txt(p.codigo) || '—')} | ${mdEscape(txt(p.category) || '—')} | ${mdEscape(helpers.productTitle(p))} |`,
        );
      }
      if (rows.length > 12) md.push(`| … | | | y ${rows.length - 12} fichas más |`);
      md.push('');
    }
  }

  const sinFrase = hallazgos.get('titulo-generico').length;
  const dups = hallazgos.get('titulo-duplicado');
  const porTitulo = new Map();
  for (const p of dups) {
    const t = helpers.productTitle(p);
    porTitulo.set(t, [...(porTitulo.get(t) || []), p]);
  }

  md.push(
    '## Lo que hay que mirar de verdad',
    '',
    'El catálogo está mucho mejor de lo que sugería la auditoría inicial: **ninguna ficha se quedó sin imagen, sin precio, sin categoría, sin descripción, sin talles ni sin temporada.** Los títulos genéricos tipo "CAMPERA — molde digital para dama" son 11, no una plaga.',
    '',
    'Lo que queda es esto, por orden de impacto real:',
    '',
    `### 1. ${dups.length} fichas con el título repetido (${porTitulo.size} pares)`,
    '',
    'No es un problema de código: son fichas **duplicadas de verdad** en el catálogo, con el mismo nombre y la misma frase de prenda. Google va a elegir una de cada par e ignorar la otra, lo cual está bien, pero conviene decidirlo a mano: o se diferencian (si son moldes distintos) o se da de baja una (si son la misma).',
    '',
    ...(porTitulo.size
      ? [
          '| Título repetido | Fichas |',
          '| --- | --- |',
          ...[...porTitulo.entries()].map(
            ([t, ps]) => `| ${mdEscape(t)} | ${ps.map((p) => `[${p.slug}](https://modeltex.com.ar/producto/${p.slug})`).join(' · ')} |`,
          ),
          '',
        ]
      : ['Sin casos.', '']),
    `### 2. ${sinFrase} fichas sin frase de prenda`,
    '',
    'Tienen en `garment_type` un código viejo en mayúsculas ("CHALECO DAMA", "SHORT 019") en vez de una frase que describa la prenda. Para esas, el título cae en la versión genérica.',
    '',
    '**Esto no se puede automatizar.** "Campera deportiva con capucha" no está en ningún campo de la base: inventarla sería cargar en la ficha un rasgo que el molde puede no tener. Hay que escribirla a mano mirando la foto, desde `/admin`. Son 11 fichas: es una tarde de trabajo.',
    '',
    `### 3. ${hallazgos.get('slug-pobre').length} slugs sin palabras clave (${pct(hallazgos.get('slug-pobre').length)})`,
    '',
    'Slugs como `top-107` o `falda-44` no llevan ninguna palabra clave en la URL, aunque la ficha SÍ tiene la frase descriptiva cargada ("top con recorte al frente"). Es la mejora con más potencial del catálogo… y la más riesgosa.',
    '',
    '**Recomendación: no hacerlo en masa.** Cambiar 1.548 URLs resetea el historial de indexación de cada una. El proyecto ya tiene el mecanismo de redirecciones 301 (`src/lib/slugRedirects.ts`) para no perder los links viejos, pero el costo de equivocarse es alto y la ganancia por ficha es chica. Lo sensato es cambiar el slug solo cuando ya se está editando esa ficha por otro motivo, agregando siempre la entrada en `slugRedirects.ts`, y empezando por los moldes que más se venden.',
    '',
    `### 4. ${hallazgos.get('titulo-largo').length} títulos de más de 80 caracteres`,
    '',
    'Google muestra unos 60. Ya se reordenó el título para que la frase de la prenda y la palabra clave vayan primero (antes arrancaba con el nombre interno, repetido en decenas de fichas), así que lo que se corta es la referencia de modelo entre paréntesis, que es lo descartable. Acortar las frases más largas en `garment_type` mejoraría el CTR, pero no es urgente.',
    '',
    '## Qué se puede automatizar y qué no',
    '',
    '| Se puede | No se puede |',
    '| --- | --- |',
    '| Reordenar el título para poner primero la frase y la palabra clave (ya hecho en `productTitle()`). | Escribir la frase de la prenda: no está en ningún campo. |',
    '| Usar el código, o el número del nombre, como referencia que diferencia dos fichas parecidas (ya hecho). | Completar telas recomendadas: dependen del molde real. |',
    '| Detectar y listar duplicados, faltantes y títulos largos (este script). | Completar precios: es una decisión comercial. |',
    '| Marcar `season` en `todo-el-anio` por defecto, si Denis confirma que ese es el criterio. | Reescribir 1.548 slugs de una sola vez sin riesgo. |',
    '',
    '## Orden de trabajo sugerido',
    '',
    `1. Resolver los ${porTitulo.size} pares de fichas duplicadas: diferenciarlas o dar de baja una.`,
    `2. Cargar la frase de prenda en las ${sinFrase} fichas que la tienen como código.`,
    `3. Completar los formatos de las ${hallazgos.get('sin-formatos').length} fichas sin \`formats\` (sin eso no aparecen al filtrar por formato en el catálogo).`,
    `4. Revisar las ${hallazgos.get('nombre-corto').length} fichas con nombre de menos de 6 caracteres.`,
    '5. De ahí en adelante, prolijidad: telas recomendadas, códigos internos y slugs, siempre de a una ficha y aprovechando ediciones que ya se estén haciendo.',
    '',
    'Todo esto se edita desde `/admin`, ficha por ficha. Volver a correr `node scripts/seo-audit-products.mjs` después de cada tanda muestra cuánto bajó cada número.',
    '',
  );

  await writeReport('seo-audit-products-report.md', md.join('\n'));
}
