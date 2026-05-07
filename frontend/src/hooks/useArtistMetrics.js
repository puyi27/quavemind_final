import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useArtistMetrics = (artistId) => {
  return useQuery({
    queryKey: ['artistMetrics', artistId],
    queryFn: async () => {
      const { data } = await api.get(`/music/artist-real-stats/${artistId}`);
      return data.data;
    },
    enabled: !!artistId,
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
  });
};
