// Tipos de las guías para producción (/guias). El contenido vive en
// src/lib/guias/*.ts y lo consumen la app (GuiaPage) y middleware.ts (lo que
// leen Google y los asistentes de IA), así los dos dicen exactamente lo mismo.

export interface GuiaSection {
  /** Título de la sección (se renderiza como h2). */
  h2: string;
  /** Párrafos de texto plano, sin HTML ni markdown. */
  paragraphs: string[];
  /** Lista opcional de puntos cortos (se renderiza como ul). */
  bullets?: string[];
}

export interface GuiaFaq {
  q: string;
  a: string;
}

export interface GuiaLink {
  label: string;
  /** Ruta interna del sitio, ej. "/catalogo?categoria=hombre". */
  to: string;
}

export interface Guia {
  /** Parte final de la URL: /guias/<slug>. Solo minúsculas, números y guiones. */
  slug: string;
  /** H1 de la página (hasta 70 caracteres). */
  title: string;
  /** <title> sin el " | Modeltex" (hasta 60 caracteres). */
  seoTitle: string;
  /** Meta description (140 a 160 caracteres). */
  description: string;
  /** Respuesta directa a la pregunta de la guía, 2 o 3 oraciones (lo primero que lee una IA). */
  intro: string;
  sections: GuiaSection[];
  faqs: GuiaFaq[];
  related: GuiaLink[];
  /** Fecha de publicación/actualización, formato AAAA-MM-DD. */
  updated: string;
  /** Palabras clave por las que se busca esta guía. */
  keywords: string[];
}
