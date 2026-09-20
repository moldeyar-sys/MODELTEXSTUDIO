#!/usr/bin/env node
/**
 * Genera la marca y todos los iconos del sitio a partir del logo del maniquí.
 *
 * ── Qué problema resuelve ───────────────────────────────────────────────────
 * 1. El logo original viene sobre un fondo negro que NO es parte de la paleta
 *    de Modeltex: es un telón. Este script lo recorta y deja el maniquí sobre
 *    transparencia, con los bordes bien suavizados.
 * 2. Google recorta el favicon en CÍRCULO en los resultados de búsqueda. Si el
 *    dibujo toca los bordes, el recorte le come los hombros y la base. Por eso
 *    los iconos se arman con el maniquí centrado y con aire calculado.
 * 3. modeltex.com.ar/favicon.ico no existía: como el sitio manda todo lo que no
 *    encuentra a index.html, a Google le llegaba la página HTML entera en lugar
 *    de un icono.
 *
 * ── Cómo recorta el negro ───────────────────────────────────────────────────
 * El telón es negro puro, así que lo que se ve ya está premultiplicado:
 *   color visto = alfa × color real     (el fondo no aporta nada)
 * El dibujo es de colores planos, así que para cada píxel se busca de cuál de
 * esos colores es una versión atenuada, y esa proporción es el alfa. Sale un
 * borde limpio y de paso se va el ruido de compresión del archivo original.
 *
 * ── Qué escribe ─────────────────────────────────────────────────────────────
 *   public/brand/modeltex-mark.png        el maniquí solo, sin fondo, 1024 px
 *   public/favicon.ico                    16 + 32 + 48
 *   public/brand/favicon.png              96x96 (pisa el viejo de 64x64)
 *   public/brand/favicon-96 / -192 / -512
 *   public/brand/favicon-maskable-512.png más aire, para el recorte de Android
 *   public/brand/apple-touch-icon.png     180x180 (iPhone)
 *   public/apple-touch-icon.png           lo mismo en la raíz, ver abajo
 *   apk/.../mipmap-*\/ic_launcher*.png     el icono de la app de Android
 *   scripts/.iconos-prueba.html           hoja para mirar cómo queda
 *
 * Las dos imágenes de marca que llevan texto adentro —modeltex-logo-full.png y
 * og-image.png— las arma scripts/generar-lockup.mjs, que necesita el navegador
 * para componer la tipografía. `npm run iconos` corre los dos, en ese orden.
 *
 * Uso:  npm run iconos
 *       node scripts/generar-iconos.mjs --fondo=crema   (para probar otro fondo)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const PUBLICO = join(RAIZ, 'public');
const MARCA = join(PUBLICO, 'brand');

/** El logo tal como lo entregó el diseñador, sobre negro. */
const ORIGEN = join(MARCA, 'modeltex-mark-maniqui-original.png');

/** Cuánto del círculo ocupa el dibujo. 1 = lo toca; 0.90 deja 10 % de aire. */
const OCUPACION = 0.9;
/** Lo mismo para el icono "maskable" de Android, que recorta mucho más. */
const OCUPACION_MASCARA = 0.76;

/** Fondos posibles para la pastilla del icono. */
const FONDOS = {
  blanco: [255, 255, 255, 255],
  crema: [232, 231, 211, 255],   // el crema de la paleta
  azul: [11, 26, 49, 255],       // el azul tinta oscuro de la paleta
  negro: [0, 0, 0, 255],
};
const nombreFondo = (process.argv.find((a) => a.startsWith('--fondo=')) ?? '--fondo=blanco').split('=')[1];
const FONDO = FONDOS[nombreFondo];
if (!FONDO) throw new Error(`Fondo desconocido: ${nombreFondo}. Hay: ${Object.keys(FONDOS).join(', ')}`);

// ── PNG: leer ───────────────────────────────────────────────────────────────

