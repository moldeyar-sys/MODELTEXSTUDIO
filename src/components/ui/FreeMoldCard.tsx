import { useState } from 'react';
import { ArrowRight, FileDown, MessageCircle, Star, Tag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FreeMold } from '../../lib/types';
import { CATEGORIES } from '../../lib/types';
import { buildFreeMoldWhatsApp } from '../../lib/freeMolds';
import { freeMoldName, freeMoldPath, groupFiles, type FreeFileSection } from '../../lib/freeMoldFormats';
import { ReviewsSection } from './ReviewsSection';

interface Props {
  mold: FreeMold;
  /**
   * Slug de su página (/moldes-gratis/<slug>), calculado por FreeMoldsPage.
   * Sin slug (páginas del Lab) se enlaza por id y la página redirige al slug.
   */
  slug?: string;
}

// "PDF A4 · 8 talles", "PDF plotter · 5 anchos", "CDR editable · 2 archivos"
function sectionSummary(s: FreeFileSection) {
  if (s.format.id === 'pdf-plotter') {
    const widths = new Set(s.files.map((f) => f.width).filter(Boolean)).size;
    if (widths) return `${s.format.short} · ${widths} ${widths === 1 ? 'ancho' : 'anchos'}`;
  }
  const sizes = new Set(s.files.map((f) => f.size).filter(Boolean)).size;
  if (s.format.id === 'pdf-a4' && sizes) return `${s.format.short} · ${sizes} ${sizes === 1 ? 'talle' : 'talles'}`;
  return `${s.format.short} · ${s.files.length} ${s.files.length === 1 ? 'archivo' : 'archivos'}`;
}

export function FreeMoldCard({ mold, slug }: Props) {
  const [showReviews, setShowReviews] = useState(false);
  const sections = groupFiles(mold.files || []);
  const name = freeMoldName(mold.title);
  const path = freeMoldPath(slug || mold.id);
  const category = CATEGORIES.find((c) => c.value === mold.category)?.label;

  return (
    <div className="card group overflow-hidden flex flex-col">
      {/* Imagen cuadrada con la prenda entera (sin recortar) */}
      <Link to={path} className="relative block">
        <div className="aspect-square bg-white overflow-hidden">
          {mold.image_url ? (
            <img
              src={mold.image_url}
              alt={`${name} — molde gratis`}
              loading="lazy"
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <FileDown className="w-14 h-14" />
            </div>
          )}
        </div>
        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">GRATIS</span>
      </Link>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {category && <span className="text-xs font-medium text-petroleum-600 bg-petroleum-50 px-2 py-0.5 rounded-md">{category}</span>}
          {mold.code && <span className="text-xs text-gray-400 font-mono">#{mold.code}</span>}
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-1">
          <Link to={path} className="hover:text-primary-800">{name}</Link>
        </h3>
        {mold.product_type && <p className="text-xs text-gray-400 mt-0.5">{mold.product_type}</p>}
        {mold.fabric_recommendation && (
          <p className="text-xs text-gray-500 mt-1"><span className="font-medium text-gray-600">Tela:</span> {mold.fabric_recommendation}</p>
        )}

        {mold.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {mold.tags.slice(0, 3).map((tagItem) => (
              <span key={tagItem} className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" /> {tagItem}
              </span>
            ))}
          </div>
        )}

        {/* Qué formatos trae (el detalle y las descargas están en su página) */}
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/60 p-2.5">
          <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Formatos para descargar</p>
          {sections.length > 0 ? (
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.format.id} className="flex items-center gap-1.5 text-xs text-gray-700">
                  <FileDown className="w-3.5 h-3.5 text-primary-700 flex-shrink-0" />
                  {sectionSummary(s)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Archivos en preparación.</p>
          )}
        </div>

        <div className="flex-1" />

        <Link
          to={path}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          {sections.length > 0 ? 'Ver y descargar' : 'Ver molde'} <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <a
            href={buildFreeMoldWhatsApp(mold)}
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

      {showReviews && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setShowReviews(false)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Opiniones de</p>
                <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
              </div>
              <button onClick={() => setShowReviews(false)} aria-label="Cerrar" className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <ReviewsSection targetType="free_mold" targetId={mold.id} compact />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
