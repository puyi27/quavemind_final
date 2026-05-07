import { getCachedData, cacheData } from './redis.js';
import { getSpotifyToken, SPOTIFY_API_BASE, fetchJsonWithRetry } from './spotify.js';

// ─── ESTADO GLOBAL ─────────────────────────────────────────────────────────
let webPlayerToken = null;
let webPlayerTokenExpiresAt = 0;
// Bandera global para suprimir logs repetitivos cuando la API falla
let partnerApiFailed = false;

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

// ─── TOKEN DEL WEB PLAYER DE SPOTIFY ────────────────────────────────────────
/**
 * Obtiene el access token anónimo del web player de Spotify.
 * Este endpoint es público y no requiere credenciales de usuario.
 * Funciona con el Bearer que usa el propio open.spotify.com
 */
const getWebPlayerToken = async () => {
  if (webPlayerToken && Date.now() < webPlayerTokenExpiresAt) return webPlayerToken;

  try {
    const res = await fetch(
      'https://open.spotify.com/get_access_token?reason=transport&productType=web_player',
      {
        headers: {
          ...FETCH_HEADERS,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(6000)
      }
    );

    if (!res.ok) {
      if (!partnerApiFailed) console.warn(`[STATS] Web player token HTTP ${res.status} - usando fallback de seguidores`);
      partnerApiFailed = true;
      return null;
    }

    const data = await res.json();
    if (data?.accessToken) {
      webPlayerToken = data.accessToken;
      // Los tokens del web player duran ~1 hora
      const expiresMs = data.accessTokenExpirationTimestampMs
        ? data.accessTokenExpirationTimestampMs - Date.now() - 60000
        : 55 * 60 * 1000;
      webPlayerTokenExpiresAt = Date.now() + Math.max(expiresMs, 0);
      partnerApiFailed = false;
      return webPlayerToken;
    }
  } catch (e) {
    if (!partnerApiFailed) console.warn('[STATS] Error obteniendo web player token:', e.message);
    partnerApiFailed = true;
  }
  return null;
};

// ─── API PARTNER (GRAPHQL) ────────────────────────────────────────────────
const getMonthlyListenersFromPartnerAPI = async (artistId) => {
  if (partnerApiFailed) return null;

  try {
    const token = await getWebPlayerToken();
    if (!token) return null;

    const variables = encodeURIComponent(JSON.stringify({ uri: `spotify:artist:${artistId}` }));
    const extensions = encodeURIComponent(JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash: '591ed473fa2f5426186f8ba52dee295fe1ce12b99da884d888e29f41b17b8480'
      }
    }));

    const url = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&variables=${variables}&extensions=${extensions}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'app-platform': 'WebPlayer',
        'spotify-app-version': '1.2.46.25.ga2b0a556',
        ...FETCH_HEADERS
      },
      signal: AbortSignal.timeout(8000)
    });

    if (res.status === 401) {
      // Token caducado — forzar renovación en la siguiente llamada
      webPlayerToken = null;
      webPlayerTokenExpiresAt = 0;
      return null;
    }

    if (!res.ok) return null;

    const json = await res.json();
    const stats = json?.data?.artistUnion?.stats;

    if (stats?.monthlyListeners && typeof stats.monthlyListeners === 'number' && stats.monthlyListeners > 0) {
      console.log(`[STATS] ✅ Oyentes reales para ${artistId}: ${stats.monthlyListeners.toLocaleString()}`);
      return stats.monthlyListeners;
    }
  } catch (e) {
    // Silencioso — el fallback se encargará
  }
  return null;
};

// ─── FALLBACK: SCRAPING HTML ──────────────────────────────────────────────
const parseMonthlyListenersFromHtml = (html) => {
  if (!html) return null;

  // Intentar extraer de __NEXT_DATA__ (estructura actual de Spotify)
  const nextDataPatterns = [
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i,
    /<script type="application\/json" id="__NEXT_DATA__">([\s\S]*?)<\/script>/i,
  ];

  for (const pattern of nextDataPatterns) {
    try {
      const match = html.match(pattern);
      if (!match?.[1]) continue;
      const data = JSON.parse(match[1]);
      const ml = deepFind(data, 'monthlyListeners', 0);
      if (ml && typeof ml === 'number' && ml > 0) return ml;
    } catch {}
  }

  // JSON de initial-state (versión más antigua)
  try {
    const match = html.match(/<script[^>]+id="initial-state"[^>]*>([^<]+)<\/script>/i);
    if (match?.[1]) {
      const data = JSON.parse(match[1]);
      const ml = deepFind(data, 'monthlyListeners', 0);
      if (ml && typeof ml === 'number' && ml > 0) return ml;
    }
  } catch {}

  // Regex como último recurso
  const regexes = [
    /"monthlyListeners"\s*:\s*(\d{4,})/,
    /"monthly_listeners"\s*:\s*(\d{4,})/,
    /(\d[\d,.]+)\s+monthly listeners/i,
  ];
  for (const re of regexes) {
    const m = html.match(re);
    if (m?.[1]) {
      const n = parseInt(m[1].replace(/[^\d]/g, ''), 10);
      if (n > 1000 && n < 200_000_000) return n;
    }
  }
  return null;
};

// Búsqueda recursiva con límite de profundidad
const deepFind = (obj, key, depth) => {
  if (!obj || typeof obj !== 'object' || depth > 12) return null;
  if (key in obj && typeof obj[key] === 'number' && obj[key] > 0) return obj[key];
  for (const k of Object.keys(obj)) {
    const r = deepFind(obj[k], key, depth + 1);
    if (r) return r;
  }
  return null;
};

let scrapingLimited = false;
let scrapingResetTimer = null;

const scrapeFallback = async (artistId) => {
  if (scrapingLimited) return null;

  try {
    const res = await fetch(`https://open.spotify.com/artist/${artistId}`, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10000)
    });

    if (res.status === 429) {
      scrapingLimited = true;
      if (scrapingResetTimer) clearTimeout(scrapingResetTimer);
      scrapingResetTimer = setTimeout(() => { scrapingLimited = false; }, 300000); // 5min cooldown
      return null;
    }

    if (res.ok) {
      const html = await res.text();
      return parseMonthlyListenersFromHtml(html);
    }
  } catch {}
  return null;
};

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────
export const getRealArtistStats = async (id) => {
  const cacheKey = `artist:stats:v4:${id}`;
  try {
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;
  } catch {}

  let monthlyListeners = null;
  let followers = 0;
  let popularity = 0;
  let bio = null;

  // 1. API Oficial de Spotify — siempre disponible (seguidores y popularidad)
  try {
    const token = await getSpotifyToken();
    const artistData = await fetchJsonWithRetry(`${SPOTIFY_API_BASE}/artists/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (artistData) {
      followers = artistData.followers?.total || 0;
      popularity = artistData.popularity || 0;
    }
  } catch {}

  // 2. API Partner via web player token (oyentes mensuales reales)
  monthlyListeners = await getMonthlyListenersFromPartnerAPI(id);

  // 3. Fallback: scraping HTML de open.spotify.com
  if (!monthlyListeners) {
    monthlyListeners = await scrapeFallback(id);
  }

  const hasRealStats = monthlyListeners !== null && monthlyListeners > 0;
  const value = {
    listeners: hasRealStats ? monthlyListeners : followers,
    bio,
    followers,
    popularity,
    verificado: hasRealStats
  };

  try {
    // 12h si tenemos dato real, 20min si solo tenemos fallback de seguidores
    await cacheData(cacheKey, value, hasRealStats ? 43200 : 1200);
  } catch {}

  return value;
};
