import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './lib/locale';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ContactDock } from './components/layout/ContactDock';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';
import HomePage from './pages/HomePage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
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
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TrustPage = lazy(() => import('./pages/TrustPage'));
const RespaldoDrivePage = lazy(() => import('./pages/RespaldoDrivePage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
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
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
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
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/preguntas-frecuentes" element={<FaqPage />} />
            <Route path="/como-funciona" element={<TrustPage variant="como-funciona" />} />
            <Route path="/ayuda-impresion" element={<TrustPage variant="ayuda-impresion" />} />
            <Route path="/politica-descargas" element={<TrustPage variant="politica-descargas" />} />
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
