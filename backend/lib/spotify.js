const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '72d3c40165884d6396ff2ef86a01ffb1';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '52a4b60ab1e14ece818cc51309f24d4d';
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
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      
      // Manejar respuestas sin contenido (204 No Content)
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
        // Reintentar solo en errores temporales (429 o 5xx)
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          continue;
        }
        throw new Error(message);
      }
      return data;
    } catch (error) {
      lastError = error;
      if (attempt >= retries) throw lastError;
      // Pequeña espera antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError || new Error('Error de red inesperado');
};

export { SPOTIFY_API_BASE };
