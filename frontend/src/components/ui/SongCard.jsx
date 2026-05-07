import { Link } from 'react-router-dom';
import { MdPlayArrow, MdPause, MdExplicit } from 'react-icons/md';

export default function SongCard({ song, showAlbum = true, compact = false }) {
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <Link 
        to={`/cancion/${song.id}`}
        className="group flex items-center gap-3 p-3 bg-[var(--bg-card)] border-2 border-[var(--border-primary)] hover:border-[var(--color-quave-orange)] transition-all"
        style={{ boxShadow: 'var(--shadow-neo)' }}
      >
        <div className="relative w-12 h-12 overflow-hidden flex-shrink-0">
          <img
            src={song.album_imagen || '/placeholder-album.jpg'}
            alt={song.nombre}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <MdPlayArrow className="text-white text-xl" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate group-hover:text-[var(--color-quave-orange)] transition-colors">
            {song.nombre}
          </h4>
          <p className="text-xs font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
            {song.artista_nombre}
          </p>
        </div>
        
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {formatDuration(song.duracion)}
        </span>
      </Link>
    );
  }

  return (
    <Link 
      to={`/cancion/${song.id}`}
      className="group block bg-[var(--bg-card)] border-2 border-[var(--border-primary)] hover:border-[var(--color-quave-orange)] transition-all hover:-translate-y-1"
      style={{ boxShadow: 'var(--shadow-neo)' }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={song.album_imagen || '/placeholder-album.jpg'}
          alt={song.nombre}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-16 h-16 bg-[var(--color-quave-orange)] border-2 border-black flex items-center justify-center hover:scale-110 transition-transform"
                  style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
            <MdPlayArrow className="text-black text-3xl" />
          </button>
        </div>

        {/* Explicit Badge */}
        {song.explicit && (
          <div className="absolute top-2 left-2 bg-black/80 p-1">
            <MdExplicit className="text-[var(--color-quave-orange)] text-sm" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold truncate group-hover:text-[var(--color-quave-orange)] transition-colors">
          {song.nombre}
        </h3>
        
        <p className="text-sm font-mono mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>
          {song.artista_nombre}
        </p>

        {showAlbum && song.album_nombre && (
          <p className="text-xs font-mono mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
            {song.album_nombre}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-primary)]">
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {formatDuration(song.duracion)}
          </span>
          
          {song.bpm && (
            <span className="text-[10px] font-mono px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
              {Math.round(song.bpm)} BPM
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}