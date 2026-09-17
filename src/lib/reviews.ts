import { supabase } from './supabase';
import type { Review } from './types';

export type ReviewTarget = 'product' | 'free_mold';

/** Trae las reseñas de un producto o molde gratis. Resiliente. */
export async function fetchReviews(targetType: ReviewTarget, targetId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as Review[]) || [];
  } catch {
    return [];
  }
}

/**
 * Trae las mejores reseñas recientes de todo el sitio para la prueba social del home.
 * Solo 4-5 estrellas con comentario: es una vidriera, no el listado completo.
 */
export async function fetchTopReviews(limit = 6): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return ((data as Review[]) || []).filter(r => (r.comment || '').trim().length > 0);
  } catch {
    return [];
  }
}

export async function submitReview(input: {
  targetType: ReviewTarget;
  targetId: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    // upsert (no insert): la migración 044 agregó un UNIQUE sobre
    // (target_type, target_id, user_id) para que nadie pueda dejar más de
    // una reseña por producto e inflar el AggregateRating público. Antes de
    // esa migración, un insert simple ya alcanzaba (no había restricción);
    // con upsert sigue funcionando igual en ambos casos: si la fila no
    // existe la crea, si existe la actualiza en vez de fallar con "duplicate
    // key" o (peor, antes de 044) crear una segunda reseña del mismo usuario.
    const row = {
      target_type: input.targetType,
      target_id: input.targetId,
      user_id: input.userId,
      author_name: input.authorName,
      rating: input.rating,
      comment: input.comment,
    };
    let { error } = await supabase.from('reviews').upsert(row, { onConflict: 'target_type,target_id,user_id' });
    // Resiliente: si la migración 044 (UNIQUE target_type,target_id,user_id)
    // todavía no se corrió, Postgres rechaza el upsert porque no existe la
    // restricción que el onConflict pide ("no unique or exclusion constraint
    // matching..."). Sin este fallback, dejar una reseña se rompía del todo
    // hasta que se aplicara esa migración.
    if (error && /no unique|exclusion constraint|on conflict/i.test(error.message ?? '')) {
      ({ error } = await supabase.from('reviews').insert(row));
    }
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export function reviewSummary(reviews: Review[]): { avg: number; count: number } {
  if (!reviews.length) return { avg: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
