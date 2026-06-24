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

export async function submitReview(input: {
  targetType: ReviewTarget;
  targetId: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('reviews').insert({
      target_type: input.targetType,
      target_id: input.targetId,
      user_id: input.userId,
      author_name: input.authorName,
      rating: input.rating,
      comment: input.comment,
    });
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
