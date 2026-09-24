// GA4 vía variable de entorno. Si VITE_GA_MEASUREMENT_ID no está configurada
// (dev, preview, o mientras Denis no la cargue en Vercel), el sitio funciona
// exactamente igual: initGA() no inyecta nada y trackEvent() es un no-op.
// Nunca mandar datos personales (nombre, email, teléfono, dirección): solo
// ids/nombres de producto, categorías, montos y conteos.

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

// Píxel de Meta (anuncios de Facebook/Instagram), mismo criterio que GA: sin
// VITE_META_PIXEL_ID no se carga nada y los track* siguen igual. Solo viajan
// los eventos que se piden a mano (autoConfig apagado) y NINGUNO desde una URL
// con el email del comprador invitado (/mi-pedido?...&email=...): el píxel
// manda la URL completa de la página con cada evento y no se le puede sacar
// la query string.
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: Fbq;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let initialized = false;
let pixelInitialized = false;

/** Inyecta fbevents.js (código base oficial de Meta, sin el PageView automático: lo manda trackPageView). */
export function initMetaPixel(): void {
  if (pixelInitialized || !META_PIXEL_ID || typeof document === 'undefined' || window.fbq) return;
  pixelInitialized = true;

  const fbq: Fbq = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  fbq('set', 'autoConfig', false, META_PIXEL_ID);
  fbq('init', META_PIXEL_ID);
}

function trackMeta(event: string, params: Record<string, unknown> = {}, eventId?: string, custom = false): void {
  if (!META_PIXEL_ID || typeof window === 'undefined' || !window.fbq) return;
  if (/email/i.test(window.location.search)) return;
  const method = custom ? 'trackCustom' : 'track';
  if (eventId) window.fbq(method, event, params, { eventID: eventId });
  else window.fbq(method, event, params);
}

/** Inyecta gtag.js. Llamar una sola vez, apenas arranca la app (ver main.tsx). */
export function initGA(): void {
  if (initialized || !GA_MEASUREMENT_ID || typeof document === 'undefined') return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  // send_page_view:false porque el page_view automático de gtag.js manda
  // location.href COMPLETO, con query string incluida — y algunas URLs del
  // sitio llevan el email del comprador invitado ahí (/mi-pedido?...&email=...).
  // El page_view real se dispara a mano con trackPageView(), sin esa parte.
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true, send_page_view: false });
}

/** Wrapper seguro: no explota ni hace nada si GA no está configurado. */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

/**
 * Page view manual, con la URL saneada (sin query string) — ver el porqué en
 * initGA(). Llamar en cada cambio de ruta (ver src/App.tsx).
 */
export function trackPageView(path: string): void {
  trackMeta('PageView');
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  const cleanPath = path.split('?')[0].split('#')[0];
  window.gtag('event', 'page_view', {
    page_location: `${window.location.origin}${cleanPath}`,
    page_path: cleanPath,
    page_title: document.title,
  });
}

// ── Eventos clave del negocio (los 9 pedidos) ──────────────────────────────
// Cada helper solo toma datos no sensibles: ids, nombres de producto/curso,
// categorías, montos y formatos ya públicos en el catálogo.

export function trackViewProduct(p: { id: string; name: string; category?: string; price?: number | null }): void {
  trackEvent('view_item', {
    currency: 'ARS',
    value: p.price ?? undefined,
    items: [{ item_id: p.id, item_name: p.name, item_category: p.category }],
  });
  trackMeta('ViewContent', {
    content_ids: [p.id],
    content_name: p.name,
    content_category: p.category,
    content_type: 'product',
    value: p.price ?? undefined,
    currency: 'ARS',
  });
}

export function trackSearch(term: string): void {
  if (!term.trim()) return;
  trackEvent('search', { search_term: term });
  trackMeta('Search', { search_string: term });
}

export function trackAddToCart(p: { id: string; name: string; category?: string; price?: number | null; format?: string }): void {
  trackEvent('add_to_cart', {
    currency: 'ARS',
    value: p.price ?? undefined,
    items: [{ item_id: p.id, item_name: p.name, item_category: p.category, item_variant: p.format }],
  });
  trackMeta('AddToCart', {
    content_ids: [p.id],
    content_name: p.name,
    content_type: 'product',
    value: p.price ?? undefined,
    currency: 'ARS',
  });
}

export function trackBeginCheckout(value: number, itemCount: number): void {
  trackEvent('begin_checkout', { currency: 'ARS', value, num_items: itemCount });
  trackMeta('InitiateCheckout', { value, currency: 'ARS', num_items: itemCount });
}

export function trackPurchase(order: { id: string; value: number; itemCount: number }): void {
  trackEvent('purchase', {
    transaction_id: order.id,
    currency: 'ARS',
    value: order.value,
    num_items: order.itemCount,
  });
  // eventID = id del pedido: si más adelante se manda la misma compra desde
  // el servidor (API de conversiones), Meta la cuenta una sola vez.
  trackMeta('Purchase', { value: order.value, currency: 'ARS', num_items: order.itemCount }, order.id);
}

export function trackWhatsAppClick(context: string): void {
  trackEvent('whatsapp_click', { context });
  trackMeta('Contact', { content_name: context });
}

export function trackFreeDownload(p: { id: string; name: string }): void {
  trackEvent('free_download', { item_id: p.id, item_name: p.name });
  trackMeta('DescargaGratis', { content_ids: [p.id], content_name: p.name }, undefined, true);
}

export function trackLabStart(courseSlug: string): void {
  trackEvent('lab_start', { course_slug: courseSlug });
}

export function trackLabLessonComplete(courseSlug: string, lessonSlug: string): void {
  trackEvent('lab_lesson_complete', { course_slug: courseSlug, lesson_slug: lessonSlug });
}

// ── Embudo de Modeltex Lab (lead magnet, microlearning, upsell) ────────────
// El console.log queda a propósito además del trackEvent: sirve para
// verificar el evento en el momento (sin depender de que GA4 esté
// configurado) y deja claro dónde engancha Facebook Pixel u otra
// herramienta el día que se sume. El email del lead SOLO va al console.log
// (visible nada más que en la consola del propio navegador) — nunca se
// manda a GA4 ni a ningún tercero, para no filtrar datos personales.

export function trackLeadGenerated(email: string): void {
  console.log('Analytics: Evento lead_generado', email);
  trackEvent('lead_generado');
  trackMeta('Lead');
}

export function trackMicrolearningVideoStart(lessonId: string): void {
  console.log('Analytics: Evento video_iniciado', lessonId);
  trackEvent('video_iniciado', { lesson_id: lessonId });
}

export function trackUpsellCatalogClick(): void {
  console.log('Analytics: Evento clic_upsell_catalogo');
  trackEvent('clic_upsell_catalogo');
}
