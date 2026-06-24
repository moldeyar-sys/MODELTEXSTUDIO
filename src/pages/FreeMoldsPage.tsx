import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Gift, ShieldCheck, Download, ArrowRight, PackageOpen } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { fetchActiveFreeMolds } from '../lib/freeMolds';
import { fetchPromoProducts, type PromoProduct } from '../lib/promo';
import { FreeMoldCard } from '../components/ui/FreeMoldCard';
import { FreePromoCard } from '../components/ui/FreePromoCard';
import type { FreeMold } from '../lib/types';

export default function FreeMoldsPage() {
  const [molds, setMolds] = useState<FreeMold[]>([]);
  const [promos, setPromos] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useSeo({
    title: 'Moldes Gratis para descargar — Moldería digital gratis',
    description:
      'Moldes de ropa GRATIS para descargar: moldería digital gratuita en PDF A4, plotter y más. Probá la calidad Modeltex antes de comprar. Descarga inmediata y nuevos moldes gratis cada semana.',
    path: '/moldes-gratis',
  });

  useEffect(() => {
    Promise.all([fetchActiveFreeMolds(), fetchPromoProducts()]).then(([m, p]) => {
      setMolds(m);
      setPromos(p);
      setLoading(false);
    });
  }, []);

  const showPromos = !search.trim();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return molds;
    return molds.filter(m =>
      [m.title, m.code, m.category, m.product_type, m.fabric_recommendation, ...(m.tags || []), ...(m.sizes || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [molds, search]);

  return (
    <div className="min-h-screen bg-petroleum-50">
      {/* Hero oscuro premium */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-900 text-white">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 85% 0%, rgba(203,110,231,0.35), transparent 45%)' }}
        />
        <div className="container-custom relative py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-400/30 text-sm font-semibold backdrop-blur-sm">
            <Gift className="w-4 h-4 text-green-300" /> 100% Gratis
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-5 max-w-3xl text-balance">
            Moldes Gratis Modeltex
          </h1>
          <p className="text-lg md:text-xl text-white/90 mt-5 max-w-2xl font-medium">
            Descargá moldes gratuitos y probá la calidad de nuestro trabajo antes de comprar.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-white/75">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-300" /> Archivos verificados</span>
            <span className="inline-flex items-center gap-2"><Download className="w-4 h-4 text-green-300" /> Descarga inmediata</span>
            <span className="inline-flex items-center gap-2"><Gift className="w-4 h-4 text-green-300" /> Sin registro</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              Ver catálogo completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="container-custom py-10 md:py-14">
        {/* Buscador */}
        <div className="max-w-md mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar molde gratis..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && (!showPromos || promos.length === 0) ? (
          <div className="card max-w-lg mx-auto text-center py-14 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-petroleum-100 mb-5">
              <PackageOpen className="w-8 h-8 text-petroleum-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-primary-900 mb-2">
              {search ? 'No encontramos moldes con esa búsqueda' : 'Pronto sumamos moldes gratis'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? 'Probá con otra palabra o mirá todo el catálogo.'
                : 'Estamos preparando moldes gratuitos para que pruebes la calidad Modeltex. Mientras tanto, explorá el catálogo.'}
            </p>
            <Link to="/catalogo" className="btn-primary">Ver catálogo de moldes</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {showPromos && promos.map(p => (
              <FreePromoCard key={p.product.id} item={p} />
            ))}
            {filtered.map(m => (
              <FreeMoldCard key={m.id} mold={m} />
            ))}
          </div>
        )}
      </section>

      {/* CTA final */}
      <section className="container-custom pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 to-petroleum-800 text-white px-6 py-12 md:px-12 text-center">
          <h2 className="relative font-display text-2xl md:text-3xl font-bold max-w-2xl mx-auto text-balance">
            ¿Te gustó la calidad? Llevá el catálogo completo de moldes listos para producir.
          </h2>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              Ver catálogo de moldes
            </Link>
            <Link
              to="/diseno-a-pedido"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-all active:scale-[0.98]"
            >
              Pedir diseño a medida
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
