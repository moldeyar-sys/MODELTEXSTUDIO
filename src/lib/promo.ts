import { supabase } from './supabase';
import type { Product } from './types';

/** True si el producto está en promo gratis activa (free_until en el futuro). */
export function isPromoActive(p: Pick<Product, 'free_until'>): boolean {
  return !!p.free_until && new Date(p.free_until).getTime() > Date.now();
}

export interface PromoFile {
  id: string;
  file_name: string;
  file_url: string;
}
export interface PromoProduct {
  product: Product;
  files: PromoFile[];
}

/**
 * Productos del catálogo que están en promo gratis (free_until > ahora).
 * Trae también sus archivos. Resiliente: si la columna no existe aún, devuelve [].
 */
export async function fetchPromoProducts(): Promise<PromoProduct[]> {
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gt('free_until', nowIso)
      .order('free_until', { ascending: true });
    if (error || !data) return [];
    const products = data as Product[];
    if (products.length === 0) return [];

    const ids = products.map(p => p.id);
    const { data: filesData } = await supabase
      .from('product_files')
      .select('id, product_id, file_name, file_url')
      .in('product_id', ids);

    const byProduct = new Map<string, PromoFile[]>();
    for (const f of (filesData as Array<{ id: string; product_id: string; file_name: string; file_url: string }>) || []) {
      const arr = byProduct.get(f.product_id) || [];
      arr.push({ id: f.id, file_name: f.file_name, file_url: f.file_url });
      byProduct.set(f.product_id, arr);
    }
    return products.map(p => ({ product: p, files: byProduct.get(p.id) || [] }));
  } catch {
    return [];
  }
}
