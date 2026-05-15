import { Link } from 'react-router-dom';
import { 
  MdAlbum, MdGraphicEq, MdGridView, MdPersonSearch, 
  MdLyrics, MdWhatshot, MdTimer, MdPlaylistPlay, MdTrendingUp
} from 'react-icons/md';

const games = [
  {
    slug: 'songdle',
    title: 'SONGDLE',
    description: 'Escucha el preview de audio y adivina el track.',
    icon: <MdGraphicEq className="text-5xl text-white" />,
    color: 'from-purple-600 to-pink-600',
    shadow: 'hover:shadow-[0_0_40px_rgba(219,39,119,0.3)]'
  },
  {
    slug: 'artist',
    title: 'ARTISTADLE',
    description: 'Descifra la foto pixelada. Se aclara con cada fallo.',
    icon: <MdPersonSearch className="text-5xl text-white" />,
    color: 'from-green-600 to-emerald-600',
    shadow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]'
  },
  {
    slug: 'cover',
    title: 'PORTADA',
    description: 'Destapa la cuadrícula para ver el arte del disco.',
    icon: <MdGridView className="text-5xl text-white" />,
    color: 'from-orange-600 to-red-600',
    shadow: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]'
  },
  {
    slug: 'lyrics',
    title: 'LYRICSDLE',
    description: 'Lee el verso icónico y descubre la canción.',
    icon: <MdLyrics className="text-5xl text-white" />,
    color: 'from-pink-600 to-rose-600',
    shadow: 'hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]'
  },
];

const modos = [
  {
    slug: 'maraton',
    title: 'MARATÓN (10x)',
    description: 'Racha de 10 canciones sin límite de tiempo.',
    icon: <MdPlaylistPlay className="text-5xl text-[#ff6b00]" />,
    bg: 'bg-[#111]',
    shadow: 'hover:shadow-[0_0_40px_rgba(255,107,0,0.15)]'
  },
  {
    slug: 'contrarreloj',
    title: 'CONTRARRELOJ',
    description: 'Pánico total. 30 segundos por canción.',
    icon: <MdTimer className="text-5xl text-red-500" />,
    bg: 'bg-[#1a0505]',
    shadow: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]'
  },
];

const Quavedle = () => {
  return (
    <div className="min-h-screen bg-[#050505] py-10 sm:py-14 px-3 sm:px-4">
      <div className="container-quave">
        
        {/* Cabecera Quave */}
        <div className="text-center mb-12 sm:mb-20 relative">
          <MdTrendingUp className="absolute left-1/2 -top-6 sm:-top-10 -translate-x-1/2 text-[8rem] sm:text-[15rem] text-white opacity-5" />
          <div className="relative z-10">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
              QUAVE<span className="text-[#ff6b00]">DLE</span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-lg md:text-xl font-bold tracking-[0.12em] sm:tracking-widest uppercase mt-3 sm:mt-4">
              La Sala de Entrenamiento Auditivo
            </p>
          </div>
        </div>

        {/* Juegos Principales */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-black uppercase mb-6 sm:mb-8 flex items-center gap-3 text-white pl-1 sm:pl-4">
            <MdWhatshot className="text-[#ff6b00]" />
            Simulaciones Diarias
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {games.map((game) => (
              <Link
                key={game.slug}
                to={`/quavedle/${game.slug}`}
                className={`group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] aspect-[4/3] transition-all duration-500 ${game.shadow} hover:-translate-y-2`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="relative h-full p-5 sm:p-8 flex flex-col justify-end">
                  <div className="mb-auto transform group-hover:scale-110 transition-transform duration-500 origin-top-left">
                    {game.icon}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">{game.title}</h3>
                  <p className="text-[10px] sm:text-sm font-bold text-white/80 uppercase tracking-[0.12em] sm:tracking-widest">{game.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Modos Especiales */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-black uppercase mb-6 sm:mb-8 flex items-center gap-3 text-white pl-1 sm:pl-4">
            <MdTimer className="text-red-500" />
            Desafíos Especiales
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {modos.map((modo) => (
              <Link
                key={modo.slug}
                to={`/quavedle/${modo.slug}`}
                className={`group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 transition-all duration-500 ${modo.bg} border border-white/5 ${modo.shadow} hover:-translate-y-2 flex items-center gap-4 sm:gap-6`}
              >
                <div className="shrink-0 transform group-hover:scale-110 transition-transform duration-500">
                  {modo.icon}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{modo.title}</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.12em] sm:tracking-widest">{modo.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Quavedle;
