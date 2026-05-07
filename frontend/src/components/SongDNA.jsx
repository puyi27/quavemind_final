import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdGraphicEq, MdPeople, MdTrendingUp, MdHub,
  MdLink, MdMusicNote, MdPublic, MdBolt
} from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Función para calcular similitud entre artistas (0-100%)
const calcularSimilitud = (artista1, artista2) => {
  let puntos = 0;
  let total = 0;
  
  // Similitud de géneros (40%)
  if (artista1.generos && artista2.generos) {
    const generosComunes = artista1.generos.filter(g => 
      artista2.generos.some(g2 => g2.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(g2.toLowerCase()))
    );
    puntos += (generosComunes.length / Math.max(artista1.generos.length, artista2.generos.length)) * 40;
    total += 40;
  }
  
  // Diferencia de popularidad (30%) - cuanto más cerca, mejor
  if (artista1.popularidad && artista2.popularidad) {
    const diff = Math.abs(artista1.popularidad - artista2.popularidad);
    puntos += Math.max(0, 30 - diff * 0.5);
    total += 30;
  }
  
  // Rango de seguidores similar (20%)
  if (artista1.seguidores && artista2.seguidores) {
    const ratio = Math.min(artista1.seguidores, artista2.seguidores) / Math.max(artista1.seguidores, artista2.seguidores);
    puntos += ratio * 20;
    total += 20;
  }
  
  // Ambos hispanos/latinos (10%)
  const esLatino = (a) => a.generos?.some(g => 
    ['latin', 'reggaeton', 'trap', 'urbano', 'spanish'].some(term => g.toLowerCase().includes(term))
  );
  if (esLatino(artista1) && esLatino(artista2)) {
    puntos += 10;
    total += 10;
  }
  
  return total > 0 ? Math.round((puntos / total) * 100) : 50;
};

// Obtener color según nivel de conexión
const getConnectionColor = (similitud) => {
  if (similitud >= 80) return 'bg-green-500';
  if (similitud >= 60) return 'bg-blue-500';
  if (similitud >= 40) return 'bg-yellow-500';
  return 'bg-gray-500';
};

// Obtener tipo de conexión
const getConnectionType = (similitud) => {
  if (similitud >= 80) return 'Muy similar';
  if (similitud >= 60) return 'Similar';
  if (similitud >= 40) return 'Relacionado';
  return 'Conexión débil';
};

