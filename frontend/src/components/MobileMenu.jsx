import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdExplore, MdSearch, MdSportsEsports, MdGroups, MdFolder, MdPerson, MdClose, MdSecurity } from 'react-icons/md';
import { useAuthStore } from '../store/authStore';
import iconoLogo from '../assets/iconoLogo.png';

export default function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isOpen) return null;

  const menuItems = [
    { to: '/', label: 'Inicio', icon: MdHome },
    { to: '/buscar', label: 'Buscar', icon: MdSearch },
    { to: '/quavedle', label: 'Juegos', icon: MdSportsEsports },
    { to: '/comunidad', label: 'Comunidad', icon: MdGroups },
    { to: '/boveda', label: 'Mi Bóveda', icon: MdFolder },
    ...(user?.rol === 'ADMIN' ? [{ to: '/admin', label: 'Panel Admin', icon: MdSecurity }] : []),
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <img src={iconoLogo} alt="QUAVEMIND" className="w-8 h-8" />
          <span className="text-xl font-black">
            <span className="text-white uppercase tracking-tighter">QUAVE</span>
            <span className="text-[#ff6b00] uppercase tracking-tighter">MIND</span>
          </span>
        </div>
        <button onClick={onClose} className="p-2 text-white bg-white/5 rounded-xl">
          <MdClose className="text-2xl" />
        </button>
      </div>
 
      {/* Menu Items - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-5 p-5 mb-3 rounded-2xl transition-all active:scale-95 ${
                active ? 'bg-[#ff6b00] text-black shadow-[0_0_20px_rgba(255,107,0,0.2)]' : 'bg-[#0a0a0a] border border-white/5 text-white'
              }`}
            >
              <Icon className="text-2xl" />
              <span className="text-lg font-black uppercase tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
 
      {/* Auth Section - Bottom Fixed with Safe Area */}
      <div className="mt-auto p-6 border-t border-white/10 bg-black/95 backdrop-blur-xl pb-10 sm:pb-6">
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-4">
            <Link to={`/perfil/${user?.id}`} onClick={onClose} className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl shrink-0">
                <img 
                  src={user?.avatar || user?.fotoPerfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                  className="w-full h-full object-cover" 
                  alt={user?.username} 
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white uppercase truncate">{user?.username}</p>
                <p className="text-[9px] font-bold text-[#ff6b00] uppercase tracking-widest">Ver Perfil</p>
              </div>
            </Link>
            <button 
              onClick={() => { logout(); onClose(); }}
              className="px-5 py-3 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link 
            to="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-3 w-full p-5 bg-[#ff6b00] text-black font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            <MdPerson className="text-xl" />
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
}