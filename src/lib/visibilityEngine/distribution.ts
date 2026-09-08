// Modelos de distribución en redes sociales — SOLO TIPOS. Ninguna red está
// conectada (no hay credenciales de Facebook/Instagram/TikTok/YouTube/
// Pinterest/LinkedIn en el proyecto) y nada se publica automáticamente:
// todo borrador pasa por Approval antes de un PublishStatus distinto de
// 'borrador'. Flujo: ContentSource → SocialDraft → Platform → Approval → PublishStatus.

export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest' | 'linkedin';

export type ContentSourceType = 'guia' | 'lab-lesson' | 'producto' | 'landing' | 'otro';

/** De dónde sale el contenido a distribuir (siempre algo que ya existe en el sitio). */
export interface ContentSource {
  id: string;
  type: ContentSourceType;
  url: string;
  title: string;
}

export type PublishStatus = 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'programado' | 'publicado' | 'rechazado';

/** Borrador de post para una red puntual, generado a partir de un ContentSource. */
export interface SocialDraft {
  id: string;
  sourceId: string;
  platform: Platform;
  text: string;
  hashtags: string[];
  imageUrl?: string;
  status: PublishStatus;
  createdAt: string;
  approvedBy?: string;
  scheduledFor?: string;
  publishedAt?: string;
}
