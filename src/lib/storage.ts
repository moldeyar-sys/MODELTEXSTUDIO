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

/**
 * Comprime/redimensiona una imagen en el navegador antes de subir.
 * Reescala al lado máximo `maxDim` y reencoda a WebP con `quality`.
 * Si algo falla o no conviene, devuelve el archivo original.
 */
export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // formatos no decodificables (ej. HEIC) -> se sube original
  }
  let { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) { bitmap.close?.(); return file; }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/webp', quality));
  if (!blob || blob.size >= file.size) return file; // si no achicó, dejar original
  const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
  return new File([blob], newName, { type: 'image/webp' });
}

/** Sube una imagen (comprimida) al bucket publico y devuelve su URL publica. */
export async function uploadProductImage(file: File): Promise<string> {
  const optimized = await compressImage(file);
  const path = `${Date.now()}-${safeName(optimized.name)}`;
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, optimized, { cacheControl: '3600', upsert: false, contentType: optimized.type });
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
