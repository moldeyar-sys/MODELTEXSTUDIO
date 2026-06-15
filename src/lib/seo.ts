import { useEffect } from 'react';

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  /** Ruta o URL canónica de la página, ej: "/catalogo" o una URL completa. */
  path?: string;
  type?: 'website' | 'product' | 'article';
}

const SITE_NAME = 'Modeltex';
const SITE_URL = 'https://modeltexstudio.com';
const DEFAULT_DESCRIPTION =
  'Moldes digitales profesionales en PDF A4, plotter y formatos editables. Descarga inmediata. Vendemos a todo el mundo.';
const DEFAULT_IMAGE = 'https://modeltexstudio.com/brand/og-image.png';

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

/**
 * Actualiza title y meta tags (description, Open Graph, Twitter, canonical)
 * de forma dinámica por página. Sin dependencias externas.
 *
 * Nota: al ser una SPA, esto mejora el SEO en Google (renderiza JS) y la UX
 * (título de pestaña), pero los scrapers de redes sociales no ejecutan JS, así
 * que para previews por producto haría falta prerender/SSR más adelante.
 */
export function useSeo({ title, description, image, path, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Moldes digitales de ropa`;
    const desc = description || DEFAULT_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;
    const url = path
      ? path.startsWith('http')
        ? path
        : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
      : SITE_URL + '/';

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
    setCanonical(url);
  }, [title, description, image, path, type]);
}
