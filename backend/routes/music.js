import { Router } from 'express';
import { Client } from 'genius-lyrics';
import { getSpotifyToken, fetchJsonWithRetry, SPOTIFY_API_BASE } from '../lib/spotify.js';
import { slidingWindowRateLimiter } from '../middleware/rateLimiter.js';
import { getCachedData, cacheData } from '../lib/redis.js';
import { normalizeArtistList } from '../lib/artistValidator.js';
import { getRealArtistStats } from '../lib/stats.js';

const router = Router();

const cleanLyricsQuery = (title, artist = '') => {
  const patterns = [
    /\(feat\..*?\)/gi, /\[feat\..*?\]/gi, /\(ft\..*?\)/gi, /\[ft\..*?\]/gi,
    /\(.*?Remix.*?\)/gi, /\[.*?Remix.*?\]/gi, /\(.*?Cover.*?\)/gi, /\[.*?Cover.*?\]/gi,
    /\(Official.*?\)/gi, /\[Official.*?\]/gi, /\(Lyric.*?\)/gi, /\[Lyric.*?\]/gi,
    /\(Remastered.*?\)/gi, /\[Remastered.*?\]/gi, /- Remastered.*?$/gi,
    /ft\..*?(\s|$)/gi, /feat\..*?(\s|$)/gi,
  ];
  let cleanTitle = title;
  patterns.forEach(p => { cleanTitle = cleanTitle.replace(p, ''); });
  return `${artist} ${cleanTitle}`.replace(/\s+/g, ' ').trim();
};

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;
const geniusClient = GENIUS_ACCESS_TOKEN ? new Client(GENIUS_ACCESS_TOKEN) : null;

const getGeniusBio = async (nombre) => {
  if (!geniusClient) return null;
  try {
    const searches = await geniusClient.songs.search(nombre);
    if (!searches || searches.length === 0) return null;
    const song = searches[0];
    return song.artist?.description || null;
  } catch (e) {
    return null;
  }
};

