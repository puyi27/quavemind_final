import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('quave_user')) || null,
  isAuthenticated: !!localStorage.getItem('quave_logged_in'),
  loading: !!localStorage.getItem('quave_token'),

  login: (userData, token) => {
    if (token) localStorage.setItem('quave_token', token);
    localStorage.setItem('quave_user', JSON.stringify(userData));
    localStorage.setItem('quave_logged_in', 'true');
    set({ user: userData, isAuthenticated: true });
  },

  updatePoints: (newPoints) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, quavePoints: newPoints };
      localStorage.setItem('quave_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  updateUser: (userData) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...userData };
      localStorage.setItem('quave_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('quave_user');
      localStorage.removeItem('quave_token');
      localStorage.removeItem('quave_logged_in');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('quave_token');
    if (!token) {
      set({ loading: false });
      return;
    }
    
    set({ loading: true });
    try {
      const res = await api.get('/auth/me');
      if (res.data.status === 'ok') {
        const usuario = res.data.usuario || res.data.user;
        localStorage.setItem('quave_user', JSON.stringify(usuario));
        localStorage.setItem('quave_logged_in', 'true');
        set({ user: usuario, isAuthenticated: true, loading: false });
      }
    } catch (error) {
      // Manejo silencioso: El 401 indica que el token expiró o es inválido.
      if (error.response?.status === 401) {
        localStorage.removeItem('quave_token');
        localStorage.removeItem('quave_user');
        localStorage.removeItem('quave_logged_in');
        set({ user: null, isAuthenticated: false, loading: false });
      } else {
        console.error('[AUTH] Error en verificación:', error.message);
        set({ user: null, isAuthenticated: false, loading: false });
      }
    }
  }
}));