export default function SongDNA({ artista }) {
  const [loading, setLoading] = useState(true);
  const [conexiones, setConexiones] = useState([]);
  const [redCompleta, setRedCompleta] = useState([]);
  const [error, setError] = useState(null);
  const [modoVista, setModoVista] = useState('conexiones'); // 'conexiones' | 'red'

  useEffect(() => {
    if (artista?.id) {
      cargarConexiones();
    }
  }, [artista?.id]);

  const cargarConexiones = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener artistas relacionados de Spotify
      const res = await fetch(`${API_URL}/music/artista/${artista.id}`);
      const data = await res.json();

      if (data.status === 'ok') {
        // Calcular similitud con cada artista relacionado
        const conexionesCalculadas = (data.relacionados || [])
          .map(rel => ({
            ...rel,
            similitud: calcularSimilitud(artista, rel),
            tipo: getConnectionType(calcularSimilitud(artista, rel))
          }))
          .sort((a, b) => b.similitud - a.similitud);

        setConexiones(conexionesCalculadas);
        
        // Construir red completa (artista central + conexiones)
        setRedCompleta([
          { ...artista, esCentral: true, similitud: 100 },
          ...conexionesCalculadas.slice(0, 8)
        ]);
      }
    } catch (err) {
      console.error('Error cargando conexiones:', err);
      setError('No se pudieron cargar las conexiones');
    } finally {
      setLoading(false);
    }
  };

  // Buscar conexiones de segundo nivel (amigos de amigos)
  const expandirRed = async () => {
    setLoading(true);
    const nuevaRed = [...redCompleta];
    
    // Tomar los 3 artistas más conectados y buscar sus conexiones
    for (const artistaConexion of conexiones.slice(0, 3)) {
      try {
        const res = await fetch(`${API_URL}/music/artista/${artistaConexion.id}`);
        const data = await res.json();
        
        const nuevasConexiones = (data.relacionados || [])
          .filter(rel => !nuevaRed.find(a => a.id === rel.id)) // No duplicados
          .map(rel => ({
            ...rel,
            similitud: Math.round(calcularSimilitud(artista, rel) * 0.7), // Peso menor
            tipo: 'Conexión extendida',
            via: artistaConexion.nombre
          }))
          .sort((a, b) => b.similitud - a.similitud)
          .slice(0, 3);
        
        nuevaRed.push(...nuevasConexiones);
      } catch (e) {
        console.log('Error expandiendo red:', e);
      }
    }
    
    setRedCompleta(nuevaRed);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
        <div className="flex items-center gap-3 mb-4">
          <MdHub className="text-2xl text-[#ff6b00]" />
          <h3 className="text-xl font-bold">RED DE ARTISTAS</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
        <div className="flex items-center gap-3 mb-4">
          <MdHub className="text-2xl text-[#ff6b00]" />
          <h3 className="text-xl font-bold">RED DE ARTISTAS</h3>
        </div>
        <p className="text-gray-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#222]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <MdHub className="text-2xl text-[#ff6b00]" />
            <h3 className="text-xl font-bold uppercase tracking-wider">ADN de Conexiones</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModoVista('conexiones')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                modoVista === 'conexiones' ? 'bg-[#ff6b00] text-black' : 'bg-[#222] text-gray-400'
              }`}
            >
              Directas
            </button>
            <button
              onClick={() => setModoVista('red')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                modoVista === 'red' ? 'bg-[#ff6b00] text-black' : 'bg-[#222] text-gray-400'
              }`}
            >
              Red completa
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Artistas conectados por género, estilo y similitud musical
        </p>
      </div>

      {/* Artista Central */}
      <div className="p-6 border-b border-[#222] bg-gradient-to-r from-[#ff6b00]/10 to-transparent">
        <div className="flex items-center gap-4">
          <img
            src={artista.imagen}
            alt={artista.nombre}
            className="w-20 h-20 rounded-full object-cover border-4 border-[#ff6b00]"
          />
          <div>
            <h4 className="text-2xl font-black text-white">{artista.nombre}</h4>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <MdPeople className="text-[#ff6b00]" />
                {(artista.seguidores / 1000000).toFixed(1)}M
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MdMusicNote className="text-[#ff6b00]" />
                {artista.generos?.slice(0, 2).join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Conexiones */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase">
            {modoVista === 'conexiones' ? 'Conexiones Directas' : 'Red Completa'}
            <span className="ml-2 text-[#ff6b00]">
              ({(modoVista === 'conexiones' ? conexiones : redCompleta).filter(a => !a.esCentral).length})
            </span>
          </h4>
          {modoVista === 'conexiones' && conexiones.length > 0 && (
            <button
              onClick={expandirRed}
              className="text-xs text-[#ff6b00] hover:underline flex items-center gap-1"
            >
              <MdBolt /> Expandir red
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(modoVista === 'conexiones' ? conexiones : redCompleta)
            .filter(a => !a.esCentral)
            .map((artistaConexion, index) => (
            <Link
              key={artistaConexion.id}
              to={`/artista/${artistaConexion.id}`}
              className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl hover:bg-[#252525] transition-all group"
            >
              {/* Número */}
              <span className="text-lg font-black text-gray-600 w-6">
                #{index + 1}
              </span>
              
              {/* Imagen */}
              <div className="relative">
                <img
                  src={artistaConexion.imagen}
                  alt={artistaConexion.nombre}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {/* Indicador de similitud */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getConnectionColor(artistaConexion.similitud)}`}>
                  {artistaConexion.similitud}%
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate group-hover:text-[#ff6b00] transition-colors">
                  {artistaConexion.nombre}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MdLink className="text-gray-600" />
                    {artistaConexion.tipo || 'Conexión'}
                  </span>
                  {artistaConexion.via && (
                    <>
                      <span>•</span>
                      <span>vía {artistaConexion.via}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate mt-1">
                  {artistaConexion.generos?.slice(0, 2).join(', ')}
                </p>
              </div>
              
              {/* Stats */}
              <div className="text-right text-xs">
                <p className="text-gray-400">
                  {(artistaConexion.seguidores / 1000000).toFixed(1)}M
                </p>
                <p className="text-[#ff6b00]">{artistaConexion.popularidad}%</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Leyenda de conexiones */}
      <div className="px-6 pb-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Nivel de conexión</h4>
        <div className="flex flex-wrap gap-3">
          {[
            { color: 'bg-green-500', label: 'Muy similar (80%+)', desc: 'Mismo género y estilo' },
            { color: 'bg-blue-500', label: 'Similar (60-79%)', desc: 'Géneros relacionados' },
            { color: 'bg-yellow-500', label: 'Relacionado (40-59%)', desc: 'Alguna similitud' },
            { color: 'bg-gray-500', label: 'Débil (<40%)', desc: 'Conexión lejana' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de red */}
      <div className="border-t border-[#222] p-6">
        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
          <MdTrendingUp className="text-[#ff6b00]" />
          Métricas de la Red
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-[#ff6b00]">
              {conexiones.filter(c => c.similitud >= 60).length}
            </p>
            <p className="text-xs text-gray-500">Conexiones fuertes</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-blue-500">
              {Math.round(conexiones.reduce((acc, c) => acc + c.similitud, 0) / (conexiones.length || 1))}%
            </p>
            <p className="text-xs text-gray-500">Similitud media</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-green-500">
              {conexiones.length}
            </p>
            <p className="text-xs text-gray-500">Artistas conectados</p>
          </div>
        </div>
      </div>
    </div>
  );
}