// Ruta: Letras (Híbrida: LRCLIB + Genius)
router.get('/lyrics', async (req, res) => {
  const { q: query, title, artist } = req.query;
  
  const cleanArtist = artist ? artist.split(',')[0].trim() : '';
  const cleanTitle = title ? title.replace(/\s*-\s*.*Remix.*$/i, '').replace(/\(.*\)/g, '').trim() : '';
  const searchQuery = cleanArtist && cleanTitle ? `${cleanArtist} ${cleanTitle}` : query;

  if (!searchQuery) return res.status(400).json({ status: 'error', mensaje: 'Falta query' });

  const cacheKey = `lyrics:${searchQuery.toLowerCase().trim()}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return res.json({ status: 'ok', letra: cached });

  try {
    // 1. INTENTO CON LRCLIB (Mucho más estable para servidores)
    console.log(`[LYRICS] Probando LRCLIB para: ${cleanTitle} - ${cleanArtist}`);
    try {
      const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
      const response = await fetch(lrclibUrl, {
        headers: { 'User-Agent': 'Quavemind (https://github.com/puyi27/quavemind_final)' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && (data.plainLyrics || data.syncedLyrics)) {
          const letra = data.plainLyrics || data.syncedLyrics.replace(/\[\d+:\d+\.\d+\]/g, ''); // Limpiar tiempos si es synced
          console.log('[LYRICS] Encontrada en LRCLIB');
          await cacheData(cacheKey, letra, 86400);
          return res.json({ status: 'ok', letra });
        }
      }
    } catch (e) {
      console.warn('[LYRICS] LRCLIB falló, pasando a Genius...');
    }

    // 2. INTENTO CON GENIUS (Como respaldo)
    if (geniusClient) {
      const searchTerms = cleanArtist && cleanTitle ? `${cleanArtist} ${cleanTitle}` : searchQuery;
      const searches = await geniusClient.songs.search(searchTerms);

      if (searches && searches.length > 0) {
        const song = searches[0];
        const lyrics = await song.lyrics(true);
        const cleanedLyrics = lyrics ? lyrics.replace(/^\d+ Contributors.*/i, '').replace(/[0-9]*[ ]?Embed$/gi, '').replace(/You might also like/gi, '').replace(/\[.*?\]/g, '').trim() : null;
        
        if (cleanedLyrics) {
          await cacheData(cacheKey, cleanedLyrics, 86400);
          return res.json({ status: 'ok', letra: cleanedLyrics });
        }
      }
    }

    return res.json({ status: 'ok', letra: 'Letra no encontrada en los archivos Quave. Prueba con otra canción.' });

  } catch (error) {
    console.error('[LYRICS ERROR]:', error.message);
    // Error silencioso: si todo falla, simplemente decimos que no hay letras
    return res.json({ 
      status: 'ok', 
      letra: 'No hemos podido localizar la frecuencia de esta letra en nuestros archivos. Prueba con otro tema.' 
    });
  }
});

// Endpoint: Recomendaciones para un artista
router.get('/recomendaciones/:artistId', async (req, res) => {
  const { artistId } = req.params;
  if (!artistId) return res.status(400).json({ status: 'error', mensaje: 'Falta artistId' });

  try {
    const token = await getSpotifyToken();
    const [relatedRes, topTracksRes] = await Promise.all([
      fetchJsonWithRetry(`${SPOTIFY_API_BASE}/artists/${artistId}/related-artists`, token),
      fetchJsonWithRetry(`${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=ES`, token)
    ]);

    const recomendaciones = {
      artistas: (relatedRes?.artists || []).slice(0, 6).map(a => ({
        id: a.id,
        nombre: a.name,
        imagen: a.images?.[0]?.url,
        imagen_small: a.images?.[2]?.url || a.images?.[1]?.url || a.images?.[0]?.url,
        seguidores: a.followers?.total,
        popularidad: a.popularity
      })),
      canciones: (topTracksRes?.tracks || []).slice(0, 6).map(t => ({
        id: t.id,
        nombre: t.name,
        imagen: t.album?.images?.[0]?.url,
        album_imagen_small: t.album?.images?.[2]?.url || t.album?.images?.[1]?.url || t.album?.images?.[0]?.url,
        artista: t.artists?.[0]?.name,
        preview: t.preview_url
      }))
    };

    return res.json({ status: 'ok', recomendaciones });
  } catch (error) {
    return res.status(500).json({ status: 'error', mensaje: error.message });
  }
});

// Endpoint: Estadísticas reales (scraping) para múltiples artistas (Ranking)
router.post('/artists-real-stats/bulk', async (req, res) => {
  try {
    const { artistas } = req.body;
    
    // Validación temprana
    if (!artistas || !Array.isArray(artistas)) {
      return res.status(400).json({ status: 'error', mensaje: 'Se requiere un array de artistas' });
    }

    // Límite de seguridad para evitar DoS accidental
    if (artistas.length > 50) {
      return res.status(400).json({ status: 'error', mensaje: 'Demasiados artistas (máximo 50)' });
    }

    const resultados = await Promise.all(
      artistas.map(async (a) => {
        try {
          if (!a.id) return { ...a, oyentesMensuales: null };
          
          const stats = await getRealArtistStats(a.id);
          return {
            ...a,
            oyentesMensuales: stats?.listeners || null,
            biografia: stats?.bio || null,
            verificado: stats?.listeners !== null
          };
        } catch (innerError) {
          console.warn(`[Backend] Error obteniendo stats para ${a.id}:`, innerError.message);
          return { ...a, oyentesMensuales: null, verificado: false };
        }
      })
    );

    return res.json({ status: 'ok', data: resultados });
  } catch (error) {
    console.error('[Backend CRITICAL] Fallo masivo en stats bulk:', error.message);
    // Devolvemos 500 pero con un JSON válido para que el frontend no rompa
    return res.status(500).json({ 
      status: 'error', 
      mensaje: 'Error procesando estadísticas en el servidor',
      data: [] 
    });
  }
});

// Endpoint: Buscar (Restaurado para arreglar el 404)
router.get('/buscar', async (req, res) => {
  const query = `${req.query.q || req.query.query || ''}`.trim();
  const tipo = `${req.query.tipo || req.query.type || 'artist,track,album'}`;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  if (!query) {
    return res.json({ status: 'ok', artistas: [], canciones: [], albumes: [] });
  }

  try {
    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };
    const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(tipo)}&limit=${limit}`;
    
    const data = await fetchJsonWithRetry(url, { headers }, 1);
    
    const artistas = (data.artists?.items || []).map(a => ({
      id: a.id,
      nombre: a.name,
      imagen: a.images?.[0]?.url || '/default.png',
      imagen_small: a.images?.[2]?.url || a.images?.[1]?.url || a.images?.[0]?.url || '/default.png',
      popularidad: a.popularity || 0,
      seguidores: a.followers?.total || 0,
      generos: a.genres || [],
      spotifyUrl: a.external_urls?.spotify
    }));

    const canciones = (data.tracks?.items || []).map(t => ({
      id: t.id,
      nombre: t.name,
      artista: t.artists?.[0]?.name,
      artistas: (t.artists || []).map(a => ({ id: a.id, nombre: a.name })),
      imagen: t.album?.images?.[0]?.url || '/default.png',
      album_imagen_small: t.album?.images?.[2]?.url || t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '/default.png',
      preview: t.preview_url,
      duracion: t.duration_ms,
      spotifyUrl: t.external_urls?.spotify
    }));

    const albumes = (data.albums?.items || []).map(a => ({
      id: a.id,
      nombre: a.name,
      artista: a.artists?.[0]?.name,
      imagen: a.images?.[0]?.url || '/default.png',
      imagen_small: a.images?.[2]?.url || a.images?.[1]?.url || a.images?.[0]?.url || '/default.png',
      fecha: a.release_date?.substring(0, 4) || '',
      spotifyUrl: a.external_urls?.spotify
    }));

    return res.json({
      status: 'ok',
      artistas,
      canciones,
      albumes
    });
  } catch (error) {
    console.error('[Music Search] Error:', error.message);
    return res.status(500).json({ status: 'error', mensaje: 'Error buscando en Spotify' });
  }
});

export default router;