/** Devuelve {w, h, px} con px en RGBA de 8 bits, sin premultiplicar. */
function leerPng(ruta) {
  const b = readFileSync(ruta);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(`${ruta} no es un PNG`);
  let p = 8, w = 0, h = 0, prof = 0, tipo = 0, paleta = null, trans = null;
  const trozos = [];
  while (p < b.length) {
    const largo = b.readUInt32BE(p);
    const clase = b.toString('ascii', p + 4, p + 8);
    const datos = b.subarray(p + 8, p + 8 + largo);
    if (clase === 'IHDR') {
      w = datos.readUInt32BE(0); h = datos.readUInt32BE(4);
      prof = datos[8]; tipo = datos[9];
      if (datos[12] !== 0) throw new Error('PNG entrelazado: no lo sé leer');
    } else if (clase === 'PLTE') paleta = Buffer.from(datos);
    else if (clase === 'tRNS') trans = Buffer.from(datos);
    else if (clase === 'IDAT') trozos.push(Buffer.from(datos));
    else if (clase === 'IEND') break;
    p += largo + 12;
  }
  if (prof !== 8) throw new Error(`PNG de ${prof} bits: este script espera 8`);

  const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipo];
  if (!canales) throw new Error(`Tipo de color PNG ${tipo} no soportado`);
  const bpp = canales;
  const anchoFila = w * bpp;
  const cruda = inflateSync(Buffer.concat(trozos));
  const plano = Buffer.alloc(anchoFila * h);

  let o = 0;
  for (let y = 0; y < h; y++) {
    const filtro = cruda[o++];
    const fila = y * anchoFila;
    const prev = fila - anchoFila;
    for (let x = 0; x < anchoFila; x++) {
      const crudo = cruda[o + x];
      const izq = x >= bpp ? plano[fila + x - bpp] : 0;
      const arr = y > 0 ? plano[prev + x] : 0;
      const dia = x >= bpp && y > 0 ? plano[prev + x - bpp] : 0;
      let v;
      if (filtro === 0) v = crudo;
      else if (filtro === 1) v = crudo + izq;
      else if (filtro === 2) v = crudo + arr;
      else if (filtro === 3) v = crudo + ((izq + arr) >> 1);
      else {
        const est = izq + arr - dia;
        const di = Math.abs(est - izq), da = Math.abs(est - arr), dd = Math.abs(est - dia);
        v = crudo + (di <= da && di <= dd ? izq : da <= dd ? arr : dia);
      }
      plano[fila + x] = v & 255;
    }
    o += anchoFila;
  }

  const px = Buffer.alloc(w * h * 4);
  for (let i = 0, j = 0; i < w * h; i++, j += 4) {
    const s = i * bpp;
    if (tipo === 6) { px[j] = plano[s]; px[j + 1] = plano[s + 1]; px[j + 2] = plano[s + 2]; px[j + 3] = plano[s + 3]; }
    else if (tipo === 2) { px[j] = plano[s]; px[j + 1] = plano[s + 1]; px[j + 2] = plano[s + 2]; px[j + 3] = 255; }
    else if (tipo === 0) { px[j] = px[j + 1] = px[j + 2] = plano[s]; px[j + 3] = 255; }
    else if (tipo === 4) { px[j] = px[j + 1] = px[j + 2] = plano[s]; px[j + 3] = plano[s + 1]; }
    else { const k = plano[s] * 3; px[j] = paleta[k]; px[j + 1] = paleta[k + 1]; px[j + 2] = paleta[k + 2]; px[j + 3] = trans?.[plano[s]] ?? 255; }
  }
  return { w, h, px };
}

// ── PNG: escribir ───────────────────────────────────────────────────────────

const TABLA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLA_CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function trozo(clase, datos) {
  const cab = Buffer.alloc(8);
  cab.writeUInt32BE(datos.length, 0);
  cab.write(clase, 4, 'ascii');
  const cola = Buffer.alloc(4);
  cola.writeUInt32BE(crc32(Buffer.concat([cab.subarray(4), datos])), 0);
  return Buffer.concat([cab, datos, cola]);
}

