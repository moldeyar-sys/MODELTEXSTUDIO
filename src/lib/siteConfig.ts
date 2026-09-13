// FUENTE UNICA DE VERDAD de los datos institucionales de Modeltex (GEO/E-E-A-T).
//
// Antes estos datos vivían repetidos a mano en index.html, middleware.ts,
// contact.ts, faqData.ts, public/llms.txt y api/llms-full.ts. Cambiar el
// WhatsApp o el texto de "18 años" significaba tocar 5+ archivos y confiar en
// no olvidarse ninguno. Ahora todo eso importa (o replica, donde Vercel no
// deja importar — ver nota al final) de este único módulo.
//
// Los campos marcados `confirmed: false` son placeholders documentados, NO
// datos reales: no se usan en ningún schema.org hasta que alguien los
// confirme acá. Ver PENDING_FIELDS al final para la lista completa de lo que
// falta cargar.

export interface ConfirmedFact<T> {
  value: T;
  confirmed: true;
}
export interface PendingFact<T> {
  value: T;
  confirmed: false;
  /** Por qué está pendiente / qué hace falta para confirmarlo. */
  note: string;
}
export type Fact<T> = ConfirmedFact<T> | PendingFact<T>;

function confirmed<T>(value: T): ConfirmedFact<T> {
  return { value, confirmed: true };
}
function pending<T>(value: T, note: string): PendingFact<T> {
  return { value, confirmed: false, note };
}
/** Devuelve el valor solo si el dato está confirmado; si no, `undefined`. */
export function factOrUndefined<T>(fact: Fact<T>): T | undefined {
  return fact.confirmed ? fact.value : undefined;
}

export const SITE_URL = 'https://modeltex.com.ar';

