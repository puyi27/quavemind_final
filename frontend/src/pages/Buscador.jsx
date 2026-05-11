import { useState, useEffect, useTransition } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MdSearch, MdFilterList, MdPerson, MdAlbum, MdMusicNote,
  MdArrowForward, MdPeople, MdWhatshot, MdGraphicEq, MdClose,
  MdPlayArrow
} from 'react-icons/md';
import { useSearch } from '../hooks/useSearch';
import { useDebounce } from '../hooks/useDebounce';

export default function Buscador() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [isPending, startTransition] = useTransition();

  // Debounce de 500ms para no saturar la API mientras se escribe
  const debouncedQuery = useDebounce(query, 500);

  const {
    artistas,
    canciones,
    albumes,
    artistaDestacado,
    cancionDestacada,
    albumDestacado,
    loading,
    error,
    hasSearched,
    clearSearch
  } = useSearch(debouncedQuery, tipo);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // Envolvemos la actualización de la URL en una transición para mantener la fluidez
    startTransition(() => {
      if (newValue.length >= 2) {
        setSearchParams({ q: newValue }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    });
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({}, { replace: true });
    clearSearch();
  };

  const tipos = [
    { id: 'todos', label: 'TODO', icon: MdFilterList },
    { id: 'artistas', label: 'ARTISTAS', icon: MdPerson },
    { id: 'canciones', label: 'CANCIONES', icon: MdMusicNote },
    { id: 'albumes', label: 'ÁLBUMES', icon: MdAlbum },
  ];

  return (
    <div className="min-h-screen bg-black pb-24">
      <section className="relative pt-12 md:pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#ff6b00]/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
              <span className="text-white">MOTOR DE</span>
              <span className="text-[#ff6b00]"> BÚSQUEDA</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm">Encuentra la próxima joya de la escena</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b00] to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-[1.8rem] px-6 py-4 md:py-6 shadow-2xl">
              <MdSearch className="text-3xl text-[#ff6b00] mr-4" />
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="¿Qué quieres escuchar hoy?"
                className="w-full bg-transparent border-none text-white text-lg md:text-2xl font-bold focus:ring-0 focus:outline-none outline-none placeholder:text-gray-600"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                >
                  <MdClose className="text-xl" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {tipos.map((t) => (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${tipo === t.id
                    ? 'bg-[#ff6b00] border-[#ff6b00] text-black shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <t.icon className="text-sm" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">Escaneando base de datos...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* ── ARTISTA DESTACADO ── */}
            {artistaDestacado && tipo === 'todos' && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b00] to-transparent rounded-[3rem] blur opacity-20 transition duration-1000"></div>
                <div className="relative bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-[2.5rem] p-6 md:p-10 border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b00]/5 blur-[80px] rounded-full -mr-20 -mt-20" />
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                    <img src={artistaDestacado.imagen} alt={artistaDestacado.nombre} className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] object-cover shadow-2xl border-2 border-white/10" />
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#ff6b00] text-black text-[10px] font-black rounded-full uppercase tracking-widest">RESULTADO ALPHA</span>
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-tighter">{artistaDestacado.nombre}</h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#ff6b00]/20 rounded-xl"><MdGraphicEq className="text-2xl text-[#ff6b00]" /></div>
                          <div>
                            <p className="text-2xl font-black text-white leading-none">
                              {artistaDestacado.oyentesVerificados ? artistaDestacado.oyentesReales?.toLocaleString() : artistaDestacado.seguidores?.toLocaleString()}
                            </p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#ff6b00] mt-1">
                              {artistaDestacado.oyentesVerificados ? 'Radar Verificado' : 'Seguidores'}
                            </p>
                          </div>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden md:block" />
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-xl"><MdWhatshot className="text-2xl text-[#ff6b00]" /></div>
                          <div>
                            <p className="text-2xl font-black text-white leading-none">{artistaDestacado.popularidad}%</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Pop. Global</p>
                          </div>
                        </div>
                      </div>
                      <Link to={`/artista/${artistaDestacado.id}`} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform uppercase text-xs tracking-widest">
                        VER PERFIL COMPLETO <MdArrowForward className="text-xl" />
                      </Link>
                    </div>
                    <div className="w-full md:w-80 space-y-3">
                      <span className="text-[10px] font-black text-[#ff6b00] uppercase tracking-[0.2em] mb-1">Resultado de búsqueda</span>
                      {canciones.slice(0, 4).map((c) => (
                        <Link key={c.id} to={`/cancion/${c.id}`} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-[#ff6b00]/10 hover:border-[#ff6b00]/30 transition-all group">
                          <img src={c.imagen} className="w-10 h-10 rounded-xl" alt={c.nombre} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate group-hover:text-white uppercase tracking-tight">{c.nombre}</p>
                          </div>
                          <MdPlayArrow className="text-[#ff6b00] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CANCIÓN DESTACADA ── */}
            {cancionDestacada && tipo === 'todos' && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/50 to-transparent rounded-[3rem] blur opacity-20 transition duration-1000"></div>
                <div className="relative bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-[2.5rem] p-6 md:p-10 border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full -mr-20 -mt-20" />
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-4 bg-purple-600/20 rounded-[2.5rem] blur opacity-50" />
                      <img src={cancionDestacada.imagen} alt={cancionDestacada.nombre} className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2rem] object-cover shadow-2xl border-2 border-white/10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                          <MdMusicNote className="text-sm" /> TRACK DESTACADO
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-3 uppercase tracking-tighter leading-none">{cancionDestacada.nombre}</h2>
                      <p className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-8">{cancionDestacada.artista}</p>
                      <Link to={`/cancion/${cancionDestacada.id}`} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform uppercase text-xs tracking-widest">
                        VER ANÁLISIS <MdArrowForward className="text-xl" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ÁLBUM DESTACADO ── */}
            {albumDestacado && tipo === 'todos' && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1DB954]/40 to-transparent rounded-[3rem] blur opacity-20 transition duration-1000"></div>
                <div className="relative bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-[2.5rem] p-6 md:p-10 border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#1DB954]/5 blur-[80px] rounded-full -mr-20 -mt-20" />
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-4 bg-[#1DB954]/20 rounded-[2.5rem] blur opacity-50" />
                      <img src={albumDestacado.imagen} alt={albumDestacado.nombre} className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2rem] object-cover shadow-2xl border-2 border-white/10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#1DB954] text-black text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                          <MdAlbum className="text-sm" /> PROYECTO DESTACADO
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-3 uppercase tracking-tighter leading-none">{albumDestacado.nombre}</h2>
                      <p className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-2">{albumDestacado.artista}</p>
                      {albumDestacado.ano && <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8">{albumDestacado.ano}</p>}
                      <Link to={`/album/${albumDestacado.id}`} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform uppercase text-xs tracking-widest">
                        VER PROYECTO <MdArrowForward className="text-xl" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(tipo === 'todos' || tipo === 'artistas') && artistas.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl">
                      <MdPerson className="text-[#ff6b00]" />
                    </div>
                    {hasSearched ? 'Artistas' : 'Tendencias Alpha'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {artistas.map((art) => (
                    <Link
                      key={art.id}
                      to={`/artista/${art.id}`}
                      className="group flex flex-col items-center text-center space-y-4"
                    >
                      <div className="relative w-full aspect-square">
                        <div className="absolute -inset-2 bg-[#ff6b00] rounded-full blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                        <img
                          src={art.imagen}
                          alt={art.nombre}
                          className="relative w-full h-full object-cover rounded-full border border-white/10 transition-transform duration-500 shadow-2xl"
                        />
                        {art.oyentesVerificados && (
                          <div className="absolute -bottom-1 -right-1 bg-black p-1.5 rounded-full border border-white/10 shadow-xl">
                             <MdGraphicEq className="text-xs text-[#ff6b00]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 w-full px-2">
                        <h4 className="font-black text-sm md:text-base text-white truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition-colors">{art.nombre}</h4>
                        <div className="flex flex-col items-center gap-1 mt-1">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Artista</span>
                           {art.oyentesVerificados && (
                              <span className="text-[9px] font-black text-[#ff6b00] uppercase tracking-tighter bg-[#ff6b00]/10 px-2 py-0.5 rounded">
                                 {art.oyentesReales?.toLocaleString()} OYENTES
                              </span>
                           )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(tipo === 'todos' || tipo === 'canciones') && canciones.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl">
                      <MdMusicNote className="text-[#ff6b00]" />
                    </div>
                    Canciones
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {canciones.map((can) => (
                    <Link
                      key={can.id}
                      to={`/cancion/${can.id}`}
                      className="group flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-3xl border border-white/5 hover:bg-[#111] hover:border-[#ff6b00]/30 transition-all duration-300"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={can.imagen}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover shadow-lg"
                          alt={can.nombre}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                          <MdPlayArrow className="text-2xl text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-base md:text-lg text-white truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition-colors">{can.nombre}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{can.artista}</p>
                      </div>
                      <MdGraphicEq className="text-gray-700 group-hover:text-[#ff6b00] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(tipo === 'todos' || tipo === 'albumes') && albumes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl">
                      <MdAlbum className="text-[#ff6b00]" />
                    </div>
                    Álbumes
                  </h3>
                </div>
                <div className="media-grid">
                  {albumes.map((alb) => (
                    <Link
                      key={alb.id}
                      to={`/album/${alb.id}`}
                      className="media-card group shadow-xl"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={alb.imagen}
                          alt={alb.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <h4 className="font-black text-sm text-white truncate group-hover:text-[#ff6b00] transition-colors uppercase tracking-tight">{alb.nombre}</h4>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">{alb.artista}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {hasSearched && !loading && artistas.length === 0 && canciones.length === 0 && albumes.length === 0 && (
              <div className="text-center py-20 bg-[#111] rounded-[3rem] border-2 border-dashed border-white/5">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <MdSearch className="text-4xl text-gray-600" />
                </div>
                <h3 className="text-2xl font-black uppercase text-white mb-2">SIN RESULTADOS PARA "{query}"</h3>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto">Nuestro satélite no ha detectado transmisiones bajo este nombre en el sector urbano.</p>
              </div>
            )}

            {error && (
              <div className="p-10 bg-red-950/20 border-2 border-red-900/50 rounded-[3rem] text-center">
                 <h3 className="text-xl font-black text-red-500 uppercase mb-2">Fallo en la conexión táctica</h3>
                 <p className="text-red-900/70 text-xs font-bold uppercase">El servidor de Spotify está devolviendo interferencias. Reintenta en unos segundos.</p>
              </div>
            )}


          </div>
        )}
      </section>
    </div>
  );
}