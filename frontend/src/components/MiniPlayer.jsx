import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MdPlayArrow, MdPause, MdSkipNext, MdSkipPrevious,
  MdOpenInNew, MdExpandMore, MdExpandLess, MdGraphicEq, MdClose, MdUnfoldMore
} from 'react-icons/md';
import { useSpotifyEmbedStore } from '../store/spotifyEmbedStore';

const loadSpotifyApi = () => {
  if (window.SpotifyIframeApiLoaded) return;
  window.SpotifyIframeApiLoaded = true;
  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  document.body.appendChild(script);
};

const fmt = (ms) => {
  if (!ms || isNaN(ms)) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss < 10 ? '0' : ''}${ss}`;
};

export default function MiniPlayer() {
  const { isPlaying, position, duration, currentTrack, activeUri, setController, updatePlayback, reset, next, previous } = useSpotifyEmbedStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const progressRef = useRef(null);
  const lastLoadedUri = useRef(null);

  // 1. Cargar API
  useEffect(() => {
    loadSpotifyApi();
    if (window.SpotifyIFrameAPI) {
      setIsApiReady(true);
    } else {
      const existing = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIFrameAPI = IFrameAPI;
        if (existing) existing(IFrameAPI);
        setIsApiReady(true);
      };
    }
  }, []);

  // 2. Inicialización y Sincronización de URI
  useEffect(() => {
    if (!isApiReady || !activeUri || !containerRef.current) return;

    // Si ya hay un controlador y la URI cambió
    if (controllerRef.current) {
      if (lastLoadedUri.current !== activeUri) {
        controllerRef.current.loadUri(activeUri);
        lastLoadedUri.current = activeUri;
        controllerRef.current.play();
        setIsChangingTrack(false);
      }
      return;
    }

    // Inicialización por primera vez
    const IFrameAPI = window.SpotifyIFrameAPI;
    IFrameAPI.createController(containerRef.current, {
      uri: activeUri,
      width: '100%',
      height: '80',
      theme: '0'
    }, (ctrl) => {
      controllerRef.current = ctrl;
      lastLoadedUri.current = activeUri;
      setController(ctrl);
      ctrl.addListener('playback_update', (e) => updatePlayback(e.data));
      ctrl.play();
    });

    return () => {
      // No reseteamos controllerRef.current aquí para evitar loops si el componente re-renderiza
    };
  }, [isApiReady, activeUri, setController, updatePlayback]);

  const handlePlayPause = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    isPlaying ? ctrl.pause() : ctrl.resume();
  }, [isPlaying]);

  const handleProgressClick = useCallback((e) => {
    const ctrl = controllerRef.current;
    if (!ctrl || !duration) return;
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    ctrl.seek(Math.floor((pct / 100) * duration));
  }, [duration]);

  const handleClose = (e) => {
    e.stopPropagation();
    if (controllerRef.current) controllerRef.current.pause();
    controllerRef.current = null;
    lastLoadedUri.current = null;
    reset();
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-[-1000px] left-[-1000px] w-0 h-0 opacity-0 pointer-events-none">
        <div ref={containerRef} />
      </div>
    );
  }

  const progPct = duration > 0 ? (position / duration) * 100 : 0;
  const iPath = currentTrack.tipo === 'album' ? `/album/${currentTrack.id}` : `/cancion/${currentTrack.id}`;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={isExpanded ? 'expanded' : 'compact'}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-6 left-6 z-[400] pointer-events-auto"
        >
          <div className={`bg-[#0a0a0a]/95 backdrop-blur-2xl border-2 border-white/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 ${isExpanded ? 'w-64' : 'w-[220px]'}`}>
            
            <div ref={progressRef} onClick={handleProgressClick} className="h-1 w-full bg-white/5 cursor-pointer relative">
              <div className="h-full bg-[#ff6b00] transition-all" style={{ width: `${progPct}%` }} />
            </div>

            {isExpanded ? (
              <div className="p-4 flex flex-col gap-4 relative">
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <button onClick={() => setIsExpanded(false)} className="p-1.5 bg-black/60 rounded-lg text-white/50 hover:text-[#ff6b00] transition-all"><MdExpandMore size={18} /></button>
                  <button onClick={handleClose} className="p-1.5 bg-black/60 rounded-lg text-red-500/50 hover:text-red-500 transition-all"><MdClose size={18} /></button>
                </div>

                <Link to={iPath} className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/5 group">
                  <img src={currentTrack.imagen || '/default.png'} className={`w-full h-full object-cover transition-all ${isChangingTrack ? 'opacity-50' : 'group-hover:scale-110'}`} alt="" />
                  {isPlaying && !isChangingTrack && (
                    <div className="absolute bottom-3 left-3 bg-black/60 p-2 rounded-xl border border-white/10"><MdGraphicEq className="text-[#ff6b00] animate-pulse" /></div>
                  )}
                  {isChangingTrack && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
                    </div>
                  )}
                </Link>

                <div className="text-center">
                  <h4 className="text-xs font-black text-white uppercase truncate">{currentTrack.nombre}</h4>
                  <p className="text-[9px] font-bold text-[#ff6b00] uppercase truncate mt-1">{currentTrack.artista}</p>
                </div>

                <div className="flex items-center justify-between px-2">
                  <button onClick={() => !isChangingTrack && previous()} className={`p-2 transition-all ${isChangingTrack ? 'opacity-20' : 'text-gray-500 hover:text-white'}`} disabled={isChangingTrack}><MdSkipPrevious size={24} /></button>
                  <button onClick={handlePlayPause} className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#ff6b00] transition-all active:scale-95">
                    {isPlaying ? <MdPause size={28} /> : <MdPlayArrow size={28} className="ml-0.5" />}
                  </button>
                  <button onClick={() => !isChangingTrack && next()} className={`p-2 transition-all ${isChangingTrack ? 'opacity-20' : 'text-gray-500 hover:text-white'}`} disabled={isChangingTrack}><MdSkipNext size={24} /></button>
                </div>
              </div>
            ) : (
              <div className="p-2 flex items-center gap-2">
                <div onClick={() => setIsExpanded(true)} className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-white/5 cursor-pointer group">
                  <img src={currentTrack.imagen || '/default.png'} className={`w-full h-full object-cover transition-all ${isChangingTrack ? 'opacity-50' : ''}`} alt="" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MdUnfoldMore className="text-white" />
                  </div>
                  {isChangingTrack && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <div className="w-3 h-3 border-2 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0" onClick={() => setIsExpanded(true)}>
                  <h4 className="text-[9px] font-black text-white uppercase truncate leading-tight">{currentTrack.nombre}</h4>
                  <p className="text-[7px] font-bold text-[#ff6b00] uppercase truncate tracking-widest mt-0.5">{currentTrack.artista}</p>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={handlePlayPause} className="w-8 h-8 bg-[#ff6b00] text-black rounded-lg flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-90">
                    {isPlaying ? <MdPause size={18} /> : <MdPlayArrow size={18} className="ml-0.5" />}
                  </button>
                  <button onClick={handleClose} className="p-1 text-gray-700 hover:text-red-500 transition-colors">
                    <MdClose size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-[-1000px] left-[-1000px] w-0 h-0 opacity-0 pointer-events-none overflow-hidden">
        <div ref={containerRef} />
      </div>
    </>
  );
}