function escribirPng(ruta, { w, h, px }) {
  const anchoFila = w * 4;
  const cruda = Buffer.alloc((anchoFila + 1) * h);
  const intento = Buffer.alloc(anchoFila);
  const previa = Buffer.alloc(anchoFila);
  const actual = Buffer.alloc(anchoFila);

  // Filtrado adaptativo: por cada fila se prueban los cinco filtros del
  // estándar y se elige el que deja los números más chicos, que comprime mejor.
  for (let y = 0; y < h; y++) {
    px.copy(actual, 0, y * anchoFila, (y + 1) * anchoFila);
    let mejorFiltro = 0, mejorPuntaje = Infinity, mejorFila = null;
    for (let f = 0; f <= 4; f++) {
      let puntaje = 0;
      for (let x = 0; x < anchoFila; x++) {
        const izq = x >= 4 ? actual[x - 4] : 0;
        const arr = previa[x];
        const dia = x >= 4 ? previa[x - 4] : 0;
        let base;
        if (f === 0) base = 0;
        else if (f === 1) base = izq;
        else if (f === 2) base = arr;
        else if (f === 3) base = (izq + arr) >> 1;
        else {
          const est = izq + arr - dia;
          const di = Math.abs(est - izq), da = Math.abs(est - arr), dd = Math.abs(est - dia);
          base = di <= da && di <= dd ? izq : da <= dd ? arr : dia;
        }
        const v = (actual[x] - base) & 255;
        intento[x] = v;
        puntaje += v < 128 ? v : 256 - v;
      }
      if (puntaje < mejorPuntaje) { mejorPuntaje = puntaje; mejorFiltro = f; mejorFila = Buffer.from(intento); }
    }
    cruda[y * (anchoFila + 1)] = mejorFiltro;
    mejorFila.copy(cruda, y * (anchoFila + 1) + 1);
    actual.copy(previa);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  writeFileSync(ruta, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(cruda, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]));
}

// ── Sacar el telón negro ────────────────────────────────────────────────────

/** Los colores planos del dibujo, sacados de los píxeles más claros. */
function coloresDelDibujo(im) {
  const cuenta = new Map();
  for (let i = 0; i < im.w * im.h; i++) {
    const j = i * 4, r = im.px[j], g = im.px[j + 1], b = im.px[j + 2];
    if (0.2126 * r + 0.7152 * g + 0.0722 * b < 45) continue;   // telón o borde
    const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);   // agrupa el ruido
    const e = cuenta.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b;
    cuenta.set(k, e);
  }
  const orden = [...cuenta.values()].sort((a, b) => b.n - a.n)
    .map((e) => ({ n: e.n, c: [e.r / e.n, e.g / e.n, e.b / e.n] }));

  // Fusionar los que quedaron cerca: son el mismo color con otro ruido.
  const pal = [];
  for (const cand of orden) {
    if (cand.n < im.w * im.h * 0.001) continue;                // menos del 0,1 %
    const cerca = pal.find((p) => Math.hypot(...p.c.map((v, i) => v - cand.c[i])) < 42);
    if (cerca) { cerca.n += cand.n; continue; }
    pal.push({ ...cand });
  }
  return pal.sort((a, b) => b.n - a.n).slice(0, 6);
}

/**
 * Convierte el logo sobre negro en RGBA con el telón transparente.
 * Sobre negro, lo que se ve ya está premultiplicado (color = alfa × real), así
 * que proyectando cada píxel sobre el color plano que más se le parece sale
 * directo el alfa, y de paso el color queda limpio de ruido.
 */
