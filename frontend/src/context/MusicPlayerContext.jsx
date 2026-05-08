import { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';

export const PlayerContext = createContext(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [queue, setQueueState] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [autoNextTrigger, setAutoNextTrigger] = useState(false);

  const queueRef = useRef([]);
  const queueIndexRef = useRef(0);

  // Sincronizar refs con el estado para que los listeners los vean siempre actualizados
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);

  const pauseTrack = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const playTrack = useCallback(async (track, trackQueue = null, startIndex = 0) => {
    const audio = audioRef.current;
    if (!audio || !track?.preview) {
      setError('Esta canción no tiene preview disponible en Spotify.');
      return false;
    }

    if (trackQueue) {
      setQueueState(trackQueue);
      setQueueIndex(startIndex);
    }

    const isSameTrack = currentTrack?.id === track.id;
    setError('');
    setCurrentTrack(track);

    if (!isSameTrack || audio.src !== track.preview) {
      audio.src = track.preview;
      audio.load();
      setCurrentTime(0);
      setDuration(track.durationMs ? track.durationMs / 1000 : 0);
    }

    try {
      await audio.play();
      return true;
    } catch {
      setError('El navegador ha bloqueado la reproducción automática.');
      setIsPlaying(false);
      return false;
    }
  }, [currentTrack]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.preview) return;
    if (audio.paused) {
      try { await audio.play(); } catch { setError('No se ha podido reanudar.'); }
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const seekTo = useCallback((percent) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (percent / 100) * duration;
  }, [duration]);

  const nextTrack = useCallback(() => {
    if (queueIndex < queue.length - 1) {
      const next = queue[queueIndex + 1];
      if (next?.preview) {
        setQueueIndex(queueIndex + 1);
        playTrack(next);
      }
    }
  }, [queue, queueIndex, playTrack]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    // Si llevas más de 3 segundos → reiniciar, si no → canción anterior
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (queueIndex > 0) {
      const prev = queue[queueIndex - 1];
      if (prev?.preview) {
        setQueueIndex(queueIndex - 1);
        playTrack(prev);
      }
    }
  }, [queue, queueIndex, playTrack]);

  // Efecto para manejar el cambio automático de canción
  useEffect(() => {
    if (autoNextTrigger) {
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      if (idx < q.length) {
        const next = q[idx];
        if (next?.preview) {
          playTrack(next);
        }
      }
      setAutoNextTrigger(false);
    }
  }, [autoNextTrigger, playTrack]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      const q = queueRef.current;
      const idx = queueIndexRef.current;

      if (idx < q.length - 1) {
        setQueueIndex(prev => prev + 1);
        setAutoNextTrigger(true);
      }
    };

    const handleError = () => {
      setError('No se ha podido reproducir esta preview.');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [playTrack]);

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentTime,
        duration,
        error,
        isPlaying,
        pauseTrack,
        playTrack,
        progress,
        togglePlayback,
        seekTo,
        nextTrack,
        prevTrack,
        queue,
        queueIndex,
        setQueue: setQueueState,
        formatTime,
        hasNext: queueIndex < queue.length - 1,
        hasPrev: queueIndex > 0,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
