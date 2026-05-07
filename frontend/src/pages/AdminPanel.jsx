import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  MdSecurity, MdPeople, MdDelete, MdShield, 
  MdAdminPanelSettings, MdSearch, MdRefresh 
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.status === 'ok') {
        setUsers(res.data.usuarios);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar usuarios. ¿Eres Admin?' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const nuevoRol = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { nuevoRol });
      if (res.data.status === 'ok') {
        setUsers(users.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u));
        setMessage({ type: 'success', text: `Usuario actualizado a ${nuevoRol}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Fallo al cambiar el rol' });
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('¿ESTÁS SEGURO? Esta acción es irreversible y eliminará todo el historial del agente.')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.status === 'ok') {
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ type: 'success', text: 'Usuario eliminado del sistema' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al eliminar usuario' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#ff6b00] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.3)]">
              <MdSecurity size={32} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">ADMIN CORE</h1>
              <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-1">Terminal de Control de Usuarios v1.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="BUSCAR AGENTE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-black border-2 border-white/10 rounded-xl font-black text-xs uppercase tracking-widest focus:border-[#ff6b00] outline-none transition-all w-64"
              />
            </div>
            <button 
              onClick={fetchUsers}
              className="p-3 bg-white/5 border-2 border-white/10 rounded-xl hover:border-[#ff6b00] transition-all"
            >
              <MdRefresh size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Alerta */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`max-w-7xl mx-auto mb-8 p-4 rounded-xl font-black text-xs uppercase text-center ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20'}`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Usuarios */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando base de datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <motion.div 
                layout
                key={user.id}
                className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 hover:border-[#ff6b00]/30 transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10">
                    <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg uppercase truncate leading-none">{user.username}</h3>
                    <p className="text-[10px] text-gray-500 truncate mt-1">{user.email}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[8px] font-black tracking-widest ${user.rol === 'ADMIN' ? 'bg-[#ff6b00] text-black shadow-[0_0_15px_#ff6b00]' : 'bg-white/10 text-gray-400'}`}>
                    {user.rol}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Puntos</p>
                    <p className="font-black text-[#ff6b00]">{user.quavePoints}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Registro</p>
                    <p className="font-black text-white text-[10px]">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleRole(user.id, user.rol)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${user.rol === 'ADMIN' ? 'bg-black text-red-500 hover:bg-red-500/10' : 'bg-[#ff6b00] text-black hover:scale-[1.02]'}`}
                  >
                    {user.rol === 'ADMIN' ? <MdShield size={16} /> : <MdAdminPanelSettings size={16} />}
                    {user.rol === 'ADMIN' ? 'QUITAR ADMIN' : 'HACER ADMIN'}
                  </button>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="p-3 bg-black text-gray-600 hover:text-red-500 border border-white/5 hover:border-red-500/30 rounded-xl transition-all"
                    title="Eliminar Agente"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
