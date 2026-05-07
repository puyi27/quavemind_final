import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAccountCircle, MdFormatQuote, MdStar } from 'react-icons/md';
import api from '../lib/api';

const OpinionesGlobales = ({ tipo, itemId }) => {
  const [opiniones, setOpiniones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpiniones = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/vault/opiniones/${tipo}/${itemId}`);
        if (res.data.status === 'ok') {
          setOpiniones(res.data.opiniones);
        }
      } catch (err) {
        console.error('Error fetching global opinions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) fetchOpiniones();
  }, [tipo, itemId]);

  if (loading) return (
    <div className="flex items-center gap-3 animate-pulse py-4">
      <div className="w-8 h-8 bg-white/5 rounded-full" />
      <div className="h-4 bg-white/5 rounded w-full" />
    </div>
  );

  if (opiniones.length === 0) return (
    <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
        Todavía no hay valoraciones para este tema.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {opiniones.map((op) => (
        <div key={op.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-[#ff6b00]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Link to={`/perfil/${op.usuario.id}`} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                <img 
                  src={op.usuario.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${op.usuario.username}`} 
                  alt={op.usuario.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-black uppercase text-gray-300 group-hover:text-white transition-colors">
                {op.usuario.username}
              </span>
            </Link>
            <div className="flex items-center gap-1 bg-[#ff6b00] text-black px-2 py-0.5 rounded-lg text-[10px] font-black shadow-lg">
              <MdStar /> {op.rating}
            </div>
          </div>
          
          <div className="relative pl-6">
            <MdFormatQuote className="absolute top-0 left-0 text-[#ff6b00] opacity-30 text-xl" />
            <p className="text-[11px] text-gray-400 font-sans italic leading-relaxed">
              {op.comentario || 'Sin comentario.'}
            </p>
          </div>
          
          <div className="mt-3 flex justify-end">
            <span className="text-[8px] font-mono text-gray-600 uppercase">
              {new Date(op.updatedAt).toLocaleDateString()} // SECTOR {op.usuario.id.substring(0, 4)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OpinionesGlobales;
