import api from './api';

export const musicService = {
  buscar: async (query, tipo = 'todos', limit = 50) => {
    const tipoSpotify = tipo === 'todos' ? 'artist,track,album' : 
                       tipo === 'artistas' ? 'artist' : 
                       tipo === 'canciones' ? 'track' : 'album';
    
    try {
      const response = await api.get('/music/buscar', {
        params: { q: query, tipo: tipoSpotify, limit }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return [];
      return [];
    }
  },

  getArtista: async (id) => {
    try {
      const response = await api.get(`/music/artista/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`[MusicService] Artista no encontrado: ${id}`);
        return { status: 'error', mensaje: 'Artista no disponible' };
      }
      throw error;
    }
  },

  getBulkArtistas: async (nombres) => {
    try {
      const response = await api.get('/music/artistas/bulk', {
        params: { nombres }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { status: 'ok', artistas: [] };
      }
      throw error;
    }
  },

  getCancion: async (id) => {
    try {
      const response = await api.get(`/music/cancion/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`[MusicService] Canción no encontrada: ${id}`);
        return { status: 'error', mensaje: 'Canción no disponible' };
      }
      throw error;
    }
  },

  getAlbum: async (id) => {
    try {
      const response = await api.get(`/music/album/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`[MusicService] Álbum no encontrado: ${id}`);
        return { status: 'error', mensaje: 'Álbum no disponible' };
      }
      throw error;
    }
  }
};
