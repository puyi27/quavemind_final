import { Router } from 'express';
import { getSpotifyToken, SPOTIFY_API_BASE } from '../lib/spotify.js';
import { getCachedData, cacheData } from '../lib/redis.js';

const router = Router();

// POST /api/music/artistas/bulk - Buscar múltiples artistas
router.post('/bulk', async (req, res) => {
  try {
    const { nombres } = req.body;
    
    if (!nombres || !Array.isArray(nombres)) {
      return res.status(400).json({ error: 'Se requiere array de nombres' });
    }

    const token = await getSpotifyToken();
    const artistas = [];

    // Buscar cada artista (limitado a 10 para no sobrecargar)
    for (const nombre of nombres.slice(0, 10)) {
      try {
        const response = await fetch(
          `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(nombre)}&type=artist&limit=1`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        if (data.artists?.items?.[0]) {
          const artist = data.artists.items[0];
          artistas.push({
            id: artist.id,
            nombre: artist.name,
            imagen: artist.images?.[0]?.url,
            seguidores: artist.followers?.total,
            popularidad: artist.popularity,
            generos: artist.genres
          });
        }
      } catch (e) {
        console.error(`Error buscando ${nombre}:`, e.message);
      }
    }

    res.json({ status: 'ok', artistas });
  } catch (error) {
    console.error('Error en bulk:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/music/artistas/bulk - Versión avanzada con caché y normalización
router.get('/bulk', async (req, res) => {
  try {
    const nombresRaw = req.query.nombres || '';
    if (!nombresRaw) return res.json({ status: 'ok', artistas: [] });
    
    const names = nombresRaw.split(',').map((n) => n.trim()).filter(Boolean).slice(0, 40);
    const cacheKey = `bulk_artists:${Buffer.from(names.join(',')).toString('base64')}`;
    
    const cachedBulk = await getCachedData(cacheKey);
    if (cachedBulk) return res.json({ status: 'ok', artistas: cachedBulk });

    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };
    const artistasRaw = [];

    for (let i = 0; i < names.length; i += 5) {
      const batch = names.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map(async (name) => {
          try {
            const url = `${SPOTIFY_API_BASE}/search?q=artist:${encodeURIComponent(name)}&type=artist&limit=1`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            const artist = data.artists?.items?.[0];
            if (!artist) return null;
            return {
              id: artist.id,
              nombre: artist.name,
              imagen: artist.images?.[0]?.url || '/default.png',
              popularidad: artist.popularity || 0,
              seguidores: artist.followers?.total || 0,
              generos: artist.genres || [],
              spotifyUrl: artist.external_urls?.spotify
            };
          } catch {
            return null;
          }
        })
      );
      artistasRaw.push(...batchResults.filter(Boolean));
    }

    let artistas = artistasRaw;
    try {
      const { normalizeArtistList } = await import('../lib/artistValidator.js');
      artistas = normalizeArtistList(artistasRaw, { scene: req.query.escena || req.query.scene });
    } catch (e) {}
    
    await cacheData(cacheKey, artistas, 86400);
    return res.json({ status: 'ok', artistas });
  } catch (error) {
    return res.status(500).json({ status: 'error', mensaje: error.message, artistas: [] });
  }
});

// GET /api/music/artistas - Obtener por IDs
router.get('/', async (req, res) => {
  const idsRaw = `${req.query.ids || ''}`.trim();
  const scrape = `${req.query.scrape || 'false'}`.toLowerCase() === 'true';
  if (!idsRaw) return res.status(400).json({ status: 'error', mensaje: 'Faltan ids' });

  const ids = idsRaw.split(',').map((id) => id.trim()).filter(Boolean).slice(0, 50);

  try {
    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };
    const url = `${SPOTIFY_API_BASE}/artists?ids=${encodeURIComponent(ids.join(','))}`;
    
    const response = await fetch(url, { headers });
    const data = await response.json();

    const { getRealArtistStats } = await import('../lib/stats.js');

    const artistasRaw = await Promise.all((data.artists || []).filter(Boolean).map(async (a) => {
      let oyentesMensuales = null;
      let biografia = null;
      if (scrape) {
        try {
          const real = await getRealArtistStats(a.id);
          oyentesMensuales = real.listeners ?? null;
          biografia = real.bio ?? null;
        } catch (e) {}
      }
      return {
        id: a.id,
        nombre: a.name,
        imagen: a.images?.[0]?.url || '/default.png',
        seguidores: a.followers?.total || 0,
        popularidad: a.popularity || 0,
        generos: a.genres || [],
        oyentesMensuales,
        biografia,
        spotifyUrl: a.external_urls?.spotify
      };
    }));

    let artistas = artistasRaw;
    try {
      const { normalizeArtistList } = await import('../lib/artistValidator.js');
      artistas = normalizeArtistList(artistasRaw, { scene: req.query.escena || req.query.scene });
    } catch (e) {}

    return res.json({ status: 'ok', artistas });
  } catch (error) {
    return res.status(500).json({ status: 'error', mensaje: error.message, artistas: [] });
  }
});

export default router;