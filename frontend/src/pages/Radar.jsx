import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdTrendingUp, MdGraphicEq, MdFilterList, MdPeople,
  MdExplore, MdPerson, MdMusicNote
} from 'react-icons/md';
import { musicService } from '../services/musicService';
import AINeuralDiscovery from '../components/AINeuralDiscovery';
import api from '../services/api';

// Términos de búsqueda INFINITOS para Spotify
const TERMINOS_BUSQUEDA = [
  'genre:"reggaeton"', 'genre:"trap latino"', 'genre:"urbano latino"', 'genre:"latin hip hop"',
  'genre:"dembow"', 'genre:"vallenato"', 'genre:"bachata"', 'genre:"trap argentino"',
  'genre:"pop urbano"', 'genre:"urbano chileno"', 'genre:"corridos tumbados"',
  'genre:"reggaeton flow"', 'genre:"latin pop"', 'genre:"cumbia villera"',
  'genre:"rap latino"', 'genre:"drill espanol"', 'genre:"flamenco urbano"',
  'genre:"trap boricua"', 'genre:"mambo chileno"', 'genre:"reggaeton colombiano"'
];

// Géneros disponibles para filtrar
const GENEROS_FILTRO = [
  { id: 'todos', nombre: 'Todos', color: 'bg-gray-600' },
  { id: 'reggaeton', nombre: 'Reggaetón', color: 'bg-red-600' },
  { id: 'trap', nombre: 'Trap Latino', color: 'bg-purple-600' },
  { id: 'latino', nombre: 'Latino', color: 'bg-yellow-600' },
  { id: 'hip-hop', nombre: 'Hip Hop', color: 'bg-blue-600' },
  { id: 'r-n-b', nombre: 'R&B', color: 'bg-pink-600' },
  { id: 'pop', nombre: 'Pop Urbano', color: 'bg-green-600' },
  { id: 'dembow', nombre: 'Dembow', color: 'bg-orange-600' },
];

