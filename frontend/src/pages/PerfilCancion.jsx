import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  MdAlbum, MdFavorite, MdFavoriteBorder, MdPause, MdPlayArrow, 
  MdScience, MdWarning, MdArrowBack, MdOpenInNew, MdMusicNote,
  MdTimer, MdSpeed, MdGraphicEq, MdStar, MdLock, MdPeople, MdRateReview,
  MdInfoOutline, MdSkipPrevious, MdSkipNext
} from 'react-icons/md';
import RatingSystem from '../components/RatingSystem';
import ReviewSection from '../components/ReviewSection';
import OpinionesGlobales from '../components/OpinionesGlobales';
import SpotifyEmbedPlayer from '../components/SpotifyEmbedPlayer';
import api from '../services/api';
import { usePlayer } from '../context/usePlayer';
import { useAuthStore } from '../store/authStore';
import { useSpotifyEmbedStore } from '../store/spotifyEmbedStore';

// Componente de carga neobrutalista
const LoadingState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="border-4 border-[#ff6b00] bg-[#111] p-8 shadow-[8px_8px_0px_0px_#ff6b00] animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
        <span className="font-black uppercase text-[#ff6b00] tracking-widest">
          Analizando Track...
        </span>
      </div>
    </div>
  </div>
);

// Componente de error de autenticación
const AuthErrorState = ({ onBack }) => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6">
    <div className="border-4 border-black bg-[#ff6b00] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md text-center">
      <MdLock className="text-6xl text-black mx-auto mb-4" />
      <h2 className="font-black uppercase text-black text-2xl mb-2 tracking-tighter">
        Acceso Restringido
      </h2>
      <p className="font-mono text-xs uppercase text-black/80 mb-6 tracking-widest">
        Debes iniciar sesión para guardar favoritos o valorar
      </p>
      <div className="flex gap-4 justify-center">
        <button 
          onClick={onBack}
          className="border-4 border-black bg-transparent text-black px-6 py-3 font-black uppercase text-sm tracking-widest hover:bg-black hover:text-[#ff6b00] transition-colors"
        >
          Volver
        </button>
        <Link 
          to="/login"
          className="border-4 border-black bg-black text-[#ff6b00] px-6 py-3 font-black uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  </div>
);