function sacarElNegro(im, pal) {
  const px = Buffer.alloc(im.w * im.h * 4);
  for (let i = 0; i < im.w * im.h; i++) {
    const j = i * 4;
    const C = [im.px[j], im.px[j + 1], im.px[j + 2]];
    let mejor = null;
    for (const { c } of pal) {
      const pp = c[0] * c[0] + c[1] * c[1] + c[2] * c[2];
      let t = (C[0] * c[0] + C[1] * c[1] + C[2] * c[2]) / pp;
      t = Math.max(0, Math.min(1, t));
      const resto = Math.hypot(C[0] - t * c[0], C[1] - t * c[1], C[2] - t * c[2]);
      if (!mejor || resto < mejor.resto) mejor = { resto, t, c };
    }
    const a = Math.round(mejor.t * 255);
    px[j] = Math.round(mejor.c[0]); px[j + 1] = Math.round(mejor.c[1]);
    px[j + 2] = Math.round(mejor.c[2]); px[j + 3] = a;
  }
  return { w: im.w, h: im.h, px };
}

/** Recorta el vacío de alrededor para que el dibujo quede pegado al borde. */
function recortarAlDibujo(im) {
  let x0 = im.w, y0 = im.h, x1 = -1, y1 = -1;
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
    if (im.px[(y * im.w + x) * 4 + 3] > 8) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    im.px.copy(px, y * w * 4, ((y + y0) * im.w + x0) * 4, ((y + y0) * im.w + x0 + w) * 4);
  }
  return { w, h, px };
}

// ── Redimensionar ───────────────────────────────────────────────────────────

/** Catmull-Rom: nítido al achicar y sin halos al agrandar. */
function nucleo(t) {
  t = Math.abs(t);
  if (t >= 2) return 0;
  if (t >= 1) return -0.5 * t ** 3 + 2.5 * t ** 2 - 4 * t + 2;
  return 1.5 * t ** 3 - 2.5 * t ** 2 + 1;
}

/**
 * Redimensiona premultiplicando el alfa. Sin premultiplicar, el color de los
 * píxeles transparentes se mezclaría con el borde y dejaría un halo.
 * Devuelve el resultado premultiplicado.
 */
function redimensionar(im, nw, nh) {
  const pre = new Float64Array(im.w * im.h * 4);
  for (let i = 0; i < im.w * im.h; i++) {
    const a = im.px[i * 4 + 3] / 255;
    pre[i * 4] = im.px[i * 4] * a;
    pre[i * 4 + 1] = im.px[i * 4 + 1] * a;
    pre[i * 4 + 2] = im.px[i * 4 + 2] * a;
    pre[i * 4 + 3] = im.px[i * 4 + 3];
  }

  const pasada = (src, sw, sh, dw, dh, horizontal) => {
    const dst = new Float64Array(dw * dh * 4);
    const escala = horizontal ? sw / dw : sh / dh;
    const soporte = 2 * Math.max(1, escala);   // al achicar hay que ensancharlo
    for (let d = 0; d < (horizontal ? dw : dh); d++) {
      const centro = (d + 0.5) * escala - 0.5;
      const desde = Math.max(0, Math.ceil(centro - soporte));
      const hasta = Math.min((horizontal ? sw : sh) - 1, Math.floor(centro + soporte));
      const pesos = [];
      let suma = 0;
      for (let s = desde; s <= hasta; s++) {
        const p = nucleo((s - centro) / Math.max(1, escala));
        pesos.push(p); suma += p;
      }
      if (suma === 0) continue;
      for (let otro = 0; otro < (horizontal ? dh : dw); otro++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let s = desde; s <= hasta; s++) {
          const i = (horizontal ? otro * sw + s : s * sw + otro) * 4;
          const p = pesos[s - desde];
          r += src[i] * p; g += src[i + 1] * p; b += src[i + 2] * p; a += src[i + 3] * p;
        }
        const j = (horizontal ? otro * dw + d : d * dw + otro) * 4;
        dst[j] = r / suma; dst[j + 1] = g / suma; dst[j + 2] = b / suma; dst[j + 3] = a / suma;
      }
    }
    return dst;
  };

  const paso1 = pasada(pre, im.w, im.h, nw, im.h, true);
  return { w: nw, h: nh, pre: pasada(paso1, nw, im.h, nw, nh, false) };
}

