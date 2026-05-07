import axios from 'axios';

/**
 * Instancia maestra de Axios para QUAVEMIND
 * Forzamos ruta relativa '/api' para que el proxy de Vite (5173 -> 3000) 
 * gestione correctamente las cookies, cabeceras y evite errores de CORS.
 */
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000
});

// REQUEST INTERCEPTOR: Inyectar Token JWT globalmente para todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quave_token');
  
  if (token) {
    // Compatibilidad total con Axios 0.x y 1.x
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// RESPONSE INTERCEPTOR: Manejo inteligente de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};
    
    if (status === 401) {
      // Ignoramos el 401 si viene de un intento de login
      if (config && config.url && config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      console.warn(`[AUTH] 401 en ${config?.url}. Sesión expirada.`);
      localStorage.removeItem('quave_user');
      localStorage.removeItem('quave_token');
      localStorage.removeItem('quave_logged_in');
      
      // Eliminamos el window.location.href brusco para que React Router (ProtectedRoute)
      // se encargue de expulsar al usuario sin recargar la página entera.
      // Así podremos ver el error en la consola si algo falla.
      error.isAuthError = true;
    }
    
    return Promise.reject(error);
  }
);

export default api;