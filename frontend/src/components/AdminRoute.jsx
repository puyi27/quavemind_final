import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useAuthStore();

  // Si está cargando o autenticado pero aún no tenemos el rol (esperando a checkAuth), mostramos carga
  if (loading || (isAuthenticated && !user?.rol)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full shadow-[0_0_20px_#ff6b0033]" />
      </div>
    );
  }

  // Si no está autenticado o no es ADMIN, fuera de aquí
  if (!isAuthenticated || user?.rol !== 'ADMIN') {
    console.warn('[SECURITY] Acceso no autorizado detectado. Abortando conexión...');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
