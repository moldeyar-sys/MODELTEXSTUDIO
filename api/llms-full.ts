// /llms-full.txt: todo el contenido del sitio en un solo archivo de texto
// para asistentes de IA (complementa /llms.txt, que es el resumen). Incluye
// las guías, las preguntas frecuentes y los 2.000+ productos con su
// descripción y precio, generado al vuelo desde Supabase con cache de 1 hora.

import { GUIAS } from '../src/lib/guiasData';
import { FAQ_ITEMS } from '../src/lib/faqData';
import { CATEGORY_TITLE_SUFFIX } from '../src/lib/categorySeo';

const SITE_URL = 'https://modeltex.com.ar';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdGlicWd5cmNnd2N0aW9saGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjkyNjgsImV4cCI6MjA5NzEwNTI2OH0.GeBsY6QvZMBe2k7YqSXh5aaRBjO9upgCO_0nb1mB8bU';

const CATEGORY_LABEL: Record<string, string> = {
  dama: 'Dama',
  hombre: 'Hombre',
  nina: 'Niña',
  nino: 'Niño',
  bebes: 'Bebés',
  'adultos-unisex': 'Adultos unisex',
  'ninos-unisex': 'Niños unisex',
};

interface Row {
  name: string;
  slug: string;
  category?: string | null;
  garment_type?: string | null;
  short_description?: string | null;
  sizes?: string[] | null;
  precio_pdf_a4?: number | null;
  price?: number | null;
  precio_usd_pdf_a4?: number | null;
}

const PAGE = 1000;

async function fetchProducts(): Promise<Row[]> {
  const out: Row[] = [];
  try {
    for (let offset = 0; ; offset += PAGE) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=name,slug,category,garment_type,short_description,sizes,precio_pdf_a4,price,precio_usd_pdf_a4` +
          `&is_active=eq.true&order=category.asc,name.asc&limit=${PAGE}&offset=${offset}`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
      );
      if (!res.ok) break;
      const rows = (await res.json()) as Row[];
      if (!Array.isArray(rows)) break;
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
  } catch {
    /* se devuelve lo que se alcanzó a juntar */
  }
  return out;
}

function ars(n: unknown): string {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) && v > 0 ? `$${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ARS` : '';
}

function oneLine(s: string | null | undefined): string {
  return (s || '').replace(/\s+/g, ' ').trim();
}

export default async function handler(_req: unknown, res: any) {
  const products = await fetchProducts();
  const lines: string[] = [];

  lines.push('# Modeltex — moldería digital para producción textil (contenido completo)');
  lines.push('');
  lines.push(
    `> Modeltex (${SITE_URL}) vende moldes de ropa digitales como insumo de producción para fabricantes, talleres, marcas y emprendedores. ` +
      `Más de ${products.length ? products.length.toLocaleString('es-AR') : '2.000'} moldes de dama, hombre, niña, niño, bebés y unisex, ` +
      'cada uno con la curva de talles completa (adultos XS a 4XL, niños 2 a 18) y aprobado con muestra confeccionada. ' +
      'Formatos: PDF A4, PDF plotter (90, 120 o 150 cm), cartón, DXF/AAMA, PDS (Optitex), MRK (tizadas), ADS (Audaces), PLT, CDR y sublimación. ' +
      'Pagos con Mercado Pago, transferencia, PayPal, Payoneer, Wise y cripto; entrega por descarga digital a todo el mundo. WhatsApp +54 9 11 6653 1086.',
  );
  lines.push('');
  lines.push('## Páginas principales');
  lines.push(`- Catálogo completo: ${SITE_URL}/catalogo`);
  for (const [k, v] of Object.entries(CATEGORY_LABEL)) lines.push(`- Moldes ${CATEGORY_TITLE_SUFFIX[k] || v}: ${SITE_URL}/catalogo?categoria=${k}`);
  lines.push(`- Moldes gratis para probar la calidad: ${SITE_URL}/moldes-gratis`);
  lines.push(`- Moldería a pedido (moldes a medida): ${SITE_URL}/diseno-a-pedido`);
  lines.push(`- Preguntas frecuentes: ${SITE_URL}/preguntas-frecuentes`);
  lines.push(`- Guías para producción: ${SITE_URL}/guias`);
  lines.push(`- Contacto: ${SITE_URL}/contacto`);
  lines.push('');

  lines.push('## Guías para producir ropa con moldes digitales');
  for (const g of GUIAS) {
    lines.push('');
    lines.push(`### ${g.title}`);
    lines.push(`URL: ${SITE_URL}/guias/${g.slug}`);
    lines.push(oneLine(g.intro));
    for (const s of g.sections) {
      lines.push('');
      lines.push(`#### ${s.h2}`);
      for (const p of s.paragraphs) lines.push(oneLine(p));
      for (const b of s.bullets || []) lines.push(`- ${oneLine(b)}`);
    }
    if (g.faqs.length) {
      lines.push('');
      for (const f of g.faqs) lines.push(`P: ${oneLine(f.q)}\nR: ${oneLine(f.a)}`);
    }
  }
  lines.push('');

  lines.push('## Preguntas frecuentes');
  for (const f of FAQ_ITEMS) lines.push(`P: ${oneLine(f.q)}\nR: ${oneLine(f.a)}`);
  lines.push('');

  lines.push(`## Catálogo (${products.length} moldes activos)`);
  lines.push('Cada línea: nombre — tipo de prenda — categoría — talles — precio del PDF A4 (todos los talles incluidos) — descripción — URL.');
  let currentCat = '';
  for (const p of products) {
    const cat = p.category || '';
    if (cat !== currentCat) {
      currentCat = cat;
      lines.push('');
      lines.push(`### ${CATEGORY_LABEL[cat] || cat} (${SITE_URL}/catalogo?categoria=${cat})`);
    }
    const sizes = (p.sizes || []).filter(Boolean);
    const talles = sizes.length ? `${sizes.length} talles (${sizes[0]} a ${sizes[sizes.length - 1]})` : '';
    const precio = ars(p.precio_pdf_a4 ?? p.price);
    const usd = typeof p.precio_usd_pdf_a4 === 'number' && p.precio_usd_pdf_a4 > 0 ? ` (USD ${p.precio_usd_pdf_a4})` : '';
    const tipo = oneLine(p.garment_type);
    lines.push(
      `- ${oneLine(p.name)}${tipo && tipo.toUpperCase() !== oneLine(p.name).toUpperCase() ? ` — ${tipo}` : ''} — ${CATEGORY_LABEL[cat] || cat}` +
        `${talles ? ` — ${talles}` : ''}${precio ? ` — desde ${precio}${usd}` : ''}` +
        `${p.short_description ? ` — ${oneLine(p.short_description)}` : ''} — ${SITE_URL}/producto/${encodeURIComponent(p.slug)}`,
    );
  }
  lines.push('');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(lines.join('\n'));
}
