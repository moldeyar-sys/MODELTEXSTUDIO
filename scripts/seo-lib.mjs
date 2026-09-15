// Utilidades compartidas por los scripts de validacion SEO.
//
// La pieza central es `loadMiddleware()`: compila middleware.ts con esbuild y
// lo importa como modulo, con un `fetch` interceptado para que el pedido
// interno de `/index.html` lea el build local (dist/index.html) en vez de
// salir a internet. Asi se puede probar el comportamiento REAL del middleware
// (estado HTTP, canonical, robots, H1, JSON-LD) sin desplegar nada.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ORIGIN = 'https://modeltex.com.ar';

export const UA = {
  navegador: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  gptbot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot',
  claudebot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +claudebot@anthropic.com',
  perplexitybot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot',
  oaisearchbot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
};

/** Resuelve los imports `./src/lib/x.js` de middleware.ts al `.ts` real. */
const tsResolver = {
  name: 'ts-from-js',
  setup(build) {
    build.onResolve({ filter: /^\.{1,2}\/.*\.js$/ }, (args) => {
      const candidate = path.resolve(args.resolveDir, args.path.replace(/\.js$/, '.ts'));
      return existsSync(candidate) ? { path: candidate } : undefined;
    });
  },
};

async function bundle(entry, outName) {
  const esbuild = await import('esbuild');
  const outdir = path.join(ROOT, 'node_modules', '.seo-check');
  await mkdir(outdir, { recursive: true });
  const outfile = path.join(outdir, outName);
  await esbuild.build({
    entryPoints: [path.join(ROOT, entry)],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    logLevel: 'silent',
    plugins: [tsResolver],
  });
  return outfile;
}

/**
 * Compila e importa middleware.ts. Devuelve `request(path, ua)` que ejecuta el
 * middleware como lo haria Vercel y resuelve a `{ status, headers, html }`.
 * Si el middleware decide no intervenir (cabecera x-middleware-next) devuelve
 * el index.html crudo con status 200, igual que haria el rewrite de Vercel.
 */
export async function loadMiddleware() {
  const shell = await readFile(path.join(ROOT, 'dist', 'index.html'), 'utf8').catch(() => {
    throw new Error('Falta dist/index.html. Corré `npm run build` antes de validar.');
  });

  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const href = typeof input === 'string' ? input : input.url;
    if (href.endsWith('/index.html')) return new Response(shell, { headers: { 'content-type': 'text/html' } });
    return realFetch(input, init);
  };

  const outfile = await bundle('middleware.ts', 'middleware.mjs');
  const mod = await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
  const handler = mod.default;

  return async function request(pathAndQuery, ua = UA.navegador) {
    const res = await handler(new Request(`${ORIGIN}${pathAndQuery}`, { headers: { 'user-agent': ua }, redirect: 'manual' }));
    const headers = Object.fromEntries(res.headers.entries());
    if (headers['x-middleware-next'] === '1') return { status: 200, headers, html: shell, passthrough: true };
    if (res.status >= 300 && res.status < 400) return { status: res.status, headers, html: '', location: headers.location };
    return { status: res.status, headers, html: await res.text() };
  };
}

/** Compila e importa api/sitemap.ts y devuelve el XML que produce. */
export async function loadSitemap() {
  const outfile = await bundle('api/sitemap.ts', 'sitemap.mjs');
  const mod = await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
  let body = '';
  const res = {
    setHeader() {},
    status() {
      return res;
    },
    send(v) {
      body = v;
    },
  };
  await mod.default({}, res);
  return body;
}

// ---------------------------------------------------------------------------
// Lectura de HTML (sin dependencias: expresiones regulares acotadas)
// ---------------------------------------------------------------------------

export const pick = (html, re) => (html.match(re) || [])[1] || '';

