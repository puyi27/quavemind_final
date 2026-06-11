import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import RouteLoading from './components/ui/RouteLoading';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { SpeedInsights } from '@vercel/speed-insights/react';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Buscador from './pages/Buscador';
import Quavedle from './pages/Quavedle';
import QuavedleGame from './pages/QuavedleGame';
import Valoraciones from './pages/Valoraciones';
import PerfilArtista from './pages/PerfilArtista';
import PerfilAlbum from './pages/PerfilAlbum';
import PerfilCancion from './pages/PerfilCancion';
import Genero from './pages/Genero';
import Escena from './pages/Escena';
import Boveda from './pages/Boveda';
import Login from './pages/Login';
import Register from './pages/Register';
import Generador from './pages/Generador';
import PerfilUsuario from './pages/PerfilUsuario';
import Comunidad from './pages/Comunidad';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const AppContent = () => {
  const { initTheme } = useThemeStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    initTheme();
    checkAuth();

    // AUTO-RECUPERACIÓN: Detectar errores de carga de chunks (Vite/Vercel)
    const handleChunkError = (e) => {
      if (e.message.includes('Failed to fetch dynamically imported module') || e.message.includes('type "text/html"')) {
        console.warn('[Quavemind] Error de sincronización detectado. Recargando núcleo...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, [initTheme, checkAuth]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* RUTAS DE ACCESO (FUERA DEL LAYOUT PRINCIPAL PARA ESTILO FULL TERMINAL) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<MainLayout />}>
            {/* RUTAS PUBLICAS */}
            <Route path="/" element={<Home />} />
            <Route path="/buscador" element={<Buscador />} />
            <Route path="/buscar" element={<Buscador />} />
            <Route path="/quavedle" element={<Quavedle />} />
            <Route path="/quavedle/:gameSlug" element={<QuavedleGame />} />
            <Route path="/artista/:id" element={<PerfilArtista />} />
            <Route path="/album/:id" element={<PerfilAlbum />} />
            <Route path="/cancion/:id" element={<PerfilCancion />} />
            <Route path="/genero/:id" element={<Genero />} />
            <Route path="/escena/:pais" element={<Escena />} />
            <Route path="/perfil/:id" element={<PerfilUsuario />} />
            <Route path="/comunidad" element={<Comunidad />} />

            {/* RUTAS PROTEGIDAS (USUARIO) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/boveda/*" element={<Boveda />} />
              <Route path="/valoraciones" element={<Valoraciones />} />
            </Route>

            {/* RUTA PROTEGIDA (ADMIN) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>

          <Route path="/generador" element={<Generador />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[var(--color-quave-orange)] selection:text-black">
        <AppContent />
        <SpeedInsights />
      </div>
    </Router>
  );
};

export default App;

