import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchReviews, submitReview, deleteReview, reviewSummary, type ReviewTarget } from '../../lib/reviews';
import type { Review } from '../../lib/types';

function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer p-0.5' : 'cursor-default p-0'}
          aria-label={`${n} estrellas`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </span>
  );
}

interface Props {
  targetType: ReviewTarget;
  targetId: string;
  compact?: boolean;
}

export function ReviewsSection({ targetType, targetId, compact = false }: Props) {
  const { user, profile, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setReviews(await fetchReviews(targetType, targetId));
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => { load(); }, [load]);

  const { avg, count } = reviewSummary(reviews);
  const alreadyReviewed = !!user && reviews.some(r => r.user_id === user.id);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setSaving(true);
    setError('');
    const res = await submitReview({
      targetType,
      targetId,
      userId: user.id,
      authorName: profile?.full_name || user.email?.split('@')[0] || 'Cliente',
      rating,
      comment: comment.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error?.includes('reviews') ? 'Falta crear la tabla de reseñas en Supabase (SQL).' : 'No se pudo enviar tu opinión. Probá de nuevo.');
      return;
    }
    setComment('');
    setRating(5);
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta opinión?')) return;
    if (await deleteReview(id)) setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className={compact ? '' : 'border-t border-gray-100 pt-8'}>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-700" /> Opiniones
        </h3>
        {count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Stars value={Math.round(avg)} size={16} />
            <span className="font-bold text-gray-900">{avg}</span>
            <span className="text-gray-400">({count})</span>
          </div>
        )}
      </div>

      {/* Formulario */}
      {user ? (
        alreadyReviewed ? (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-5">Ya dejaste tu opinión. ¡Gracias! 🙌</p>
        ) : (
          <form onSubmit={onSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Tu puntuación:</span>
              <Stars value={rating} size={22} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              required
              placeholder="Contanos tu experiencia con este molde..."
              className="input-field resize-none"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={saving || !comment.trim()} className="btn-primary text-sm py-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {saving ? 'Enviando...' : 'Publicar opinión'}
            </button>
          </form>
        )
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
          <Link to="/login" className="text-primary-700 font-semibold hover:underline">Iniciá sesión</Link> para dejar tu opinión.
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-gray-400">Cargando opiniones...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no hay opiniones. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                    {(r.author_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{r.author_name || 'Cliente'}</p>
                    <Stars value={r.rating} size={13} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{r.created_at && new Date(r.created_at).toLocaleDateString('es-AR')}</span>
                  {(isAdmin || (user && r.user_id === user.id)) && (
                    <button onClick={() => onDelete(r.id)} className="p-1 text-gray-300 hover:text-red-500 rounded" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
