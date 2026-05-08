import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MdPerson,
  MdEdit,
  MdLocationOn,
  MdStar,
  MdTrendingUp,
  MdHistory,
  MdShield,
  MdMusicNote,
  MdAlbum,
  MdPeople,
  MdList,
  MdFilterList,
  MdAnalytics,
  MdFormatQuote,
  MdClose,
  MdCheckCircle,
  MdStarHalf,
  MdVisibility,
  MdVisibilityOff
} from 'react-icons/md';
import fetchOptimizer from '../utils/fetchOptimizer';
import { useAuthStore } from '../store/authStore';

// Optimizador: Formateador de números (Memoizado fuera para evitar recreación)
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const LoadingState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-6">
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
      <span className="font-black uppercase text-white tracking-[0.3em] text-sm animate-pulse">
        Sincronizando Perfil...
      </span>
    </div>
  </div>
);

export default function PerfilUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, updateUser, logout } = useAuthStore();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // NAVIGATION & FILTERING STATES
  const [activeVaultTab, setActiveVaultTab] = useState('all');
  const [activeRatingTab, setActiveRatingTab] = useState('all');

  // EDIT STATE
  const [editData, setEditData] = useState({
    bio: '',
    ubicacion: '',
    avatar: '',
    newPassword: ''
  });

  const isOwnProfile = authUser && String(authUser.id) === String(id);

  useEffect(() => {
    cargarPerfil();
  }, [id]);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const data = await fetchOptimizer.get(`/auth/public/${id}`);
      if (data && data.usuario) {
        const profile = data.usuario;
        setUserProfile(profile);
        setEditData({
          bio: profile.bio || '',
          ubicacion: profile.ubicacion || '',
          avatar: profile.avatar || '',
          newPassword: ''
        });
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor central.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();

    // Si intenta cambiar la contraseña, validar robustez
    if (editData.newPassword) {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
      if (!passwordRegex.test(editData.newPassword)) {
        alert('LA NUEVA CLAVE NO ES SEGURA: Debe tener al menos 6 caracteres, un número y un símbolo especial.');
        return;
      }
    }

    try {
      const data = await fetchOptimizer.post('/auth/update-profile', editData);
      if (data && data.usuario) {
        setUserProfile(prev => ({ ...prev, ...data.usuario }));
        updateUser(data.usuario);
        
        // Si cambió la contraseña, forzamos un refresco para asegurar la sesión
        if (editData.newPassword) {
          alert('Contraseña actualizada correctamente. Sincronizando sesión...');
          window.location.reload();
          return;
        }

        setIsEditing(false);
      }
    } catch (err) {
      alert('Fallo en la actualización del registro. Verifica tus datos.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setEditData(prev => ({ ...prev, avatar: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    const confirmacion = window.confirm("¿ESTÁS SEGURO? Esta acción es irreversible y eliminará permanentEMENTE tu historial de puntos, favoritos y valoraciones de la red Quave.");
    
    if (confirmacion) {
      const confirmacionFinal = window.prompt("Para confirmar la eliminación permanente, escribe tu nombre de usuario:");
      
      if (confirmacionFinal === userProfile.username) {
        try {
          await fetchOptimizer.delete('/auth/delete-account');
          logout(); // Limpiar estado global
          navigate('/');
          alert('Cuenta eliminada con éxito. Desconexión del terminal completada.');
        } catch (err) {
          alert('Error crítico al intentar purgar el expediente. Reintenta más tarde.');
        }
      } else if (confirmacionFinal !== null) {
        alert('Nombre de usuario incorrecto. Abortando purga de datos.');
      }
    }
  };

  const handleStartEdit = () => {
    setEditData({
      bio: userProfile.bio || '',
      ubicacion: userProfile.ubicacion || '',
      avatar: userProfile.avatar || '',
      newPassword: ''
    });
    setIsEditing(true);
  };

  // Optimizador: Filtrado memoizado para evitar re-cálculos pesados en el render
  const filteredVault = useMemo(() => {
    if (!userProfile?.favoritos) return [];
    if (activeVaultTab === 'all') return userProfile.favoritos;
    return userProfile.favoritos.filter(f => f.tipo === activeVaultTab);
  }, [userProfile?.favoritos, activeVaultTab]);

  const filteredRatings = useMemo(() => {
    if (!userProfile?.valoraciones) return [];
    if (activeRatingTab === 'all') return userProfile.valoraciones;
    return userProfile.valoraciones.filter(v => v.tipo === activeRatingTab);
  }, [userProfile?.valoraciones, activeRatingTab]);

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = rating >= star;
        const isHalf = !isFull && rating >= star - 0.5;
        return (
          <span key={star} className="text-[#ff6b00]">
            {isFull ? <MdStar size={14} /> : isHalf ? <MdStarHalf size={14} /> : <MdStar size={14} className="text-white/5" />}
          </span>
        );
      })}
    </div>
  );

  if (loading) return <LoadingState />;
  if (!userProfile) return <div className="p-20 text-center text-white">Perfil no encontrado.</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* HEADER TECH-PREMIUM (OPTIMIZADO) */}
      <section className="pt-24 pb-16 px-6 bg-gradient-to-b from-[#1a1a2e] to-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff6b00]/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* AVATAR */}
          <div className="relative group shrink-0">
            <div className="w-48 h-48 rounded-[3rem] overflow-hidden border border-white/10 group-hover:border-[#ff6b00]/50 transition-all duration-700 shadow-2xl relative">
              <img
                src={userProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`}
                alt={userProfile.username}
                className="w-full h-full object-cover transition-transform duration-700"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[3rem]" />
            </div>
            {isOwnProfile && (
              <button
                onClick={handleStartEdit}
                className="absolute -bottom-2 -right-2 p-4 bg-[#ff6b00] text-black rounded-3xl hover:scale-105 transition-transform shadow-xl border border-white/20"
              >
                <MdEdit size={24} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-[#ff6b00]/10 text-[#ff6b00] text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-[#ff6b00]/20">
                Usuario Verificado
              </span>
              {userProfile.ubicacion && (
                <span className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  <MdLocationOn /> {userProfile.ubicacion}
                </span>
              )}
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
              {userProfile.username}<span className="text-[#ff6b00]">.</span>
            </h1>
            <div className="relative p-6 bg-white/5 border border-white/10 rounded-[2rem] max-w-2xl group">
              <MdFormatQuote className="absolute -top-3 -left-1 text-4xl text-[#ff6b00] opacity-50" />
              <p className="text-gray-300 italic text-sm leading-relaxed">
                {userProfile.bio || 'Este usuario no ha definido su biografía personal.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE EDICIÓN (ALIGERADO) */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 overflow-hidden max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(255,107,0,0.1)]">
            <button onClick={() => setIsEditing(false)} className="absolute top-8 right-8 text-white/50 hover:text-white"><MdClose size={32} /></button>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-10">MODIFICAR <span className="text-[#ff6b00]">PERFIL</span></h2>
            
            <form onSubmit={handleUpdate} className="space-y-10" autoComplete="off">
              <div className="flex flex-col md:flex-row gap-10 items-center bg-white/5 p-8 rounded-[2rem] border border-white/10">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-[#ff6b00] shrink-0">
                  <img src={editData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`} className="w-full h-full object-cover" alt="Preview" />
                </div>
                <div className="flex-1 space-y-4">
                  <label className="block text-xs font-black uppercase text-[#ff6b00] tracking-[0.3em]">Previsualización de Identidad</label>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Selecciona un avatar predefinido o sube tu propia imagen. Los cambios solo se aplicarán al sincronizar.</p>
                </div>
              </div>

              {/* SECCIÓN AVATAR */}
              <div className="space-y-6">
                <label className="block text-xs font-black uppercase text-[#ff6b00] tracking-[0.3em]">Opciones de Identidad</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                  {[
                    { name: 'Agente 1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
                    { name: 'Agente 2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
                    { name: 'Agente 3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
                    { name: 'Agente 4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kasper' },
                    { name: 'Agente 5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo' },
                    { name: 'Agente 6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
                    { name: 'Agente 7', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
                    { name: 'Agente 8', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vero' },
                  ].map((opt) => (
                    <button
                      key={opt.url}
                      type="button"
                      onClick={() => setEditData({ ...editData, avatar: opt.url })}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${editData.avatar === opt.url ? 'border-[#ff6b00] scale-110 shadow-[0_0_20px_rgba(255,107,0,0.3)]' : 'border-white/10 hover:border-white/40'}`}
                    >
                      <img src={opt.url} alt={opt.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={editData.avatar}
                    onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#ff6b00] outline-none text-xs font-mono"
                    placeholder="URL de avatar personalizado..."
                    autoComplete="off"
                  />
                  <label className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
                    <MdPerson size={18} />
                    Subir Archivo
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <label className="block text-xs font-black uppercase text-[#ff6b00] tracking-widest">Localización</label>
                  <input
                    type="text"
                    value={editData.ubicacion}
                    onChange={(e) => setEditData({ ...editData, ubicacion: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#ff6b00] outline-none transition-colors"
                    autoComplete="off"
                  />
                  <label className="block text-xs font-black uppercase text-[#ff6b00] tracking-widest flex justify-between">
                    Nueva Contraseña
                    {editData.newPassword && editData.newPassword.length < 6 && (
                      <span className="text-red-500 normal-case font-bold animate-pulse">Min. 6 caracteres</span>
                    )}
                  </label>
                  <div className="relative group/pass">
                    <input
                      type={showPass ? "text" : "password"}
                      value={editData.newPassword}
                      onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#ff6b00] outline-none transition-colors pr-14"
                      autoComplete="new-password"
                      placeholder="Dejar en blanco para mantener..."
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPass ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="block text-xs font-black uppercase text-[#ff6b00] tracking-widest">Biografía</label>
                  <textarea
                    rows="6"
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#ff6b00] outline-none resize-none"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button type="submit" className="flex-1 py-5 bg-[#ff6b00] text-black font-black uppercase rounded-2xl hover:bg-white transition-all transform hover:scale-[1.02]">
                  Sincronizar Cambios
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteAccount}
                  className="px-8 py-5 bg-red-900/20 border border-red-500/30 text-red-500 font-black uppercase rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  Borrar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 mt-20">
        
        {/* COLUMNA IZQUIERDA (BIBLIOTECA & AUDITORÍAS) */}
        <div className="lg:col-span-2 space-y-24">
          
          {/* BIBLIOTECA */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase italic leading-none mb-2">BIBLIOTECA</h2>
                <div className="w-12 h-1 bg-[#ff6b00]" />
              </div>
              <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 gap-1">
                {[
                  { id: 'all', label: 'Todo', icon: MdList },
                  { id: 'artista', label: 'Artistas', icon: MdPeople },
                  { id: 'album', label: 'Álbumes', icon: MdAlbum },
                  { id: 'cancion', label: 'Canciones', icon: MdMusicNote }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveVaultTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeVaultTab === tab.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredVault.map((fav) => (
                <Link key={fav.id} to={`/${fav.tipo}/${fav.itemId}`} className="group relative aspect-square bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden hover:border-[#ff6b00]/40 transition-all duration-500">
                  <img
                    src={fav.snapshot?.imagen || 'https://via.placeholder.com/300'}
                    className={`w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ${fav.tipo !== 'artista' ? 'group-hover:scale-110' : ''}`}
                    alt={fav.snapshot?.nombre}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-[9px] font-black text-white uppercase truncate">{fav.snapshot?.nombre}</p>
                    <p className="text-[7px] font-bold text-[#ff6b00] uppercase tracking-widest">{fav.snapshot?.artista}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* AUDITORÍAS */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase italic leading-none mb-2">VALORACIONES</h2>
                <div className="w-12 h-1 bg-white" />
              </div>
              <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 gap-1">
                {[
                  { id: 'all', label: 'Todo', icon: MdFilterList },
                  { id: 'cancion', label: 'Tracks', icon: MdMusicNote },
                  { id: 'album', label: 'Discos', icon: MdAlbum }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRatingTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeRatingTab === tab.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRatings.map((val) => (
                <div key={val.id} className="group bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 hover:border-[#ff6b00]/20 transition-all duration-500">
                  <div className="flex gap-6">
                    <div className="relative shrink-0">
                      <img src={val.snapshot?.imagen} className="w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ff6b00] text-black rounded-lg flex items-center justify-center font-black text-[10px] shadow-xl">{val.rating}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0">
                          <h4 className="text-lg font-black uppercase group-hover:text-[#ff6b00] transition-colors truncate">{val.snapshot?.nombre}</h4>
                          <p className="text-[10px] font-bold text-gray-500 uppercase truncate">{val.snapshot?.artista}</p>
                        </div>
                        <Link to={`/${val.tipo}/${val.itemId}`} className="p-2.5 bg-white/5 rounded-xl hover:bg-[#ff6b00] hover:text-black transition-all shrink-0 ml-2">
                          <MdAnalytics size={16} />
                        </Link>
                      </div>
                      <div className="relative p-4 bg-white/2 rounded-xl border border-white/5 italic text-[11px] text-gray-400 leading-relaxed">
                        <MdFormatQuote className="absolute -top-2 -left-1 text-2xl text-[#ff6b00] opacity-30" />
                        "{val.comentario || 'Sin comentario.'}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA (STATS) */}
        <div className="space-y-8">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><MdTrendingUp size={120} /></div>
            <h3 className="text-2xl font-black uppercase italic mb-10 flex items-center gap-3">
              <MdTrendingUp className="text-[#ff6b00]" /> IMPACTO
            </h3>
            
            <div className="space-y-10">
              <div className="bg-black/40 p-10 rounded-[2.5rem] border-2 border-[#ff6b00] text-center group transition-all hover:scale-[1.02]">
                <span className="block text-6xl font-black text-[#ff6b00] mb-2">{formatNumber(userProfile.quavePoints)}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Quave Points</span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    <span>Nivel de Colección</span>
                    <span className="text-[#ff6b00]">{userProfile.favoritos?.length || 0} ITEMS</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff6b00] transition-all duration-1000" style={{ width: `${Math.min(100, (userProfile.favoritos?.length || 0) * 10)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    <span>Actividad Analítica</span>
                    <span className="text-white">{userProfile.valoraciones?.length || 0} REVIEWS</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(100, (userProfile.valoraciones?.length || 0) * 10)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
