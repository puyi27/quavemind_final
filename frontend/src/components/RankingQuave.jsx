import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVerified, MdPeople, MdTrendingUp, MdGraphicEq, MdInfoOutline } from 'react-icons/md';
import api from '../lib/api';
import fetchOptimizer from '../utils/fetchOptimizer';

const RankingQuave = ({ artistasInput = [] }) => {
    const [artistasRankeados, setArtistasRankeados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        if (!artistasInput || artistasInput.length === 0) return;

        const computarImpactoReal = async () => {
            setCargando(true);
            // Inicializar con lo que tenemos
            if (artistasRankeados.length === 0) {
                setArtistasRankeados(artistasInput);
            }
            
            try {
                const safeStats = await fetchOptimizer.fetchStats(artistasInput.slice(0, 30));
                const statsMap = new Map(safeStats.map((item) => [item.id, item]));

                const rankingOrdenado = artistasInput.map((artista) => {
                    const real = statsMap.get(artista.id);
                    return {
                        ...artista,
                        oyentesReales: real?.oyentesMensuales || real?.listeners || null,
                        oyentesVerificados: real ? Boolean(real.verificado) : false,
                        // Si no hay oyentes, usamos seguidores de la API como fallback
                        seguidores: real?.followers || artista.seguidores
                    };
                }).sort((a, b) => {
                    const aVal = a.oyentesReales || a.seguidores || (a.popularidad * 10000);
                    const bVal = b.oyentesReales || b.followers || (b.popularidad * 10000);
                    return bVal - aVal;
                });
                
                setArtistasRankeados(rankingOrdenado);
            } catch (error) {
                console.error("Error en Ranking Quave:", error);
            } finally {
                setCargando(false);
            }
        };

        computarImpactoReal();
    }, [artistasInput]);

    const formatoPremium = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return new Intl.NumberFormat('es-ES').format(num);
    };

    if (cargando) return (
        <div className="flex flex-col items-center justify-center py-20 bg-black">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#ff6b00] border-t-transparent"></div>
            <p className="mt-6 font-black text-sm tracking-[0.3em] text-gray-500 uppercase">
                Cargando artistas...
            </p>
        </div>
    );

    if (artistasRankeados.length === 0) return null;

    return (
        <div className="mx-auto max-w-7xl py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#ff6b00]/10 rounded-2xl">
                        <MdTrendingUp className="text-4xl text-[#ff6b00]" />
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">
                            RANKING <span className="text-[#ff6b00]">GLOBAL</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                            Tendencias populares en Spotify • Datos actualizados
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-4">
                {artistasRankeados.slice(0, limit).map((artista, index) => (
                    <Link
                        key={artista.id}
                        to={`/artista/${artista.id}`}
                        className="group relative flex flex-col bg-[#0d0d0d] rounded-[2.5rem] border-2 border-white/5 transition-all duration-500 overflow-hidden"
                    >
                        <div className="relative p-6 flex items-center gap-5">
                            <div className="absolute top-6 left-6 w-8 h-8 bg-black rounded-xl flex items-center justify-center border-2 border-[#ff6b00] shadow-[2px_2px_0px_0px_#ff6b00] z-20">
                                <span className="text-xs font-black text-white">#{index + 1}</span>
                            </div>

                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[2rem] border-2 border-white/10 transition-colors relative">
                                <img
                                    src={artista.imagen || '/default.png'}
                                    alt={artista.nombre}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.target.src = '/default.png'; }}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black uppercase text-white truncate tracking-tighter mb-1 transition-colors">
                                    {artista.nombre}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {artista.popularidad > 80 && (
                                        <span className="flex items-center gap-1 bg-[#3b82f6]/10 text-[#3b82f6] text-[8px] font-black px-2 py-0.5 rounded border border-[#3b82f6]/20 uppercase">
                                            Leyenda
                                        </span>
                                    )}
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">
                                        {(artista.generos || []).slice(0, 1).join(', ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative mt-auto p-6 pt-0">
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-white/10 transition-colors border border-white/5">
                                <div className="flex flex-col">
                                   <div className="flex items-center gap-2">
                                      <MdGraphicEq className={artista.oyentesReales ? 'text-[#ff6b00]' : 'text-gray-500'} />
                                      <span className="text-2xl font-black text-white leading-none tracking-tighter tabular-nums">
                                          {artista.oyentesReales 
                                             ? formatoPremium(artista.oyentesReales) 
                                             : (artista.seguidores > 0 ? formatoPremium(artista.seguidores) : '---')}
                                      </span>
                                   </div>
                                   <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1">
                                       {artista.oyentesVerificados 
                                         ? <span className="text-[#ff6b00]">OYENTES MENSUALES</span> 
                                         : <span className="text-gray-500">SEGUIDORES (ESTIMADO)</span>}
                                   </span>
                                </div>
                                
                                {artista.oyentesVerificados ? (
                                    <div className="bg-[#ff6b00] text-black w-8 h-8 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_white]">
                                        <MdGraphicEq className="text-lg animate-pulse" />
                                    </div>
                                ) : (
                                    <div className="bg-white/10 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                        <MdPeople className="text-lg" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {limit < artistasRankeados.length && limit < 25 && (
                <div className="mt-16 flex justify-center px-4">
                    <button 
                        onClick={() => setLimit(25)}
                        className="group relative flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-[#ff6b00] hover:text-black transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(255,107,0,0.3)] active:scale-95"
                    >
                        <MdPeople className="text-lg" />
                        CARGAR MÁS AGENTES (TOP 25)
                        <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20">
                            <span className="text-[8px]">▼</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default RankingQuave;
