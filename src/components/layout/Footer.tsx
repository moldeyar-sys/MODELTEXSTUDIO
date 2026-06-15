import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { CATEGORIES } from '../../lib/types';
import { useLocale } from '../../lib/locale';
import { BrandLogo } from '../brand/BrandLogo';

export function Footer() {
  const { t } = useLocale();
  const mainCats = CATEGORIES.filter(c => !['packs', 'diseno-pedido'].includes(c.value));

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <BrandLogo variant="full" tone="light" size={36} />
            </div>
            <p className="text-primary-200 text-sm leading-relaxed mb-4">
              {t('footer.tagline', 'Moldes digitales profesionales listos para imprimir y producir. Tienda digital para fabricantes, emprendedores y diseñadores.')}
            </p>
            <div className="flex items-center gap-2 text-primary-200 text-sm">
              <Mail className="w-4 h-4" />
              <span>info@modeltexstudio.com</span>
            </div>
            <div className="flex items-center gap-2 text-primary-200 text-sm mt-2">
              <MapPin className="w-4 h-4" />
              <span>{t('footer.location', 'Argentina - Envíos digitales a todo el mundo')}</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.categories', 'Categorías')}</h4>
            <ul className="space-y-2">
              {mainCats.map(cat => (
                <li key={cat.value}>
                  <Link to={`/catalogo?categoria=${cat.value}`} className="text-primary-200 text-sm hover:text-white transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Modeltex</h4>
            <ul className="space-y-2">
              <li><Link to="/catalogo" className="text-primary-200 text-sm hover:text-white transition-colors">{t('footer.fullCatalog', 'Catálogo completo')}</Link></li>
              <li><Link to="/catalogo?categoria=packs" className="text-primary-200 text-sm hover:text-white transition-colors">{t('footer.packs', 'Packs de moldes')}</Link></li>
              <li><Link to="/diseno-a-pedido" className="text-primary-200 text-sm hover:text-white transition-colors">{t('nav.custom', 'Diseño a pedido')}</Link></li>
              <li><Link to="/registro" className="text-primary-200 text-sm hover:text-white transition-colors">{t('nav.register', 'Crear cuenta')}</Link></li>
              <li><Link to="/login" className="text-primary-200 text-sm hover:text-white transition-colors">{t('nav.signin', 'Iniciar sesión')}</Link></li>
            </ul>
          </div>

          {/* Formats */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.formats', 'Formatos disponibles')}</h4>
            <ul className="space-y-2">
              {['PDF A4', 'PDF Plotter', 'PLT', 'DXF', 'CDR', 'Sublimación'].map(f => (
                <li key={f} className="text-primary-200 text-sm">{f}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700/50 mt-12 pt-8 text-center">
          <p className="text-primary-300 text-sm">
            &copy; {new Date().getFullYear()} Modeltex. {t('footer.rights', 'Todos los derechos reservados.')}
          </p>
        </div>
      </div>
    </footer>
  );
}
