import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { LocaleProvider } from './lib/locale';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ContactDock } from './components/layout/ContactDock';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';
import { trackPageView } from './lib/analytics';
import HomePage from './pages/HomePage';

/**
 * Dispara el page_view de GA4 a mano en cada cambio de ruta, con la URL
 * SIN query string (ver src/lib/analytics.ts: send_page_view:false en
 * initGA — algunas rutas como /mi-pedido llevan el email del comprador
 * invitado en la query string, y el page_view automático de gtag.js lo
 * hubiera mandado tal cual).
 */
function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

/**
 * Scroll al cambiar de página. Sin esto, al tocar un enlace del pie de
 * página (por ejemplo "Botón de arrepentimiento" o "Términos") la página
 * nueva aparecía desplazada hasta abajo, donde estaba el pie de la anterior:
 * el navegador conserva el scroll en la navegación de una SPA. Con #ancla se
 * espera al elemento (las páginas se cargan en diferido) y se lleva hasta él.
 * Atrás/adelante (POP) se deja al navegador, que restaura solo la posición.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType === 'POP') return;
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let intentos = 0;
    let timer = 0;
    const buscar = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (intentos++ < 40) timer = window.setTimeout(buscar, 50);
    };
    buscar();
    return () => window.clearTimeout(timer);
  }, [pathname, hash, navType]);
  return null;
}

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MyGuestOrderPage = lazy(() => import('./pages/MyGuestOrderPage'));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const MyDownloadsPage = lazy(() => import('./pages/MyDownloadsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CustomDesignPage = lazy(() => import('./pages/CustomDesignPage'));
const IaTextilPage = lazy(() => import('./pages/IaTextilPage'));
const FreeMoldsPage = lazy(() => import('./pages/FreeMoldsPage'));
const FreeMoldDetailPage = lazy(() => import('./pages/FreeMoldDetailPage'));
const LabHomePage = lazy(() => import('./pages/LabHomePage'));
const LabCoursePage = lazy(() => import('./pages/LabCoursePage'));
const LabLessonPage = lazy(() => import('./pages/LabLessonPage'));
const LabAiPage = lazy(() => import('./pages/LabAiPage'));
const LabGlossaryPage = lazy(() => import('./pages/LabGlossaryPage'));
const LabGlossaryTermPage = lazy(() => import('./pages/LabGlossaryTermPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TrustPage = lazy(() => import('./pages/TrustPage'));
const RespaldoDrivePage = lazy(() => import('./pages/RespaldoDrivePage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const GuiasPage = lazy(() => import('./pages/GuiasPage'));
const GuiaDetailPage = lazy(() => import('./pages/GuiaDetailPage'));
const MolderiaDigitalPage = lazy(() => import('./pages/MolderiaDigitalPage'));
const MoldesPdfPage = lazy(() => import('./pages/MoldesPdfPage'));
const MoldesPdfA4Page = lazy(() => import('./pages/MoldesPdfA4Page'));
const MoldesPlotterPage = lazy(() => import('./pages/MoldesPlotterPage'));
const MoldesEmprendedoresPage = lazy(() => import('./pages/MoldesEmprendedoresPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
    </div>
  );
}

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageViewTracker />
      <ScrollManager />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/molderia-digital" element={<MolderiaDigitalPage />} />
            <Route path="/moldes-pdf" element={<MoldesPdfPage />} />
            <Route path="/moldes-pdf-a4" element={<MoldesPdfA4Page />} />
            <Route path="/moldes-para-plotter" element={<MoldesPlotterPage />} />
            <Route path="/moldes-para-emprendedores" element={<MoldesEmprendedoresPage />} />
            <Route path="/producto/:slug" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            {/* Sin ProtectedRoute a proposito: se puede comprar sin cuenta. CheckoutPage
                distingue internamente si hay sesion o pide el email de invitado. */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mi-pedido" element={<MyGuestOrderPage />} />
            <Route path="/mi-cuenta" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
            <Route path="/mis-compras" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/descargas" element={<ProtectedRoute><MyDownloadsPage /></ProtectedRoute>} />
            <Route path="/diseno-a-pedido" element={<CustomDesignPage />} />
            <Route path="/ia-textil" element={<IaTextilPage />} />
            <Route path="/moldes-gratis" element={<FreeMoldsPage />} />
            <Route path="/moldes-gratis/:slug" element={<FreeMoldDetailPage />} />
            <Route path="/lab" element={<LabHomePage />} />
            <Route path="/lab/ia" element={<LabAiPage />} />
            <Route path="/lab/glosario" element={<LabGlossaryPage />} />
            <Route path="/lab/glosario/:slug" element={<LabGlossaryTermPage />} />
            <Route path="/lab/:cursoSlug" element={<LabCoursePage />} />
            <Route path="/lab/:cursoSlug/:moduloSlug/:claseSlug" element={<LabLessonPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/quienes-somos" element={<AboutPage />} />
            <Route path="/preguntas-frecuentes" element={<FaqPage />} />
            <Route path="/guias" element={<GuiasPage />} />
            <Route path="/guias/:slug" element={<GuiaDetailPage />} />
            <Route path="/como-funciona" element={<TrustPage variant="como-funciona" />} />
            <Route path="/ayuda-impresion" element={<TrustPage variant="ayuda-impresion" />} />
            <Route path="/politica-descargas" element={<TrustPage variant="politica-descargas" />} />
            <Route path="/devoluciones" element={<TrustPage variant="devoluciones" />} />
            <Route path="/terminos" element={<TrustPage variant="terminos" />} />
            <Route path="/privacidad" element={<TrustPage variant="privacidad" />} />
            <Route path="/legal/respaldo-drive-denis" element={<RespaldoDrivePage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ContactDock />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;
