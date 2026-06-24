import { useState } from 'react';
import { Download, MessageCircle, FileDown, Tag, Lock, UserPlus, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FreeMold } from '../../lib/types';
import { buildFreeMoldWhatsApp, incrementFreeMoldDownload } from '../../lib/freeMolds';
import { useAuth } from '../../contexts/AuthContext';
import { ReviewsSection } from './ReviewsSection';

interface Props {
  mold: FreeMold;
}

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

export function FreeMoldCard({ mold }: Props) {
  const { user } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const waUrl = buildFreeMoldWhatsApp(mold);
  const files = mold.files || [];
  // Sin cuenta: solo se pueden descargar los archivos marcados "free". Con cuenta: todos.
  const canDownload = (f: { free?: boolean }) => !!user || !!f.free;
  const hasLocked = !user && files.some(f => !f.free);

  const handleDownload = (url: string) => {
    incrementFreeMoldDownload(mold.id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card group overflow-hidden flex flex-col">
      {/* Imagen */}
      <div className="relative">
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
          {mold.image_url ? (
            <img
              src={mold.image_url}
              alt={mold.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <FileDown className="w-14 h-14" />
            </div>
          )}
        </div>
        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
          GRATIS
        </span>
      </div>

      {/* Cuerpo */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {mold.category && (
            <span className="text-xs font-medium text-petroleum-600 bg-petroleum-50 px-2 py-0.5 rounded-md">
              {categoryLabel(mold.category)}
            </span>
          )}
          {mold.code && <span className="text-xs text-gray-400 font-mono">#{mold.code}</span>}
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-1">{mold.title}</h3>
        {mold.product_type && <p className="text-xs text-gray-400 mt-0.5">{mold.product_type}</p>}
        {mold.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{mold.description}</p>}

        {/* Datos rapidos */}
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          {mold.sizes?.length > 0 && (
            <p><span className="font-medium text-gray-600">Talles:</span> {mold.sizes.join(', ')}</p>
          )}
          {mold.fabric_recommendation && (
            <p><span className="font-medium text-gray-600">Tela:</span> {mold.fabric_recommendation}</p>
          )}
        </div>

        {/* Etiquetas */}
        {mold.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {mold.tags.slice(0, 4).map(tagItem => (
              <span key={tagItem} className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" /> {tagItem}
              </span>
            ))}
          </div>
        )}

        {/* Archivos para descargar (azul = descarga / gris = requiere cuenta) */}
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/60 p-2.5">
          <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Archivos para descargar</p>
          {files.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {files.map((f, i) =>
                canDownload(f) ? (
                  <button
                    key={i}
                    onClick={() => handleDownload(f.url)}
                    className="flex items-center justify-between gap-2 w-full px-2.5 py-1.5 bg-primary-800 text-white border border-primary-800 rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <span className="truncate">{f.label || f.name}</span>
                    <Download className="w-3.5 h-3.5 flex-shrink-0" />
                  </button>
                ) : (
                  <div
                    key={i}
                    title="Creá tu cuenta para descargar este talle"
                    className="flex items-center justify-between gap-2 w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-400 cursor-not-allowed select-none"
                  >
                    <span className="truncate">{f.label || f.name}</span>
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Disponible pronto.</p>
          )}

          {/* Mensaje crear cuenta (solo si hay talles bloqueados y no tiene cuenta) */}
          {hasLocked && (
            <div className="mt-2.5 pt-2.5 border-t border-gray-200">
              <p className="text-[11px] text-gray-600 mb-1.5">Creá tu cuenta para descargar gratis <b>todos los talles</b>.</p>
              <Link
                to="/registro"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-petroleum-600 text-white text-xs font-semibold rounded-lg hover:bg-petroleum-700 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Crear cuenta gratis
              </Link>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Consulta + Opiniones */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <button
            onClick={() => setShowReviews(true)}
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <Star className="w-3.5 h-3.5" /> Opiniones
          </button>
        </div>
      </div>

      {/* Modal de opiniones */}
      {showReviews && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setShowReviews(false)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Opiniones de</p>
                <h3 className="font-semibold text-gray-900 truncate">{mold.title}</h3>
              </div>
              <button onClick={() => setShowReviews(false)} aria-label="Cerrar" className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <ReviewsSection targetType="free_mold" targetId={mold.id} compact />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
