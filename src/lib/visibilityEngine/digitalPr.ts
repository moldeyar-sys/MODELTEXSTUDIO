// Modelos de oportunidades de Digital PR — SOLO TIPOS. No hay envío de
// emails, no hay contacto automático a sitios, no hay generación de spam:
// esto es una lista de candidatos para que Denis (o quien administre)
// evalúe y contacte manualmente si quiere. `status` empieza siempre en
// 'detectado' y solo un humano lo mueve a 'contactado'/'descartado'.

export type DigitalPrSiteType = 'blog' | 'medio' | 'directorio' | 'foro' | 'influencer' | 'otro';

export type DigitalPrStatus = 'detectado' | 'evaluado' | 'contactado' | 'en_conversacion' | 'conseguido' | 'descartado';

export interface DigitalPrOpportunity {
  id: string;
  domain: string;
  url: string;
  siteType: DigitalPrSiteType;
  topic: string;
  relevance: 'baja' | 'media' | 'alta';
  estimatedAuthority?: number;
  opportunity: string;
  contact?: string;
  status: DigitalPrStatus;
  notes?: string;
  createdAt: string;
}
