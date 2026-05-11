import { getCachedData, cacheData } from './redis.js';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

let cachedToken = null;
let tokenExpiresAt = 0;

export const getSpotifyToken = async () => {
  try {
    if (cachedToken && Date.now() < tokenExpiresAt) {
      return cachedToken;
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) throw new Error('Faltan las credenciales de Spotify');
    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
        Authorization: `Basic ${credentials}` 
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) throw new Error(data.error?.message || 'Fallo de token');
    
    cachedToken = data.access_token;
    // Cachear por 50 minutos (Spotify suele dar 1 hora)
    tokenExpiresAt = Date.now() + (50 * 60 * 1000); 
    return cachedToken;
  } catch (error) {
    console.error('CRITICAL: Error obteniendo Spotify Token:', error.message);
    throw error;
  }
};

export const fetchJsonWithRetry = async (url, options = {}, retries = 1) => {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const cacheKey = isGet ? `spotify_cache:${url}` : null;

  if (cacheKey) {
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;
  }

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 204) return null;

      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Error de red: HTTP ${response.status} - ${text.substring(0, 100)}`);
        }
        return text;
      }

      if (!response.ok) {
        const message = data?.error?.message || data?.mensaje || `HTTP ${response.status}`;
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          continue;
        }
        throw new Error(message);
      }

      // Cachear resultados exitosos de GET por 1 hora
      if (cacheKey && data) {
        await cacheData(cacheKey, data, 3600);
      }

      return data;
    } catch (error) {
      lastError = error;
      if (attempt >= retries) throw lastError;
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError || new Error('Error de red inesperado');
};

export { SPOTIFY_API_BASE };
