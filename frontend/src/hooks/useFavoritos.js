import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export const useFavoritos = (itemId, tipo) => {
  const [esFavorito, setEsFavorito] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Obtener estado de autenticación desde el store
    const { isAuthenticated } = useAuthStore.getState();
    
    const checkFavorito = async () => {
      // Early Return: Si no hay item o no hay sesión, abortamos la petición
      if (!itemId || !isAuthenticated) {
        setEsFavorito(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const res = await api.get('/vault/favoritos');
        
        if (!isMounted.current) return;
        
        const favoritos = res.data.favoritos || [];
        setEsFavorito(favoritos.some(f => f.itemId === itemId && f.tipo === tipo));
      } catch (err) {
        if (!isMounted.current) return;
        
        // SILENCIAR errores - Estado neutral seguro
        if (err.response?.status === 401 || err.isAuthError) {
          useAuthStore.setState({ isAuthenticated: false, user: null });
        }
        setEsFavorito(false);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    checkFavorito();
    
    return () => {
      isMounted.current = false;
    };
  }, [itemId, tipo]);

  return { esFavorito, setEsFavorito, isLoading };
};