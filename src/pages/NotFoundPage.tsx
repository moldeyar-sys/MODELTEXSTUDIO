import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { BrandLogo } from '../components/brand/BrandLogo';
import { useSeo } from '../lib/seo';

export default function NotFoundPage() {
  useSeo({ title: 'Página no encontrada', path: '/404' });

  return (
    <div className="min-h-[70vh] bg-petroleum-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex justify-center mb-6">
          <BrandLogo variant="icon" size={64} />
        </div>
        <p className="font-display text-6xl font-bold text-primary-900 mb-2">404</p>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-8">
          La página que buscás no existe o se movió. Probá desde el catálogo o volvé al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" /> Ir al inicio
          </Link>
          <Link to="/catalogo" className="btn-secondary inline-flex items-center gap-2">
            <Search className="w-4 h-4" /> Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
