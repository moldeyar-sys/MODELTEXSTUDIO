import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Lock, UserPlus, FileDown, Clock, Star, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createSignedDownloadUrl, isStoragePath } from '../../lib/storage';
import { ReviewsSection } from './ReviewsSection';
import type { PromoProduct } from '../../lib/promo';

const categoryLabel = (c: string) => {
  switch (c) {
    case 'nino': return 'Niño';
    case 'nina': return 'Niña';
    case 'bebes': return 'Bebés';
    case 'adultos-unisex': return 'Adultos unisex';
    case 'ninos-unisex': return 'Niños unisex';
    default: return c ? c.charAt(0).toUpperCase() + c.slice(1) : '';
  }
};

export function FreePromoCard({ item }: { item: PromoProduct }) {
  const { user } = useAuth();
  const { product, files } = item;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);

  const endsAt = product.free_until ? new Date(product.free_until) : null;

  const handleDownload = async (file: { id: string; file_name: string; file_url: string }) => {
    if (!user) return;
    if (!isStoragePath(file.file_url)) {
      window.open(file.file_url, '_blank', 'noopener,noreferrer');
      return;
    }
    setDownloadingId(file.id);
    try {
      const url = await createSignedDownloadUrl(file.file_url);
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = file.file_name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="card group overflow-hidden flex flex-col">
      <Link to={`/producto/${product.slug}`} className="relative block">
        <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
          {product.main_image_url ? (
            <img src={product.main_image_url} alt={product.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><FileDown className="w-14 h-14" /></div>
          )}
        </div>
        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">GRATIS</span>
        <span className="absolute top-3 right-3 bg-accent-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">PROMO</span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {product.category && (
            <span className="text-xs font-medium text-petroleum-600 bg-petroleum-50 px-2 py-0.5 rounded-md">{categoryLabel(product.category)}</span>
          )}
          {product.codigo && <span className="text-xs text-gray-400 font-mono">#{product.codigo}</span>}
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        {product.sizes?.length > 0 && (
          <p className="text-xs text-gray-500 mt-1"><span className="font-medium text-gray-600">Talles:</span> {product.sizes.join(', ')}</p>
        )}
        {endsAt && (
          <p className="text-[11px] text-accent-700 font-medium mt-1 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Gratis hasta el {endsAt.toLocaleDateString('es-AR')}
          </p>
        )}

        {/* Archivos */}
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/60 p-2.5">
          <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Archivos para descargar</p>
          {files.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {files.map(f =>
                user ? (
                  <button key={f.id} onClick={() => handleDownload(f)} disabled={downloadingId === f.id} className="flex items-center justify-between gap-2 w-full px-2.5 py-1.5 bg-primary-800 text-white border border-primary-800 rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60">
                    <span className="truncate">{f.file_name}</span>
                    <Download className="w-3.5 h-3.5 flex-shrink-0" />
                  </button>
                ) : (
                  <div key={f.id} title="Creá tu cuenta para descargar gratis" className="flex items-center justify-between gap-2 w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-400 cursor-not-allowed select-none">
                    <span className="truncate">{f.file_name}</span>
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Disponible pronto.</p>
          )}

          {!user && files.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-gray-200">
              <p className="text-[11px] text-gray-600 mb-1.5">Creá tu cuenta gratis para <b>descargar este molde</b>.</p>
              <Link to="/registro" className="flex items-center justify-center gap-1.5 w-full py-2 bg-petroleum-600 text-white text-xs font-semibold rounded-lg hover:bg-petroleum-700 transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> Crear cuenta gratis
              </Link>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button onClick={() => setShowReviews(true)} className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
          <Star className="w-3.5 h-3.5" /> Opiniones
        </button>
      </div>

      {showReviews && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowReviews(false)}>
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Opiniones de</p>
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              </div>
              <button onClick={() => setShowReviews(false)} aria-label="Cerrar" className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5"><ReviewsSection targetType="product" targetId={product.id} compact /></div>
          </div>
        </div>
      )}
    </div>
  );
}