export default function Radar() {
  const [artistas, setArtistas] = useState([]);
  const [artistaDestacado, setArtistaDestacado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoria, setCategoria] = useState('emergentes');
  const [generoFiltro, setGeneroFiltro] = useState('todos');
  const [error, setError] = useState(null);
  
  // Usar ref para el Set de artistas usados (persiste entre renders)
  const usedArtistsRef = useRef(new Set());

  // Función para obtener término de búsqueda basado en el filtro
  const getRandomTerm = (genero) => {
    if (genero && genero !== 'todos') {
      let baseGenre = genero;
      if (genero === 'pop') baseGenre = 'pop urbano';
      if (genero === 'trap') baseGenre = 'trap latino';
      if (genero === 'r-n-b') baseGenre = 'latin r&b';
      if (genero === 'hip-hop') baseGenre = 'latin hip hop';
      if (genero === 'latino') baseGenre = 'urbano latino';

      const variaciones = [
         `genre:"${baseGenre}"`,
         `genre:"${baseGenre}" year:2023-2024`,
         `genre:"${baseGenre}" year:2020-2022`,
         `genre:"${baseGenre}" year:2018-2019`,
         `genre:"${baseGenre}" year:2015-2017`,
      ];
      return variaciones[Math.floor(Math.random() * variaciones.length)];
    }
    const shuffled = [...TERMINOS_BUSQUEDA].sort(() => 0.5 - Math.random());
    return shuffled[0];
  };

  const cargarArtistas = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      usedArtistsRef.current.clear();
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let nuevosArtistas = [];
      let attempts = 0;
      const maxAttempts = 10;

      // Intentar hasta conseguir artistas nuevos
      while (nuevosArtistas.length < 12 && attempts < maxAttempts) {
        const term = getRandomTerm(generoFiltro);
        const randomOffset = Math.floor(Math.random() * 200); // 0 a 200
        
        let arts = [];
        try {
           const res = await api.get('/music/buscar', {
              params: { q: term, tipo: 'artist', limit: 50, offset: randomOffset }
           });
           arts = res.data?.resultados?.artistas || res.data?.artistas || [];
        } catch (e) {
           console.warn("[Radar] Search fail for", term);
        }

        // FILTRO ESTRICTO HISPANO
        const keywordsHispanas = [
          'latino', 'reggaeton', 'urbano', 'mexicano', 'argentino', 
          'espanol', 'español', 'chileno', 'colombiano', 'puerto rican', 
          'dominicano', 'vallenato', 'bachata', 'mariachi', 'norteno', 'corridos',
          'trap latino', 'trap argentino', 'trap chileno', 'trap espanol', 'pop urbano'
        ];

        const keywordsExcluidas = ['italian', 'italy', 'italia', 'canzone', 'napoletana', 'french', 'portuguese', 'brazilian', 'german'];
        
        arts = arts.filter(a => {
          const generos = (a.generos || []).map(g => g.toLowerCase());
          const esHispano = generos.some(g => keywordsHispanas.some(k => g.includes(k)));
          const esExcluido = generos.some(g => keywordsExcluidas.some(k => g.includes(k)));
          const esGenericoUrbano = generos.some(g => g === 'trap' || g === 'hip hop' || g === 'pop');
          
          return (esHispano || esGenericoUrbano) && !esExcluido;
        });

        // Filtrar según categoría
        if (categoria === 'emergentes') {
          arts = arts.filter(a => 
            a?.seguidores >= 10000 && 
            a?.seguidores <= 8000000 &&
            a?.popularidad >= 20 &&
            a?.popularidad <= 75
          );
        }

        // Filtrar por género si hay filtro activo (como capa de seguridad adicional)
        if (generoFiltro !== 'todos') {
          arts = arts.filter(a => {
            const generosArtista = a.generos?.map(g => g.toLowerCase()) || [];
            let filtroNormalizado = generoFiltro.toLowerCase();
            if (filtroNormalizado === 'pop') filtroNormalizado = 'pop';
            else if (filtroNormalizado === 'trap') filtroNormalizado = 'trap';
            else if (filtroNormalizado === 'hip-hop') filtroNormalizado = 'hip hop';
            else if (filtroNormalizado === 'r-n-b') filtroNormalizado = 'r&b';
            
            return generosArtista.some(g => g.includes(filtroNormalizado));
          });
        }

        // Filtrar artistas no usados
        arts = arts.filter(a => !usedArtistsRef.current.has(a.id));
        
        // Añadir a la lista de usados
        arts.forEach(a => usedArtistsRef.current.add(a.id));
        
        nuevosArtistas = [...nuevosArtistas, ...arts];
        attempts++;
      }

      if (categoria === 'top') {
        nuevosArtistas = nuevosArtistas.sort((a, b) => b.popularidad - a.popularidad);
      } else {
        nuevosArtistas = nuevosArtistas.sort(() => 0.5 - Math.random());
      }
      
      nuevosArtistas = nuevosArtistas.slice(0, 12);

      // Hidratar artistas con oyentes reales de Quave (Axios)
      try {
        const statsRes = await api.post('/music/artists-real-stats/bulk', {
          artistas: nuevosArtistas.map(a => ({ id: a.id, nombre: a.nombre }))
        });
        if (statsRes.data?.status === 'ok') {
          const statsMap = new Map((statsRes.data.data || []).map(s => [s.id, s]));
          nuevosArtistas = nuevosArtistas.map(art => {
            const real = statsMap.get(art.id);
            return real ? { ...art, oyentesReales: real.oyentesMensuales, oyentesVerificados: real.oyentesVerificados } : art;
          });
        }
      } catch (hErr) {
        // Silenciar error - stats no crítico
        console.warn("[Radar] Error hidratando stats:", hErr.message);
      }

      if (isInitial) {
        setArtistas(nuevosArtistas);
        setArtistaDestacado(nuevosArtistas[0] || null);
      } else {
        setArtistas(prev => {
          const combined = [...prev, ...nuevosArtistas];
          if (categoria === 'top') {
            return combined.sort((a, b) => b.popularidad - a.popularidad);
          }
          return combined;
        });
      }

    } catch (err) {
      console.error('Error Radar:', err);
      setError('No se pudo cargar el Radar de Spotify. Reintenta en unos instantes.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoria, generoFiltro]);

  // Cargar inicial
  useEffect(() => {
    cargarArtistas(true);
  }, [categoria, generoFiltro, cargarArtistas]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        if (!loadingMore && !loading) {
          cargarArtistas(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, loading, cargarArtistas]);

  const categorias = [
    { id: 'emergentes', label: 'Emergentes', icon: MdTrendingUp, desc: 'Nuevos talentos hispanos' },
    { id: 'top', label: 'Top Global', icon: MdFilterList, desc: 'Los más escuchados' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-b from-[#1a1a2e] to-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2">
            <span className="text-white">RADAR</span>
            <span className="text-[#ff6b00]">.</span>
          </h1>
          <p className="text-gray-400 text-lg">Explora nueva música • Basado en tus gustos</p>
        </div>
      </section>

      {/* Categorías y Filtros */}
      <section className="px-4 mb-8 sticky top-16 bg-black/95 backdrop-blur-md z-40 py-4 border-b border-[#222]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-3">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoria(cat.id);
                  setArtistas([]);
                  usedArtistsRef.current.clear();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  categoria === cat.id
                    ? 'bg-[#ff6b00] text-black'
                    : 'bg-[#111] text-gray-400 hover:bg-[#222] hover:text-white'
                }`}
              >
                <cat.icon className="text-xl" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-500 text-sm mr-2 py-1">Género:</span>
            {GENEROS_FILTRO.map((gen) => (
              <button
                key={gen.id}
                onClick={() => {
                  setGeneroFiltro(gen.id);
                  setArtistas([]);
                  usedArtistsRef.current.clear();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  generoFiltro === gen.id
                    ? `${gen.color} text-white`
                    : 'bg-[#222] text-gray-400 hover:bg-[#333]'
                }`}
              >
                {gen.nombre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI DISCOVERY RADAR */}
      <section className="px-4 py-8 mb-12">
        <div className="max-w-7xl mx-auto">
          {artistas.length > 0 && (
            <AINeuralDiscovery 
              title="Quave Emerging AI"
              type="emerging"
              data={artistas.filter(a => a.popularidad < 70)}
              description="Detección de Talento Urbano en Ascenso"
            />
          )}
        </div>
      </section>

      {/* Destacado */}
      {artistaDestacado && !loading && (
        <section className="px-4 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#ff6b00]/20 to-purple-900/20 rounded-3xl p-8 border border-[#ff6b00]/30">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img 
                  src={artistaDestacado.imagen} 
                  alt={artistaDestacado.nombre}
                  className="w-48 h-48 rounded-full object-cover border-4 border-[#ff6b00] shadow-[0_0_50px_rgba(255,107,0,0.3)]"
                />
                <div className="text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-[#ff6b00] text-black text-sm font-bold rounded-full mb-4">
                    DESCUBRIMIENTO DESTACADO
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                    {artistaDestacado.nombre}
                  </h2>
                  <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6 justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-[#ff6b00]/20 rounded-lg">
                          <MdGraphicEq className="text-xl text-[#ff6b00]" />
                       </div>
                       <div>
                          <p className="text-lg font-black text-white leading-none">
                             {artistaDestacado.oyentesVerificados 
                               ? (artistaDestacado.oyentesReales / 1000000).toFixed(1) + 'M'
                               : (artistaDestacado.seguidores / 1000000).toFixed(1) + 'M'}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#ff6b00] mt-1">
                             {artistaDestacado.oyentesVerificados ? 'Radar Verificado' : 'Seguidores'}
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-white/5 rounded-lg">
                          <MdTrendingUp className="text-xl text-[#ff6b00]" />
                       </div>
                       <div>
                          <p className="text-lg font-black text-white leading-none">{artistaDestacado.popularidad}%</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Popularidad</p>
                       </div>
                    </div>
                  </div>
                  <Link 
                    to={`/artista/${artistaDestacado.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff6b00] text-black font-bold rounded-xl hover:bg-[#ff8533] transition-colors"
                  >
                    <MdPerson /> Ver Perfil Completo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid de Artistas */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 p-6 text-center mb-6 rounded-xl">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => cargarArtistas(true)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-bold"
              >
                Reintentar Conexión
              </button>
            </div>
          )}

          {loading && artistas.length === 0 ? (
            <div className="media-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-[#111] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="media-grid">
                {artistas.map((artista, index) => (
                  <Link 
                    key={`${artista.id}-${index}`}
                    to={`/artista/${artista.id}`}
                    className="media-card group hover:shadow-lg hover:shadow-[#ff6b00]/10"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={artista.imagen} 
                        alt={artista.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      
                      <div className="absolute top-2 left-2 flex gap-1">
                        {artista.popularidad >= 80 ? (
                          <span className="px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded uppercase">TOP</span>
                        ) : artista.popularidad >= 60 ? (
                          <span className="px-2 py-1 bg-[#ff6b00] text-black text-[10px] font-bold rounded uppercase">HOT</span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">RADAR</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-base truncate group-hover:text-[#ff6b00] transition-colors mb-2 uppercase tracking-tight">
                        {artista.nombre}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {artista.generos?.slice(0, 2).map((genero, i) => (
                          <span 
                            key={i} 
                            className="text-[9px] font-bold bg-[#111] border border-white/5 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-tighter"
                          >
                            {genero}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        {artista.oyentesVerificados ? (
                          <span className="text-[#ff6b00] flex items-center gap-1.5">
                            <MdGraphicEq className="text-xs" />
                            {(artista.oyentesReales / 1000000).toFixed(1)}M REALES
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-1">
                            <MdPeople className="text-[#ff6b00]" />
                            {(artista.seguidores / 1000000).toFixed(1)}M
                          </span>
                        )}
                        <span className="text-gray-600 bg-white/5 px-2 py-0.5 rounded">
                          {artista.popularidad}%
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {loadingMore && (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
                    <span className="font-bold uppercase tracking-widest text-xs">Escaneando radar...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
