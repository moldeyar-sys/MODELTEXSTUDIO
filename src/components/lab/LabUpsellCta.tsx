import { Link } from 'react-router-dom';
import { PackageCheck, ArrowRight } from 'lucide-react';
import { trackUpsellCatalogClick } from '../../lib/analytics';

/** Puente de venta al catálogo, para el final de una página de Modeltex Lab. */
export function LabUpsellCta() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-900 to-petroleum-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
      <span className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
        <PackageCheck className="w-7 h-7" />
      </span>
      <div className="flex-1 text-center sm:text-left">
        <h2 className="font-display text-xl sm:text-2xl font-bold">¿Querés ahorrar tiempo en producción?</h2>
        <p className="text-white/80 mt-1.5 max-w-xl">
          Llevate nuestros packs de moldería industrial ya escalada y lista para imprimir: curva de talles completa, muestra aprobada, en PDF A4, plotter y formatos CAD.
        </p>
      </div>
      <Link
        to="/catalogo"
        onClick={trackUpsellCatalogClick}
        className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
      >
        Ver catálogo <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
