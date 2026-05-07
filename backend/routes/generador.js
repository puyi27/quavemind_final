import { Router } from 'express';

const router = Router();
const SPOTIFY_TOKEN_URL = 'https://' + 'accounts.' + 'spotify.' + 'com/api/token';
const SPOTIFY_API_BASE = 'https://' + 'api.' + 'spotify.' + 'com/v1';

// Función auxiliar para obtener el token (asumiendo que está en tu index.js o la exportas)
// Si está en index.js, tendrás que pasarla aquí o refactorizarla a un archivo utils.js
// Por simplicidad para este paso, la redefinimos aquí basándonos en tu index.js
const getSpotifyToken = async () => {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '72d3c40165884d6396ff2ef86a01ffb1';
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '52a4b60ab1e14ece818cc51309f24d4d';
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error('No se pudo obtener el token de Spotify');
  }
  return data.access_token;
};

router.post('/generar', async (req, res) => {
  try {
    // Parámetros recibidos del frontend
    const { 
      seed_genres = 'reggaeton,latin', 
      target_tempo, 
      target_energy, 
      target_valence, 
      limit = 20 
    } = req.body;

    const token = await getSpotifyToken();

    // Construimos la URL de recomendación de Spotify con los parámetros matemáticos
    const url = new URL(`${SPOTIFY_API_BASE}/recommendations`);
    url.searchParams.append('seed_genres', seed_genres);
    url.searchParams.append('limit', limit);
    
    // Si el usuario ajustó los sliders, añadimos los targets
    if (target_tempo) url.searchParams.append('target_tempo', target_tempo);
    if (target_energy) url.searchParams.append('target_energy', target_energy);
    if (target_valence) url.searchParams.append('target_valence', target_valence); // Valencia = "Vibe" (0 triste, 1 feliz)

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en la API de Spotify');
    }

    // Formateamos los tracks para el frontend de Quavemind
    const canciones = (data.tracks || []).map((track) => ({
      id: track.id,
      nombre: track.name,
      artista: track.artists[0]?.name || 'Desconocido',
      imagen: track.album?.images[0]?.url || '/default.png',
      preview: track.preview_url,
      duracion: track.duration_ms,
      spotifyUrl: track.external_urls?.spotify,
    }));

    res.json({ status: 'ok', playlist: canciones });

  } catch (error) {
    console.error('Error generando playlist:', error);
    res.status(500).json({ status: 'error', mensaje: 'Fallo al computar la matriz de audio' });
  }
});

export default router;
