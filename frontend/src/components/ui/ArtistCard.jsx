import { Link } from 'react-router-dom';
import { MdPerson, MdVerified } from 'react-icons/md';
import { useQueryClient } from '@tanstack/react-query';
import { musicService } from '../../services/musicService';

export default function ArtistCard({ artist, featured = false }) {
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['artista', artist.id],
      queryFn: () => musicService.getArtista(artist.id),
      staleTime: 60000,
    });
  };

  const displayImage = artist.imagen_small || artist.imagen || '/placeholder-artist.jpg';

  return (
    <Link 
      to={`/artista/${artist.id}`}
      onMouseEnter={handlePrefetch}
      className={`group block ${featured ? 'col-span-2 row-span-2' : ''}`}
    >
      <div className="neo-card overflow-hidden h-full">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={displayImage}
            alt={artist.nombre}
            loading="lazy"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          {artist.esVerificado && (
            <div className="absolute top-3 right-3 bg-[var(--color-quave-orange)] p-1.5 border-2 border-black"
                 style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}>
              <MdVerified className="text-black text-sm" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 text-xs font-mono text-white/80">
              <span className="bg-black/50 px-2 py-1">
                {(artist.seguidores / 1000000).toFixed(1)}M seguidores
              </span>
              <span className="bg-[var(--color-quave-orange)] px-2 py-1 text-black">
                {artist.popularidad || 0}% popularidad
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold truncate group-hover:text-[var(--color-quave-orange)] transition-colors ${featured ? 'text-xl' : 'text-lg'}`}>
                {artist.nombre}
              </h3>
              
              {artist.generos && artist.generos.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {artist.generos.slice(0, 2).map((genero, i) => (
                    <span key={i} className="neo-badge text-[10px]">
                      {genero}
                    </span>
                  ))}
                </div>
              )}
              
              {featured && artist.bio && (
                <p className="mt-3 text-sm line-clamp-2 text-[var(--text-secondary)]">
                  {artist.bio}
                </p>
              )}
            </div>
            
            <div className="w-10 h-10 bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] flex items-center justify-center group-hover:bg-[var(--color-quave-orange)] group-hover:border-black transition-colors">
              <MdPerson className="text-lg group-hover:text-black" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-0 h-1 bg-[var(--color-quave-orange)] group-hover:w-full transition-all duration-500" />
      </div>
    </Link>
  );
}