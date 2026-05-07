import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MdSearch, MdTrendingUp, MdPerson, MdAlbum, 
  MdMusicNote, MdArrowForward, MdPlayArrow,
  MdLocationOn, MdGames, MdPeople, MdNewReleases,
  MdMap, MdEmojiEvents, MdStar, MdHeadset,
  MdGraphicEq, MdSpeaker, MdRadio, MdLanguage,
  MdVideogameAsset, MdNightlight, MdSunny, MdWater,
  MdLocalFireDepartment, MdElectricBolt, MdStyle,
  MdMic, MdQueueMusic, MdWhatshot, MdTrendingFlat
} from 'react-icons/md';
import { GENEROS_DATA } from '../data/generosData';
import { ESCENAS_DATA } from '../data/escenasData';
import RecomendacionesDiarias from '../components/RecomendacionesDiarias';
import RankingQuave from '../components/RankingQuave';
import iconoLogo from '../assets/iconoLogo.png';
import { fetchArtistasBulk, buscarMusica } from '../services/musicApi';

// Iconos mapeados para géneros
const iconosGeneros = {
  'trap-latino': MdGraphicEq,
  'reggaeton': MdWhatshot,
  'hiphop-rap': MicIcon,
  'dembow': MdSpeaker,
  'rnb-latino': MdHeadset,
  'corridos-tumbados': MdLocalFireDepartment,
  'pop-urbano': MdStar,
  'electronica-latina': MdElectricBolt,
  'latin-alternative': MdStyle,
  'cumbia-urbana': MdWater,
  'dancehall-latino': MdSunny,
  'afrobeat-latino': MdLanguage,
};

