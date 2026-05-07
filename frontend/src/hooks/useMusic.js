import { useQuery } from '@tanstack/react-query';
import { musicService } from '../services/musicService';

export const useSearch = (query, tipo, options = {}) => {
  return useQuery({
    queryKey: ['search', query, tipo],
    queryFn: () => musicService.buscar(query, tipo),
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

export const useArtista = (id, options = {}) => {
  return useQuery({
    queryKey: ['artista', id],
    queryFn: () => musicService.getArtista(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options
  });
};

export const useTrendingArtistas = (nombres, options = {}) => {
  return useQuery({
    queryKey: ['trending-artistas', nombres],
    queryFn: () => musicService.getBulkArtistas(nombres),
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options
  });
};
export const useDiscovery = (terms, options = {}) => {
  return useQuery({
    queryKey: ['discovery', terms],
    queryFn: async () => {
      const results = await Promise.all(
        terms.slice(0, 3).map(term => musicService.buscar(term, 'artistas', 50))
      );
      // Combinar y filtrar artistas únicos
      const allArtistas = results.flatMap(r => r.artistas || []);
      const uniqueArtistas = Array.from(new Map(allArtistas.map(a => [a.id, a])).values());
      return uniqueArtistas;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options
  });
};
