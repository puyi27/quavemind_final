import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000
});

const cache = new Map();
const CACHE_TIME = 1000 * 60 * 5; // 5 minutos

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quave_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Solo cacheamos peticiones GET que no sean de autenticación
  if (config.method === 'get' && !config.url.includes('/auth/me')) {
    const cached = cache.get(config.url);
    if (cached && (Date.now() - cached.timestamp < CACHE_TIME)) {
      console.log(`[CACHE] Hit: ${config.url}`);
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      });
    }
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => {
    // Guardar en caché si es una petición GET exitosa
    if (response.config.method === 'get' && !response.config.url.includes('/auth/me')) {
      cache.set(response.config.url, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    const { status } = error.response || {};
    if (status === 401) {
      localStorage.removeItem('quave_token');
    }
    return Promise.reject(error);
  }
);

export default api;