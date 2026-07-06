import { supabase } from './supabase';

export interface AISettings {
  id: string;
  /** Base de conocimiento / "memoria" que el asistente usa como contexto fijo. */
  knowledge: string;
}

export const AI_SETTINGS_DEFAULTS: AISettings = {
  id: 'default',
  knowledge: '',
};

/** Carga la memoria de la IA. Si la tabla no existe aún, devuelve los defaults. */
export async function fetchAISettings(): Promise<AISettings> {
  try {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    if (error || !data) return AI_SETTINGS_DEFAULTS;
    return { ...AI_SETTINGS_DEFAULTS, ...(data as AISettings) };
  } catch {
    return AI_SETTINGS_DEFAULTS;
  }
}

/** Guarda (upsert) la memoria de la IA. Devuelve true si tuvo éxito. */
export async function saveAISettings(knowledge: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_settings')
      .upsert({ id: 'default', knowledge, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}
