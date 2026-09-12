import { supabase } from './supabase';
import type { FileType } from './types';

export const IMAGES_BUCKET = 'product-images';
export const FILES_BUCKET = 'product-files';
// Bucket PUBLICO solo para archivos gratuitos (separado del privado de pagos).
export const FREE_FILES_BUCKET = 'free-files';
// Bucket PUBLICO para recursos/adjuntos de MODELTEX LAB (PDFs, imágenes, tablas).
export const LAB_FILES_BUCKET = 'lab-files';

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

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result es "data:<mime>;base64,<datos>" — solo interesa la parte de datos.
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Sube una imagen (comprimida) a Cloudflare R2 vía /api/utils?action=upload-image
 * y devuelve su URL pública. Antes iba a Supabase Storage: las fotos del
 * catálogo eran la mayor parte del egress que hizo que Supabase restringiera
 * el proyecto entero (ver memoria del proyecto, incidente de sept. 2026). R2
 * no cobra por transferencia de salida.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const optimized = await compressImage(file);
  // Vercel rechaza requests de más de 4.5 MB antes de que el código llegue a
  // correr; en base64 eso son ~3.3 MB de archivo real. Si compressImage no
  // pudo achicarla (ej. HEIC de iPhone, que el navegador no sabe decodificar
  // y compressImage devuelve tal cual), frenar acá con un mensaje claro es
  // mejor que un fetch que cuelga o falla sin explicación.
  if (optimized.size > 3 * 1024 * 1024) {
    throw new Error(
      `La imagen pesa ${(optimized.size / (1024 * 1024)).toFixed(1)} MB, demasiado para subir. ` +
      `Si es una foto de iPhone (HEIC), convertila a JPG primero, o elegí una más liviana.`,
    );
  }

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Necesitás estar logueado como admin para subir imágenes.');

  const dataBase64 = await fileToBase64(optimized);
  const res = await fetch('/api/utils?action=upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fileName: optimized.name, contentType: optimized.type, dataBase64, folder: 'products' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error subiendo imagen (${res.status})`);
  return data.url as string;
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
 * Sube un archivo GRATUITO al bucket PUBLICO 'free-files' y devuelve su URL
 * publica (descarga directa). Aislado del bucket privado de productos pagos.
 */
export async function uploadFreeMoldFile(file: File): Promise<string> {
  const path = `${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(FREE_FILES_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return supabase.storage.from(FREE_FILES_BUCKET).getPublicUrl(path).data.publicUrl;
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

/**
 * Sube un recurso de MODELTEX LAB (PDF, imagen, tabla, etc.) al bucket
 * PUBLICO 'lab-files' y devuelve su URL pública. Comprime si es imagen.
 */
export async function uploadLabFile(file: File): Promise<string> {
  const optimized = await compressImage(file);
  const path = `${Date.now()}-${safeName(optimized.name)}`;
  const { error } = await supabase.storage
    .from(LAB_FILES_BUCKET)
    .upload(path, optimized, { upsert: false, contentType: optimized.type || undefined });
  if (error) throw error;
  return supabase.storage.from(LAB_FILES_BUCKET).getPublicUrl(path).data.publicUrl;
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
