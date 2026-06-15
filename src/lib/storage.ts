import { supabase } from './supabase';
import type { FileType } from './types';

export const IMAGES_BUCKET = 'product-images';
export const FILES_BUCKET = 'product-files';

function safeName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1) : '';
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
  const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanExt ? `${cleanBase || 'archivo'}.${cleanExt}` : (cleanBase || 'archivo');
}

/** Sube una imagen al bucket publico y devuelve su URL publica. */
export async function uploadProductImage(file: File): Promise<string> {
  const path = `${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Sube un archivo descargable al bucket PRIVADO y devuelve la ruta interna
 * (no una URL publica). La descarga se sirve con signed URL temporal (Fase 3).
 */
export async function uploadProductFile(productId: string, file: File): Promise<string> {
  const path = `${productId}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(FILES_BUCKET)
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

/** Borra un archivo descargable del bucket privado por su ruta interna. */
export async function removeProductFile(path: string): Promise<void> {
  await supabase.storage.from(FILES_BUCKET).remove([path]);
}

/**
 * Genera un signed URL temporal para descargar un archivo del bucket privado.
 * Solo funciona si el usuario pasa la RLS (compra pagada de ese producto).
 * Expira en `expiresIn` segundos (por defecto 120) y fuerza la descarga.
 */
export async function createSignedDownloadUrl(path: string, expiresIn = 120): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(FILES_BUCKET)
    .createSignedUrl(path, expiresIn, { download: true });
  if (error || !data) return null;
  return data.signedUrl;
}

/** True si el valor es una ruta interna de Storage (no una URL http). */
export function isStoragePath(value: string): boolean {
  return !/^https?:\/\//i.test(value);
}

/** Infiere el tipo de archivo a partir de la extension. */
export function inferFileType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'pdf': return 'pdf_a4';
    case 'plt': return 'plt';
    case 'dxf': return 'dxf';
    case 'cdr': return 'cdr';
    default: return 'other';
  }
}
