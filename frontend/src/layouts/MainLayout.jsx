import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  MdHome, MdExplore, MdSearch, 
  MdSportsEsports, MdFolder, MdMap, MdAlbum,
  MdPerson, MdArrowDropDown, MdMenu, MdClose,
  MdGroups, MdSecurity
} from 'react-icons/md';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ESCENAS_DATA } from '../data/escenasData';
import { GENEROS_DATA } from '../data/generosData';
import iconoLogo from '../assets/iconoLogo.png';
import { useAuthStore } from '../store/authStore';
import MobileMenu from '../components/MobileMenu';
import MiniPlayer from '../components/MiniPlayer';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Detectar scroll para cambiar estilo
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar dropdowns al cambiar de ruta
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Inicio', icon: MdHome },
    { to: '/buscar', label: 'Buscar', icon: MdSearch },
    { to: '/comunidad', label: 'Comunidad', icon: MdGroups },
  ];

  const dropdownItems = [
    { 
      id: 'escenas', 
      label: 'Escenas', 
      icon: MdMap,
      items: Object.entries(ESCENAS_DATA).map(([id, data]) => ({
        to: `/escena/${id}`,
        label: data.nombre,
        icon: data.flag
      }))
    },
    { 
      id: 'generos', 
      label: 'Géneros', 
      icon: MdAlbum,
      items: Object.entries(GENEROS_DATA).map(([id, data]) => ({
        to: `/genero/${id}`,
        label: data.nombre
      }))
    }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar Minimalista Inspirado en navbar.gallery */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none px-4 lg:px-8 ${
          scrolled 
            ? 'pt-2 lg:pt-3 pb-3 bg-black/60 backdrop-blur-xl border-b border-white/5' 
            : 'pt-4 lg:pt-6 pb-2'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LADO IZQUIERDO: LOGO - Centrado vertical forzado */}
          <div className="flex-1 flex items-center justify-start pointer-events-auto h-12">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={iconoLogo} 
                alt="QUAVEMIND" 
                className="w-10 h-10 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
              />
              <span className="text-lg font-black tracking-tighter hidden sm:block uppercase leading-none mt-0.5">
                <span className="text-white">QUAVE</span>
                <span className="text-[#ff6b00]">MIND</span>
              </span>
            </Link>
          </div>

          {/* CENTRO: PÍLDORA DE NAVEGACIÓN INTELIGENTE (SMART PILL) - OCULTA EN MÓVIL */}
          <nav className={`hidden md:flex pointer-events-auto transition-all duration-300 items-center gap-1 p-1.5 rounded-full border border-white/10 ${
            scrolled 
              ? 'bg-[#050505] border-white/20 shadow-xl' 
              : 'bg-black/40 border-white/10'
          }`}>
            {/* Inicio & Buscar */}
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-2 ${
                  isActive(item.to)
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="text-base" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            ))}

            {/* Mega Menús: Escenas & Géneros */}
            {dropdownItems.map((dropdown) => (
              <div 
                key={dropdown.id} 
                className="relative"
                onMouseEnter={() => setActiveDropdown(dropdown.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-2 ${
                    activeDropdown === dropdown.id || location.pathname.includes(dropdown.id)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <dropdown.icon className="text-base" />
                  <span className="hidden xl:inline">{dropdown.label}</span>
                  <MdArrowDropDown className={`text-lg transition-transform duration-300 ${activeDropdown === dropdown.id ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === dropdown.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[300px] sm:w-[450px] bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-4 z-50"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {dropdown.items.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] text-white/70 uppercase font-black tracking-widest hover:bg-[#ff6b00] hover:text-black transition-all group"
                          >
                            {item.icon && <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {/* Comunidad & Juegos */}
            {navItems.slice(2).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-2 ${
                  isActive(item.to)
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="text-base" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            ))}

            <Link
              to="/quavedle"
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 hidden lg:flex items-center gap-2 ${
                isActive('/quavedle')
                  ? 'bg-[#ff6b00] text-black shadow-[0_0_20px_rgba(255,107,0,0.4)] scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <MdSportsEsports className="text-base" />
              <span>Juegos</span>
            </Link>
          </nav>

          {/* LADO DERECHO: ACCIONES Y PERFIL - Centrado vertical forzado */}
          <div className="flex-1 flex items-center justify-end gap-3 pointer-events-auto h-12">
            {user?.rol === 'ADMIN' && (
              <Link 
                to="/admin"
                className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-500 h-10 border border-white/20 ${
                  isActive('/admin')
                    ? 'bg-white text-black'
                    : 'bg-black text-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                }`}
              >
                <MdPerson className="text-base" />
                <span>Admin</span>
              </Link>
            )}

            <Link 
              to="/boveda"
              className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-500 h-10 ${
                isActive('/boveda')
                  ? 'bg-white text-black'
                  : 'bg-[#ff6b00] text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,107,0,0.3)]'
              }`}
            >
              <MdFolder className="text-base" />
              <span>Bóveda</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 h-10">
                <Link to={`/perfil/${user.id}`} className="group flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white group-hover:border-[#ff6b00] transition-all overflow-hidden shadow-lg">
                     <img 
                       src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                       className="w-full h-full object-cover" 
                       alt={user.username} 
                     />
                  </div>
                </Link>
                <button 
                  onClick={() => logout()}
                  className="p-2.5 rounded-full text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center"
                  title="Salir"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#ff6b00] transition-all shadow-xl"
              >
                <MdPerson className="text-xl" />
              </Link>
            )}
            
            {/* Botón de Menú Móvil (solo visible si la píldora central se oculta en móvil muy pequeño) */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-full text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <MdMenu className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* MINI PLAYER FLOTANTE */}
      <MiniPlayer />

      {/* Main Content - Ajustado para el nuevo navbar flotante */}
      <main className="pt-28 lg:pt-36">
        <Outlet />
      </main>

      {/* BOTÓN BACK TO TOP (CON LOGO) */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-black border-2 border-[#ff6b00]/30 hover:border-[#ff6b00] rounded-2xl flex items-center justify-center group transition-all shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:shadow-[0_0_40px_rgba(255,107,0,0.4)] pointer-events-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#ff6b00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src={iconoLogo} 
              alt="TOP" 
              className="w-7 h-7 object-contain group-hover:scale-125 transition-transform duration-500 z-10" 
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