export const SITE = {
  name: 'Modeltex',
  alternateName: 'Molderia Modeltex',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/modeltex-logo-full.png`,
  ogImage: `${SITE_URL}/brand/og-image.png`,
  description:
    'Modeltex vende moldes de ropa digitales y moldería profesional para producción textil: más de 2.000 moldes con curva de talles completa en PDF A4, plotter, DXF/AAMA, Optitex y Audaces, con descarga inmediata a todo el mundo.',
  countryCode: 'AR',
  countryName: 'Argentina',
  /** "Más de 18 años en la industria textil argentina" — confirmado, se repetía en 5 archivos. */
  experienceYearsMin: 18,
  knowsAbout: [
    'moldes pdf',
    'moldes para imprimir',
    'molderia digital',
    'moldes de ropa',
    'patronaje industrial',
    'tizado computarizado',
    'DXF AAMA',
    'Optitex',
    'Audaces',
  ],
} as const;

export const CONTACT = {
  whatsappNumber: confirmed('5491166531086'), // wa.me/<numero>
  telegramNumber: confirmed('5491166531086'), // t.me/+<numero>
  facebookHandle: confirmed('modeltex.ar'), // facebook.com/<handle>
  // Confirmado 2026-09-13: Cloudflare Email Routing activo, reenvia a la
  // casilla real que Denis revisa. Antes era un placeholder sin confirmar.
  email: confirmed('contacto@modeltex.com.ar'),
  // Confirmado 2026-09-13 por Denis: atencion 24/7 (compra y descarga
  // digital automatica en cualquier momento, sin horario de local fisico).
  hours: confirmed('Las 24 horas, los 7 días de la semana'),
  // Confirmado 2026-09-13 por Denis: @modeltex.com.ar (162 seguidores).
  instagramHandle: confirmed('modeltex.com.ar'),
  tiktokHandle: pending('', 'Sin cuenta de TikTok cargada todavía.'),
  city: pending('', 'Sin ciudad/localidad confirmada — el Organization schema hoy solo declara el país (AR).'),
  streetAddress: pending('', 'Sin domicilio confirmado.'),
} as const;

export const WHATSAPP_LINK = `https://wa.me/${CONTACT.whatsappNumber.value}`;
export const TELEGRAM_LINK = `https://t.me/+${CONTACT.telegramNumber.value}`;
export const FACEBOOK_LINK = `https://www.facebook.com/${CONTACT.facebookHandle.value}`;
export const INSTAGRAM_LINK = `https://www.instagram.com/${CONTACT.instagramHandle.value}`;

/** sameAs: solo perfiles reales y confirmados. */
export const SAME_AS: readonly string[] = [FACEBOOK_LINK, TELEGRAM_LINK, INSTAGRAM_LINK];

/**
 * Autoría de contenido (E-E-A-T). Hoy no hay una persona real con nombre y
 * credenciales cargada en el proyecto — por eso `value: null`. Cuando exista,
 * completar acá (una sola vez) y todo el sitio (Article schema de guías y
 * lecciones del Lab, "Quiénes somos") lo va a usar automáticamente vía
 * getArticleAuthor().
 */
// Confirmado 2026-09-13 por Denis.
export const CONTENT_AUTHOR: Fact<{ name: string; jobTitle: string; url?: string } | null> = confirmed({
  name: 'J. Denis Espinoza',
  jobTitle: 'Fundador y CEO de Modeltex',
  url: `${SITE_URL}/quienes-somos`,
});

export interface SchemaAuthor {
  '@type': 'Person' | 'Organization';
  name: string;
  jobTitle?: string;
  url?: string;
}

/** Autor real de un Article si existe; si no, cae en la Organization (lo que ya se hacía antes, sin regresión). */
export function getArticleAuthor(): SchemaAuthor {
  if (CONTENT_AUTHOR.confirmed && CONTENT_AUTHOR.value) {
    return { '@type': 'Person', name: CONTENT_AUTHOR.value.name, jobTitle: CONTENT_AUTHOR.value.jobTitle, url: CONTENT_AUTHOR.value.url };
  }
  return { '@type': 'Organization', name: SITE.name, url: SITE.url };
}

export function organizationSchemaId(): string {
  return `${SITE_URL}/#organization`;
}

/**
 * Arma el JSON-LD de Organization completo a partir de datos reales
 * únicamente. Los campos pendientes (email, ciudad) se omiten en vez de
 * inventarse — omitir un campo opcional de schema.org es válido; poner un
 * dato falso no lo es.
 */
export function buildOrganizationSchema(): Record<string, unknown> {
  const address: Record<string, unknown> = { '@type': 'PostalAddress', addressCountry: SITE.countryCode };
  const city = factOrUndefined(CONTACT.city);
  const street = factOrUndefined(CONTACT.streetAddress);
  if (city) address.addressLocality = city;
  if (street) address.streetAddress = street;

  const contactPoint: Record<string, unknown> = {
    '@type': 'ContactPoint',
    contactType: 'sales',
    telephone: `+${CONTACT.whatsappNumber.value.replace(/^54/, '54-')}`,
    url: `${SITE_URL}/contacto`,
    // Solo 'es': el selector de idioma ingles de src/lib/locale.tsx existe en
    // el codigo pero no esta conectado a ningun control, asi que ninguna
    // pagina se renderiza realmente en ingles todavia.
    availableLanguage: ['es'],
    areaServed: 'Worldwide',
  };
  const email = factOrUndefined(CONTACT.email);
  if (email) contactPoint.email = email;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationSchemaId(),
    name: SITE.name,
    alternateName: SITE.alternateName,
    url: SITE.url,
    logo: SITE.logo,
    image: SITE.ogImage,
    description: SITE.description,
    telephone: `+${CONTACT.whatsappNumber.value.replace(/^54/, '54-')}`,
    contactPoint,
    address,
    sameAs: SAME_AS,
    areaServed: 'Worldwide',
    knowsAbout: SITE.knowsAbout,
  };
}

// ---------------------------------------------------------------------------
// PENDING_FIELDS: lista plana de todo lo que falta confirmar, para no tener
// que recorrer el archivo buscando `confirmed: false`. Pensada para que un
// futuro panel de admin (o el propio Visibility Engine) la muestre como
// checklist de "datos institucionales que faltan".
// ---------------------------------------------------------------------------
export const PENDING_FIELDS: ReadonlyArray<{ field: string; note: string }> = [
  { field: 'CONTACT.tiktokHandle', note: CONTACT.tiktokHandle.confirmed ? '' : CONTACT.tiktokHandle.note },
  { field: 'CONTACT.city', note: CONTACT.city.confirmed ? '' : CONTACT.city.note },
  { field: 'CONTACT.streetAddress', note: CONTACT.streetAddress.confirmed ? '' : CONTACT.streetAddress.note },
].filter((f) => f.note);
