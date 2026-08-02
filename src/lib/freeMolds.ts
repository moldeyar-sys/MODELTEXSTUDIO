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

/**
 * Suma +1 al contador de descargas (via funcion segura, igual que siempre)
 * y ademas registra el detalle (con/sin cuenta, que archivo) para las
 * estadisticas del panel admin. Todo best-effort: si algo falla, no afecta
 * la descarga en si.
 */
export async function incrementFreeMoldDownload(
  id: string,
  fileLabel: string,
  hasAccount: boolean,
  userId: string | null,
): Promise<void> {
  try {
    await supabase.rpc('increment_free_mold_download', { p_id: id });
  } catch {
    /* el contador viejo es best-effort */
  }
  try {
    await supabase.from('free_mold_downloads').insert({
      free_mold_id: id,
      file_label: fileLabel,
      has_account: hasAccount,
      user_id: userId,
    });
  } catch {
    /* el detalle nuevo tambien es best-effort */
  }
}

export interface FreeMoldDownloadStats {
  free_mold_id: string;
  con_cuenta: number;
  sin_cuenta: number;
}

/** Descargas agrupadas por molde y con/sin cuenta, para el panel admin. Resiliente. */
export async function fetchFreeMoldDownloadStats(): Promise<FreeMoldDownloadStats[]> {
  try {
    const { data, error } = await supabase.from('free_mold_downloads').select('free_mold_id,has_account');
    if (error) return [];
    const map = new Map<string, FreeMoldDownloadStats>();
    for (const row of (data as { free_mold_id: string; has_account: boolean }[]) || []) {
      const entry = map.get(row.free_mold_id) || { free_mold_id: row.free_mold_id, con_cuenta: 0, sin_cuenta: 0 };
      if (row.has_account) entry.con_cuenta++;
      else entry.sin_cuenta++;
      map.set(row.free_mold_id, entry);
    }
    return Array.from(map.values());
  } catch {
    return [];
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
