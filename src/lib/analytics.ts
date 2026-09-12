// GA4 vía variable de entorno. Si VITE_GA_MEASUREMENT_ID no está configurada
// (dev, preview, o mientras Denis no la cargue en Vercel), el sitio funciona
// exactamente igual: initGA() no inyecta nada y trackEvent() es un no-op.
// Nunca mandar datos personales (nombre, email, teléfono, dirección): solo
// ids/nombres de producto, categorías, montos y conteos.

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

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
}

export function trackSearch(term: string): void {
  if (!term.trim()) return;
  trackEvent('search', { search_term: term });
}

export function trackAddToCart(p: { id: string; name: string; category?: string; price?: number | null; format?: string }): void {
  trackEvent('add_to_cart', {
    currency: 'ARS',
    value: p.price ?? undefined,
    items: [{ item_id: p.id, item_name: p.name, item_category: p.category, item_variant: p.format }],
  });
}

export function trackBeginCheckout(value: number, itemCount: number): void {
  trackEvent('begin_checkout', { currency: 'ARS', value, num_items: itemCount });
}

export function trackPurchase(order: { id: string; value: number; itemCount: number }): void {
  trackEvent('purchase', {
    transaction_id: order.id,
    currency: 'ARS',
    value: order.value,
    num_items: order.itemCount,
  });
}

export function trackWhatsAppClick(context: string): void {
  trackEvent('whatsapp_click', { context });
}

export function trackFreeDownload(p: { id: string; name: string }): void {
  trackEvent('free_download', { item_id: p.id, item_name: p.name });
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
}

export function trackMicrolearningVideoStart(lessonId: string): void {
  console.log('Analytics: Evento video_iniciado', lessonId);
  trackEvent('video_iniciado', { lesson_id: lessonId });
}

export function trackUpsellCatalogClick(): void {
  console.log('Analytics: Evento clic_upsell_catalogo');
  trackEvent('clic_upsell_catalogo');
}
