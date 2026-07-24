// Sirve HTML con meta tags Open Graph especificas del producto a los robots de
// Facebook/WhatsApp/etc. Los usuarios reales nunca pasan por aca: siguen de largo
// hacia la SPA de siempre. Esto existe porque el sitio es una SPA (Vite/React) y
// esos robots no ejecutan JavaScript, asi que sin esto siempre verian el og:image
// y og:title genericos del home en vez de los del producto compartido.

export const config = {
  matcher: '/producto/:path*',
};

const BOT_UA =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|vkShare|redditbot|Applebot|SkypeUriPreview|Snapchat|W3C_Validator/i;

// Mismas claves publicas que src/lib/supabase.ts (la "anon key" esta pensada
// para vivir en el cliente; la seguridad la dan las policies RLS de la tabla).
const SUPABASE_URL = 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const SITE_NAME = 'Modeltex';
const DEFAULT_IMAGE = 'https://modeltex.com.ar/brand/og-image.png';

function next() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceAttr(html: string, matchAttr: string, content: string) {
  const pattern = new RegExp(`(${matchAttr}content=")[^"]*(")`, 'i');
  return html.replace(pattern, `$1${content}$2`);
}

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return next();

  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.replace(/^\/producto\//, '').replace(/\/$/, ''));
  if (!slug) return next();

  try {
    const apiUrl =
      `${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}` +
      `&is_active=eq.true&select=name,short_description,long_description,main_image_url&limit=1`;

    const [productRes, htmlRes] = await Promise.all([
      fetch(apiUrl, { headers: { apikey: SUPABASE_ANON_KEY } }),
      fetch(`${url.origin}/index.html`),
    ]);

    let html = await htmlRes.text();
    const products = productRes.ok ? await productRes.json() : [];
    const product = Array.isArray(products) ? products[0] : null;

    if (product) {
      const title = escapeHtml(`${product.name} | ${SITE_NAME}`);
      const description = escapeHtml(
        (product.short_description || product.long_description || '')
          .toString()
          .slice(0, 160) || 'Molde digital profesional con descarga inmediata.',
      );
      const image = escapeHtml(product.main_image_url || DEFAULT_IMAGE);
      const pageUrl = `${url.origin}/producto/${slug}`;

      html = html
        .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
        .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
        .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${pageUrl}$2`)
        .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1product$2`);

      html = replaceAttr(html, 'property="og:title" ', title);
      html = replaceAttr(html, 'property="og:description" ', description);
      html = replaceAttr(html, 'property="og:url" ', pageUrl);
      html = replaceAttr(html, 'property="og:image" ', image);
      html = replaceAttr(html, 'name="twitter:title" ', title);
      html = replaceAttr(html, 'name="twitter:description" ', description);
      html = replaceAttr(html, 'name="twitter:image" ', image);
    }

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch {
    return next();
  }
}
