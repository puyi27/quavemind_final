import { create } from 'zustand';

export const useSpotifyEmbedStore = create((set, get) => ({
  isPlaying: false,
  position: 0,
  duration: 0,
  currentTrack: null, // { id, nombre, artista, imagen, tipo, uri }
  activeUri: null,
  queue: [],
  currentIndex: -1,

  setController: (ctrl) => set({ controller: ctrl }),
  
  // Cargar una canción o un álbum con su cola de reproducción
  loadUri: (id, type, info, tracks = []) => {
    const uri = `spotify:${type}:${id}`;
    const queue = tracks.length > 0 ? tracks : [];
    const currentIndex = tracks.length > 0 ? 0 : -1;
    
    // Si es un álbum y tenemos tracks, cargamos el primero para tener control total
    const actualUri = (type === 'album' && queue.length > 0) 
      ? `spotify:track:${queue[0].id}` 
      : uri;

    const trackInfo = (type === 'album' && queue.length > 0)
      ? { 
          id: queue[0].id, 
          nombre: queue[0].nombre, 
          artista: queue[0].artista, 
          imagen: info.imagen,
          tipo: 'cancion'
        }
      : { 
          id, 
          nombre: info.nombre, 
          artista: info.artista, 
          imagen: info.imagen,
          tipo: type
        };

    set({ 
      activeUri: actualUri,
      queue,
      currentIndex,
      currentTrack: { 
        ...trackInfo,
        uri: actualUri,
        spotifyUrl: `https://open.spotify.com/${trackInfo.tipo}/${trackInfo.id}`
      }
    });
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const track = queue[nextIndex];
      const uri = `spotify:track:${track.id}`;
      set({
        currentIndex: nextIndex,
        activeUri: uri,
        currentTrack: {
          id: track.id,
          nombre: track.nombre,
          artista: track.artista,
          imagen: get().currentTrack?.imagen, // Mantener portada del album
          tipo: 'cancion',
          uri,
          spotifyUrl: `https://open.spotify.com/track/${track.id}`
        }
      });
    }
  },

  previous: () => {
    const { queue, currentIndex } = get();
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const track = queue[prevIndex];
      const uri = `spotify:track:${track.id}`;
      set({
        currentIndex: prevIndex,
        activeUri: uri,
        currentTrack: {
          id: track.id,
          nombre: track.nombre,
          artista: track.artista,
          imagen: get().currentTrack?.imagen,
          tipo: 'cancion',
          uri,
          spotifyUrl: `https://open.spotify.com/track/${track.id}`
        }
      });
    }
  },

  updatePlayback: (data) => {
    const { isPaused, position, duration } = data;
    const currentState = get();
    
    set({
      isPlaying: !isPaused,
      position: position || 0,
      duration: duration || 0,
    });

    // Lógica de reproducción automática: si la canción termina (o falta muy poco y se pausa)
    if (duration > 0 && position > 0 && position >= duration - 800 && isPaused) {
      // Pequeño delay para evitar saltos bruscos
      setTimeout(() => {
        const freshState = get();
        // Solo saltar si sigue pausado y al final
        if (freshState.position >= freshState.duration - 1000) {
          freshState.next();
        }
      }, 500);
    }
  },

  reset: () => set({ 
    isPlaying: false, 
    position: 0, 
    duration: 0, 
    currentTrack: null, 
    activeUri: null,
    queue: [],
    currentIndex: -1
  }),
}));
