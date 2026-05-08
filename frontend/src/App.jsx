import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import RouteLoading from './components/ui/RouteLoading';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { SpeedInsights } from '@vercel/speed-insights/react';

const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });

const MainLayout = lazyWithRetry(() => import('./layouts/MainLayout.jsx'));
const Home = lazyWithRetry(() => import('./pages/Home.jsx'));
const Buscador = lazyWithRetry(() => import('./pages/Buscador.jsx'));
const Comunidad = lazyWithRetry(() => import('./pages/Comunidad.jsx'));
const Escena = lazyWithRetry(() => import('./pages/Escena.jsx'));
const Genero = lazyWithRetry(() => import('./pages/Genero.jsx'));
const PerfilArtista = lazyWithRetry(() => import('./pages/PerfilArtista.jsx'));
const PerfilAlbum = lazyWithRetry(() => import('./pages/PerfilAlbum.jsx'));
const PerfilCancion = lazyWithRetry(() => import('./pages/PerfilCancion.jsx'));
const PerfilUsuario = lazyWithRetry(() => import('./pages/PerfilUsuario.jsx'));
const Boveda = lazyWithRetry(() => import('./pages/Boveda.jsx'));
const Valoraciones = lazyWithRetry(() => import('./pages/Valoraciones.jsx'));
const Quavedle = lazyWithRetry(() => import('./pages/Quavedle.jsx'));
const QuavedleGame = lazyWithRetry(() => import('./pages/QuavedleGame.jsx'));
const Radar = lazyWithRetry(() => import('./pages/Radar.jsx'));
const Login = lazyWithRetry(() => import('./pages/Login.jsx'));
const Register = lazyWithRetry(() => import('./pages/Register.jsx'));
const AdminPanel = lazyWithRetry(() => import('./pages/AdminPanel.jsx'));
const Generador = lazyWithRetry(() => import('./pages/Generador.jsx'));
const ProtectedRoute = lazyWithRetry(() => import('./components/ProtectedRoute.jsx'));
const AdminRoute = lazyWithRetry(() => import('./components/AdminRoute.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function AppContent() {
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
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[var(--color-quave-orange)] selection:text-black">
        <AppContent />
        <SpeedInsights />
      </div>
    </Router>
  );
}

export default App;

