import { Router } from 'express';
import { getSpotifyToken, fetchJsonWithRetry, SPOTIFY_API_BASE } from '../lib/spotify.js';

const router = Router();
const cacheDiaria = { fecha: null, seed: null, selecciones: null };

const getHoy = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

const getSeed = () => {
  const hoy = new Date();
  return hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
};

const selectWithSeed = (array, seed, offset = 0) => {
  if (!array || array.length === 0) return null;
  const x = Math.sin(seed + offset) * 10000;
  const fraction = x - Math.floor(x);
  return array[Math.floor(fraction * array.length)];
};

router.get('/diarias', async (req, res) => {
  try {
    const hoy = getHoy();
    const seed = getSeed();
    
    if (cacheDiaria.fecha === hoy && cacheDiaria.selecciones && cacheDiaria.selecciones.artistaDestacado) {
      return res.json({ status: 'ok', fecha: hoy, desdeCache: true, selecciones: cacheDiaria.selecciones });
    }
    
    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };
    
    // Consultas más robustas y variadas
    const queries = [
      'genre:trap latino', 
      'genre:reggaeton',
      'urbano en español',
      'genre:corridos tumbados',
      'pop urbano español',
      'hip hop español',
      'top urbano españa',
      'musica urbana latina 2024'
    ];
    const query = queries[seed % queries.length];
    
    // 1. Obtener pool de canciones
    const searchTracksUrl = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=ES`;
    const dataTracks = await fetchJsonWithRetry(searchTracksUrl, { headers });
    const trackItems = dataTracks.tracks?.items || [];

    // 2. Obtener pool de álbumes
    const searchAlbumsUrl = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=album&limit=50&market=ES`;
    const dataAlbums = await fetchJsonWithRetry(searchAlbumsUrl, { headers });
    const albumItems = (dataAlbums.albums?.items || []).filter(a => a.album_type === 'album' && a.total_tracks > 3);

    // Selección de canción del día
    const cancionPool = trackItems.map(item => ({
      id: item.id,
      nombre: item.name,
      imagen: item.album?.images?.[0]?.url,
      artista: item.artists?.[0]?.name,
      preview: item.preview_url
    }));
    const cancionDelDia = selectWithSeed(cancionPool, seed, 2);

    // Selección de álbum del día
    const albumPool = albumItems.map(a => ({
      id: a.id,
      nombre: a.name,
      imagen: a.images?.[0]?.url,
      artista: a.artists?.[0]?.name,
      fecha: a.release_date?.substring(0, 4)
    }));
    const albumDelDia = selectWithSeed(albumPool, seed, 3);

    // Selección de artista destacado
    const artistIds = Array.from(new Set(trackItems.map(t => t.artists[0]?.id).filter(Boolean))).slice(0, 20);
    
    let artistaDestacado = null;
    if (artistIds.length > 0) {
      const artistsFullRes = await fetchJsonWithRetry(`${SPOTIFY_API_BASE}/artists?ids=${artistIds.join(',')}`, { headers });
      const artistPool = (artistsFullRes.artists || []).filter(a => a && a.images?.length > 0);
      
      // Intentamos buscar uno con popularidad decente pero no necesariamente el top 1
      const selectedArtistRaw = selectWithSeed(artistPool, seed, 1);
      
      if (selectedArtistRaw) {
        artistaDestacado = {
          id: selectedArtistRaw.id,
          nombre: selectedArtistRaw.name,
          imagen: selectedArtistRaw.images?.[0]?.url,
          seguidores: selectedArtistRaw.followers?.total || 0,
          popularidad: selectedArtistRaw.popularity || 0
        };
      }
    }

    const selecciones = {
      artistaDestacado,
      cancionDelDia,
      albumDelDia
    };
    
    // Solo cacheamos si tenemos al menos un artista
    if (artistaDestacado) {
      cacheDiaria.fecha = hoy; 
      cacheDiaria.seed = seed; 
      cacheDiaria.selecciones = selecciones;
    }
    
    res.json({ status: 'ok', fecha: hoy, desdeCache: false, selecciones });
    
  } catch (error) {
    console.error("Error en recomendaciones:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/limpiar', (req, res) => {
  cacheDiaria.fecha = null; 
  cacheDiaria.seed = null; 
  cacheDiaria.selecciones = null;
  res.json({ status: 'ok', mensaje: 'Caché purgada.' });
});

export default router;

