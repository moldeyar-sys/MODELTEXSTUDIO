#!/usr/bin/env node
/**
 * Arma las dos imágenes de marca que llevan texto adentro:
 *
 *   public/brand/modeltex-logo-full.png   el maniquí + MODELTEX, sobre blanco.
 *                                         Es el "logo" que declara el schema de
 *                                         Organization, o sea el que Google usa
 *                                         en su panel de conocimiento.
 *   public/brand/og-image.png             1200x630, la tarjeta que se ve cuando
 *                                         alguien comparte un enlace del sitio
 *                                         en WhatsApp, Facebook o X.
 *
 * El resto de los iconos los hace scripts/generar-iconos.mjs, que no necesita
 * navegador. Estas dos sí, porque hay que componer tipografía: se dibujan en
 * una página HTML y se le saca una captura con Chrome sin ventana.
 *
 * El maniquí sale de public/brand/modeltex-mark.png, que genera el otro script.
 * Por eso conviene correrlos juntos:  npm run iconos
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const MARCA = join(RAIZ, 'public', 'brand');
const TEMP = join(AQUI, '.build');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));
if (!CHROME) throw new Error('No se encontró Chrome ni Edge para dibujar las imágenes.');

const MANIQUI = `file:///${join(MARCA, 'modeltex-mark.png').replace(/\\/g, '/')}`;
if (!existsSync(join(MARCA, 'modeltex-mark.png'))) {
  throw new Error('Falta public/brand/modeltex-mark.png. Corré antes: node scripts/generar-iconos.mjs');
}

// Los colores salen de tailwind.config.js, para que las imágenes y el sitio
// digan exactamente lo mismo.
const AZUL = '#0048AD';        // primary-800, el azul de marca
const AZUL_HONDO = '#012f6f';  // primary-900, el del pie de página
const MAGENTA = '#CB6EE7';     // accent, el magenta de marca
const CREMA = '#E8E7D3';

const BASE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .lienzo{display:flex;align-items:center;background:#fff}
  .maniqui{display:block;width:auto}
  .nombre{font-weight:800;letter-spacing:-.02em;color:${AZUL_HONDO};line-height:1}
  .tiras{display:flex;overflow:hidden;border-radius:2px}
  .tiras i{display:block;height:100%}
`;

/** Las tres tiras de color de la marca, como en el logo anterior. */
const tiras = (ancho, alto) => `
  <div class="tiras" style="width:${ancho}px;height:${alto}px">
    <i style="width:40%;background:${AZUL}"></i>
    <i style="width:32%;background:${MAGENTA}"></i>
    <i style="width:28%;background:${CREMA}"></i>
  </div>`;

const PIEZAS = [
  {
    archivo: 'modeltex-logo-full.png',
    ancho: 860, alto: 280,
    cuerpo: `
      <div class="lienzo" style="width:860px;height:280px;gap:34px;padding:0 44px">
        <img class="maniqui" src="${MANIQUI}" style="height:196px">
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="nombre" style="font-size:78px">MODELTEX</div>
          ${tiras(196, 10)}
        </div>
      </div>`,
  },
  {
    archivo: 'og-image.png',
    ancho: 1200, alto: 630,
    cuerpo: `
      <div class="lienzo" style="width:1200px;height:630px;gap:64px;padding:0 90px;position:relative">
        <img class="maniqui" src="${MANIQUI}" style="height:392px">
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="nombre" style="font-size:96px">MODELTEX</div>
          <div style="font-size:34px;font-weight:600;color:${MAGENTA}">Moldería de precisión</div>
          <div style="font-size:30px;font-weight:400;color:#4a5568;line-height:1.35">
            Moldes digitales de indumentaria<br>listos para imprimir y producir
          </div>
          ${tiras(260, 12)}
        </div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:10px;display:flex">
          <i style="flex:40;background:${AZUL}"></i>
          <i style="flex:32;background:${MAGENTA}"></i>
          <i style="flex:28;background:${CREMA}"></i>
        </div>
      </div>`,
  },
];

mkdirSync(TEMP, { recursive: true });
mkdirSync(MARCA, { recursive: true });

for (const pieza of PIEZAS) {
  const rutaHtml = join(TEMP, pieza.archivo.replace('.png', '.html'));
  const rutaPng = join(MARCA, pieza.archivo);
  writeFileSync(rutaHtml, `<!doctype html><meta charset="utf-8"><style>${BASE}</style>${pieza.cuerpo}`, 'utf8');
  execFileSync(
    CHROME,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      '--force-device-scale-factor=1', `--window-size=${pieza.ancho},${pieza.alto}`,
      '--virtual-time-budget=20000', `--screenshot=${rutaPng}`,
      `file:///${rutaHtml.replace(/\\/g, '/')}`],
    { stdio: 'ignore', timeout: 120000 }
  );
  console.log(`✓ public/brand/${pieza.archivo}  (${pieza.ancho}x${pieza.alto})`);
}
