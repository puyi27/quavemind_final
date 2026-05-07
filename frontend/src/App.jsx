import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import RouteLoading from './components/ui/RouteLoading';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const Home = lazy(() => import('./pages/Home'));
const Buscador = lazy(() => import('./pages/Buscador'));
const Quavedle = lazy(() => import('./pages/Quavedle'));
const QuavedleGame = lazy(() => import('./pages/QuavedleGame'));
const Valoraciones = lazy(() => import('./pages/Valoraciones'));
const PerfilArtista = lazy(() => import('./pages/PerfilArtista'));
const PerfilAlbum = lazy(() => import('./pages/PerfilAlbum'));
const PerfilCancion = lazy(() => import('./pages/PerfilCancion'));
const Genero = lazy(() => import('./pages/Genero'));
const Escena = lazy(() => import('./pages/Escena'));
const Boveda = lazy(() => import('./pages/Boveda'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Generador = lazy(() => import('./pages/Generador'));
const PerfilUsuario = lazy(() => import('./pages/PerfilUsuario'));
const Comunidad = lazy(() => import('./pages/Comunidad'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

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

            {/* RUTAS PROTEGIDAS */}
            <Route element={<ProtectedRoute />}>
              <Route path="/boveda/*" element={<Boveda />} />
              <Route path="/valoraciones" element={<Valoraciones />} />
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
      </div>
    </Router>
  );
};

export default App;

