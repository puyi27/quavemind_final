import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

export function useSpotifySearch(query, type = 'artist') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/music/buscar-spotify?q=${encodeURIComponent(query)}&type=${type}`
        );
        const result = await response.json();
        if (result.status === 'ok') {
          setData(result.resultados);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, type]);

  return { data, loading, error };
}

export function useArtistaDetail(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Primero intentar de la BD local
        const localRes = await fetch(`${API_URL}/music/artista/${id}`);
        const localData = await localRes.json();
        
        if (localData.status === 'ok') {
          setData(localData.artista);
        } else {
          // Si no está en BD, importar de Spotify
          const importRes = await fetch(`${API_URL}/music/importar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, tipo: 'artist' })
          });
          const importData = await importRes.json();
          if (importData.status === 'ok') {
            setData(importData.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading };
}