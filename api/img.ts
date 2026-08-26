// Proxy de imagenes con cache: /img/<bucket>/<archivo> sirve el objeto publico
// de Supabase Storage pero CACHEADO en el CDN de Vercel (s-maxage 1 año).
//
// Por que existe: el plan gratis de Supabase incluye 5 GB/mes de transferencia
// y cada visitante bajaba las ~650 fotos del catalogo directo de Supabase.
// Con esto, Supabase entrega cada foto UNA vez por region y el resto lo sirve
// el CDN de Vercel (100 GB/mes gratis). Los nombres de archivo llevan
// timestamp (inmutables), asi que el cache largo es seguro.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';

const ALLOWED_BUCKETS = new Set(['product-images', 'free-files']);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const raw = req.query?.p;
  const path = Array.isArray(raw) ? raw.join('/') : String(raw || '');
  const clean = path.replace(/^\/+/, '');
  const bucket = clean.split('/')[0];

  if (!clean || clean.includes('..') || !ALLOWED_BUCKETS.has(bucket)) {
    res.status(400).json({ error: 'Ruta invalida' });
    return;
  }

  try {
    const origin = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/${clean
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`,
    );
    if (!origin.ok) {
      res.status(origin.status === 404 ? 404 : 502).json({ error: 'No encontrada' });
      return;
    }

    const buf = Buffer.from(await origin.arrayBuffer());
    res.setHeader('Content-Type', origin.headers.get('content-type') || 'application/octet-stream');
    // s-maxage: cache del CDN de Vercel (la clave de todo el ahorro).
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
    res.status(200).send(buf);
  } catch {
    res.status(502).json({ error: 'Error trayendo la imagen' });
  }
}
