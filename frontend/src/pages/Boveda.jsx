import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { 
  MdTrendingUp, MdFavorite, 
  MdPerson, MdAlbum, MdMusicNote, MdStar, MdStarHalf,
  MdArrowBack, MdLock, MdHistory
} from 'react-icons/md';
import { useVault } from '../hooks/useVault';

// Componente de carga Tech-Premium
const LoadingState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6">
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
      <span className="font-black uppercase text-white tracking-[0.3em] text-sm animate-pulse">
        Descifrando Archivos...
      </span>
    </div>
  </div>
);

// Componente de error de autenticación estilo Tech-Premium
const AuthErrorState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6">
    <div className="bg-[#0a0a0a] border border-white/10 p-12 rounded-[2.5rem] max-w-md text-center shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ff6b00]/10 blur-[80px] rounded-full" />
      <MdLock className="text-6xl text-[#ff6b00] mx-auto mb-6" />
      <h2 className="font-black uppercase text-white text-3xl mb-3 tracking-tighter">
        Acceso Restringido
      </h2>
      <p className="text-gray-400 text-xs uppercase mb-8 tracking-[0.2em] leading-relaxed">
        Identificación requerida para acceder a tu Bóveda Musical
      </p>
      <Link 
        to="/login"
        className="inline-block bg-[#ff6b00] text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white transition-all transform hover:scale-105"
      >
        Iniciar Sesión
      </Link>
    </div>
  </div>
);

// Componente de error genérico
const ErrorState = ({ message }) => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6">
    <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-[2.5rem] max-w-md text-center">
      <h2 className="font-black uppercase text-red-500 text-2xl mb-2 tracking-tighter">
        Error de Enlace
      </h2>
      <p className="text-gray-400 text-xs uppercase tracking-widest">
        {message || 'No se pudieron recuperar los registros'}
      </p>
    </div>
  </div>
);