/** Pasa un resultado premultiplicado a RGBA normal (para guardarlo con fondo transparente). */
function desPremultiplicar({ w, h, pre }) {
  const px = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = Math.min(255, Math.max(0, pre[i * 4 + 3]));
    px[i * 4 + 3] = Math.round(a);
    for (let c = 0; c < 3; c++) {
      const v = a > 0 ? (pre[i * 4 + c] / (a / 255)) : 0;
      px[i * 4 + c] = Math.min(255, Math.max(0, Math.round(v)));
    }
  }
  return { w, h, px };
}

// ── Componer ────────────────────────────────────────────────────────────────

/** Pone el dibujo centrado sobre un lienzo transparente (para Android). */
function sobreTransparente(tam, dibujo, x0, y0) {
  const px = Buffer.alloc(tam * tam * 4);
  const plano = desPremultiplicar(dibujo);
  for (let y = 0; y < dibujo.h; y++) {
    const dy = y0 + y;
    if (dy < 0 || dy >= tam) continue;
    for (let x = 0; x < dibujo.w; x++) {
      const dx = x0 + x;
      if (dx < 0 || dx >= tam) continue;
      plano.px.copy(px, (dy * tam + dx) * 4, (y * dibujo.w + x) * 4, (y * dibujo.w + x) * 4 + 4);
    }
  }
  return { w: tam, h: tam, px };
}

/** Pega el dibujo (premultiplicado) sobre un lienzo liso y devuelve RGBA. */
function componer(tam, dibujo, x0, y0, fondo) {
  const px = Buffer.alloc(tam * tam * 4);
  for (let i = 0; i < tam * tam; i++) {
    px[i * 4] = fondo[0]; px[i * 4 + 1] = fondo[1];
    px[i * 4 + 2] = fondo[2]; px[i * 4 + 3] = fondo[3];
  }
  for (let y = 0; y < dibujo.h; y++) {
    const dy = y0 + y;
    if (dy < 0 || dy >= tam) continue;
    for (let x = 0; x < dibujo.w; x++) {
      const dx = x0 + x;
      if (dx < 0 || dx >= tam) continue;
      const s = (y * dibujo.w + x) * 4;
      const a = Math.min(255, Math.max(0, dibujo.pre[s + 3])) / 255;
      if (a <= 0) continue;
      const d = (dy * tam + dx) * 4;
      for (let c = 0; c < 3; c++) {
        const v = dibujo.pre[s + c] + px[d + c] * (1 - a);
        px[d + c] = Math.min(255, Math.max(0, Math.round(v)));
      }
      px[d + 3] = 255;
    }
  }
  return { w: tam, h: tam, px };
}

// ── Geometría ───────────────────────────────────────────────────────────────

