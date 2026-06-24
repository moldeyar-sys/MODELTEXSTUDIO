// Devuelve el país del visitante usando la geolocalización que inyecta Vercel.
// (cabecera x-vercel-ip-country). No usa servicios externos ni claves.
export default function handler(req: any, res: any) {
  const country = (req.headers['x-vercel-ip-country'] || '').toString().toUpperCase();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ country });
}
