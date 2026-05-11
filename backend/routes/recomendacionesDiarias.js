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
    
    if (cacheDiaria.fecha === hoy && cacheDiaria.selecciones) {
      return res.json({ status: 'ok', fecha: hoy, desdeCache: true, selecciones: cacheDiaria.selecciones });
    }
    
    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };
    
    const queries = ['trap latino', 'reggaeton', 'urbano español', 'pop latino'];
    const query = queries[seed % queries.length];
    
    // Ejecutamos en paralelo para mayor velocidad
    const [dataTracks, dataAlbums] = await Promise.all([
      fetchJsonWithRetry(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=ES`, { headers }),
      fetchJsonWithRetry(`${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=album&limit=50&market=ES`, { headers })
    ]);

    const trackItems = dataTracks?.tracks?.items || [];
    const albumItems = (dataAlbums?.albums?.items || []).filter(a => a.album_type === 'album');

    const cancionDelDia = selectWithSeed(trackItems.map(item => ({
      id: item.id,
      nombre: item.name,
      imagen: item.album?.images?.[0]?.url,
      artista: item.artists?.[0]?.name,
      preview: item.preview_url
    })), seed, 2);

    const albumDelDia = selectWithSeed(albumItems.map(a => ({
      id: a.id,
      nombre: a.name,
      imagen: a.images?.[0]?.url,
      artista: a.artists?.[0]?.name
    })), seed, 3);

    const artistIds = Array.from(new Set(trackItems.map(t => t.artists[0]?.id).filter(Boolean))).slice(0, 20);
    let artistaDestacado = null;

    if (artistIds.length > 0) {
      const artistsFullRes = await fetchJsonWithRetry(`${SPOTIFY_API_BASE}/artists?ids=${artistIds.join(',')}`, { headers });
      const artistPool = (artistsFullRes?.artists || []).filter(a => a && a.images?.length > 0);
      const selected = selectWithSeed(artistPool, seed, 1);
      if (selected) {
        artistaDestacado = {
          id: selected.id,
          nombre: selected.name,
          imagen: selected.images?.[0]?.url,
          seguidores: selected.followers?.total || 0,
          popularidad: selected.popularity || 0
        };
      }
    }

    const selecciones = { artistaDestacado, cancionDelDia, albumDelDia };
    
    cacheDiaria.fecha = hoy; 
    cacheDiaria.selecciones = selecciones;
    
    res.json({ status: 'ok', fecha: hoy, desdeCache: false, selecciones });
    
  } catch (error) {
    console.error("Error en recomendaciones:", error.message);
    res.status(200).json({ status: 'partial', message: 'Spotify temporalmente fuera de servicio', selecciones: { artistaDestacado: null, cancionDelDia: null, albumDelDia: null } });
  }
});

export default router;
