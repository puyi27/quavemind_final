import axios from 'axios';

/**
 * Instancia maestra de Axios para QUAVEMIND
 * Gestiona automáticamente el JWT y la sesión con el backend
 */
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000 // 10s de margen para evitar bloqueos
});

// REQUEST INTERCEPTOR: Inyectar Token dinámicamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quave_token');
  if (token) {
    // Inyectamos el token en la cabecera para rutas protegidas
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// RESPONSE INTERCEPTOR: Manejo de sesión y errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};
    
    // Si recibimos un 401 Unauthorized
    if (status === 401) {
      // SOLO forzamos logout si la petición NO es la de comprobación inicial /auth/me
      // y si existe un token local (indicando que la sesión debería ser válida)
      const isCheckAuth = config.url.includes('/auth/me');
      const hasToken = !!localStorage.getItem('quave_token');

      if (!isCheckAuth && hasToken) {
        console.warn('[AUTH] Sesión invalidada por el servidor. Limpiando estado...');
        // Aquí podrías disparar un evento global o limpiar el storage
        // localStorage.clear(); // Descomentar si quieres reset total
      }
    }

    if (status === 404) {
      console.debug(`[API] 404 detectado en ${config.url}. Silenciando...`);
    }

    return Promise.reject(error);
  }
);

export default api;