import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export const useVault = () => {
  const [data, setData] = useState({
    valoraciones: [],
    favoritos: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);
    setError(null);

    const fetchVaultData = async () => {
      // SOLUCIÓN FALLO 3:
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return;

      try {
        const [resValoraciones, resFavoritos] = await Promise.all([
          api.get('/vault/valoraciones'),
          api.get('/vault/favoritos')
        ]);

        if (!isMounted.current) return;

        setData({
          valoraciones: resValoraciones.data?.valoraciones || [],
          favoritos: resFavoritos.data?.favoritos || []
        });
        setError(null);
      } catch (err) {
        if (!isMounted.current) return;
        
        // SILENCIAR 401 - Devolver estados neutrales
        if (err.response?.status === 401 || err.isAuthError) {
          useAuthStore.setState({ isAuthenticated: false, user: null });
          setData({ valoraciones: [], favoritos: [] });
          setError(null); // No es un error real, es usuario invitado
        } else {
          setError({ type: 'NETWORK_ERROR', message: 'Error de conexión' });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchVaultData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return { 
    valoraciones: data.valoraciones, 
    favoritos: data.favoritos, 
    isLoading, 
    error 
  };
};