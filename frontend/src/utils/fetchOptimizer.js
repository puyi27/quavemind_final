import api from '../services/api';

/**
 * FetchOptimizer - Arquitectura de red de alto rendimiento para QUAVEMIND
 * 
 * Implementa una capa de caché en memoria y métodos defensivos para evitar re-renderizados
 * y tiempos de carga innecesarios.
 */

// Caché en memoria para evitar peticiones redundantes (TTL 30s)
const cache = new Map();
const CACHE_TTL = 30000; 

const getFromCache = (key) => {
  const item = cache.get(key);
  if (item && (Date.now() - item.timestamp < CACHE_TTL)) {
    return item.data;
  }
  return null;
};

const saveToCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const optimizedGet = async (endpoint, params = {}, fallback = { status: 'error', resultados: {} }) => {
  const cacheKey = `GET:${endpoint}:${JSON.stringify(params)}`;
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    console.debug(`[FetchOptimizer] Cache Hit: ${endpoint}`);
    return cachedData;
  }

  try {
    const response = await api.get(endpoint, { 
      params,
      responseType: 'json' 
    });
    saveToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.debug(`[FetchOptimizer] 404 Silenciado en ${endpoint}`);
    } else {
      console.warn(`[FetchOptimizer] GET ${endpoint} falló:`, error.message);
    }
    return fallback;
  }
};

export const optimizedPost = async (endpoint, data = {}, fallback = { status: 'error' }) => {
  try {
    const response = await api.post(endpoint, data, {
      responseType: 'json'
    });
    // Invalidamos caché relacionada si es necesario (ej: si es una mutación)
    return response.data;
  } catch (error) {
    console.warn(`[FetchOptimizer] POST ${endpoint} falló:`, error.message);
    return fallback;
  }
};

export const optimizedPut = async (endpoint, data = {}, fallback = { status: 'error' }) => {
  try {
    const response = await api.put(endpoint, data);
    // Invalidamos toda la caché en PUT para asegurar consistencia
    cache.clear();
    return response.data;
  } catch (error) {
    console.warn(`[FetchOptimizer] PUT ${endpoint} falló:`, error.message);
    return fallback;
  }
};

/**
 * Realiza múltiples peticiones en paralelo de forma segura.
 */
export const optimizedBatchGet = async (requests, fallback = null) => {
  const promises = requests.map(async ({ endpoint, params = {} }) => {
    return optimizedGet(endpoint, params, fallback);
  });

  const results = await Promise.allSettled(promises);
  return results.map(result => result.status === 'fulfilled' ? result.value : fallback);
};

/**
 * Búsqueda optimizada para el componente Radar y Buscador.
 */
export const searchArtistsOptimized = async (query, tipo = 'artistas', limit = 20) => {
  try {
    const data = await optimizedGet('/music/buscar', { q: query, tipo, limit });
    const res = data?.[tipo] || data?.artistas || data?.canciones || data?.albumes || [];
    return Array.isArray(res) ? res : [];
  } catch (error) {
    return [];
  }
};

/**
 * Carga masiva de artistas con chunking
 */
export const fetchArtistasBulkOptimized = async (nombres, chunkSize = 5) => {
  if (!nombres || nombres.length === 0) return [];
  
  const results = [];
  for (let i = 0; i < nombres.length; i += chunkSize) {
    const chunk = nombres.slice(i, i + chunkSize);
    try {
      const data = await optimizedGet('/music/artistas/bulk', { nombres: chunk.join(',') });
      if (data?.status === 'ok') {
        results.push(...(data.data || data.artistas || []));
      }
    } catch (error) {
      console.warn('[FetchOptimizer] Chunk de artistas fallido');
    }
  }
  return results.filter(a => a && a.id);
};

export const fetchStatsOptimized = async (artistas) => {
  if (!artistas || artistas.length === 0) return [];
  try {
    const data = await optimizedPost('/music/artists-real-stats/bulk', {
      artistas: artistas.map(a => ({ id: a.id, nombre: a.nombre }))
    });
    return data?.data || [];
  } catch (error) {
    return [];
  }
};

const fetchOptimizer = {
  get: optimizedGet,
  post: optimizedPost,
  put: optimizedPut,
  batchGet: optimizedBatchGet,
  searchArtists: searchArtistsOptimized,
  fetchArtistasBulk: fetchArtistasBulkOptimized,
  fetchStats: fetchStatsOptimized
};

export default fetchOptimizer;