export default function Boveda() {
  const { valoraciones, favoritos, isLoading, error } = useVault();
  const location = useLocation();

  if (isLoading) return <LoadingState />;
  if (error?.type === 'AUTH_REQUIRED') return <AuthErrorState />;
  if (error && error.type !== 'AUTH_REQUIRED') return <ErrorState message={error.message} />;

  const MainView = () => (
    <>
      {/* Actividad Reciente (Valoraciones) */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ff6b00]/10 rounded-2xl">
              <MdHistory className="text-3xl text-[#ff6b00]" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight italic">Últimas Auditorías</h2>
          </div>
          <Link to="/valoraciones" className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black text-[#ff6b00] hover:bg-white hover:text-black transition-all uppercase tracking-widest">
            Ver Historial Completo
          </Link>
        </div>

        {valoraciones.length === 0 ? (
          <div className="p-20 bg-[#0a0a0a] border border-white/5 rounded-[3rem] text-center">
             <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">No hay registros de auditoría en la sesión actual</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valoraciones.slice(0, 6).map((item) => (
              <Link 
                key={item.id}
                to={`/${item.tipo}/${item.itemId}`}
                className="group bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] hover:border-[#ff6b00]/30 transition-all duration-500 flex items-center gap-5"
              >
                <div className="relative w-20 h-20 shrink-0">
                  <img src={item.snapshot?.imagen} className="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white uppercase truncate text-sm mb-1 group-hover:text-[#ff6b00] transition-colors">{item.snapshot?.nombre}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase truncate mb-3">{item.snapshot?.artista}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFull = item.rating >= star;
                      const isHalf = !isFull && item.rating >= star - 0.5;
                      return (
                        <span key={star} className="text-[#ff6b00]">
                          {isFull ? (
                            <MdStar className="text-xs" />
                          ) : isHalf ? (
                            <MdStarHalf className="text-xs" />
                          ) : (
                            <MdStar className="text-xs text-white/5" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Favoritos Destacados */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-red-500/10 rounded-2xl">
            <MdFavorite className="text-3xl text-red-500" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic">Favoritos del Búnker</h2>
        </div>

        {favoritos.length === 0 ? (
          <div className="p-20 bg-[#0a0a0a] border border-white/5 rounded-[3rem] text-center">
             <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">Tu bóveda de favoritos está vacía</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
            {favoritos.slice(0, 8).map((fav) => (
              <Link 
                key={fav.id}
                to={`/${fav.tipo === 'cancion' ? 'cancion' : fav.tipo}/${fav.itemId}`}
                className="group relative"
              >
                <div className="aspect-square rounded-2xl overflow-hidden border border-white/5 group-hover:border-red-500/50 transition-all duration-500 shadow-2xl">
                  <img src={fav.snapshot?.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Accesos Rápidos - Estilo Tech */}
      <div className="grid md:grid-cols-3 gap-8">
        <Link to="/boveda/canciones" className="group bg-[#0a0a0a] rounded-[2rem] p-10 border border-white/5 hover:border-[#ff6b00]/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
            <MdMusicNote className="text-8xl" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 uppercase italic">Tracks</h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Protocolo de Sencillos</p>
        </Link>

        <Link to="/boveda/albumes" className="group bg-[#0a0a0a] rounded-[2rem] p-10 border border-white/5 hover:border-[#ff6b00]/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
            <MdAlbum className="text-8xl" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 uppercase italic">Discos</h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Archivo de LPs/EPs</p>
        </Link>

        <Link to="/boveda/artistas" className="group bg-[#0a0a0a] rounded-[2rem] p-10 border border-white/5 hover:border-[#ff6b00]/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
            <MdPerson className="text-8xl" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 uppercase italic">Artistas</h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Perfiles de Artistas</p>
        </Link>
      </div>
    </>
  );

  const FilteredView = ({ type, title, icon: Icon }) => {
    const itemsMap = new Map();
    
    favoritos.filter(f => f.tipo === type).forEach(f => {
      itemsMap.set(f.itemId, { ...f, esFavorito: true });
    });

    valoraciones.filter(a => a.tipo === type).forEach(a => {
      const existing = itemsMap.get(a.itemId);
      itemsMap.set(a.itemId, { 
        ...(existing || a), 
        rating: a.rating,
        esValorado: true 
      });
    });

    const filtered = Array.from(itemsMap.values()).filter(item => item.itemId && item.tipo);

    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center gap-6 mb-12">
          <Link to="/boveda" className="p-4 bg-white/5 rounded-2xl hover:bg-[#ff6b00] hover:text-black transition-all shadow-xl">
            <MdArrowBack className="text-xl" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Icon className="text-2xl text-[#ff6b00]" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Archivo Filtrado</span>
            </div>
            <h2 className="text-5xl font-black uppercase italic leading-none">{title}</h2>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-24 bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] text-center">
            <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-xs">Sin registros para esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {filtered.map((item) => (
              <Link 
                key={item.itemId}
                to={`/${item.tipo}/${item.itemId}`}
                className="group bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[#ff6b00]/40 transition-all duration-500"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={item.snapshot?.imagen} 
                    className={`w-full h-full object-cover ${item.tipo !== 'artista' ? 'group-hover:scale-110' : ''} transition-transform duration-1000`} 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    {item.esFavorito && <MdFavorite className="text-3xl text-red-500" />}
                    {item.esValorado && (
                      <div className="flex items-center gap-2 bg-black/80 px-4 py-2 rounded-full border border-white/10 shadow-2xl">
                        <MdStar className="text-[#ff6b00] text-lg" />
                        <span className="text-sm font-black text-white">{item.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-white uppercase truncate text-sm mb-1 group-hover:text-[#ff6b00] transition-colors">{item.snapshot?.nombre}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase truncate mb-4">{item.snapshot?.artista}</p>
                  
                  {item.esValorado && (
                    <div className="flex gap-0.5 opacity-40 group-hover:opacity-100 transition-all duration-500">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const full = item.rating >= star;
                        const half = !full && item.rating >= star - 0.5;
                        return (
                          <span key={star} className="text-[#ff6b00]">
                            {full ? <MdStar className="text-[10px]" /> : half ? <MdStarHalf className="text-[10px]" /> : <MdStar className="text-[10px] text-white/5" />}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header Premium */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#1a1a2e] to-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff6b00]/5 blur-[180px] rounded-full" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-1px bg-[#ff6b00]/30" />
            <span className="text-[#ff6b00] font-black text-[10px] uppercase tracking-[0.5em]">Central Database</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-4 leading-none">
            <span className="text-white">BOVEDA</span>
            <span className="text-[#ff6b00]">.</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-lg font-mono uppercase tracking-[0.4em] max-w-2xl leading-relaxed">
            Tu biblioteca de música
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-32 -mt-10 relative z-20">
        <Routes>
          <Route index element={<MainView />} />
          <Route path="canciones" element={<FilteredView type="cancion" title="Tracks" icon={MdMusicNote} />} />
          <Route path="albumes" element={<FilteredView type="album" title="Discos" icon={MdAlbum} />} />
          <Route path="artistas" element={<FilteredView type="artista" title="Artistas" icon={MdPerson} />} />
        </Routes>
      </div>
    </div>
  );
}