/** Círculo más chico que contiene todo lo opaco: centro y radio, en píxeles. */
function circuloMinimo(im) {
  const borde = [];
  for (let y = 0; y < im.h; y++) {
    let a = -1, b = -1;
    for (let x = 0; x < im.w; x++) if (im.px[(y * im.w + x) * 4 + 3] > 12) { if (a < 0) a = x; b = x; }
    if (a >= 0) borde.push([a + 0.5, y + 0.5], [b + 0.5, y + 0.5]);
  }
  for (let x = 0; x < im.w; x++) {
    let a = -1, b = -1;
    for (let y = 0; y < im.h; y++) if (im.px[(y * im.w + x) * 4 + 3] > 12) { if (a < 0) a = y; b = y; }
    if (a >= 0) borde.push([x + 0.5, a + 0.5], [x + 0.5, b + 0.5]);
  }

  // Envolvente convexa (Andrew): el círculo mínimo sólo depende de ella.
  const cruz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const pts = [...new Set(borde.map((p) => p.join(',')))]
    .map((t) => t.split(',').map(Number))
    .sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const bajo = [], alto = [];
  for (const p of pts) { while (bajo.length >= 2 && cruz(bajo.at(-2), bajo.at(-1), p) <= 0) bajo.pop(); bajo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (alto.length >= 2 && cruz(alto.at(-2), alto.at(-1), p) <= 0) alto.pop(); alto.push(p); }
  const env = bajo.slice(0, -1).concat(alto.slice(0, -1));

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const cabe = (c, r) => env.every((p) => dist(p, c) <= r + 1e-6);
  let mejor = null;
  for (let i = 0; i < env.length; i++) for (let j = i + 1; j < env.length; j++) {
    const c = [(env[i][0] + env[j][0]) / 2, (env[i][1] + env[j][1]) / 2];
    const r = dist(env[i], env[j]) / 2;
    if (cabe(c, r) && (!mejor || r < mejor.r)) mejor = { c, r };
  }
  for (let i = 0; i < env.length; i++) for (let j = i + 1; j < env.length; j++) for (let k = j + 1; k < env.length; k++) {
    const [A, B, C] = [env[i], env[j], env[k]];
    const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
    if (Math.abs(d) < 1e-9) continue;
    const sa = A[0] ** 2 + A[1] ** 2, sb = B[0] ** 2 + B[1] ** 2, sc = C[0] ** 2 + C[1] ** 2;
    const c = [
      (sa * (B[1] - C[1]) + sb * (C[1] - A[1]) + sc * (A[1] - B[1])) / d,
      (sa * (C[0] - B[0]) + sb * (A[0] - C[0]) + sc * (B[0] - A[0])) / d,
    ];
    const r = dist(c, A);
    if (cabe(c, r) && (!mejor || r < mejor.r)) mejor = { c, r };
  }
  return mejor;
}

// ── ICO ─────────────────────────────────────────────────────────────────────

/**
 * Arma un .ico con varias medidas. Cada una va como DIB (mapa de bits) y no
 * como PNG embebido: el PNG dentro del ICO sólo lo entienden los lectores
 * nuevos, y este archivo lo pide de todo, incluido el robot de Google.
 */
function escribirIco(ruta, imagenes) {
  const cuerpos = imagenes.map(({ w, h, px }) => {
    const cab = Buffer.alloc(40);
    cab.writeUInt32LE(40, 0);
    cab.writeInt32LE(w, 4);
    cab.writeInt32LE(h * 2, 8);   // alto doble: la norma cuenta color + máscara
    cab.writeUInt16LE(1, 12);
    cab.writeUInt16LE(32, 14);
    cab.writeUInt32LE(0, 16);
    cab.writeUInt32LE(w * h * 4, 20);
    const color = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      const orig = (h - 1 - y) * w * 4;      // el DIB va de abajo hacia arriba
      for (let x = 0; x < w; x++) {
        const s = orig + x * 4, d = (y * w + x) * 4;
        color[d] = px[s + 2]; color[d + 1] = px[s + 1];
        color[d + 2] = px[s]; color[d + 3] = px[s + 3];
      }
    }
    // Máscara AND en 1 bit, filas alineadas a 4 bytes. Todo opaco = todo ceros.
    const mascara = Buffer.alloc(Math.ceil(w / 32) * 4 * h);
    return { w, h, datos: Buffer.concat([cab, color, mascara]) };
  });

  const dir = Buffer.alloc(6 + 16 * cuerpos.length);
  dir.writeUInt16LE(0, 0); dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(cuerpos.length, 4);
  let desplazamiento = dir.length;
  cuerpos.forEach((c, i) => {
    const o = 6 + i * 16;
    dir[o] = c.w >= 256 ? 0 : c.w;
    dir[o + 1] = c.h >= 256 ? 0 : c.h;
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(c.datos.length, o + 8);
    dir.writeUInt32LE(desplazamiento, o + 12);
    desplazamiento += c.datos.length;
  });
  writeFileSync(ruta, Buffer.concat([dir, ...cuerpos.map((c) => c.datos)]));
}

