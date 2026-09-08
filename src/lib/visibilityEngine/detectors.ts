// Detectores puros de la fase DETECTAR. Ninguno llama a una IA ni modifica
// contenido: reciben datos ya cargados (productos, guías, clases del Lab,
// listas de URLs) y devuelven Issue[]. Los primeros cinco ya corren contra
// datos reales del proyecto (products/guías/Lab); los últimos (basados en
// PageMeta/LinkGraph) quedan listos para cuando exista un crawler o un
// fetch del sitemap real que les arme el input — no hay crawler todavía,
// así que hoy nadie los llama con datos live, pero la forma ya está fijada.

import type { Issue, IssueType, Severity } from './types';
import type { Product } from '../types';
import type { Guia } from '../guiasTypes';
import type { LabLesson } from '../labTypes';
import { normalizeGarmentType } from '../garmentType';

let counter = 0;
function makeIssue(type: IssueType, url: string, severity: Severity, evidence: string, now: string): Issue {
  counter += 1;
  return { id: `issue-${type}-${counter}`, type, url, severity, evidence, detectedAt: now };
}

// ── Detectores con datos reales del proyecto ───────────────────────────────

export function detectProductsWithoutDescription(products: Product[], now: string): Issue[] {
  return products
    .filter((p) => !p.short_description?.trim() && !p.long_description?.trim())
    .map((p) => makeIssue('producto-sin-descripcion', `/producto/${p.slug}`, 'media', `Producto "${p.name}" sin short_description ni long_description`, now));
}

export function detectProductsWithoutNormalizedGarmentType(products: Product[], now: string): Issue[] {
  return products
    .filter((p) => normalizeGarmentType(p) === null)
    .map((p) => makeIssue('producto-sin-categoria-normalizada', `/producto/${p.slug}`, 'baja', `garment_type "${p.garment_type || ''}" no matchea ninguna familia conocida (ver garmentType.ts)`, now));
}

/** Guía sin cluster asignado en CLUSTER_BY_SLUG: su "Más guías" se arma solo con relleno, sin hermanas temáticas reales. */
export function detectGuiasWithoutCluster(guias: Guia[], guiaCluster: (slug: string) => string | undefined, now: string): Issue[] {
  return guias
    .filter((g) => !guiaCluster(g.slug))
    .map((g) => makeIssue('guia-sin-relacionadas', `/guias/${g.slug}`, 'media', `Guía "${g.title}" no tiene cluster temático asignado en CLUSTER_BY_SLUG`, now));
}

/** Clase del Lab sin ninguna guía relacionada declarada: no aparece en el "Más guías" de ninguna guía. */
export function detectLabLessonsWithoutRelatedGuides(lessons: LabLesson[], courseSlugByLesson: (l: LabLesson) => string, now: string): Issue[] {
  return lessons
    .filter((l) => (l.related_guide_slugs || []).length === 0)
    .map((l) => makeIssue('lab-sin-enlaces', `/lab/${courseSlugByLesson(l)}`, 'baja', `Clase "${l.title}" no declara related_guide_slugs`, now));
}

/** Diff simple entre landings que deberían estar indexables y lo que el sitemap realmente expone. */
export function detectLandingsNotInSitemap(knownLandingPaths: string[], sitemapPaths: string[], now: string): Issue[] {
  const inSitemap = new Set(sitemapPaths);
  return knownLandingPaths
    .filter((path) => !inSitemap.has(path))
    .map((path) => makeIssue('landing-fuera-de-sitemap', path, 'alta', `"${path}" no aparece en el sitemap actual`, now));
}

// ── Detectores genéricos a nivel página (listos para un futuro crawler) ────
// PageMeta representa lo mínimo que un crawler o un fetch de la propia página
// tendría que resolver. Hoy nada llama estas funciones con datos reales
// porque no existe ese crawler; se dejan implementadas y tipadas para no
// tener que rediseñar el resto del motor cuando se construya.

export interface PageMeta {
  url: string;
  title?: string;
  description?: string;
  canonical?: string;
  schemaTypes: string[];
  images: { src: string; alt?: string }[];
  internalLinksOut: string[];
  lastModified?: string;
}

export interface LinkGraphEntry {
  url: string;
  incomingLinks: number;
}

export function detectMissingTitle(pages: PageMeta[], now: string): Issue[] {
  return pages.filter((p) => !p.title?.trim()).map((p) => makeIssue('sin-title', p.url, 'alta', 'Página sin <title>', now));
}

export function detectMissingDescription(pages: PageMeta[], now: string): Issue[] {
  return pages.filter((p) => !p.description?.trim()).map((p) => makeIssue('sin-description', p.url, 'media', 'Página sin meta description', now));
}

export function detectMissingCanonical(pages: PageMeta[], now: string): Issue[] {
  return pages.filter((p) => !p.canonical?.trim()).map((p) => makeIssue('sin-canonical', p.url, 'media', 'Página sin <link rel="canonical">', now));
}

export function detectMissingSchema(pages: PageMeta[], now: string): Issue[] {
  return pages.filter((p) => p.schemaTypes.length === 0).map((p) => makeIssue('sin-schema', p.url, 'media', 'Página sin structured data', now));
}

export function detectImagesWithoutAlt(pages: PageMeta[], now: string): Issue[] {
  const issues: Issue[] = [];
  for (const p of pages) {
    const missing = p.images.filter((img) => !img.alt?.trim());
    for (const img of missing) issues.push(makeIssue('imagen-sin-alt', p.url, 'baja', `Imagen sin alt: ${img.src}`, now));
  }
  return issues;
}

export function detectPagesWithoutInternalLinks(pages: PageMeta[], now: string): Issue[] {
  return pages.filter((p) => p.internalLinksOut.length === 0).map((p) => makeIssue('sin-enlaces-internos', p.url, 'media', 'Página sin enlaces internos salientes', now));
}

export function detectOrphanUrls(graph: LinkGraphEntry[], now: string): Issue[] {
  return graph.filter((g) => g.incomingLinks === 0).map((g) => makeIssue('url-huerfana', g.url, 'media', 'Ninguna otra página del sitio enlaza esta URL', now));
}

/** contenido desactualizado: sin cambios hace más de maxAgeDays. */
export function detectOldContent(pages: PageMeta[], maxAgeDays: number, now: string): Issue[] {
  const nowMs = new Date(now).getTime();
  return pages
    .filter((p) => p.lastModified && nowMs - new Date(p.lastModified).getTime() > maxAgeDays * 86_400_000)
    .map((p) => makeIssue('contenido-desactualizado', p.url, 'baja', `Sin actualizar desde ${p.lastModified}`, now));
}

/** El mismo @id de schema con @type distinto en dos apariciones de la misma página: señal de la duplicación middleware/React ya resuelta una vez, para detectar regresiones futuras. */
export function detectInconsistentSchema(pages: { url: string; schemaIdToTypes: Record<string, string[]> }[], now: string): Issue[] {
  const issues: Issue[] = [];
  for (const p of pages) {
    for (const [id, types] of Object.entries(p.schemaIdToTypes)) {
      const distinct = new Set(types);
      if (distinct.size > 1) {
        issues.push(makeIssue('schema-inconsistente', p.url, 'alta', `id "${id}" usado para tipos distintos: ${[...distinct].join(', ')}`, now));
      }
    }
  }
  return issues;
}
