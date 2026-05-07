import { useState, useRef } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export const useToggleFavorito = () => {
  const [isLoading, setIsLoading] = useState(false);
  const isProcessing = useRef(false);

  const toggleFavorito = async (itemId, tipo, snapshot) => {
    // Prevenir llamadas duplicadas
    if (isProcessing.current) {
      return { success: false, isAuthError: false, error: 'Petición en proceso' };
    }

    isProcessing.current = true;
    setIsLoading(true);

    try {
      const res = await api.post('/vault/favoritos/toggle', {
        itemId,
        tipo,
        snapshot
      });

      // Actualizar puntos si se reciben
      if (res.data.totalPuntos !== undefined) {
        useAuthStore.getState().updatePoints(res.data.totalPuntos);
      }

      return { 
        success: true, 
        isAuthError: false,
        data: res.data 
      };
    } catch (err) {
      // SILENCIAR 401 - Retornar estructura controlada
      if (err.response?.status === 401 || err.isAuthError) {
        return { 
          success: false, 
          isAuthError: true, 
          error: 'Se requiere iniciar sesión' 
        };
      }
      
      // Otros errores
      return { 
        success: false, 
        isAuthError: false, 
        error: 'Error de conexión' 
      };
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
    }
  };

  return { toggleFavorito, isLoading };
};