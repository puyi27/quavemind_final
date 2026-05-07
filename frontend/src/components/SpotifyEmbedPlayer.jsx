import { useEffect, useRef } from 'react';
import { useSpotifyEmbedStore } from '../store/spotifyEmbedStore';

// Carga el script de la IFrame API de Spotify una sola vez
const loadSpotifyApi = () => {
  if (window.SpotifyIframeApiLoaded) return;
  window.SpotifyIframeApiLoaded = true;
  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  document.body.appendChild(script);
};

/**
 * SpotifyEmbedPlayer
 * Reemplaza el <iframe> directo por uno controlado mediante la IFrame API de Spotify.
 * Detecta reproducción y actualiza el store global para que el MiniPlayer lo use.
 *
 * Props:
 *  - spotifyId: ID de Spotify del track o album
 *  - type: 'track' | 'album'
 *  - trackInfo: { nombre, artista, imagen } — info del elemento actual para el MiniPlayer
 *  - height: altura del iframe (default 152 para tracks, 352 para albums)
 */
export default function SpotifyEmbedPlayer({ spotifyId, type = 'track', trackInfo = {}, height }) {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const { setController, setCurrentTrack, updatePlayback } = useSpotifyEmbedStore();

  const defaultHeight = type === 'album' ? 352 : 152;

  useEffect(() => {
    if (!spotifyId) return;
    loadSpotifyApi();

    // Registra el callback global para cuando la API esté lista
    const initController = (IFrameAPI) => {
      if (!containerRef.current) return;

      const options = {
        uri: `spotify:${type}:${spotifyId}`,
        width: '100%',
        height: height || defaultHeight,
        theme: '0', // dark theme
      };

      IFrameAPI.createController(containerRef.current, options, (ctrl) => {
        controllerRef.current = ctrl;
        setController(ctrl);

        ctrl.addListener('playback_update', (e) => {
          updatePlayback({
            isPaused: e.data.isPaused,
            position: e.data.position,
            duration: e.data.duration,
          });

          // Cuando empieza a sonar, registrar el track en el store
          if (!e.data.isPaused) {
            setCurrentTrack({
              id: spotifyId,
              tipo: type,
              nombre: trackInfo.nombre || 'Reproduciendo...',
              artista: trackInfo.artista || '',
              imagen: trackInfo.imagen || '',
              spotifyUrl: `https://open.spotify.com/${type}/${spotifyId}`,
            });
          }
        });

        ctrl.addListener('ready', () => {
          console.log(`[SpotifyEmbed] Listo: ${type}:${spotifyId}`);
        });
      });
    };

    // La API puede tardar en cargar; esperamos al callback o ya está disponible
    if (window.SpotifyIFrameAPI) {
      initController(window.SpotifyIFrameAPI);
    } else {
      const prev = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIFrameAPI = IFrameAPI;
        if (prev) prev(IFrameAPI);
        initController(IFrameAPI);
      };
    }

    return () => {
      // Limpiar el controlador al desmontar
      if (controllerRef.current) {
        try { controllerRef.current.destroy?.(); } catch {}
        controllerRef.current = null;
        setController(null);
      }
    };
  }, [spotifyId, type]);

  return (
    <div
      className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl"
      style={{ minHeight: height || defaultHeight }}
    >
      <div ref={containerRef} />
    </div>
  );
}
