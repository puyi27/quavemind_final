import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdCalendarToday, MdRefresh, MdTrendingUp, MdMusicNote, MdAlbum, MdNewReleases } from 'react-icons/md';
import fetchOptimizer from '../utils/fetchOptimizer';
const STORAGE_KEY = 'quave_recomendaciones_diarias';

const getHoy = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

export default function RecomendacionesDiarias() {
  const [selecciones, setSelecciones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    setLoading(true);
    const hoy = getHoy();
    
    // Intentar cargar de caché pero solo si es de hoy y tiene datos reales
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      const datos = JSON.parse(guardado);
      if (datos.fecha === hoy && datos.selecciones && datos.selecciones.cancionDelDia) {
        setSelecciones(datos.selecciones);
        setLoading(false);
        return;
      }
    }
    
    // Si no hay caché válida, pedimos al servidor
    const data = await fetchOptimizer.get('/recomendaciones/diarias');
    
    // Aceptamos tanto 'ok' como 'partial' para no dejar la UI vacía
    if (data && (data.status === 'ok' || data.status === 'partial') && data.selecciones) {
      setSelecciones(data.selecciones);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fecha: hoy,
        selecciones: data.selecciones
      }));
    } else {
      setSelecciones(null);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-8">
        <div className="flex items-center gap-3 mb-6">
          <MdCalendarToday className="text-2xl text-[#ff6b00]" />
          <h2 className="text-2xl font-black uppercase">Selección del Día</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !selecciones) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-8">
        <div className="flex items-center gap-3 mb-6">
          <MdCalendarToday className="text-2xl text-[#ff6b00]" />
          <h2 className="text-2xl font-black uppercase">Selección del Día</h2>
        </div>
        <p className="text-gray-500 text-center py-8">No disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#111] rounded-2xl border border-[#ff6b00]/30 overflow-hidden">
      <div className="p-6 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <MdCalendarToday className="text-3xl text-[#ff6b00]" />
            <div>
              <h2 className="text-2xl font-black uppercase">Selección del Día</h2>
              <p className="text-sm text-gray-400">{getHoy()}</p>
            </div>
          </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {selecciones.artistaDestacado && (
          <Link to={`/artista/${selecciones.artistaDestacado.id}`} className="group relative bg-[#111] rounded-xl overflow-hidden border border-[#222] hover:border-[#ff6b00] transition-all">
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 bg-[#ff6b00] text-black text-xs font-bold rounded-full">Artista</span>
            </div>
            <div className="aspect-square overflow-hidden">
              <img src={selecciones.artistaDestacado.imagen} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-black text-white truncate">{selecciones.artistaDestacado.nombre}</h3>
              <p className="text-sm text-gray-400">
                {selecciones.artistaDestacado.seguidores 
                  ? `${(selecciones.artistaDestacado.seguidores / 1000000).toFixed(1)}M` 
                  : 'Popular'}
              </p>
            </div>
          </Link>
        )}

        {selecciones.cancionDelDia && (
          <Link to={`/cancion/${selecciones.cancionDelDia.id}`} className="group relative bg-[#111] rounded-xl overflow-hidden border border-[#222] hover:border-[#ff6b00] transition-all">
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">Canción</span>
            </div>
            <div className="aspect-square overflow-hidden">
              <img src={selecciones.cancionDelDia.imagen} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-black text-white truncate">{selecciones.cancionDelDia.nombre}</h3>
              <p className="text-sm text-gray-400 truncate">{selecciones.cancionDelDia.artista}</p>
            </div>
          </Link>
        )}

        {selecciones.albumDelDia && (
          <Link to={`/album/${selecciones.albumDelDia.id}`} className="group relative bg-[#111] rounded-xl overflow-hidden border border-[#222] hover:border-[#ff6b00] transition-all">
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Álbum</span>
            </div>
            <div className="aspect-square overflow-hidden">
              <img src={selecciones.albumDelDia.imagen} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-black text-white truncate">{selecciones.albumDelDia.nombre}</h3>
              <p className="text-sm text-gray-400 truncate">
                {selecciones.albumDelDia.artista} 
                {selecciones.albumDelDia.fecha ? ` • ${selecciones.albumDelDia.fecha}` : ''}
              </p>
            </div>
          </Link>
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-3">
          <MdNewReleases className="text-2xl text-[#ff6b00]" />
          <p className="text-sm font-bold">Nuevos descubrimientos cada día</p>
        </div>
      </div>
    </div>
  );
}