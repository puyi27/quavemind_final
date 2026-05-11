import { useState, useEffect } from 'react';
import fetchOptimizer from '../utils/fetchOptimizer';

export const useSearch = (query, tipo) => {
    const [artistas, setArtistas] = useState([]);
    const [canciones, setCanciones] = useState([]);
    const [albumes, setAlbumes] = useState([]);
    const [artistaDestacado, setArtistaDestacado] = useState(null);
    const [cancionDestacada, setCancionDestacada] = useState(null);
    const [albumDestacado, setAlbumDestacado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Función para hidratar artistas con oyentes reales usando el optimizador
    const hidratarArtistas = async (lista) => {
        if (!lista || lista.length === 0) return lista;
        const stats = await fetchOptimizer.fetchStats(lista);
        
        if (!stats || stats.length === 0) return lista;

        const statsMap = new Map(stats.map(s => [s.id, s]));
        return lista.map(art => {
            const real = statsMap.get(art.id);
            return {
                ...art,
                oyentesReales: real?.oyentesMensuales || null,
                oyentesVerificados: Boolean(real?.verificado)
            };
        });
    };

    const fetchDestacados = async () => {
        setArtistas([]);
        setCanciones([]);
        setAlbumes([]);
        setArtistaDestacado(null);
        setCancionDestacada(null);
        setAlbumDestacado(null);
        setLoading(false);
    };

    const cargarDatosArtista = async (artistaId) => {
        const data = await fetchOptimizer.get(`/music/artista/${artistaId}`);
        if (data?.status === 'ok') {
            setCanciones(data.canciones?.slice(0, 6) || []);
            setAlbumes(data.albumes?.slice(0, 6) || []);
            
            if (data.artista) {
                setArtistaDestacado(prev => prev ? ({
                    ...prev,
                    oyentesReales: data.artista.oyentesMensuales,
                    oyentesVerificados: data.artista.oyentesVerificados
                }) : null);
            }
        }
    };

    const buscarTodo = async () => {
        if (!query || query.length < 2) return;

        setLoading(true);
        setError(null);

        const tipoSpotify = tipo === 'todos' ? 'artist,track,album' :
            tipo === 'artistas' ? 'artist' :
                tipo === 'canciones' ? 'track' : 'album';

        try {
            const data = await fetchOptimizer.get('/music/buscar', {
                q: query,
                tipo: tipoSpotify,
                limit: 50
            });

            if (data?.status === 'ok') {
                const { artistas: arts, canciones: cans, albumes: albs } = data || {};

                const queryLower = query.toLowerCase();
                
                // Artista destacado
                const artistaExacto = arts?.find(a =>
                    a.nombre?.toLowerCase() === queryLower ||
                    a.nombre?.toLowerCase().includes(queryLower)
                );
                if (artistaExacto && tipo === 'todos') {
                    setArtistaDestacado(artistaExacto);
                    await cargarDatosArtista(artistaExacto.id);
                } else {
                    setArtistaDestacado(null);
                }

                // Cancion destacada (mejor match)
                const cancionExacta = cans?.find(c =>
                    c.nombre?.toLowerCase() === queryLower ||
                    c.nombre?.toLowerCase().includes(queryLower)
                );
                setCancionDestacada(tipo === 'todos' ? (cancionExacta || null) : null);

                // Album destacado (mejor match)
                const albumExacto = albs?.find(a =>
                    a.nombre?.toLowerCase() === queryLower ||
                    a.nombre?.toLowerCase().includes(queryLower)
                );
                setAlbumDestacado(tipo === 'todos' ? (albumExacto || null) : null);

                const finalArts = arts?.slice(0, 12) || [];
                setArtistas(finalArts);
                setCanciones(cans?.slice(0, 12) || []);
                setAlbumes(albs?.slice(0, 12) || []);

                if (finalArts.length > 0) {
                    hidratarArtistas(finalArts).then(setArtistas);
                }
            } else {
                setArtistas([]);
                setCanciones([]);
                setAlbumes([]);
                setArtistaDestacado(null);
                setCancionDestacada(null);
                setAlbumDestacado(null);
            }
        } catch (err) {
            console.error('[useSearch] Fallo crítico:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!query || query.length < 2) {
            if (!hasSearched) {
                fetchDestacados();
            }
            return;
        }

        setHasSearched(true);
        buscarTodo();
    }, [query, tipo]);

    const clearSearch = () => {
        setHasSearched(false);
        fetchDestacados();
    };

    return {
        artistas,
        canciones,
        albumes,
        artistaDestacado,
        cancionDestacada,
        albumDestacado,
        loading,
        error,
        hasSearched,
        clearSearch
    };
};