// ── Hacerlo ─────────────────────────────────────────────────────────────────

const crudo = leerPng(ORIGEN);
const pal = coloresDelDibujo(crudo);
console.log(`Original: ${crudo.w}x${crudo.h}`);
console.log('Colores planos encontrados:');
for (const { c, n } of pal) {
  const hex = '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  console.log(`  ${hex}  ${(n / (crudo.w * crudo.h) * 100).toFixed(1)} % de la imagen`);
}

const limpio = recortarAlDibujo(sacarElNegro(crudo, pal));
const circulo = circuloMinimo(limpio);
const proporcion = limpio.w / limpio.h;
console.log(`\nManiquí sin el telón: ${limpio.w}x${limpio.h}`);
console.log(`Círculo que lo contiene entero: ${(circulo.r * 2).toFixed(1)} px de diámetro`);
console.log(`  → su alto puede ser, como mucho, el ${((limpio.h / (circulo.r * 2)) * 100).toFixed(1)} % del círculo`);
console.log(`  → con ${Math.round(OCUPACION * 100)} % de ocupación queda en el ${((limpio.h / (circulo.r * 2)) * OCUPACION * 100).toFixed(1)} %`);
console.log(`Fondo de la pastilla: ${nombreFondo}\n`);

/** El maniquí a la medida pedida, centrado por su círculo y no por su caja. */
function maniqui(tam, ocupacion) {
  const alto = Math.round((limpio.h / (circulo.r * 2)) * ocupacion * tam);
  const ancho = Math.round(alto * proporcion);
  const dibujo = redimensionar(limpio, ancho, alto);
  // Llevar el centro del círculo mínimo —no el del rectángulo— al centro del
  // lienzo, que es lo que hace que el recorte circular quede parejo.
  const cx = (circulo.c[0] / limpio.w) * ancho;
  const cy = (circulo.c[1] / limpio.h) * alto;
  return { dibujo, x: Math.round(tam / 2 - cx), y: Math.round(tam / 2 - cy) };
}

function icono(tam, ocupacion = OCUPACION, fondo = FONDO) {
  const { dibujo, x, y } = maniqui(tam, ocupacion);
  return componer(tam, dibujo, x, y, fondo);
}

/** Lo mismo pero sin fondo, para la capa de adelante del icono de Android. */
function iconoSinFondo(tam, ocupacion) {
  const { dibujo, x, y } = maniqui(tam, ocupacion);
  return sobreTransparente(tam, dibujo, x, y);
}

mkdirSync(MARCA, { recursive: true });

// La marca sola, sin fondo: es el archivo reusable para todo lo demás.
const altoMarca = 1024;
escribirPng(join(MARCA, 'modeltex-mark.png'),
  desPremultiplicar(redimensionar(limpio, Math.round(altoMarca * proporcion), altoMarca)));
console.log(`✓ public/brand/modeltex-mark.png  (${Math.round(altoMarca * proporcion)}x${altoMarca}, sin fondo)`);

const salidas = [
  [join(MARCA, 'favicon.png'), 96],
  [join(MARCA, 'favicon-96.png'), 96],
  [join(MARCA, 'favicon-192.png'), 192],
  [join(MARCA, 'favicon-512.png'), 512],
  [join(MARCA, 'apple-touch-icon.png'), 180],
  // También en la raíz: iOS y algunos robots lo piden ahí sin mirar el HTML, y
  // como el sitio manda todo lo que no existe a index.html, les contestaría con
  // la página entera en vez de con un icono.
  [join(PUBLICO, 'apple-touch-icon.png'), 180],
];
for (const [ruta, tam] of salidas) {
  escribirPng(ruta, icono(tam));
  console.log(`✓ ${ruta.replace(RAIZ + '\\', '').replace(/\\/g, '/')}  (${tam}x${tam})`);
}

