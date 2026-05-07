import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  MdArrowBack, MdTrendingUp, MdAlbum, MdMusicNote,
  MdStar, MdPlayArrow, MdPeople, MdWhatshot,
  MdGraphicEq, MdHeadphones, MdRadio, MdQueueMusic,
  MdCalendarToday, MdAccessTime, MdSpeed
} from 'react-icons/md';
import { GENEROS_DATA } from '../data/generosData';
import AINeuralDiscovery from '../components/AINeuralDiscovery';
import api from '../services/api';

export default function Genero() {
  const { id } = useParams();
  const [artistas, setArtistas] = useState([]);
  const [canciones, setCanciones] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const info = GENEROS_DATA[id] || {
    nombre: id.toUpperCase().replace(/-/g, ' '),
    color: 'from-gray-600 to-gray-800',
    descripcion: 'Descubre este género musical',
    origen: 'Desconocido',
    bpm: 'Variable',
    instrumentos: [],
    subgeneros: [],
    artistas: { establecidos: [], emergentes: [] },
    playlistsSpotify: [],
    caracteristicas: []
  };

  useEffect(() => {
    fetchDatosGenero();
  }, [id]);

  const fetchDatosGenero = async () => {
    setLoading(true);
    try {
      // Usar los datos curados de GENEROS_DATA para garantizar precisión 100%
      const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
      const nombresArtistas = [
        ...shuffle(info.artistas?.establecidos || []).slice(0, 12),
        ...shuffle(info.artistas?.emergentes || []).slice(0, 8)
      ];

      // Búsqueda en BLOQUE con Axios y manejo de errores defensivo
      let artistasValidos = [];
      try {
        const resArtistas = await api.get(`/music/artistas/bulk?nombres=${encodeURIComponent(nombresArtistas.join(','))}`);
        const dataArtistas = resArtistas.data;
        
        // De-duplicar artistas para evitar errores de KEY en React
        const artistasMap = new Map();
        (dataArtistas.artistas || []).forEach(a => {
          if (a && a.id) artistasMap.set(a.id, a);
        });
        artistasValidos = Array.from(artistasMap.values());
        setArtistas(artistasValidos);
      } catch (err) {
        // Silenciar error - usar array vacío
        console.warn('[Genero] Error cargando artistas:', err.message);
        setArtistas([]);
      }

      // Hidratar artistas con oyentes reales en segundo plano (No bloqueante)
      if (artistasValidos.length > 0) {
        api.post('/music/artists-real-stats/bulk', {
          artistas: artistasValidos.map(a => ({ id: a.id, nombre: a.nombre }))
        }).then(statsRes => {
          if (statsRes.data?.status === 'ok') {
            const statsMap = new Map((statsRes.data.data || []).map(s => [s.id, s]));
            setArtistas(prev => prev.map(art => {
              const real = statsMap.get(art.id);
              return real ? { ...art, oyentesReales: real.oyentesMensuales, oyentesVerificados: real.verificado } : art;
            }));
          }
        }).catch(() => {});
      }

      // Buscar canciones de los artistas principales del género con Axios
      if (artistasValidos.length > 0) {
        // Reducimos las peticiones concurrentes para evitar colapsos
        const cancionesPromises = artistasValidos.slice(0, 3).map(async (artista) => {
          try {
            const res = await api.get(`/music/buscar?q=${encodeURIComponent(artista.nombre)}&tipo=track&limit=5`);
            return res.data?.resultados?.canciones || [];
          } catch {
            return [];
          }
        });
        
        try {
          const cancionesArrays = await Promise.all(cancionesPromises);
          const todasCancionesRaw = cancionesArrays.flat();
          
          const cancionesMap = new Map();
          todasCancionesRaw.forEach(c => cancionesMap.set(c.id, c));
          const todasCanciones = Array.from(cancionesMap.values()).slice(0, 12);
          setCanciones(todasCanciones);
        } catch (err) {
          console.warn('[Genero] Error cargando canciones:', err.message);
          setCanciones([]);
        }

        // Buscar álbumes de estos artistas
        const albumesPromises = artistasValidos.slice(0, 3).map(async (artista) => {
          try {
            const res = await api.get(`/music/buscar?q=${encodeURIComponent(artista.nombre)}&tipo=album&limit=4`);
            return res.data?.resultados?.albumes || [];
          } catch {
            return [];
          }
        });
        
        try {
          const albumesArrays = await Promise.all(albumesPromises);
          const todosAlbumesRaw = albumesArrays.flat();
          
          const albumesMap = new Map();
          todosAlbumesRaw.forEach(a => albumesMap.set(a.id, a));
          const todosAlbumes = Array.from(albumesMap.values()).slice(0, 10);
          setAlbumes(todosAlbumes);
        } catch (err) {
          console.warn('[Genero] Error cargando álbumes:', err.message);
          setAlbumes([]);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const artistasEstablecidos = artistas.filter(a => a.popularidad >= 65).slice(0, 16);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className={`relative py-16 px-4 bg-gradient-to-br ${info.color}`}>
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6">
            <MdArrowBack className="text-2xl" />
            <span className="font-bold uppercase tracking-wider">Volver</span>
          </Link>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                {info.nombre}
              </h1>
              <p className="text-xl text-white/90 mb-6">{info.descripcion}</p>
              
              {/* Info rápida */}
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm">
                  <MdAccessTime className="inline mr-2" />
                  {info.origen}
                </span>
                <span className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm">
                  <MdSpeed className="inline mr-2" />
                  {info.bpm} BPM
                </span>
              </div>
            </div>

            {/* Características */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sonido característico</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {info.instrumentos?.map((inst, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                    {inst}
                  </span>
                ))}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">Subgéneros</h3>
              <div className="flex flex-wrap gap-2">
                {info.subgeneros?.map((sub, i) => (
                  <span key={i} className="px-3 py-1 bg-[#ff6b00] text-black rounded-full text-sm font-bold">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
            </div>
          ) : (
            <>
              {/* CANCIONES DEL GÉNERO */}
              {canciones.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                    <MdTrendingUp className="text-[#ff6b00]" />
                    Canciones Esenciales de {info.nombre}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {canciones.map((cancion, index) => (
                      <Link key={cancion.id} to={`/cancion/${cancion.id}`} className="group">
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                          <img 
                            src={cancion.imagen} 
                            alt={cancion.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-2 left-2 w-8 h-8 bg-[#ff6b00] rounded-full flex items-center justify-center">
                            <span className="text-black font-black text-sm">{index + 1}</span>
                          </div>
                        </div>
                        <h3 className="font-bold truncate group-hover:text-[#ff6b00] transition-colors text-sm">{cancion.nombre}</h3>
                        <p className="text-xs text-gray-500 truncate">{cancion.artista}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ARTISTAS ESTABLECIDOS */}
              {artistasEstablecidos.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                    <MdStar className="text-[#ff6b00]" />
                    Artistas Establecidos
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {artistasEstablecidos.map((artista, index) => (
                      <Link key={artista.id} to={`/artista/${artista.id}`} className="group">
                        <div className="relative aspect-square rounded-full overflow-hidden mb-3 border-2 border-[#333] group-hover:border-[#ff6b00] transition-colors">
                          <img src={artista.imagen} alt={artista.nombre} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-center text-sm truncate group-hover:text-[#ff6b00] transition-colors">{artista.nombre}</h3>
                        <div className="flex flex-col items-center gap-1 mt-1">
                           {artista.oyentesVerificados ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#ff6b00]/10 rounded border border-[#ff6b00]/20">
                                 <MdGraphicEq className="text-[10px] text-[#ff6b00]" />
                                 <span className="text-[9px] font-black text-[#ff6b00] uppercase">
                                    {(artista.oyentesReales / 1000000).toFixed(1)}M REALES
                                 </span>
                              </div>
                           ) : (
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">
                                 {(artista.seguidores / 1000000).toFixed(1)}M SEGUIDORES
                              </p>
                           )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ARTISTAS EMERGENTES / GENRE DNA MAP */}
              <div className="mb-20">
                <AINeuralDiscovery 
                  title={`Escena ${info.nombre}`}
                  type="emerging"
                  data={artistas}
                  description={`Mapa Genético de ${info.nombre} por Quave AI`}
                />
              </div>

              {/* ÁLBUMES INFLUYENTES */}
              {albumes.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                    <MdAlbum className="text-[#ff6b00]" />
                    Álbumes que Definen el Género
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {albumes.map((album) => (
                      <Link key={album.id} to={`/album/${album.id}`} className="group bg-[#111] p-3 rounded-xl border border-white/5 hover:border-[#ff6b00] transition-all">
                        <div className="aspect-square rounded-lg overflow-hidden mb-3">
                          <img src={album.imagen} alt={album.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <h3 className="font-bold text-sm truncate group-hover:text-[#ff6b00] transition-colors">{album.nombre}</h3>
                        <p className="text-xs text-gray-500 truncate">{album.artista}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* HISTORIA Y CARACTERÍSTICAS */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                 <div className="bg-[#111] p-8 rounded-[3rem] border border-white/5">
                    <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                       <MdGraphicEq className="text-[#ff6b00]" />
                       Esencia Musical
                    </h3>
                    <ul className="space-y-4">
                       {info.caracteristicas?.map((car, i) => (
                         <li key={i} className="flex items-start gap-3 text-gray-400">
                            <span className="w-2 h-2 bg-[#ff6b00] rounded-full mt-2 shrink-0" />
                            <span>{car}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="bg-[#111] p-8 rounded-[3rem] border border-white/5 flex flex-col justify-center">
                    <h3 className="text-2xl font-black uppercase mb-4 text-[#ff6b00]">Status de la Escena</h3>
                    <p className="text-gray-400 leading-relaxed mb-6 italic">
                       "El {info.nombre} está experimentando una mutación sonora sin precedentes, fusionando ritmos de {info.origen} con tecnología de producción avanzada."
                    </p>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                          <MdTrendingUp className="text-[#ff6b00] text-xl" />
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-white">Tendencia Alcista</p>
                          <p className="text-[10px] text-gray-500 uppercase">Detectada por Quave Radar</p>
                       </div>
                    </div>
                 </div>
              </div>
            </>
          )}

          {/* OTROS GÉNEROS */}
          <div className="border-t border-white/5 pt-12">
            <h2 className="text-2xl font-black uppercase mb-8">Explorar otras atmósferas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(GENEROS_DATA)
                .filter(([key]) => key !== id)
                .slice(0, 6)
                .map(([key, genero]) => (
                  <Link key={key} to={`/genero/${key}`} className="group relative overflow-hidden aspect-[4/3] rounded-2xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${genero.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <MdMusicNote className="text-3xl text-white mb-2" />
                      <span className="font-black text-white text-[10px] uppercase text-center tracking-widest">{genero.nombre}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
