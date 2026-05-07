import { useNavigate, Link } from 'react-router-dom';
import { 
  MdAlbum, MdMusicNote, MdStar, MdStarHalf, MdScience, 
  MdArrowBack, MdFilterList, MdCheckCircle, MdLock, MdWarning, MdHistory
} from 'react-icons/md';
import { useVault } from '../hooks/useVault';

// Formateador de fechas estilo log técnico
const formatAuditDate = (value) => {
  if (!value) return 'FECHA DESCONOCIDA';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'FECHA CORRUPTA';
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Componente de carga estilo Tech-Premium
const LoadingState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6">
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
      <span className="font-black uppercase text-white tracking-[0.3em] text-sm animate-pulse">
        Sincronizando Archivos...
      </span>
    </div>
  </div>
);

// Componente de error de autenticación
const AuthErrorState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6">
    <div className="bg-[#0a0a0a] border border-white/10 p-12 rounded-[2.5rem] max-w-md text-center shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ff6b00]/10 blur-[80px] rounded-full" />
      <MdLock className="text-6xl text-[#ff6b00] mx-auto mb-6" />
      <h2 className="font-black uppercase text-white text-3xl mb-3 tracking-tighter">
        Acceso Restringido
      </h2>
      <p className="text-gray-400 text-xs uppercase mb-8 tracking-[0.2em] leading-relaxed">
        Identificación requerida para visualizar registros de auditoría
      </p>
      <Link 
        to="/login"
        className="inline-block bg-[#ff6b00] text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white transition-all transform hover:scale-105"
      >
        Iniciar Sesión
      </Link>
    </div>
  </div>
);

const Valoraciones = () => {
  const navigate = useNavigate();
  const { valoraciones, isLoading, error } = useVault();

  if (isLoading) return <LoadingState />;
  if (error?.type === 'AUTH_REQUIRED') return <AuthErrorState />;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = rating >= star;
          const isHalf = !isFull && rating >= star - 0.5;
          return (
            <span key={star} className="text-[#ff6b00]">
              {isFull ? (
                <MdStar className="text-xl" />
              ) : isHalf ? (
                <MdStarHalf className="text-xl" />
              ) : (
                <MdStar className="text-xl text-white/5" />
              )}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* CABECERA ESTILO PREMIUM */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#1a1a2e] to-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff6b00]/5 blur-[150px] rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/boveda" className="inline-flex items-center gap-3 text-[#ff6b00] font-black text-[10px] uppercase tracking-[0.3em] mb-12 hover:gap-5 transition-all">
            <MdArrowBack className="text-lg" /> Volver a la Bóveda
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#ff6b00]/10 rounded-2xl border border-[#ff6b00]/20">
                  <MdHistory className="text-4xl text-[#ff6b00]" />
                </div>
                <span className="text-[#ff6b00] font-black text-xs uppercase tracking-[0.5em]">System Logs</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                REGISTRO DE <br />
                <span className="text-[#ff6b00]">AUDITORÍAS</span>
              </h1>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-6 rounded-3xl">
              <p className="text-3xl font-black text-white mb-1">{valoraciones.length}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Análisis Totales</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-32 -mt-10">
        {valoraciones.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-24 text-center">
            <MdScience className="text-7xl text-gray-800 mx-auto mb-6" />
            <h3 className="text-3xl font-black uppercase text-white mb-2">Archivo Vacío</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
              No se han detectado análisis técnicos recientes en el búnker.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valoraciones.map((item) => (
              <div 
                key={item.id}
                className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#ff6b00]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,107,0,0.05)]"
              >
                {/* Header Técnico del Card */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${item.tipo === 'album' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                      {item.tipo === 'album' ? <MdAlbum className="text-sm" /> : <MdMusicNote className="text-sm" />}
                    </div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      ID: {item.itemId.substring(0,10)}
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-[#ff6b00] uppercase tracking-widest">
                    {formatAuditDate(item.updatedAt)}
                  </span>
                </div>

                <div className="p-6">
                  {/* Info del Item */}
                  <div className="flex gap-5 mb-8">
                    <div className="relative w-24 h-24 shrink-0">
                      <img 
                        src={item.snapshot?.imagen || 'https://via.placeholder.com/150'} 
                        alt="Cover" 
                        className="w-full h-full object-cover rounded-2xl shadow-xl grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-xl font-black text-white uppercase truncate group-hover:text-[#ff6b00] transition-colors leading-tight">
                        {item.snapshot?.nombre}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 uppercase truncate mt-1">
                        {item.snapshot?.artista}
                      </p>
                    </div>
                  </div>

                  {/* Rating y Acción */}
                  <div className="flex items-center justify-between pt-6 border-t border-dashed border-white/10">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Rating Técnico</p>
                      {renderStars(item.rating)}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/${item.tipo}/${item.itemId}`)}
                      className="p-4 bg-white/5 rounded-2xl text-white hover:bg-[#ff6b00] hover:text-black transition-all duration-300 group/btn"
                    >
                      <MdArrowBack className="rotate-180 text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Valoraciones;