import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdExplore, MdSearch, MdSportsEsports, MdGroups, MdFolder, MdPerson, MdClose } from 'react-icons/md';
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
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={iconoLogo} alt="QUAVEMIND" className="w-8 h-8" />
          <span className="text-lg font-black">
            <span className="text-white">QUAVE</span>
            <span className="text-[#ff6b00]">MIND</span>
          </span>
        </div>
        <button onClick={onClose} className="p-2 text-white">
          <MdClose className="text-2xl" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-4 p-4 mb-2 rounded-xl ${
                active ? 'bg-[#ff6b00] text-black' : 'bg-white/5 text-white'
              }`}
            >
              <Icon className="text-2xl" />
              <span className="text-lg font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Auth Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border-2 border-white/10 overflow-hidden shadow-2xl shrink-0 group-hover:border-[#ff6b00] transition-colors">
                <img 
                  src={user?.avatar || user?.fotoPerfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  className="w-full h-full object-cover" 
                  alt={user.username} 
                />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">{user?.username}</p>
                <p className="text-[9px] font-bold text-[#ff6b00] uppercase tracking-widest">En línea</p>
              </div>
            </div>
            <button 
              onClick={() => { logout(); onClose(); }}
              className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link 
            to="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full p-4 bg-[#ff6b00] text-black font-bold rounded-xl"
          >
            <MdPerson className="text-xl" />
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
}