escribirPng(join(MARCA, 'favicon-maskable-512.png'), icono(512, OCUPACION_MASCARA));
console.log('✓ public/brand/favicon-maskable-512.png  (512x512, recorte de Android)');

escribirIco(join(PUBLICO, 'favicon.ico'), [icono(16), icono(32), icono(48)]);
console.log('✓ public/favicon.ico  (16 + 32 + 48)');

// ── El icono de la app de Android ───────────────────────────────────────────
// Venía con el dibujo que trae Capacitor de fábrica (una X celeste): nunca se
// había puesto la marca. Para que esto se vea hay que recompilar el APK.
//
// Android arma el icono en dos capas —un fondo y un dibujo adelante— y después
// le aplica la máscara que tenga el teléfono (círculo, cuadrado redondeado,
// gota). De la capa de adelante sólo se ve con seguridad el 66 % del centro,
// así que ahí el maniquí va más chico que en el favicon.
const ANDROID = join(RAIZ, 'apk', 'android', 'app', 'src', 'main', 'res');
const DENSIDADES = [['mdpi', 48], ['hdpi', 72], ['xhdpi', 96], ['xxhdpi', 144], ['xxxhdpi', 192]];
const SEGURO_ANDROID = 0.66;
if (existsSync(ANDROID)) {
  for (const [densidad, tam] of DENSIDADES) {
    const carpeta = join(ANDROID, `mipmap-${densidad}`);
    if (!existsSync(carpeta)) continue;
    const cuadrado = icono(tam);
    escribirPng(join(carpeta, 'ic_launcher.png'), cuadrado);
    escribirPng(join(carpeta, 'ic_launcher_round.png'), cuadrado);
    // La capa de adelante va al 225 % del icono: es la medida que espera Android.
    escribirPng(join(carpeta, 'ic_launcher_foreground.png'),
      iconoSinFondo(Math.round(tam * 2.25), SEGURO_ANDROID));
  }
  console.log(`✓ apk/.../mipmap-*  (icono de la app: ${DENSIDADES.map(([d]) => d).join(', ')})`);
  console.log('  ojo: para verlo en el celular hay que recompilar el APK');
} else {
  console.log('· sin carpeta de Android, salteo el icono de la app');
}

const prueba = [16, 32, 48].map((t) => `<div class="c"><div class="r" style="--t:${t}px"></div><span>${t}px</span></div>`).join('');
writeFileSync(join(AQUI, '.iconos-prueba.html'), `<!doctype html><meta charset="utf-8">
<style>
 body{margin:0;font:13px system-ui;display:flex;gap:40px;padding:40px}
 .lado{flex:1;padding:24px;border-radius:12px}
 .claro{background:#fff;color:#222}.oscuro{background:#202124;color:#e8eaed}
 h2{font:600 14px system-ui;margin:0 0 18px}
 .fila{display:flex;gap:22px;align-items:flex-end;margin-bottom:26px}
 .c{text-align:center}.c span{display:block;margin-top:8px;opacity:.6;font-size:11px}
 .r{width:var(--t);height:var(--t);border-radius:50%;background:url(../public/brand/favicon-512.png) center/cover}
 .grande{width:180px;height:180px;border-radius:50%;background:url(../public/brand/favicon-512.png) center/cover}
</style>
<div class="lado claro"><h2>Como lo recorta Google (círculo)</h2><div class="fila">${prueba}</div><div class="grande"></div></div>
<div class="lado oscuro"><h2>Lo mismo en modo oscuro</h2><div class="fila">${prueba}</div><div class="grande"></div></div>
`, 'utf8');
console.log('✓ scripts/.iconos-prueba.html  (abrila para ver el recorte)');