// Icono de micrófono
function MicIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [topGlobal, setTopGlobal] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState(null);
  const [showAllRanking, setShowAllRanking] = useState(false);
  const [loading, setLoading] = useState(true);

  // Convertir datos a arrays para renderizar
  const generosArray = Object.entries(GENEROS_DATA).map(([id, data]) => ({
    id,
    ...data,
    icon: iconosGeneros[id] || MdMusicNote
  }));

  const escenasArray = Object.entries(ESCENAS_DATA).map(([id, data]) => ({
    id,
    ...data,
    artistasPreview: data.artistas?.establecidos?.slice(0, 3) || []
  }));

  useEffect(() => {
    fetchDatosReales();
  }, []);

  const fetchDatosReales = async () => {
    setLoading(true);
    try {
      // Ranking Global - Lista extendida
      const nombresTop = [
        'Bad Bunny', 'Karol G', 'Peso Pluma', 'J Balvin', 'Shakira', 
        'Rauw Alejandro', 'Feid', 'Bizarrap', 'Myke Towers', 'Ozuna',
        'Anuel AA', 'Maluma', 'Daddy Yankee', 'Don Omar', 'Quevedo',
        'Rosalia', 'Duki', 'Trueno', 'Mora', 'Eladio Carrion',
        'Young Miko', 'Rels B', 'Tini', 'Maria Becerra', 'Emilia',
        'Manuel Turizo', 'Nicky Jam', 'Sebastián Yatra', 'Sech', 'Jhayco'
      ];

      // 1. Cargar el TOP 10 primero para impacto inmediato
      const primeraTanda = await fetchArtistasBulk(nombresTop.slice(0, 10), 10);
      if (primeraTanda.success) {
        setTopGlobal(primeraTanda.artistas);
        setLoading(false); // Liberar UI lo antes posible
      }
      
      // 2. Cargar el resto en segundo plano sin bloquear
      fetchArtistasBulk(nombresTop.slice(10), 10).then(segundaTanda => {
        if (segundaTanda.success) {
          setTopGlobal(prev => {
            // Unir y eliminar duplicados por ID
            const map = new Map([...prev, ...segundaTanda.artistas].map(a => [a.id, a]));
            return Array.from(map.values());
          });
        }
      });

    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { 
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-24 md:pt-40 px-4 overflow-hidden">
        {/* Fondo Atmosférico Ligero (Zero Lag) */}
        <div className="absolute inset-0 bg-[#020205]" />
        
        {/* Usamos degradados radiales nativos en lugar de filtros Blur para máximo rendimiento */}
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `
                 radial-gradient(circle at 20% 30%, rgba(26, 26, 46, 0.4) 0%, transparent 50%),
                 radial-gradient(circle at 80% 70%, rgba(15, 23, 42, 0.4) 0%, transparent 50%),
                 radial-gradient(circle at 50% 50%, rgba(30, 27, 75, 0.2) 0%, transparent 70%)
               `
             }} 
        />
        
        {/* Cuadrícula técnica ultra-sutil y estática */}
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
               backgroundSize: '100px 100px'
             }} 
        />

        {/* Degradado inferior para fundir con el contenido de abajo */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-[5]" />
        
        <div className="relative z-10 text-center mb-8">
          {/* LOGO en lugar de icono de fuego */}
          <div className="mb-6">
            <img 
              src={iconoLogo}
              alt="QUAVEMIND" 
              className="w-32 h-32 mx-auto drop-shadow-[0_0_30px_rgba(255,107,0,0.5)]"
            />
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-4">
            <span className="text-white drop-shadow-[0_0_30px_rgba(255,107,0,0.5)]">QUAVE</span>
            <span className="text-[#ff6b00] drop-shadow-[0_0_30px_rgba(255,107,0,0.8)]">MIND</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">
            Toda la música urbana en un solo lugar
          </p>
        </div>

        {/* Buscador Hero */}
        <form onSubmit={handleSearch} className="relative z-10 w-full max-w-3xl mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b00] to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-[#111] border border-[#333] rounded-lg">
              <MdSearch className="ml-6 text-2xl text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca artistas, canciones, álbumes, jerga..."
                className="w-full bg-transparent text-white px-6 py-5 text-lg focus:outline-none"
              />
              <button 
                type="submit"
                className="mr-2 px-6 py-3 bg-[#ff6b00] text-black font-bold rounded hover:bg-[#ff8533] transition-colors"
              >
                BUSCAR
              </button>
            </div>
          </div>
        </form>

        {/* Hero Bottom Space */}
        <div className="h-12 md:h-24" />
      </section>

      {/* PICKS DEL DÍA - NUEVO COMPONENTE */}
      <section className="py-20 px-4 bg-black relative">
        <div className="absolute inset-0 bg-[#ff6b00]/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto">
          <RecomendacionesDiarias />
        </div>
      </section>

      {/* GÉNEROS MUSICALES */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ff6b00]/10 rounded-2xl">
                <MdQueueMusic className="text-4xl text-[#ff6b00]" />
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">GÉNEROS <span className="text-[#ff6b00]">POPULARES</span></h2>
                <p className="text-gray-500 max-w-md">Explora los estilos que están marcando tendencia</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {generosArray.map((genero) => (
              <Link 
                key={genero.id}
                to={`/genero/${genero.id}`}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                {/* Background with dynamic color */}
                <div className={`absolute inset-0 ${genero.color} opacity-40 group-hover:opacity-80 transition-all duration-700`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Abstract Shape / Glow */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 ${genero.color} blur-[80px] opacity-20 group-hover:opacity-50 transition-opacity`} />
                
                <div className="absolute top-6 right-6 opacity-30 group-hover:opacity-60 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                  <genero.icon className="text-8xl text-white" />
                </div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="transform group-hover:-translate-y-4 transition-transform duration-500">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:bg-[#ff6b00] group-hover:text-black transition-colors">
                      <genero.icon className="text-2xl text-white group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="font-black text-2xl text-white mb-2 leading-tight tracking-tight">{genero.nombre}</h3>
                    <p className="text-sm text-white/60 mb-4 line-clamp-2 font-medium">{genero.descripcion}</p>
                    
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
                      <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">{genero.bpm} BPM</span>
                      <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">{genero.origen}</span>
                    </div>
                    
                    <div className="h-px w-full bg-white/10 mb-4 group-hover:bg-white/30 transition-colors" />
                    
                    <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      {genero.caracteristicas?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[9px] bg-white text-black font-black px-2.5 py-1 rounded-lg uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 rounded-3xl transition-colors pointer-events-none" />
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* MAPA MUNDIAL */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <MdMap className="text-4xl text-[#ff6b00]" />
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">ESCENAS GLOBALES</h2>
              <p className="text-gray-500">{escenasArray.length} países, un mismo idioma, infinitos sonidos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {escenasArray.map((escena) => (
              <Link 
                key={escena.id}
                to={`/escena/${escena.id}`}
                className="group cursor-pointer block"
                onMouseEnter={() => setActiveZone(escena.id)}
                onMouseLeave={() => setActiveZone(null)}
              >
                <div className={`relative overflow-hidden aspect-square rounded-lg bg-gradient-to-br ${escena.color} p-4 flex flex-col items-center justify-center transition-all duration-300 ${activeZone === escena.id ? 'scale-105 shadow-2xl' : ''}`}>
                  <span className="text-5xl mb-2 transform group-hover:scale-110 transition-transform">{escena.flag}</span>
                  <h3 className="font-black text-sm text-white text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {escena.nombre}
                  </h3>
                  
                  <div className={`absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-3 transition-opacity duration-300 ${activeZone === escena.id ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-[#ff6b00] font-bold text-xs mb-1">VER ARTISTAS</p>
                    <p className="text-white text-[10px] text-center leading-tight mb-2">
                      {escena.artistasPreview.join(', ')}
                    </p>
                    <span className="px-3 py-1 bg-[#ff6b00] text-black text-[10px] font-black rounded">
                      EXPLORAR →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING - TOP GLOBAL REAL */}
      <section className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
            {/* Top 10 Global - Full Width */}
            <div className="grid grid-cols-1">
            {/* Top 10 Global - Full Width */}
            <div className="w-full">
              
              <RankingQuave artistasInput={topGlobal} />
            </div>
          </div>
        </div>
      </section>

      {/* JUEGOS */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <MdGames className="text-4xl text-[#ff6b00]" />
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">QUAVEDLE</h2>
                <p className="text-gray-500">Juegos diarios para verdaderos fans</p>
              </div>
            </div>
            <Link to="/quavedle" className="px-6 py-3 bg-[#ff6b00] text-black font-bold rounded-lg hover:bg-[#ff8533] transition-colors">
              JUGAR AHORA
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'SONGDLE', slug: 'songdle', desc: 'Adivina la canción', color: 'from-purple-600 to-pink-600' },
              { name: 'ALBUM', slug: 'album', desc: 'Adivina el álbum', color: 'from-blue-600 to-cyan-600' },
              { name: 'ARTISTA', slug: 'artist', desc: 'Adivina el artista', color: 'from-green-600 to-emerald-600' },
              { name: 'PORTADA', slug: 'cover', desc: 'Pixelada', color: 'from-orange-600 to-red-600' },
            ].map((game) => (
              <Link 
                key={game.name}
                to={`/quavedle/${game.slug}`}
                className="group relative overflow-hidden aspect-video rounded-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <h3 className="text-2xl font-black text-white mb-2">{game.name}</h3>
                  <p className="text-sm text-white/80">{game.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
