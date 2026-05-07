import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVerified, MdPeople, MdTrendingUp } from 'react-icons/md';
import api from '../lib/api';

const RankingAlpha = ({ artistasInput = [] }) => {
    const [artistasRankeados, setArtistasRankeados] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const computarImpactoReal = async () => {
            if (!artistasInput || artistasInput.length === 0) return;
            setCargando(true);

            try {
                const res = await api.post('/music/artists-real-stats/bulk', {
                    artistas: artistasInput.map((artista) => ({ id: artista.id, nombre: artista.nombre })),
                });

                const statsMap = new Map((res.data?.data || []).map((item) => [item.id, item]));

                const artistasCompletos = artistasInput.map((artista) => {
                    const real = statsMap.get(artista.id);
                    return {
                        ...artista,
                        oyentesReales: real?.oyentesMensuales ?? null,
                        oyentesVerificados: Boolean(real?.oyentesVerificados),
                    };
                });

                const rankingOrdenado = artistasCompletos.sort((a, b) => {
                    const aListeners = a.oyentesReales ?? -1;
                    const bListeners = b.oyentesReales ?? -1;
                    if (bListeners !== aListeners) return bListeners - aListeners;
                    return Number(b.popularidad || 0) - Number(a.popularidad || 0);
                });
                setArtistasRankeados(rankingOrdenado);
            } catch (error) {
                console.error("Error en Ranking Alpha:", error);
                setArtistasRankeados(artistasInput);
            } finally {
                setCargando(false);
            }
        };

        computarImpactoReal();
    }, [artistasInput]);

    const formatoPremium = (num) => {
        if (!num) return '0';
        return new Intl.NumberFormat('es-ES').format(num);
    };

    if (cargando) return (
        <div className="flex flex-col items-center justify-center py-20 bg-black">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#222] border-t-white"></div>
            <p className="mt-6 font-sans text-sm font-bold tracking-widest text-gray-500 uppercase">
                COMPUTANDO IMPACTO REAL...
            </p>
        </div>
    );

    if (artistasRankeados.length === 0) return null;

    return (
        <div className="mx-auto max-w-[1400px] py-12 bg-black">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#ff6b00]/10 rounded-2xl">
                        <MdTrendingUp className="text-4xl text-[#ff6b00]" />
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-white">
                            RANKING <span className="text-[#ff6b00]">ALPHA</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                            Los artistas que dominan el ecosistema Alpha
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-16 h-2 bg-[#ff6b00] rounded-full" />
                    <div className="w-8 h-2 bg-white/10 rounded-full" />
                    <div className="w-4 h-2 bg-white/10 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-4">
                {artistasRankeados.map((artista, index) => (
                    <Link
                        key={artista.id}
                        to={`/artista/${artista.id}`}
                        className="group relative flex overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] p-6 transition-all duration-500 hover:bg-[#141414] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/5"
                    >
                        {/* Medalla de Posición */}
                        <div className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-black text-white backdrop-blur-md">
                            #{index + 1}
                        </div>

                        {/* Foto del Artista */}
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#222] shadow-2xl">
                            <img
                                src={artista.imagen || 'https://via.placeholder.com/150'}
                                alt={artista.nombre}
                                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                            />
                        </div>

                        {/* Datos */}
                        <div className="ml-6 flex flex-col justify-center w-full">
                            <h3 className="flex items-center gap-2 text-2xl font-black uppercase text-white truncate max-w-[180px]">
                                {artista.nombre}
                                <MdVerified className="text-[#3b82f6] text-xl shrink-0" />
                            </h3>

                            <div className="mt-2 flex items-center gap-2 text-gray-300">
                                <MdPeople className="text-xl text-[#ff6b00]" />
                                <span className="text-lg font-bold tracking-wide">
                                    {artista.oyentesVerificados
                                        ? formatoPremium(artista.oyentesReales)
                                        : 'N/D'}
                                </span>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mt-1">
                                Oyentes mensuales (Spotify)
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RankingAlpha;
