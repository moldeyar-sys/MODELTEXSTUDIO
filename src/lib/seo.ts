import { useEffect } from 'react';

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'product' | 'article';
  /** Paginas que no deben indexarse (404, producto inexistente). */
  noindex?: boolean;
}

const SITE_NAME = 'Modeltex';
const SITE_URL = 'https://modeltex.com.ar';
const DEFAULT_DESCRIPTION =
  'Modeltex: moldes PDF, moldes para imprimir y molderia digital para producir. Moldes de ropa en PDF A4, plotter, DXF, CDR y PLT, con escalado completo y descarga inmediata.';
const DEFAULT_IMAGE = 'https://modeltex.com.ar/brand/og-image.png';
// Mismo valor que el <meta name="robots"> base de index.html: al ser una SPA,
// la etiqueta persiste entre navegaciones y hay que restaurarla al salir de
// una pagina noindex.
const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setStructuredData(id: string, data: Record<string, unknown> | Array<Record<string, unknown>>) {
  let el = document.head.querySelector<HTMLScriptElement>(`script[data-seo-schema="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-seo-schema', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function useSeo({ title, description, image, path, type = 'website', noindex = false }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Moldes PDF y molderia digital`;
    const desc = description || DEFAULT_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;
    const url = path
      ? path.startsWith('http')
        ? path
        : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
      : `${SITE_URL}/`;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : DEFAULT_ROBOTS);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
    setCanonical(url);
  }, [title, description, image, path, type, noindex]);
}

export function useStructuredData(
  data: Record<string, unknown> | Array<Record<string, unknown>> | null,
  id = 'page-schema',
) {
  useEffect(() => {
    if (!data) return;

    setStructuredData(id, data);

    return () => {
      const el = document.head.querySelector<HTMLScriptElement>(`script[data-seo-schema="${id}"]`);
      if (el) el.remove();
    };
  }, [data, id]);
}
