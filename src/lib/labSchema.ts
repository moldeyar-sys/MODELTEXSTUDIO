// Structured data de MODELTEX LAB (schema.org Course), compartido entre
// src/pages/LabHomePage.tsx, src/pages/LabCoursePage.tsx y middleware.ts.
//
// POR QUE ACA: el Course lo armaban por separado el .tsx y el middleware, con
// diferencias (el del middleware tenia `url`, el de React no; el `provider`
// estaba escrito a mano en los dos). Al hidratar, React pisaba el del
// middleware con una version distinta de la misma pagina.
//
// POR QUE IMPORTA EL FORMATO: Google tiene dos marcados de curso distintos.
//   - Pagina de UN curso -> un `Course` suelto.
//   - Pagina que LISTA cursos (como /lab) -> un `ItemList` cuyos items son
//     `Course`. Un CollectionPage con ListItem sueltos, que es lo que habia,
//     no lo lee como cursos: se pierde el resultado enriquecido de curso justo
//     en la pagina que resume el curso gratis.
//
// Todo lo que se declara es real: el curso es gratis de verdad (Offer en 0 +
// isAccessibleForFree), la duracion sale de estimated_duration cargado en la
// base, y los modulos publicados son los que se muestran en la pagina.

import { SITE, SAME_AS } from './siteConfig.js';

export interface LabCourseSchemaInput {
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  objectives?: string[] | null;
  estimated_duration?: string | null;
  /** Módulos publicados del curso, en orden. Alimentan syllabusSections. */
  modules?: Array<{ title: string; level_label?: string | null; description?: string | null }>;
}

function provider(siteUrl: string) {
  return { '@type': 'Organization', name: SITE.name, url: `${siteUrl}/`, sameAs: SAME_AS };
}

/** Course de un curso concreto (/lab/<curso>). */
export function labCourseSchema(c: LabCourseSchemaInput, siteUrl: string): Record<string, unknown> {
  const descripcion = (c.description || c.subtitle || '').trim() || undefined;
  const modulos = (c.modules || []).filter((m) => m.title);

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.title,
    url: `${siteUrl}/lab/${c.slug}`,
    ...(descripcion ? { description: descripcion } : {}),
    provider: provider(siteUrl),
    isAccessibleForFree: true,
    inLanguage: 'es-AR',
    // Es real: el curso no tiene costo. Declarar el Offer explicito refuerza
    // "gratis" para rich results, ademas de isAccessibleForFree.
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS', category: 'Free' },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      ...(c.estimated_duration ? { courseWorkload: c.estimated_duration } : {}),
    },
    // `teaches` y `syllabusSections` son las dos propiedades que le dicen a
    // Google de que se trata el curso sin que tenga que adivinarlo del texto.
    ...(c.objectives?.length ? { teaches: c.objectives } : {}),
    ...(modulos.length
      ? {
          syllabusSections: modulos.map((m, i) => ({
            '@type': 'Syllabus',
            position: i + 1,
            name: m.level_label ? `${m.level_label} — ${m.title}` : m.title,
            ...(m.description ? { description: m.description } : {}),
          })),
        }
      : {}),
  };
}

/**
 * ItemList de Course para la pagina que lista los cursos (/lab). Es el formato
 * que Google espera en una "course list page".
 */
export function labCourseListSchema(courses: LabCourseSchemaInput[], siteUrl: string): Record<string, unknown> | null {
  if (!courses.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cursos gratis de moldería textil de MODELTEX LAB',
    url: `${siteUrl}/lab`,
    numberOfItems: courses.length,
    itemListElement: courses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: labCourseSchema(c, siteUrl),
    })),
  };
}
