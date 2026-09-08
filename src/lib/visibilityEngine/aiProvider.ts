// Interfaz agnóstica de proveedor de IA para la fase ANALIZAR/PROPONER del
// Visibility Engine. Ningún proveedor (OpenAI/Anthropic/Gemini/otro) está
// conectado acá — es el contrato que un adapter concreto va a implementar el
// día que se decida activarlo, para no reescribir el motor entero por elegir
// un proveedor u otro. Todo método devuelve texto/objetos PROPUESTOS: nada
// de esto escribe en la base ni publica nada por sí solo (eso es Approval).

import type { Opportunity } from './types';

export interface AiAnalysis {
  summary: string;
  suggestedActions: string[];
}

export interface AiDraftFaq {
  q: string;
  a: string;
}

export interface AiProvider {
  readonly name: string;

  /** Analiza una Opportunity ya detectada y devuelve un resumen + acciones sugeridas. */
  analyzeOpportunity(opportunity: Opportunity, context: string): Promise<AiAnalysis>;

  /** Redacta una mejora de contenido para un texto existente, dado el problema detectado. */
  draftImprovement(currentContent: string, problem: string): Promise<string>;

  /** Genera preguntas frecuentes nuevas a partir del contenido de una página. */
  generateFaq(pageContent: string, count: number): Promise<AiDraftFaq[]>;

  /** Propone un <title> SEO para una URL/contenido dado. */
  proposeTitle(url: string, content: string): Promise<string>;

  /** Propone una meta description SEO. */
  proposeMetaDescription(url: string, content: string): Promise<string>;

  /** Mejora un bloque de contenido existente (no lo reemplaza sin aprobación humana). */
  improveContent(currentContent: string, instructions: string): Promise<string>;

  /** Sugiere enlaces internos nuevos entre páginas relacionadas. */
  suggestInternalLinks(pageUrl: string, candidateUrls: string[]): Promise<string[]>;

  /** Sugiere el tema de una guía nueva a partir de gaps detectados (no la escribe entera). */
  suggestNewGuideTopic(existingTopics: string[]): Promise<{ title: string; reason: string }>;

  /** Prepara un borrador de post para redes (ver distribution.ts) a partir de una URL/contenido. */
  prepareSocialDraft(url: string, content: string): Promise<{ text: string; hashtags: string[] }>;
}

/**
 * Placeholder sin proveedor real: deja explícito que la IA no está
 * configurada, sin romper nada que dependa de la interfaz AiProvider.
 */
export const NO_AI_PROVIDER: AiProvider = {
  name: 'none',
  async analyzeOpportunity() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async draftImprovement() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async generateFaq() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async proposeTitle() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async proposeMetaDescription() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async improveContent() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async suggestInternalLinks() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async suggestNewGuideTopic() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
  async prepareSocialDraft() {
    throw new Error('Ningún AiProvider configurado todavía.');
  },
};
