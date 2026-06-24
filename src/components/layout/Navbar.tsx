import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, ChevronDown, LogOut, Package, Download, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLocale } from '../../lib/locale';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLocale();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: t('nav.home', 'Inicio') },
    { to: '/catalogo', label: t('nav.catalog', 'Catálogo') },
    { to: '/diseno-a-pedido', label: t('nav.custom', 'Diseño a pedido') },
    { to: '/ia-textil', label: t('nav.iaTextil', 'IA Textil') },
    { to: '/moldes-gratis', label: t('nav.freeMolds', 'Moldes Gratis') },
    { to: '/contacto', label: t('nav.contact', 'Contacto') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0 mr-2" onClick={() => setIsOpen(false)} aria-label="Modeltex - Inicio">
            <img
              src="/brand/modeltex-mark-buzo.png?v=1"
              alt="Modeltex"
              draggable={false}
              className="h-8 sm:h-9 w-auto select-none transition-transform group-hover:scale-[1.03]"
            />
            <span className="font-bold text-lg sm:text-xl tracking-tight text-gray-900 hidden sm:inline">MODELTEX</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/carrito"
              className="relative p-2 rounded-lg text-gray-600 hover:text-primary-800 hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-petroleum-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-700" />
                  </div>
                  <span className="max-w-[120px] truncate">{profile?.full_name || t('nav.myaccount', 'Mi cuenta')}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <Link
                        to="/mi-cuenta"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" /> {t('nav.profile', 'Mi perfil')}
                      </Link>
                      <Link
                        to="/mis-compras"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4" /> {t('nav.orders', 'Mis compras')}
                      </Link>
                      <Link
                        to="/descargas"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" /> {t('nav.downloads', 'Mis descargas')}
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50"
                        >
                          <Settings className="w-4 h-4" /> {t('nav.admin', 'Panel Admin')}
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut(); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> {t('nav.logout', 'Cerrar sesión')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-800 transition-colors">
                  {t('nav.signin', 'Ingresar')}
                </Link>
                <Link to="/registro" className="btn-primary text-sm px-4 py-2">
                  {t('nav.register', 'Crear cuenta')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/carrito"
              className="relative p-2 rounded-lg text-gray-600"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-petroleum-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <Link to="/mi-cuenta" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
                  {t('nav.profile', 'Mi perfil')}
                </Link>
                <Link to="/mis-compras" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
                  {t('nav.orders', 'Mis compras')}
                </Link>
                <Link to="/descargas" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
                  {t('nav.downloads', 'Mis descargas')}
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-primary-700 hover:bg-primary-50">
                    {t('nav.admin', 'Panel Admin')}
                  </Link>
                )}
                <button
                  onClick={() => { setIsOpen(false); signOut(); }}
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  {t('nav.logout', 'Cerrar sesión')}
                </button>
              </>
            ) : (
              <div className="px-4 pt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary text-sm">
                  {t('nav.signin', 'Ingresar')}
                </Link>
                <Link to="/registro" onClick={() => setIsOpen(false)} className="btn-primary text-sm">
                  {t('nav.register', 'Crear cuenta')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
