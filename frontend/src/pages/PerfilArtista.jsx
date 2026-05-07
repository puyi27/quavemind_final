import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdFavorite, MdFavoriteBorder, MdPlayArrow, MdPause,
  MdGraphicEq, MdOpenInNew, MdArrowBack, MdTrendingUp,
  MdStars, MdInfoOutline, MdHistory, MdPerson,
  MdLayers
} from 'react-icons/md';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useFavoritos } from '../hooks/useFavoritos';
import { useToggleFavorito } from '../hooks/useToggleFavorito';
import AINeuralDiscovery from '../components/AINeuralDiscovery';

const formatCompact = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num || 0);
};

export default function PerfilArtista() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const audioRef = useRef(null);

  const [artista, setArtista] = useState(null);
  const [canciones, setCanciones] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [relacionados, setRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);

  const { esFavorito, setEsFavorito } = useFavoritos(id, 'artista');
  const { toggleFavorito: toggleFav } = useToggleFavorito();

  useEffect(() => {
    const cargarPerfil = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/music/artista/${id}`);
        const data = response.data;

        if (data.status === 'ok') {
          setArtista(data.artista || null);
          setCanciones(data.topTracks || []);
          setAlbumes(data.albumes || []);
          setRelacionados(data.relacionados || []);
        } else {
          setError('No se pudo cargar el perfil del artista');
        }
      } catch (err) {
        setError('Error al cargar los datos del artista');
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [id]);

  const handleToggleFavorito = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!artista) return;

    const previousState = esFavorito;
    setEsFavorito(!esFavorito);

    try {
      const result = await toggleFav(id, 'artista', {
        nombre: artista.nombre,
        imagen: artista.imagen,
        seguidores: artista.seguidores
      });

      // Si falló por 401, revertir y redirigir
      if (!result.success) {
        setEsFavorito(previousState);
        if (result.isAuthError) {
          navigate('/login');
        }
      }
    } catch (err) {
      // Cualquier error inesperado, revertir estado
      setEsFavorito(previousState);
    }
  };

  const playPreview = (track) => {
    if (!track?.preview) return;

    if (playingTrack === track.id) {
      audioRef.current.pause();
      setPlayingTrack(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(track.preview);
    audio.onended = () => setPlayingTrack(null);
    audio.play().catch(() => setPlayingTrack(null));
    audioRef.current = audio;
    setPlayingTrack(track.id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#ff6b00] border-t-transparent" />
      </div>
    );
  }

  if (error || !artista) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-white text-center">
        <h2 className="mb-4 text-3xl font-black uppercase tracking-tighter">
          {error || 'Artista no encontrado'}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-10 py-3 bg-white text-black font-black rounded-full uppercase text-xs tracking-widest hover:bg-[#ff6b00] transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header Visual Original Feel */}
      <section className="relative min-h-[650px] lg:h-[650px] w-full overflow-hidden bg-[#050505] border-b border-white/5">
        <div className="absolute inset-0">
          <img 
            src={artista.imagen || '/default.png'} 
            alt={artista.nombre} 
            className="h-full w-full object-cover blur-[120px] scale-150 opacity-20 grayscale" 
            onError={(e) => { e.target.src = '/default.png'; }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors mb-16">
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-[#ff6b00] group-hover:text-black transition-all">
              <MdArrowBack className="text-xl" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">Regresar</span>
          </button>

          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative shrink-0"
            >
              <div className="absolute -inset-4 bg-[#ff6b00] rounded-full blur opacity-10"></div>
              <img src={artista.imagen || '/default.png'} alt={artista.nombre} className="relative h-56 w-56 md:h-72 md:w-72 rounded-full border-4 border-white/10 shadow-2xl object-cover" onError={(e) => { e.target.src = '/default.png'; }} />
            </motion.div>

            <div className="flex-1 text-center lg:text-left pb-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4">
                {(artista.generos || []).slice(0, 3).map(g => (
                  <span key={g} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-[#ff6b00] uppercase tracking-widest">{g}</span>
                ))}
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white tracking-tighter leading-none mb-6">
                {artista.nombre}
              </h1>

              <div className="flex flex-wrap justify-center lg:justify-start gap-10 items-center">
                <div>
                  <p className="text-3xl font-black text-white flex items-center gap-2">
                    <MdGraphicEq className="text-[#ff6b00]" />
                    {artista.oyentesMensuales
                      ? formatCompact(artista.oyentesMensuales)
                      : artista.seguidores
                        ? formatCompact(artista.seguidores)
                        : '---'}
                  </p>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                    {artista.oyentesMensuales ? 'Oyentes Mensuales' : 'Seguidores'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6 lg:mt-0">
                  <button onClick={handleToggleFavorito} className={`flex items-center justify-center gap-3 px-8 py-4 font-black rounded-2xl transition-all ${esFavorito ? 'bg-[#ff6b00] text-black shadow-[0_0_30px_rgba(255,107,0,0.3)]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
                    {esFavorito ? <MdFavorite /> : <MdFavoriteBorder />}
                    <span className="text-xs tracking-widest uppercase">{esFavorito ? 'SIGUIENDO' : 'SEGUIR'}</span>
                  </button>
                  <a href={artista.spotifyUrl || `https://open.spotify.com/artist/${artista.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1DB954] text-black font-black rounded-2xl hover:bg-[#1ed760] transition-all shadow-xl">
                    <MdOpenInNew /> <span className="text-xs tracking-widest uppercase">SPOTIFY</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="mx-auto max-w-7xl px-4 mt-10 lg:-mt-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-16">

          {/* Top Tracks */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <MdTrendingUp className="text-3xl text-[#ff6b00]" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">Temas Populares</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Los temas más escuchados del momento</p>
              </div>
            </div>

            <div className="space-y-3">
              {canciones.slice(0, 10).map((t, i) => (
                <div key={t.id} className="group flex items-center gap-5 bg-[#0a0a0a] p-4 rounded-3xl border border-white/5 hover:bg-[#111] hover:border-[#ff6b00]/30 transition-all">
                  <span className="w-8 text-center text-white/20 font-black italic text-xl group-hover:text-[#ff6b00]">{i + 1}</span>
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={t.imagen} alt="" className="w-14 h-14 object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-black text-white uppercase tracking-tight group-hover:text-[#ff6b00]">{t.nombre}</h4>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{formatNumber(t.duracion_ms ? t.duracion_ms / 1000 : 0)}s • DATA_STREAM</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.preview && (
                      <button onClick={() => playPreview(t)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b00] hover:text-black transition-all">
                        {playingTrack === t.id ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
                      </button>
                    )}
                    <Link to={`/cancion/${t.id}`} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white hover:text-black transition-all">
                      <MdOpenInNew size={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Albums Grid */}
            {albumes.length > 0 && (
              <div className="mt-20">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <MdStars className="text-3xl text-[#ff6b00]" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Discografía Real</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Archivos de audio verificados en la red</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {albumes.map(album => (
                    <Link key={album.id} to={`/album/${album.id}`} className="group block">
                      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/5 group-hover:border-[#ff6b00]/50 transition-all duration-500 mb-4 shadow-xl">
                        <img src={album.imagen} alt={album.nombre} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="p-4 bg-[#ff6b00] rounded-2xl text-black shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                            <MdOpenInNew size={24} />
                          </div>
                        </div>
                      </div>
                      <h5 className="font-black text-white text-sm uppercase tracking-tight truncate group-hover:text-[#ff6b00] transition-colors">{album.nombre}</h5>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <MdHistory className="text-[#ff6b00]" /> {album.fecha}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Bio & Stats */}
          <aside className="space-y-10">
            <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 p-10 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ff6b00]/5 blur-[80px] rounded-full group-hover:bg-[#ff6b00]/10 transition-all duration-700" />
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8 italic">
                  <MdInfoOutline className="text-[#ff6b00]" /> Archivo Quave
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-10 italic">
                  {artista.biografia || "No hay biografía disponible para este nodo musical. Los patrones detectados sugieren una influencia significativa en la escena local y una capacidad de innovación constante."}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Albumes</p>
                    <p className="text-2xl font-black text-white">{albumes.length}</p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Influencia</p>
                    <p className="text-2xl font-black text-[#ff6b00]">{artista.popularidad}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#ff6b00] rounded-[2.5rem] p-10 text-black group relative overflow-hidden shadow-2xl">
              <MdPerson className="absolute -right-10 -bottom-10 text-[15rem] opacity-10 group-hover:scale-110 transition-transform duration-700" />
              <h4 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] relative z-10 mb-6">NODO DE COMUNIDAD ACTIVO</h4>
              <p className="text-sm font-bold opacity-80 relative z-10 mb-8">Este artista es seguido por miles de Quavers. Únete a la conversación.</p>
              <button className="w-full py-4 bg-black text-white font-black rounded-2xl uppercase text-xs tracking-widest relative z-10 hover:scale-105 transition-transform">Explorar Escena</button>
            </div>

            {/* MINI GRID DE CONEXIONES */}
            {relacionados.length > 0 && (
              <div className="p-2">
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <MdLayers className="text-[#ff6b00]" /> Conexiones de Nodo
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {relacionados.slice(0, 12).map(r => (
                    <Link key={r.id} to={`/artista/${r.id}`} className="group aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-[#ff6b00] transition-all">
                      <img src={r.imagen} alt={r.nombre} className="w-full h-full object-cover transition-transform duration-500" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* SPIDER WEB SECTION (AINeuralDiscovery) - BOTTOM */}
        <div className="mt-32">
          <AINeuralDiscovery
            title={`Red Neural de ${artista.nombre}`}
            type="core"
            data={relacionados}
            description="Mapeo de Conexiones Quave AI"
          />
        </div>
      </section>
    </div>
  );
}