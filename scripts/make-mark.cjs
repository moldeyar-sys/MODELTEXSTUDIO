// Genera la M de Modeltex con fondo TRANSPARENTE (quita el negro) y recortada.
const sharp = require('sharp');

(async () => {
  const input = 'public/brand/modeltex-icon.png';
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // negro / casi negro del fondo -> transparente
    if (r < 48 && g < 48 && b < 48) data[i + 3] = 0;
  }
  await sharp(data, { raw: { width, height, channels } })
    .png()
    .trim({ threshold: 10 })
    .toFile('public/brand/modeltex-mark.png');
  const meta = await sharp('public/brand/modeltex-mark.png').metadata();
  console.log('OK modeltex-mark.png', meta.width + 'x' + meta.height);
})().catch(e => { console.error(e); process.exit(1); });
