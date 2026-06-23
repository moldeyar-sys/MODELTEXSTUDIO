import { supabase } from './supabase';
import { WHATSAPP_NUMBER } from './whatsapp';
import type { FreeMold } from './types';

/**
 * Trae los moldes gratis ACTIVOS para la vista publica.
 * Resiliente: si la tabla todavia no existe (falta correr el SQL), devuelve []
 * en vez de romper la pagina.
 */
export async function fetchActiveFreeMolds(): Promise<FreeMold[]> {
  try {
    const { data, error } = await supabase
      .from('free_molds')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as FreeMold[]) || [];
  } catch {
    return [];
  }
}

/** Trae TODOS los moldes gratis (para el panel admin). Resiliente. */
export async function fetchAllFreeMolds(): Promise<FreeMold[]> {
  try {
    const { data, error } = await supabase
      .from('free_molds')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as FreeMold[]) || [];
  } catch {
    return [];
  }
}

/** Suma +1 al contador de descargas (via funcion segura). No bloquea la descarga. */
export async function incrementFreeMoldDownload(id: string): Promise<void> {
  try {
    await supabase.rpc('increment_free_mold_download', { p_id: id });
  } catch {
    /* el contador es best-effort: si falla, no afecta la descarga */
  }
}

/** Mensaje de WhatsApp prearmado para un molde gratis. */
export function buildFreeMoldWhatsApp(m: FreeMold): string {
  const text =
    `Hola Modeltex, descargué o quiero consultar por este molde gratis:\n\n` +
    `Nombre: ${m.title}\n` +
    `Código: ${m.code || '-'}\n` +
    `Categoría: ${m.category || '-'}\n` +
    `Talles incluidos: ${(m.sizes || []).join(', ') || '-'}\n` +
    `Formatos: ${(m.formats || []).join(', ') || '-'}\n` +
    `Tela recomendada: ${m.fabric_recommendation || '-'}\n` +
    `Link: ${typeof window !== 'undefined' ? window.location.origin : 'https://modeltex.com.ar'}/moldes-gratis\n\n` +
    `Gracias.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
