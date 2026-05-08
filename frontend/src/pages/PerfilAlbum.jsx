import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  MdAlbum, MdFavorite, MdFavoriteBorder, MdPlayArrow, 
  MdPause, MdSchedule, MdOpenInNew, MdLibraryMusic,
  MdArrowBack, MdWarning, MdGraphicEq, MdInfoOutline,
  MdStar, MdPeople, MdRateReview
} from 'react-icons/md';
import OpinionesGlobales from '../components/OpinionesGlobales';
import api from '../services/api';
import { usePlayer } from '../context/MusicPlayerContext';
import { useAuthStore } from '../store/authStore';
import { useSpotifyEmbedStore } from '../store/spotifyEmbedStore';
import RatingSystem from '../components/RatingSystem';
import ReviewSection from '../components/ReviewSection';

const PerfilAlbum = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { isAuthenticated } = useAuthStore();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [esFavorito, setEsFavorito] = useState(false);
  const [error, setError] = useState('');
  const [rating, setLocalRating] = useState(0);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    const cargarAlbum = async () => {
      setCargando(true);
      try {
        const res = await api.get(`/album/${id}`);
        setDatos(res.data);

        if (isAuthenticated) {
          try {
            const [resFavs, resVault] = await Promise.all([
              api.get('/vault/favoritos'),
              api.get('/vault/valoraciones')
            ]);
            
            if (resFavs.data?.favoritos) {
              setEsFavorito(resFavs.data.favoritos.some(f => f.itemId === id && f.tipo === 'album'));
            }
            
            const miValoracion = resVault.data?.valoraciones?.find(v => v.itemId === id && v.tipo === 'album');
            if (miValoracion) {
              setLocalRating(miValoracion.rating);
              setComentario(miValoracion.comentario || '');
            }
          } catch (err) {
            if (err.response?.status !== 401 && err.response?.status !== 404) {
               console.warn('[Vault] Error al cargar datos sociales:', err.message);
            }
          }
        }
      } catch (err) {
        setError('Error en la conexión con el servidor de archivos.');
      } finally {
        setCargando(false);
      }
    };
    cargarAlbum();
  }, [id, isAuthenticated]);

  const toggleFavorito = async () => {
    if (!isAuthenticated) return;
    if (!datos?.album) return;
    const previousState = esFavorito;
    setEsFavorito(!esFavorito);
    try {
      const res = await api.post('/vault/favoritos/toggle', {
        itemId: id,
        tipo: 'album',
        snapshot: {
          nombre: datos.album.nombre,
          artista: datos.album.artista,
          imagen: datos.album.imagen
        }
      });
      if (res.data.totalPuntos !== undefined) {
        useAuthStore.getState().updatePoints(res.data.totalPuntos);
      }
    } catch (err) {
      setEsFavorito(previousState);
    }
  };

  const handleRate = async (value) => {
    if (!isAuthenticated) return;
    setLocalRating(value);
    try {
      const res = await api.post('/vault/valoraciones', {
        itemId: id,
        tipo: 'album',
        rating: value,
        comentario: comentario,
        snapshot: {
          nombre: datos.album.nombre,
          artista: datos.album.artista || 'Artista Desconocido',
          imagen: datos.album.imagen
        }
      });
      if (res.data.totalPuntos !== undefined) {
        useAuthStore.getState().updatePoints(res.data.totalPuntos);
      }
    } catch (err) {
      console.error('Error guardando valoración:', err);
    }
  };

  const handleSaveReview = async (nuevoComentario) => {
    if (!isAuthenticated) return;
    setComentario(nuevoComentario);
    try {
      await api.post('/vault/valoraciones', {
        itemId: id,
        tipo: 'album',
        rating: rating,
        comentario: nuevoComentario,
        snapshot: {
          nombre: datos.album.nombre,
          artista: datos.album.artista || 'Artista Desconocido',
          imagen: datos.album.imagen
        }
      });
    } catch (err) {
      console.error('Error guardando review:', err);
    }
  };

  const formatDuration = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = ((ms % 60000) / 1000).toFixed(0);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (cargando) return <LoadingState />;

  if (error || !datos) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6">
      <MdWarning className="text-6xl text-[#ff6b00] mb-4" />
      <p className="text-xl font-black mb-2 uppercase tracking-tighter">Proyecto no encontrado</p>
      <button onClick={() => navigate(-1)} className="mt-8 px-10 py-3 bg-[#ff6b00] text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] uppercase text-xs tracking-widest active:translate-y-1 active:shadow-none transition-all">Volver</button>
    </div>
  );

  const { album, tracks } = datos;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32 selection:bg-[#ff6b00] selection:text-black">
      
      {/* HEADER & HERO SECTION */}
      <section className="relative pt-12 pb-24 overflow-hidden border-b border-white/5 bg-[#050505]">
        <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <img 
            src={album.imagen || '/default.png'} 
            className="w-full h-full object-cover blur-[100px] scale-150 opacity-20 grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 text-white/50 hover:text-[#ff6b00] mb-16 transition-all"
          >
            <div className="p-2 bg-black border-2 border-white/10 rounded-xl group-hover:border-[#ff6b00] group-hover:shadow-[4px_4px_0px_0px_#ff6b00] transition-all group-active:translate-y-1 group-active:shadow-none">
              <MdArrowBack className="text-xl" />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.3em]">Regresar</span>
          </button>

          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-20">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#ff6b00] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 -z-10" />
              <div className="relative p-1 bg-gradient-to-br from-white/20 to-transparent rounded-[2.5rem]">
                <img 
                  src={album?.imagen || '/default-album.png'} 
                  alt={album?.nombre} 
                  className="w-72 h-72 md:w-96 md:h-96 rounded-[2.2rem] object-cover border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)] group-hover:shadow-[12px_12px_0px_0px_#ff6b00] transition-all duration-500" 
                />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col gap-2 mb-6">
                <span className="inline-block text-[#ff6b00] font-black text-sm uppercase tracking-[0.5em] animate-pulse">
                  {album.type || 'ÁLBUM'} • {album.fecha || 'VOL. 1'}
                </span>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase break-words">
                  {album.nombre}
                </h1>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 mb-12">
                <Link to={`/artista/${album.artistaId}`} className="text-2xl md:text-4xl font-black text-white hover:text-[#ff6b00] transition-colors uppercase flex items-center gap-3">
                  <span className="opacity-30 italic text-xl">by</span> {album.artista}
                </Link>
                <span className="text-gray-500 font-bold text-lg uppercase tracking-widest">{album.totalTracks} TRACKS DISPONIBLES</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-4">
                <button
                  onClick={toggleFavorito}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-4 px-10 py-5 font-black border-2 border-black rounded-2xl transition-all duration-200 active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                    esFavorito
                      ? 'bg-[#ff6b00] text-black'
                      : 'bg-white text-black hover:bg-[#ff6b00]'
                  }`}
                >
                  {esFavorito ? <MdFavorite size={24} /> : <MdFavoriteBorder size={24} />}
                  <span className="text-sm uppercase tracking-widest">
                    {esFavorito ? 'EN TU BÓVEDA' : 'GUARDAR ÁLBUM'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    useSpotifyEmbedStore.getState().loadUri(album.id, 'album', {
                      nombre: album.nombre,
                      artista: album.artista,
                      imagen: album.imagen
                    }, tracks);
                    if (tracks.length > 0) {
                      playTrack({ ...tracks[0], image: album.imagen }, tracks.map(t => ({ ...t, image: album.imagen })), 0);
                    }
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-white text-black font-black border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff6b00] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all group"
                >
                  <MdPlayArrow size={28} className="group-hover:scale-125 transition-transform" />
                  <span className="text-sm uppercase tracking-widest">REPRODUCIR ÁLBUM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKLIST & ASIDE */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <section className="lg:col-span-8">
          <div className="flex items-center gap-5 mb-12 border-b-4 border-[#ff6b00] pb-6">
            <MdGraphicEq className="text-5xl text-[#ff6b00]" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              LISTA DE <span className="text-[#ff6b00]">CANCIONES</span>
            </h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {tracks.map((track, index) => (
              <div 
                key={track.id}
                className="group flex items-center gap-6 bg-black p-5 rounded-2xl border-2 border-white/5 hover:border-[#ff6b00] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#ff6b00] transition-all duration-200 cursor-default active:translate-y-0 active:translate-x-0 active:shadow-none"
              >
                <div className="w-12 text-center">
                  <span className="text-2xl font-black text-white/10 group-hover:text-[#ff6b00] transition-colors italic">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="truncate font-black text-xl text-white group-hover:text-[#ff6b00] transition-colors uppercase tracking-tight leading-tight">
                    {track.nombre}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{track.artista}</p>
                    <div className="w-1 h-1 bg-gray-800 rounded-full" />
                    <div className="flex items-center gap-1 text-[10px] font-mono text-gray-600">
                      <MdSchedule size={12} className="text-[#ff6b00]" /> {formatDuration(track.duracion)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {track.preview && (
                    <button
                      onClick={() => playTrack({ ...track, image: album.imagen }, tracks.map(t => ({ ...t, image: album.imagen })), index)}
                      className="w-14 h-14 bg-[#ff6b00] text-black border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                    >
                      {currentTrack?.id === track.id && isPlaying ? <MdPause size={28} /> : <MdPlayArrow size={28} />}
                    </button>
                  )}
                  
                  <Link 
                    to={`/cancion/${track.id}`}
                    className="w-14 h-14 bg-white text-black border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                  >
                    <MdLibraryMusic size={24} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-10">
          <div className="relative bg-[#111] border-4 border-black p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#ff6b00]">
            <h3 className="text-2xl font-black mb-10 uppercase tracking-tighter italic flex items-center gap-4">
              <MdInfoOutline className="text-[#ff6b00] text-3xl" />
              DETALLES DEL ÁLBUM
            </h3>
            
            <div className="space-y-6">
              {album.label && (
                <div className="p-6 bg-black border-2 border-white/5 rounded-3xl flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Sello Discográfico</span>
                  <span className="text-xl font-black uppercase text-[#ff6b00] truncate">{album.label}</span>
                </div>
              )}
              <div className="p-6 bg-black border-2 border-white/5 rounded-3xl flex flex-col gap-2">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Fecha de Salida</span>
                <span className="text-xl font-black uppercase text-white tracking-widest">{album.fecha}</span>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t-2 border-white/5">
              <div className="bg-black/40 p-6 rounded-3xl border-2 border-dashed border-white/10">
                <RatingSystem 
                  initialRating={rating}
                  label="VALORACIÓN DEL ÁLBUM" 
                  onRate={handleRate} 
                />
                <div className="mt-6">
                  <ReviewSection 
                    initialComment={comentario} 
                    onSave={handleSaveReview} 
                    label="TU OPINIÓN"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 group">
            <div className="bg-[#0a0a0a] rounded-[2.5rem] p-4 border-2 border-white/5 group-hover:border-[#ff6b00]/30 transition-all shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4 text-center mt-2 font-mono">Spotify Link: Digital Interface</p>
              <div className="mb-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                <MdInfoOutline className="text-[#ff6b00] text-xs shrink-0" />
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-tight">
                  Inicia sesión en Spotify en este navegador para sincronizar el reproductor.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden border-2 border-black shadow-lg">
                <iframe
                  src={`https://open.spotify.com/embed/album/${album.id}?utm_source=generator&theme=0`}
                  width="100%"
                  height="380"
                  className="border-0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* SECCIÓN SOCIAL / AUDITORÍA */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-12">
            <div className="flex items-center gap-5 mb-10 border-l-8 border-[#ff6b00] pl-8">
               <div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">REPORTE DE <br/> <span className="text-[#ff6b00]">COMUNIDAD</span></h2>
                  <p className="text-gray-600 font-mono text-[9px] uppercase tracking-[0.4em] mt-3">Base de datos compartida: {datos.album.nombre}</p>
               </div>
            </div>
            <div className="bg-[#0a0a0a] p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
              <OpinionesGlobales tipo="album" itemId={id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}