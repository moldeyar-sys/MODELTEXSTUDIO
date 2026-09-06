import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ next: location.pathname }} />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, profileLoaded, loading } = useAuth();

  // El perfil se carga async despues del user: sin este spinner intermedio,
  // recien logueado rebotaria a la portada antes de saberse si es admin.
  // profileLoaded (no "!profile") es lo que corta la espera: si el perfil no
  // existe o la consulta falla, profile queda null pero profileLoaded pasa a
  // true igual, así que esto nunca queda esperando para siempre.
  if (loading || (user && !profileLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ next: '/admin' }} />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