export const seoOf = (html) => ({
  title: pick(html, /<title>([\s\S]*?)<\/title>/),
  description: pick(html, /<meta name="description" content="([^"]*)"/),
  canonical: pick(html, /<link rel="canonical" href="([^"]*)"/),
  robots: pick(html, /<meta name="robots" content="([^"]*)"/),
  ogTitle: pick(html, /<meta property="og:title" content="([^"]*)"/),
  ogUrl: pick(html, /<meta property="og:url" content="([^"]*)"/),
  twitterTitle: pick(html, /<meta name="twitter:title" content="([^"]*)"/),
  h1: (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || []).map((h) => h.replace(/<[^>]+>/g, '').trim()),
  links: [...new Set((html.match(/<main data-bot-content>[\s\S]*?<\/main>/) || [''])[0].match(/href="([^"]+)"/g) || [])],
  bodyText: ((html.match(/<main data-bot-content>([\s\S]*?)<\/main>/) || [])[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
});

/** Todos los JSON-LD del documento, con su data-seo-schema y el objeto parseado. */
export function jsonLdOf(html) {
  const out = [];
  const re = /<script type="application\/ld\+json"(?:\s+data-seo-schema="([^"]*)")?\s*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    let data = null;
    let error = null;
    try {
      data = JSON.parse(m[2]);
    } catch (e) {
      error = e.message;
    }
    out.push({ id: m[1] || null, data, error, types: data ? [].concat(data['@type'] || []) : [] });
  }
  return out;
}

export const hasType = (blocks, type) => blocks.some((b) => b.types.includes(type));

/** ids de data-seo-schema repetidos (el schema se duplicaria al hidratar). */
export function duplicateSchemaIds(blocks) {
  const seen = new Map();
  for (const b of blocks) if (b.id) seen.set(b.id, (seen.get(b.id) || 0) + 1);
  return [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
}

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------

/** Parsea robots.txt a { agente: { allow: [], disallow: [] } }. */
export function parseRobots(txt) {
  const groups = {};
  let current = [];
  let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [k, ...rest] = line.split(':');
    const key = k.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) current = [];
      current.push(value);
      groups[value] ||= { allow: [], disallow: [] };
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key !== 'allow' && key !== 'disallow') continue;
    for (const agent of current) {
      groups[agent] ||= { allow: [], disallow: [] };
      groups[agent][key].push(value);
    }
  }
  return groups;
}

/**
 * Aplica las reglas de un grupo a una ruta con el criterio real de Google:
 * gana la regla de path mas largo; a igual longitud gana Allow.
 */
export function robotsAllows(group, url) {
  if (!group) return true;
  let best = { len: -1, allow: true };
  for (const kind of ['allow', 'disallow']) {
    for (const rule of group[kind]) {
      if (!rule) continue;
      if (!url.startsWith(rule.replace(/\*$/, ''))) continue;
      const len = rule.length;
      if (len > best.len || (len === best.len && kind === 'allow')) best = { len, allow: kind === 'allow' };
    }
  }
  return best.allow;
}

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------

export function makeReporter() {
  const rows = [];
  return {
    rows,
    check(area, nombre, ok, detalle = '') {
      rows.push({ area, nombre, ok: !!ok, detalle });
      return !!ok;
    },
    get failed() {
      return rows.filter((r) => !r.ok);
    },
    print() {
      let area = '';
      for (const r of rows) {
        if (r.area !== area) {
          area = r.area;
          console.log(`\n\x1b[1m${area}\x1b[0m`);
        }
        const mark = r.ok ? '\x1b[32mOK  \x1b[0m' : '\x1b[31mFALLA\x1b[0m';
        console.log(`  ${mark} ${r.nombre}${r.detalle ? `  \x1b[2m${r.detalle}\x1b[0m` : ''}`);
      }
      console.log(
        `\n${rows.length - this.failed.length}/${rows.length} controles OK` +
          (this.failed.length ? `  —  \x1b[31m${this.failed.length} fallas\x1b[0m` : '  —  \x1b[32msin fallas\x1b[0m'),
      );
    },
  };
}

export async function writeReport(file, contents) {
  await writeFile(path.join(ROOT, file), contents, 'utf8');
  console.log(`\nReporte escrito en ${file}`);
}

export const mdEscape = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
