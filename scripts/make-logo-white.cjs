// Toma el logo COMPLETO (buzo + M + MODELTEX) y le quita el fondo negro.
const sharp = require('sharp');

(async () => {
  const input = 'public/brand/modeltex-logo-full.png';
  const meta = await sharp(input).metadata();
  console.log('original', meta.width + 'x' + meta.height);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < 50 && g < 50 && b < 50) data[i + 3] = 0; // negro -> transparente
  }
  // versión transparente final
  await sharp(data, { raw: { width, height, channels } })
    .png()
    .trim({ threshold: 12 })
    .toFile('public/brand/modeltex-logo-white.png');

  // preview compuesto sobre BLANCO para ver cómo queda
  await sharp(data, { raw: { width, height, channels } })
    .png()
    .trim({ threshold: 12 })
    .flatten({ background: '#ffffff' })
    .toFile('public/brand/_preview-logo-on-white.png');

  const m2 = await sharp('public/brand/modeltex-logo-white.png').metadata();
  console.log('logo-white', m2.width + 'x' + m2.height);
})().catch(e => { console.error(e); process.exit(1); });
