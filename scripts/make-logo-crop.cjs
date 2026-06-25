// Del logo completo transparente, recorta SOLO buzo + M (saca el texto crema y la barra).
const sharp = require('sharp');

(async () => {
  const src = 'public/brand/modeltex-logo-white.png'; // ya transparente
  const meta = await sharp(src).metadata();
  const w = meta.width, h = meta.height;
  // Quedarnos con la parte de arriba (buzo + M). El texto/barra estan abajo.
  const keep = Math.round(h * 0.52);
  await sharp(src)
    .extract({ left: 0, top: 0, width: w, height: keep })
    .trim({ threshold: 12 })
    .toFile('public/brand/modeltex-mark-buzo.png');

  await sharp('public/brand/modeltex-mark-buzo.png')
    .flatten({ background: '#ffffff' })
    .toFile('public/brand/_preview-buzo-on-white.png');

  const m2 = await sharp('public/brand/modeltex-mark-buzo.png').metadata();
  console.log('mark-buzo', m2.width + 'x' + m2.height);
})().catch(e => { console.error(e); process.exit(1); });