const PerfilCancion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { currentTrack, isPlaying, playTrack, togglePlayback } = usePlayer();
  const [datosCancion, setDatosCancion] = useState(null);
  const [letra, setLetra] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [cargandoPrincipal, setCargandoPrincipal] = useState(true);
  const [cargandoLetra, setCargandoLetra] = useState(true);
  const [cargandoRecomendaciones, setCargandoRecomendaciones] = useState(true);
  const [esFavorito, setEsFavorito] = useState(false);
  const [error, setError] = useState(null);
  const [rating, setLocalRating] = useState(0);
  const [comentario, setComentario] = useState('');
  
  // Ref para evitar memory leaks
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setCargandoPrincipal(true);
    setCargandoLetra(true);
    setCargandoRecomendaciones(true);
    setAlbumTracks([]);
    setError(null);

    const cargarDatos = async () => {
      try {
        // 1. CARGA PRIORITARIA: Spotify Data
        const resSpotify = await api.get(`/cancion/${id}`);
        if (!isMounted.current) return;
        
        const cancion = resSpotify.data.cancion;
        setDatosCancion(cancion);
        setCargandoPrincipal(false); 

        // 2. CARGA SECUNDARIA: Contexto de Álbum (para navegación)
        if (cancion.albumId) {
          api.get(`/album/${cancion.albumId}`).then(res => {
            if (isMounted.current) setAlbumTracks(res.data.tracks || []);
          }).catch(() => {});
        }

        // 3. CARGA SECUNDARIA: Vault (Favoritos/Rating)
        if (isAuthenticated) {
          api.get('/vault/favoritos').then(res => {
            if (isMounted.current) setEsFavorito(res.data.favoritos?.some(f => f.itemId === id && f.tipo === 'cancion'));
          }).catch(() => {});
          
          api.get('/vault/valoraciones').then(res => {
            if (isMounted.current) {
              const miVal = res.data.valoraciones?.find(v => v.itemId === id && v.tipo === 'cancion');
              if (miVal) {
                setLocalRating(miVal.rating);
                setComentario(miVal.comentario || '');
              }
            }
          }).catch(() => {});
        }

        // 4. CARGA PESADA: Letras y Recomendaciones
        const queryGenius = `${cancion.nombre} ${cancion.artistaPrincipal}`;
        api.get('/music/lyrics', { params: { q: queryGenius, title: cancion.nombre, artist: cancion.artistaPrincipal } })
          .then(res => { if (isMounted.current) { setLetra(res.data.letra); setCargandoLetra(false); } })
          .catch(() => { if (isMounted.current) { setLetra('Letra no disponible.'); setCargandoLetra(false); } });

        api.get(`/recomendaciones/cancion/${id}`)
          .then(res => { if (isMounted.current) { setRecomendaciones(res.data.recomendaciones || []); setCargandoRecomendaciones(false); } })
          .catch(() => { if (isMounted.current) { setRecomendaciones([]); setCargandoRecomendaciones(false); } });

      } catch (cargaError) {
        if (isMounted.current) {
          setError({ type: 'LOAD_ERROR', message: 'Error en el nodo de datos.' });
          setCargandoPrincipal(false);
        }
      }
    };

    cargarDatos();
    return () => { isMounted.current = false; };
  }, [id, isAuthenticated]);

  // Lógica de navegación entre temas del álbum
  const currentIndex = albumTracks.findIndex(t => t.id === id);
  const prevTrack = currentIndex > 0 ? albumTracks[currentIndex - 1] : null;
  const nextTrack = currentIndex < albumTracks.length - 1 ? albumTracks[currentIndex + 1] : null;

  const handlePlayWithQueue = async () => {
    if (!datosCancion?.preview) return;

    // 1. Reproducción inmediata del tema actual para evitar bloqueos del navegador
    const currentTrackData = {
      id: datosCancion.id,
      name: datosCancion.nombre,
      artist: datosCancion.artista,
      image: datosCancion.imagen,
      preview: datosCancion.preview,
      durationMs: datosCancion.duracion,
    };

    // 2. Si hay álbum, inyectamos la cola, si no, solo el tema
    if (albumTracks.length > 0) {
      const queue = albumTracks.map(t => ({
        id: t.id,
        name: t.nombre,
        artist: t.artista,
        image: t.imagen || datosCancion.imagen,
        preview: t.preview,
        durationMs: t.duracion
      }));
      
      await playTrack(currentTrackData, queue, currentIndex >= 0 ? currentIndex : 0);
    } else {
      await playTrack(currentTrackData, [currentTrackData], 0);
    }
  };

  const toggleFavorito = async () => {
    if (!isAuthenticated) {
      setError({ type: 'AUTH_REQUIRED', message: 'Debes iniciar sesión para guardar favoritos' });
      return;
    }
    if (!datosCancion) return;

    const previousState = esFavorito;
    setEsFavorito(!esFavorito);

    try {
      const res = await api.post('/vault/favoritos/toggle', {
        itemId: id,
        tipo: 'cancion',
        snapshot: {
          nombre: datosCancion.nombre,
          artista: datosCancion.artista,
          imagen: datosCancion.imagen,
        }
      });
      if (res.data.totalPuntos !== undefined) {
        useAuthStore.getState().updatePoints(res.data.totalPuntos);
      }
    } catch (err) {
      // REVERTIR OPTIMISTIC UI SIEMPRE
      setEsFavorito(previousState);
      
      // SILENCIAR 401 - Solo mostrar mensaje, no crashear
      if (err.isAuthError || err.response?.status === 401) {
        useAuthStore.setState({ isAuthenticated: false, user: null });
        setError({ type: 'AUTH_REQUIRED', message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' });
      }
      // Otros errores también silenciados
    }
  };

  const handleRate = async (value) => {
    if (!isAuthenticated) {
      setError({ type: 'AUTH_REQUIRED', message: 'Debes iniciar sesión para valorar' });
      return;
    }
    
    const previousRating = rating;
    setLocalRating(value);
    
    try {
      const res = await api.post('/vault/valoraciones', {
        itemId: id,
        tipo: 'cancion',
        rating: value,
        comentario: comentario,
        snapshot: {
          nombre: datosCancion.nombre,
          artista: datosCancion.artistaPrincipal || datosCancion.artistas?.[0]?.nombre || datosCancion.artista || 'Artista Desconocido',
          imagen: datosCancion.imagen
        }
      });
      if (res.data.totalPuntos !== undefined) {
        useAuthStore.getState().updatePoints(res.data.totalPuntos);
      }
    } catch (err) {
      // REVERTIR OPTIMISTIC UI
      setLocalRating(previousRating);
      
      // SILENCIAR 401
      if (err.isAuthError || err.response?.status === 401) {
        useAuthStore.setState({ isAuthenticated: false, user: null });
        setError({ type: 'AUTH_REQUIRED', message: 'Sesión expirada' });
      }
      // Otros errores silenciados
    }
  };

  const handleSaveReview = async (nuevoComentario) => {
    if (!isAuthenticated) {
      setError({ type: 'AUTH_REQUIRED', message: 'Debes iniciar sesión para comentar' });
      return;
    }
    
    const previousComment = comentario;
    setComentario(nuevoComentario);
    
    try {
      await api.post('/vault/valoraciones', {
        itemId: id,
        tipo: 'cancion',
        rating: rating,
        comentario: nuevoComentario,
        snapshot: {
          nombre: datosCancion.nombre,
          artista: datosCancion.artistaPrincipal || datosCancion.artistas?.[0]?.nombre || datosCancion.artista || 'Artista Desconocido',
          imagen: datosCancion.imagen
        }
      });
    } catch (err) {
      // REVERTIR OPTIMISTIC UI
      setComentario(previousComment);
      
      // SILENCIAR 401
      if (err.isAuthError || err.response?.status === 401) {
        useAuthStore.setState({ isAuthenticated: false, user: null });
        setError({ type: 'AUTH_REQUIRED', message: 'Sesión expirada' });
      }
      // Otros errores silenciados
    }
  };

  const formatearDuracion = (milisegundos) => {
    if (!milisegundos) return '0:00';
    const minutos = Math.floor(milisegundos / 60000);
    const segundos = ((milisegundos % 60000) / 1000).toFixed(0);
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  };

  const handlePreview = async () => {
    if (!datosCancion?.preview) return;
    if (currentTrack?.id === datosCancion.id && isPlaying) {
      await togglePlayback();
      return;
    }
    await playTrack({
      id: datosCancion.id,
      name: datosCancion.nombre,
      artist: datosCancion.artista,
      image: datosCancion.imagen,
      preview: datosCancion.preview,
      durationMs: datosCancion.duracion,
    });
  };

  // Early return: Carga
  if (cargandoPrincipal) {
    return <LoadingState />;
  }

  // Early return: Error de autenticación (opcional, puede mostrarse como banner)
  if (error?.type === 'AUTH_REQUIRED') {
    // Mostrar banner en lugar de pantalla completa para no bloquear la canción
    // La canción sigue visible, solo se bloquean las funciones de vault
  }

  // Early return: Error de carga
  if (!datosCancion || error?.type === 'LOAD_ERROR') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <MdWarning className="text-6xl text-[#ff6b00] mb-4" />
        <p className="text-xl font-black mb-2 uppercase">Lectura incompleta</p>
        <p className="text-gray-400 text-center mb-6">{error?.message || 'No se pudo cargar la canción'}</p>
        <button onClick={() => navigate(-1)} className="mt-8 px-10 py-3 bg-white text-black font-black rounded-full uppercase text-xs tracking-widest hover:bg-[#ff6b00] transition-colors">VOLVER</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Banner de error de autenticación (no bloqueante) */}
      {error?.type === 'AUTH_REQUIRED' && (
        <div className="fixed top-20 left-0 right-0 z-50 mx-auto max-w-lg">
          <div className="border-4 border-black bg-[#ff6b00] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between animate-in slide-in-from-top">
            <span className="font-black uppercase text-black text-sm">{error.message}</span>
            <Link to="/login" className="bg-black text-[#ff6b00] px-4 py-2 font-black uppercase text-xs tracking-widest">
              Login
            </Link>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden bg-[#050505] border-b border-white/5">
        <div className="absolute inset-0 h-[600px]">
          <img 
            src={datosCancion.imagen || '/default.png'} 
            alt="Cover background"
            className="w-full h-full object-cover blur-[120px] scale-150 opacity-20 grayscale"
            onError={(e) => { e.target.src = '/default.png'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-16">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-white/60 hover:text-white mb-12 transition-colors">
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-[#ff6b00] group-hover:text-black transition-all">
              <MdArrowBack className="text-xl" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">Atrás</span>
          </button>

          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 mt-8 lg:mt-20">
            <div className="relative group shrink-0">
              <div className="absolute -inset-4 bg-[#ff6b00] rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
              <img 
                src={datosCancion.imagen || '/default.png'} 
                alt={datosCancion.nombre}
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2rem] shadow-2xl object-cover border border-white/10 group-hover:scale-[1.02] transition-transform duration-500"
                onError={(e) => { e.target.src = '/default.png'; }}
              />
              {datosCancion.preview && (
                <button
                  onClick={handlePreview}
                  className="absolute bottom-6 right-6 w-20 h-20 bg-[#ff6b00] rounded-[1.5rem] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-20"
                >
                  {currentTrack?.id === datosCancion.id && isPlaying ? <MdPause className="text-4xl text-black" /> : <MdPlayArrow className="text-4xl text-black" />}
                </button>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block text-[#ff6b00] font-black text-xs uppercase tracking-[0.4em] mb-4">
                TRACK QUAVE • {datosCancion.fecha?.substring(0, 4) || 'N/A'}
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-none uppercase">
                {datosCancion.nombre}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 text-xl md:text-2xl mb-10">
                <div className="flex items-center">
                  {datosCancion.artistas?.map((art, i) => (
                    <span key={art.id}>
                      <Link to={`/artista/${art.id}`} className="font-black text-[#ff6b00] hover:text-white uppercase">
                        {art.nombre}
                      </Link>
                      {i < datosCancion.artistas.length - 1 && <span className="text-gray-600 mr-2">,</span>}
                    </span>
                  ))}
                </div>
                {datosCancion.albumId && (
                  <>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                    <Link to={`/album/${datosCancion.albumId}`} className="flex items-center gap-2 text-gray-400 hover:text-[#ff6b00] transition-colors group/album">
                      <MdAlbum className="text-xl group-hover/album:rotate-180 transition-transform duration-700" />
                      <span className="font-bold uppercase text-sm tracking-widest">{datosCancion.album}</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                {/* FAVORITOS */}
                <button
                  onClick={toggleFavorito}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 font-black rounded-2xl transition-all duration-300 ${
                    esFavorito ? 'bg-[#ff6b00] text-black shadow-lg shadow-[#ff6b00]/20' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {esFavorito ? <MdFavorite className="text-xl" /> : <MdFavoriteBorder className="text-xl" />}
                  <span className="text-xs uppercase tracking-widest">{esFavorito ? 'EN TUS FAVORITOS' : 'AÑADIR A FAVORITOS'}</span>
                </button>

                {/* NAVEGACIÓN Y PLAY */}
                {datosCancion.albumId && (
                  <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                    {/* ANTERIOR */}
                    <button
                      onClick={() => prevTrack && navigate(`/cancion/${prevTrack.id}`)}
                      disabled={!prevTrack || albumTracks.length === 0}
                      className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group ${
                        prevTrack 
                          ? 'bg-[#ff6b00]/20 text-[#ff6b00] hover:bg-[#ff6b00] hover:text-black cursor-pointer' 
                          : 'opacity-20 cursor-not-allowed'
                      }`}
                      title={prevTrack ? `Anterior: ${prevTrack.nombre}` : 'No hay tema anterior'}
                    >
                      {albumTracks.length === 0 ? <div className="w-5 h-5 border-2 border-[#ff6b00]/30 border-t-[#ff6b00] animate-spin rounded-full" /> : <MdSkipPrevious size={28} />}
                    </button>

                    {/* BOTÓN PLAY PRINCIPAL */}
                    <button
                      onClick={() => {
                        if (datosCancion.preview) {
                          handlePlayWithQueue();
                        } else {
                          document.getElementById('spotify-bridge')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center justify-center gap-4 px-8 py-4 font-black border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all group bg-white text-black hover:bg-[#ff6b00]"
                    >
                      {currentTrack?.id === id && isPlaying ? (
                        <MdPause size={24} className="animate-pulse" />
                      ) : (
                        <MdPlayArrow size={24} className="group-hover:scale-125 transition-transform" />
                      )}
                      <span className="text-xs uppercase tracking-widest font-black">
                        REPRODUCIR
                      </span>
                    </button>

                    {/* SIGUIENTE */}
                    <button
                      onClick={() => nextTrack && navigate(`/cancion/${nextTrack.id}`)}
                      disabled={!nextTrack || albumTracks.length === 0}
                      className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group ${
                        nextTrack 
                          ? 'bg-[#ff6b00]/20 text-[#ff6b00] hover:bg-[#ff6b00] hover:text-black cursor-pointer' 
                          : 'opacity-20 cursor-not-allowed'
                      }`}
                      title={nextTrack ? `Siguiente: ${nextTrack.nombre}` : 'No hay más temas'}
                    >
                      {albumTracks.length === 0 ? <div className="w-5 h-5 border-2 border-[#ff6b00]/30 border-t-[#ff6b00] animate-spin rounded-full" /> : <MdSkipNext size={28} />}
                    </button>
                  </div>
                )}

                <a
                  href={datosCancion.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-8 py-4 bg-[#1DB954] text-white font-black border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all group"
                >
                  <MdOpenInNew size={20} className="group-hover:scale-125 transition-transform" />
                  <span className="text-xs uppercase tracking-widest font-black">SPOTIFY</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <MdRateReview size={200} />
              </div>
              <div className="relative z-10">
                <RatingSystem initialRating={rating} label="TU VALORACIÓN" onRate={handleRate} />
                <ReviewSection initialComment={comentario} onSave={handleSaveReview} />
              </div>
            </div>

            {/* SPOTIFY BRIDGE */}
            <div className="mt-8 group">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4 text-center group-hover:text-[#ff6b00] transition-colors font-mono">Spotify Bridge: Digital Link</p>
              <div className="mb-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                <MdInfoOutline className="text-[#ff6b00] text-xs shrink-0" />
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-tight">
                  Inicia sesión en Spotify en este navegador para desbloquear tracks completos.
                </p>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl">
                <iframe
                  src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  className="border-0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 h-[600px] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-[#111]">
                <MdMusicNote className="text-2xl text-[#ff6b00]" />
                <h3 className="font-black text-xl uppercase tracking-widest italic">Letra Encriptada</h3>
              </div>
              <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                {cargandoLetra ? (
                  <div className="space-y-4 animate-pulse">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="h-4 bg-white/5 rounded w-[80%] even:w-[60%]" />
                    ))}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xl leading-relaxed text-gray-300">
                    {letra || 'Letra no disponible en este sector del archivo.'}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN COMUNIDAD: OPINIONES EXPANDIDAS */}
        <div className="mt-24 border-t-8 border-dashed border-white/5 pt-24">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="border-l-[12px] border-[#ff6b00] pl-6">
                 <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic">REPORTE DE LA COMUNIDAD</h2>
                 <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">Opiniones de la comunidad</p>
              </div>
              <div className="px-8 py-4 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4">
                 <MdPeople className="text-3xl text-[#ff6b00]" />
                 <div className="text-center md:text-left">
                    <p className="text-xl font-black text-white leading-none">MODO SOCIAL</p>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Conexión con nodos activos</p>
                 </div>
              </div>
           </div>

           <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
              <OpinionesGlobales tipo="cancion" itemId={id} />
           </div>
        </div>

        {/* RECOMENDACIONES */}
        {(cargandoRecomendaciones || recomendaciones.length > 0) && (
          <div className="mt-32">
            <h2 className="text-4xl font-black uppercase italic mb-12 border-l-8 border-[#ff6b00] pl-6">RESONANCIAS SIMILARES</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {cargandoRecomendaciones ? (
                [1,2,3,4,5].map(i => (
                  <div key={i} className="bg-[#111] p-4 rounded-[2rem] border border-white/5 animate-pulse">
                    <div className="w-full aspect-square bg-white/5 rounded-2xl mb-4" />
                    <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-white/5 rounded w-1/2" />
                  </div>
                ))
              ) : (
                recomendaciones.slice(0, 5).map((track) => (
                  <Link 
                    key={track.id} 
                    to={`/cancion/${track.id}`}
                    className="group relative block bg-[#111] p-4 rounded-[2rem] border border-white/5 hover:border-[#ff6b00] transition-all"
                  >
                    <img src={track.imagen} className="w-full aspect-square object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform" alt={track.nombre} />
                    <h4 className="font-black text-xs uppercase truncate mb-1">{track.nombre}</h4>
                    <p className="text-[10px] text-gray-500 uppercase">{track.artista}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PerfilCancion;