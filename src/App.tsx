import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocaleProvider } from './lib/locale';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';
import { ChatWidget } from './components/chat/ChatWidget';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';

// HomePage se carga de inmediato (landing). El resto se carga on-demand
// (code-splitting) para aligerar el bundle inicial.
import HomePage from './pages/HomePage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const MyDownloadsPage = lazy(() => import('./pages/MyDownloadsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CustomDesignPage = lazy(() => import('./pages/CustomDesignPage'));
const IaTextilPage = lazy(() => import('./pages/IaTextilPage'));
const FreeMoldsPage = lazy(() => import('./pages/FreeMoldsPage'));
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
            <Route path="/producto/:slug" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/mi-cuenta" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
            <Route path="/mis-compras" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/descargas" element={<ProtectedRoute><MyDownloadsPage /></ProtectedRoute>} />
            <Route path="/diseno-a-pedido" element={<CustomDesignPage />} />
            <Route path="/ia-textil" element={<IaTextilPage />} />
            <Route path="/moldes-gratis" element={<FreeMoldsPage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
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
