// Modeltex Visibility Engine — modelos base.
//
// Flujo: DETECTAR → ANALIZAR → PROPONER → APROBAR → PUBLICAR → MEDIR.
// Esta capa es SOLO tipos + detectores puros (ver detectors.ts). No hay UI,
// no hay publicación automática, no hay IA conectada todavía: es la base
// para que eso se construya encima sin rediseñar los modelos.
//
// Regla de oro del motor: ninguna Proposal se aplica sola. Todo pasa por
// Approval humana antes de convertirse en Change.

export type Severity = 'baja' | 'media' | 'alta';
export type Impact = 'bajo' | 'medio' | 'alto';
export type Difficulty = 'baja' | 'media' | 'alta';

/** Problema puntual y objetivo encontrado por un detector (ver detectors.ts). */
export interface Issue {
  id: string;
  type: IssueType;
  url: string;
  severity: Severity;
  evidence: string;
  detectedAt: string;
}

export type IssueType =
  | 'sin-title'
  | 'sin-description'
  | 'sin-canonical'
  | 'sin-schema'
  | 'imagen-sin-alt'
  | 'link-roto'
  | 'url-huerfana'
  | 'sin-enlaces-internos'
  | 'contenido-desactualizado'
  | 'landing-fuera-de-sitemap'
  | 'schema-inconsistente'
  | 'guia-sin-relacionadas'
  | 'lab-sin-enlaces'
  | 'producto-sin-descripcion'
  | 'producto-sin-categoria-normalizada';

/** Agrupa uno o más Issues bajo una oportunidad de mejora con impacto/dificultad estimados. */
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  scopeUrls: string[];
  issueIds: string[];
  estimatedImpact: Impact;
  difficulty: Difficulty;
  createdAt: string;
}

/** Acción concreta sugerida para resolver una Opportunity, antes de redactar contenido real. */
export interface Recommendation {
  id: string;
  opportunityId: string;
  actionType: RecommendationAction;
  description: string;
  createdAt: string;
}

export type RecommendationAction =
  | 'agregar-title'
  | 'agregar-description'
  | 'agregar-canonical'
  | 'agregar-schema'
  | 'agregar-alt'
  | 'arreglar-link'
  | 'enlazar-url-huerfana'
  | 'agregar-enlaces-internos'
  | 'actualizar-contenido'
  | 'agregar-a-sitemap'
  | 'corregir-schema'
  | 'agregar-relacionadas'
  | 'redactar-descripcion-producto'
  | 'normalizar-categoria-producto'
  | 'otro';

export type ProposalSource = 'manual' | 'ai';
export type ProposalStatus = 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'rechazado' | 'publicado';

/**
 * Cambio concreto de contenido, con antes/después, listo para que un humano
 * lo apruebe o lo rechace. NUNCA se aplica solo (ver Approval/Change).
 */
export interface Proposal {
  id: string;
  recommendationId: string;
  type: RecommendationAction;
  url: string;
  problem: string;
  evidence: string;
  estimatedImpact: Impact;
  suggestedAction: string;
  previousContent: string | null;
  proposedContent: string;
  status: ProposalStatus;
  source: ProposalSource;
  aiProvider?: string;
  createdAt: string;
}

/** Decisión humana sobre una Proposal. Es el único paso que puede convertirla en Change. */
export interface Approval {
  id: string;
  proposalId: string;
  approvedBy: string;
  approved: boolean;
  comments?: string;
  decidedAt: string;
}

/** Cambio ya aplicado al sitio, trazable a la Proposal + Approval que lo originaron. */
export interface Change {
  id: string;
  proposalId: string;
  approvalId: string;
  appliedAt: string;
  appliedBy: string;
  diffSummary: string;
}

/**
 * Métrica puntual de una URL, para la fase MEDIR. Genérica a propósito:
 * hoy solo hay métricas internas (vistas, conversiones); cuando se conecte
 * GSC/GA4 de verdad, se suman más campos sin romper esta forma.
 */
export interface MetricSnapshot {
  id: string;
  url: string;
  capturedAt: string;
  views?: number;
  conversions?: number;
  clicks?: number;
  impressions?: number;
  avgPosition?: number;
}
