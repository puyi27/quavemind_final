import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  MdArrowBack, MdTrendingUp, MdAlbum, MdMusicNote, 
  MdStar, MdPlayArrow, MdPeople, MdWhatshot,
  MdMap, MdLocationOn, MdCalendarToday, MdQueueMusic,
  MdRadio, MdHeadphones, MdGraphicEq, MdHistory,
  MdLightbulb, MdGroups, MdPublic, MdFemale,
  MdDiscFull, MdRecordVoiceOver, MdPerson, MdArrowForward
} from 'react-icons/md';
import { ESCENAS_DATA } from '../data/escenasData';
import api from '../services/api';

export default function Escena() {
  const { pais } = useParams();
  const navigate = useNavigate();
  const [artistas, setArtistas] = useState([]);
  const [artistasEmergentes, setArtistasEmergentes] = useState([]);
  const [artistasMujeres, setArtistasMujeres] = useState([]);
  const [canciones, setCanciones] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productoresData, setProductoresData] = useState([]);
  const [colaboracionesData, setColaboracionesData] = useState([]);

  const info = ESCENAS_DATA[pais] || {
    nombre: pais?.toUpperCase() || 'ESCENA',
    flag: '🌍',
    color: 'from-gray-600 to-gray-800',
    descripcion: 'Descubre artistas de esta escena',
    ciudadPrincipal: '',
    sellosDiscograficos: [],
    generos: [],
    artistas: { establecidos: [], emergentes: [], mujeres: [] },
    productores: [],
    colaboraciones: [],
    evolucion: [],
    datosCuriosos: [],
    influencias: [],
    exportacion: [],
    festivales: [],
    venues: []
  };

  useEffect(() => {
    fetchDatosPais();
  }, [pais]);

  const fetchDatosPais = async () => {
    setLoading(true);
    try {
      const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
      const nombresEstablecidos = shuffle(info.artistas?.establecidos || []).slice(0, 10);
      const nombresEmergentes = shuffle(info.artistas?.emergentes || []).slice(0, 8);
      const nombresMujeres = shuffle(info.artistas?.mujeres || []).slice(0, 8);
      
      const todosNombres = Array.from(new Set([...nombresEstablecidos, ...nombresEmergentes, ...nombresMujeres]));
      const normalize = (v) => `${v || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      
      let artistasCargados = [];
      try {
         const resArt = await api.get(`/music/artistas/bulk?nombres=${encodeURIComponent(todosNombres.join(','))}`);
         artistasCargados = resArt.data?.artistas || [];
      } catch (err) {
         console.warn('[Escena] Error en bulk de artistas:', err);
      }

      // Validar si un artista cargado coincide con una lista de nombres de forma flexible
      const belongsToList = (lista, artista) => {
         const n2 = normalize(artista.nombre);
         return lista.some(n1 => normalize(n1) === n2);
      };

      const establecidos = artistasCargados
        .filter(a => belongsToList(nombresEstablecidos, a))
        .slice(0, 10);
      
      const mujeres = artistasCargados
        .filter(a => belongsToList(nombresMujeres, a) && !establecidos.some(e => e.id === a.id))
        .slice(0, 8);
        
      const emergentes = artistasCargados
        .filter(a => belongsToList(nombresEmergentes, a) && !establecidos.some(e => e.id === a.id) && !mujeres.some(m => m.id === a.id))
        .slice(0, 8);

      // Mostrar datos básicos de inmediato
      setArtistas(establecidos);
      setArtistasEmergentes(emergentes);
      setArtistasMujeres(mujeres);

      // Hidratar con stats reales en segundo plano (No bloqueante)
      if (establecidos.length > 0) {
        api.post('/music/artists-real-stats/bulk', {
          artistas: establecidos.map(a => ({ id: a.id, nombre: a.nombre }))
        }).then(statsRes => {
          if (statsRes.data?.status === 'ok') {
            const statsMap = new Map((statsRes.data.data || []).map(s => [s.id, s]));
            setArtistas(prev => prev.map(art => {
               const real = statsMap.get(art.id);
               return real ? { ...art, seguidores: real.oyentesMensuales || real.listeners || art.seguidores } : art;
            }));
          }
        }).catch(() => {});
      }

      // Cargar Hits y Álbumes de forma optimizada
      // Limitamos a los top 2 para no sobrecargar el backend con llamadas extrañas de Axios
      if (establecidos.length > 0) {
        const top2 = establecidos.slice(0, 2);
        
        try {
           const [hitsRes, albRes] = await Promise.all([
             Promise.all(top2.map(art => api.get(`/music/buscar?q=${encodeURIComponent(art.nombre)}&tipo=track&limit=5`).then(r => r.data?.resultados?.canciones || []).catch(() => []))),
             Promise.all(top2.map(art => api.get(`/music/buscar?q=${encodeURIComponent(art.nombre)}&tipo=album&limit=4`).then(r => r.data?.resultados?.albumes || []).catch(() => [])))
           ]);
           
           setCanciones(hitsRes.flat().slice(0, 10));
           setAlbumes(albRes.flat().slice(0, 8));
        } catch (e) {
           console.warn('[Escena] Error hits/álbumes:', e);
           setCanciones([]); setAlbumes([]);
        }
      }

      // Colaboraciones y Productores
      const colabsActivas = info.colaboraciones?.slice(0, 4) || [];
      const prodsActivos = info.productores?.slice(0, 4) || [];
      
      try {
          const [colRes, prodRes] = await Promise.all([
            Promise.all(colabsActivas.map(col => api.get(`/music/buscar?q=${encodeURIComponent(`${col.cancion} ${col.artistas}`)}&tipo=track&limit=1`).then(r => {
              const found = r.data?.resultados?.canciones?.[0];
              return found ? { ...col, id: found.id, imagen: found.imagen } : col;
            }).catch(() => col))),
           Promise.all(prodsActivos.map(nombre => api.get(`/music/buscar?q=${encodeURIComponent(nombre)}&tipo=artist&limit=1`).then(r => {
             const found = r.data?.resultados?.artistas?.[0];
             return found ? { nombre, id: found.id } : { nombre };
           }).catch(() => ({ nombre }))))
         ]);
         setColaboracionesData(colRes);
         setProductoresData(prodRes);
      } catch (e) {
         setColaboracionesData(colabsActivas);
         setProductoresData(prodsActivos.map(n => ({nombre: n})));
      }

    } catch (error) {
      console.error('Error general cargando escena:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSeguidores = artistas.reduce((acc, a) => acc + (a.seguidores || 0), 0);

  return (
    <div key={pais} className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className={`relative pt-12 pb-24 px-4 overflow-hidden bg-gradient-to-br ${info.color}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-white/80 hover:text-white transition-colors mb-12">
            <div className="p-2 bg-black/20 rounded-xl group-hover:bg-white group-hover:text-black transition-all">
              <MdArrowBack className="text-xl" />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em]">Volver</span>
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-12">
            <div className="relative group shrink-0">
               <div className="absolute -inset-4 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-700"></div>
               <span className="relative text-8xl md:text-9xl drop-shadow-2xl animate-bounce-slow inline-block">{info.flag}</span>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-none">{info.nombre}</h1>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl font-medium leading-relaxed">{info.descripcion}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-10">
            {[
              { val: artistas.length + artistasEmergentes.length, label: 'ARTISTAS', icon: MdPerson },
              { val: `${(totalSeguidores / 1000000).toFixed(1)}M`, label: 'SEGUIDORES', icon: MdPeople },
              { val: info.festivales?.length || 0, label: 'FESTIVALES', icon: MdCalendarToday }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 px-8 py-5 rounded-[2rem] flex flex-col items-center md:items-start gap-1 min-w-[160px]">
                <div className="flex items-center gap-2 text-white/50 mb-1">
                  <stat.icon className="text-sm" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tighter">{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <MdLocationOn className="text-[#ff6b00]" /> {info.ciudadPrincipal}
            </span>
            {info.generos?.slice(0, 3).map((g, i) => (
              <span key={i} className="px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-black uppercase tracking-widest">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
              <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px]">Preparando la escena...</p>
            </div>
          ) : (
            <div className="space-y-24">
              
              {/* HITS */}
              {canciones.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <MdTrendingUp className="text-3xl text-[#ff6b00]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">HITS DE {info.nombre}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {canciones.slice(0, 12).map((c, i) => (
                      <Link key={c.id} to={`/cancion/${c.id}`} className="group">
                        <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 shadow-xl border border-white/5 group-hover:border-[#ff6b00]/50 transition-all duration-500">
                          <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute top-3 left-3 w-10 h-10 bg-[#ff6b00] rounded-2xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                            <span className="text-black font-black text-sm">#{i + 1}</span>
                          </div>
                        </div>
                        <h3 className="font-black text-sm truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition-colors">{c.nombre}</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{c.artista}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ARTISTAS ESTABLECIDOS */}
              {artistas.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <MdStar className="text-3xl text-[#ff6b00]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">LEYENDAS DE LA ESCENA</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
                    {artistas.map((a, i) => (
                      <Link key={a.id} to={`/artista/${a.id}`} className="group flex flex-col items-center">
                        <div className="relative aspect-square rounded-full overflow-hidden mb-4 border-2 border-white/5 group-hover:border-[#ff6b00] transition-all duration-500 shadow-2xl">
                          <img src={a.imagen} alt={a.nombre} className="w-full h-full object-cover transition-transform duration-700" />
                          {i < 3 && <div className="absolute top-0 right-0 w-8 h-8 bg-[#ff6b00] rounded-full flex items-center justify-center shadow-lg"><MdWhatshot className="text-black text-sm" /></div>}
                        </div>
                        <h3 className="font-black text-center text-sm truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition-colors">{a.nombre}</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{(a.seguidores / 1000000).toFixed(1)}M SEGUIDORES</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* MUJERES EN EL GÉNERO */}
              {artistasMujeres.filter(a => a && a.id).length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-[3rem] p-10 md:p-16 border border-pink-500/30">
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/10 blur-[100px] rounded-full" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-pink-500/10 rounded-2xl">
                        <MdFemale className="text-3xl text-pink-500" />
                      </div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-white">MUJERES ROMPIÉNDOLA</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                      {artistasMujeres.filter(a => a && a.id).map((a) => (
                        <Link key={a.id} to={`/artista/${a.id}`} className="group">
                          <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 border-2 border-pink-500/30 group-hover:border-pink-500 transition-all duration-500 shadow-2xl">
                            <img src={a.imagen || '/placeholder.jpg'} alt={a.nombre || 'Artista'} className="w-full h-full object-cover transition-transform duration-700" />
                          </div>
                          <h3 className="font-black text-center text-sm uppercase tracking-tight text-white group-hover:text-pink-400 transition-colors">{a.nombre}</h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* EMERGENTES */}
              {artistasEmergentes.length > 0 && (
                <div className="bg-[#0a0a0a] rounded-[3rem] p-10 md:p-16 border border-white/5">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <MdPeople className="text-3xl text-[#ff6b00]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">EL FUTURO DE LA ESCENA</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
                    {artistasEmergentes.map((a) => (
                      <Link key={a.id} to={`/artista/${a.id}`} className="group flex flex-col items-center">
                        <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 border border-white/5 group-hover:border-[#ff6b00] transition-all duration-500 shadow-2xl">
                          <img src={a.imagen} alt={a.nombre} className="w-full h-full object-cover transition-transform duration-700" />
                          <div className="absolute top-2 right-2 px-3 py-1.5 bg-[#ff6b00] text-black text-[9px] font-black rounded-xl shadow-2xl rotate-6 group-hover:rotate-0 transition-transform uppercase tracking-tighter">NUEVO</div>
                        </div>
                        <h3 className="font-black text-center text-sm truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition-colors">{a.nombre}</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{(a.seguidores / 1000).toFixed(0)}K SEGUIDORES</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* GRID INFO: SELLOS, FESTIVALES, VENUES */}
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: 'SELLOS', data: info.sellosDiscograficos, icon: MdDiscFull },
                  { title: 'FESTIVALES', data: info.festivales, icon: MdCalendarToday },
                  { title: 'VENUES', data: info.venues, icon: MdLocationOn }
                ].map((sec, i) => (
                  <div key={i} className="bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/5 hover:border-[#ff6b00]/30 transition-colors">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                      <sec.icon className="text-[#ff6b00]" /> {sec.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sec.data?.map((s, j) => (
                        <span key={j} className="px-4 py-2 bg-white/5 text-gray-400 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors cursor-default">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* EVOLUCIÓN DEL SONIDO */}
              {info.evolucion?.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#111] to-black rounded-[3rem] p-10 md:p-16 border border-white/5">
                   <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ff6b00]/5 blur-[100px] rounded-full" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-12">
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <MdHistory className="text-3xl text-[#ff6b00]" />
                      </div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">CRONOLOGÍA SONORA</h2>
                    </div>
                    <div className="relative border-l-2 border-[#ff6b00]/30 ml-6 space-y-12">
                      {info.evolucion.map((evo, i) => (
                        <div key={i} className="relative pl-10 group">
                          <div className="absolute -left-[11px] top-0 w-5 h-5 bg-black border-2 border-[#ff6b00] rounded-full group-hover:bg-[#ff6b00] transition-colors" />
                          <h3 className="text-3xl font-black text-[#ff6b00] mb-3 italic tracking-tighter">{evo.año}</h3>
                          <p className="text-gray-400 font-medium text-lg leading-relaxed">{evo.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* COLABORACIONES HISTÓRICAS */}
              {(colaboracionesData.length > 0 ? colaboracionesData : info.colaboraciones)?.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <MdGroups className="text-3xl text-[#ff6b00]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">CRUCES ICÓNICOS</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {(colaboracionesData.length > 0 ? colaboracionesData : info.colaboraciones).map((col, i) => {
                      const isLink = Boolean(col.id);
                      const Wrapper = isLink ? Link : 'div';
                      const props = isLink ? { to: `/cancion/${col.id}` } : {};
                      return (
                        <Wrapper key={i} {...props} className={`relative overflow-hidden p-6 bg-[#0a0a0a] rounded-3xl border border-white/5 hover:border-[#ff6b00] transition-all group ${isLink ? 'cursor-pointer hover:scale-[1.02]' : ''}`}>
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                             <MdPlayArrow className="text-3xl text-[#ff6b00]" />
                          </div>
                          <p className={`text-[#ff6b00] font-black text-xl mb-2 uppercase tracking-tight ${isLink ? 'group-hover:translate-x-2 transition-transform' : ''}`}>{col.cancion}</p>
                          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">{col.artistas}</p>
                        </Wrapper>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PRODUCTORES */}
              {(productoresData.length > 0 ? productoresData : info.productores)?.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <MdRecordVoiceOver className="text-3xl text-[#ff6b00]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">ARQUITECTOS DEL RITMO</h2>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(productoresData.length > 0 ? productoresData : info.productores.map(p => ({nombre: p}))).map((prod, i) => {
                      const isLink = Boolean(prod.id);
                      const Wrapper = isLink ? Link : 'span';
                      const props = isLink ? { to: `/artista/${prod.id}` } : {};
                      return (
                        <Wrapper key={i} {...props} className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black border border-white/10 hover:bg-[#ff6b00] hover:text-black transition-all hover:scale-105 hover:rotate-2 cursor-pointer inline-block uppercase text-xs tracking-widest">
                          {prod.nombre}
                        </Wrapper>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INFLUENCIAS Y EXPORTACIÓN */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#0a0a0a] rounded-[2.5rem] p-10 border border-white/5">
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                    <MdPublic className="text-[#ff6b00]" /> ADN SONORO
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {info.influencias?.map((inf, i) => (
                      <span key={i} className="px-5 py-2.5 bg-white/5 text-gray-500 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest">{inf}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#ff6b00]/20 to-black rounded-[2.5rem] p-10 border border-[#ff6b00]/30">
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                    <MdPublic className="text-[#ff6b00]" /> IMPACTO GLOBAL
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {info.exportacion?.map((exp, i) => (
                      <span key={i} className="px-5 py-2.5 bg-[#ff6b00] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">{exp}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SABÍAS QUE... */}
              {info.datosCuriosos?.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-[#0a0a0a] to-blue-900/30 rounded-[3rem] p-10 md:p-16 border border-white/10 shadow-2xl">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#ff6b00]/5 blur-[120px]" />
                  <div className="relative z-10 text-center">
                    <div className="inline-block p-4 bg-white/5 rounded-[2rem] mb-8 border border-white/10">
                      <MdLightbulb className="text-5xl text-[#ff6b00] animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-12">DATOS CURIOSOS</h2>
                    <div className="grid md:grid-cols-2 gap-10">
                      {info.datosCuriosos.map((dato, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                          <span className="text-4xl font-black text-[#ff6b00]/20 italic">#{i + 1}</span>
                          <p className="text-gray-300 font-medium text-lg leading-relaxed">{dato}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ÁLBUMES */}
              {albumes.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <MdAlbum className="text-3xl text-[#ff6b00]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">DISCOGRAFÍA ESENCIAL</h2>
                  </div>
                  <div className="media-grid">
                    {albumes.map((a) => (
                      <Link key={a.id} to={`/album/${a.id}`} className="media-card group p-2">
                        <div className="aspect-square rounded-2xl overflow-hidden mb-2 border border-white/5 group-hover:border-[#ff6b00]/50 transition-all duration-500 shadow-2xl">
                          <img src={a.imagen} alt={a.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <h3 className="font-black text-sm truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition-colors">{a.nombre}</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{a.artista}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* PLAYLIST SECTION */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#111] to-black rounded-[4rem] p-10 md:p-20 border border-white/5 shadow-2xl">
                 <MdGraphicEq className="absolute -bottom-20 -right-20 text-[25rem] text-[#ff6b00]/5" />
                 
                 <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16">
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                        <div className="p-4 bg-[#ff6b00]/10 rounded-3xl">
                          <MdQueueMusic className="text-4xl text-[#ff6b00]" />
                        </div>
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4">{info.nombre}</h2>
                      <p className="text-gray-500 font-bold uppercase tracking-widest">Las piezas fundamentales de este rompecabezas sonoro</p>
                    </div>
                    <button className="px-12 py-6 bg-[#ff6b00] text-black font-black rounded-3xl hover:bg-[#ff8533] transition-all hover:scale-105 shadow-[0_0_50px_rgba(255,107,0,0.3)] flex items-center gap-4 uppercase text-sm tracking-widest">
                      <MdPlayArrow className="text-2xl" /> REPRODUCIR TODO
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {canciones.slice(0, 10).map((c, i) => (
                      <div key={c.id} className="group flex items-center gap-6 p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-[#ff6b00]/30 transition-all duration-300">
                        <span className="text-[#ff6b00]/30 font-black text-2xl italic group-hover:text-[#ff6b00] transition-colors">{String(i + 1).padStart(2, '0')}</span>
                        <img src={c.imagen} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-2xl group-hover:scale-105 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-lg text-white uppercase tracking-tight truncate group-hover:text-[#ff6b00] transition-colors">{c.nombre}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{c.artista}</p>
                        </div>
                        <Link to={`/cancion/${c.id}`} className="p-3 bg-white/5 text-white rounded-xl hover:bg-[#ff6b00] hover:text-black transition-all">
                          <MdArrowForward className="text-xl" />
                        </Link>
                      </div>
                    ))}
                  </div>
                 </div>
              </div>
            </div>
          )}

          {/* OTRAS ESCENAS */}
          <div className="mt-32 pt-20 border-t border-white/5">
            <div className="flex items-center gap-4 mb-12">
               <div className="w-12 h-1 bg-[#ff6b00] rounded-full" />
               <h2 className="text-3xl font-black uppercase tracking-tighter">SIGUE EL VIAJE</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
              {Object.entries(ESCENAS_DATA).filter(([id]) => id !== pais).slice(0, 10).map(([id, z]) => (
                <Link key={id} to={`/escena/${id}`} className="group">
                  <div className={`relative aspect-square rounded-[2.5rem] bg-gradient-to-br ${z.color} p-6 flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative text-6xl mb-4 group-hover:scale-125 transition-transform duration-500 drop-shadow-2xl">{z.flag}</span>
                    <span className="relative font-black text-white text-[10px] uppercase tracking-widest text-center">{z.nombre}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

