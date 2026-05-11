import { useState, useEffect, useTransition } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdSearch, 
  MdGroups, 
  MdEmojiEvents, 
  MdArrowForward,
  MdAccountCircle
} from 'react-icons/md';
import api from '../services/api';
import RouteLoading from '../components/ui/RouteLoading';
import { useDebounce } from '../hooks/useDebounce';

const Comunidad = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/leaderboard');
        setLeaderboard(res.data?.leaderboard || []);
      } catch (err) {
        // Silenciar error - usar array vacío
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await api.get(`/auth/search?q=${debouncedSearchTerm}`);
        // Envolvemos la actualización de resultados en una transición
        startTransition(() => {
          setSearchResults(res.data.usuarios || []);
        });
      } catch (err) {
        console.error('Error en búsqueda:', err);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchTerm]);

  if (loading) return <RouteLoading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-black min-h-screen text-white">
      {/* HEADER COMUNIDAD */}
      <div className="mb-16 text-center md:text-left">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 italic italic-bold italic-orange">
          Comunidad <br className="hidden md:block" /> Quave
        </h1>
        <p className="text-xl text-gray-500 font-mono uppercase tracking-[0.2em]">Red de Usuarios Musicales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* BUSCADOR (COLUMNA PRINCIPAL) */}
        <div className="lg:col-span-2 space-y-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b00] to-white rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#0a0a0a] rounded-3xl p-6 border border-white/10 flex items-center gap-6">
              <MdSearch className="text-4xl text-[#ff6b00]" />
              <input 
                type="text" 
                placeholder="BUSCAR USUARIO POR NOMBRE..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-2xl font-black uppercase outline-none placeholder:text-gray-800 tracking-tighter"
              />
            </div>
          </div>

          {/* RESULTADOS O DESTACADOS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
              <MdGroups className="text-[#ff6b00]" /> 
              {searchTerm ? 'Resultados de Búsqueda' : 'Usuarios Activos'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(searchTerm ? searchResults : leaderboard).length > 0 ? (searchTerm ? searchResults : leaderboard).map((user) => (
                <Link 
                  key={user.id} 
                  to={`/perfil/${user.id}`}
                  className="p-6 rounded-[2rem] bg-[#0a0a0a] border border-white/5 hover:border-[#ff6b00] transition-all group flex items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#ff6b00] transition-colors">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      className="w-full h-full object-cover" 
                      alt={user.username}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black uppercase tracking-tight">{user.username}</h4>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{user.quavePoints} QUAVE POINTS</p>
                  </div>
                  <MdArrowForward className="text-2xl text-gray-800 group-hover:text-[#ff6b00] transform group-hover:translate-x-2 transition-all" />
                </Link>
              )) : (
                <div className="col-span-full py-20 text-center bg-[#0a0a0a] rounded-[3rem] border border-white/5 border-dashed">
                  <MdAccountCircle size={60} className="mx-auto text-gray-800 mb-4" />
                  <p className="text-gray-600 font-mono uppercase tracking-widest">No se han encontrado usuarios en esta zona.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOP AGENTES (SIDEBAR) */}
        <div className="space-y-8">
          <div className="p-10 rounded-[3rem] bg-gradient-to-b from-[#111] to-black border-4 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <MdEmojiEvents size={150} />
            </div>
            
            <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-3 italic">
              <MdEmojiEvents className="text-[#ff6b00]" /> Top Usuarios
            </h3>

            <div className="space-y-8">
              {leaderboard.slice(0, 5).sort((a,b) => b.quavePoints - a.quavePoints).map((user, index) => (
                <Link 
                  key={user.id} 
                  to={`/perfil/${user.id}`} 
                  className="flex items-center gap-5 group"
                >
                   <div className="relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 relative z-10 ${
                      index === 0 ? 'bg-[#ff6b00] border-black text-black scale-110' : 
                      index === 1 ? 'bg-gray-300 border-black text-black' :
                      index === 2 ? 'bg-[#cd7f32] border-black text-black' :
                      'bg-[#111] border-white/10 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg overflow-hidden border border-black z-20 shadow-lg">
                      <img 
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-black uppercase tracking-tight group-hover:text-[#ff6b00] transition-colors">{user.username}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-[#ff6b00] h-full" style={{ width: `${Math.min(100, user.quavePoints / 10)}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-gray-500">{user.quavePoints} PT</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-white/5 text-center">
              <p className="text-[10px] font-black uppercase text-gray-500 mb-6">¿Quieres subir en el ranking?</p>
              <Link to="/quavedle" className="inline-block px-8 py-4 bg-white text-black font-black uppercase rounded-2xl text-xs hover:bg-[#ff6b00] transition-colors shadow-2xl">
                Jugar Ahora
              </Link>
            </div>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 flex flex-col items-center text-center">
             <MdGroups size={50} className="text-[#ff6b00] mb-4" />
             <h4 className="text-lg font-black uppercase mb-2">Comunidad Protegida</h4>
             <p className="text-xs text-gray-500 font-mono leading-relaxed">
               Todos los datos de la bóveda están encriptados y protegidos por la red Neon.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Comunidad;
