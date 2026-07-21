import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  // El perfil se carga async despues del user: sin este spinner intermedio,
  // recien logueado rebotaria a la portada antes de saberse si es admin.
  if (loading || (user && !profile)) {
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
