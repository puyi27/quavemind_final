import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { 
  MdSecurity, MdPeople, MdDelete, MdShield, 
  MdAdminPanelSettings, MdSearch, MdRefresh, 
  MdAddBox, MdEdit, MdSave, MdClose, MdPersonAdd,
  MdLocationOn, MdInfoOutline, MdWarningAmber
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);

  // Estados para creación y edición
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserPayload, setNewUserPayload] = useState({
    username: '', email: '', password: '', rol: 'USER', quavePoints: 0
  });
  const [targetedUserForEdit, setTargetedUserForEdit] = useState(null);
  const [deletionTarget, setDeletionTarget] = useState(null);

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
      setMessage({ type: 'error', text: 'Error de conexión con el nodo central.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/users', newUserPayload);
      if (res.data.status === 'ok') {
        setUsers([res.data.usuario, ...users]);
        setNewUserPayload({ username: '', email: '', password: '', rol: 'USER', quavePoints: 0 });
        setShowCreateForm(false);
        setMessage({ type: 'success', text: 'Agente creado y registrado en el sistema.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Fallo al crear el agente. Datos duplicados.' });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/users/${targetedUserForEdit.id}`, targetedUserForEdit);
      if (res.data.status === 'ok') {
        setUsers(users.map(u => u.id === targetedUserForEdit.id ? res.data.usuario : u));
        setTargetedUserForEdit(null);
        setMessage({ type: 'success', text: 'Expediente actualizado correctamente.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Fallo en la sincronización de datos.' });
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.status === 'ok') {
        setUsers(users.filter(u => u.id !== userId));
        setDeletionTarget(null);
        setMessage({ type: 'success', text: 'Agente eliminado del sistema.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'No se pudo eliminar el nodo.' });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 selection:bg-[#ff6b00] selection:text-black">
      {/* Header Estilo Admin Core */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
             <MdSecurity size={300} />
          </div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-[#ff6b00] rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,107,0,0.4)] rotate-3">
              <MdSecurity size={40} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">ADMIN CORE</h1>
              <p className="text-[#ff6b00] font-mono text-[11px] uppercase tracking-[0.4em] mt-3 font-bold">Terminal de Gestión de Usuarios v2.0</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <div className="relative">
              <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="BUSCAR NODO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-8 py-4 bg-black border-2 border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest focus:border-[#ff6b00] outline-none transition-all w-full md:w-80 shadow-inner"
              />
            </div>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-[#ff6b00] transition-all transform hover:scale-105 active:scale-95"
            >
              <MdPersonAdd size={20} />
              <span className="text-xs uppercase tracking-widest">NUEVO AGENTE</span>
            </button>
            <button 
              onClick={fetchUsers}
              className="p-4 bg-white/5 border-2 border-white/10 rounded-2xl hover:border-[#ff6b00] transition-all text-gray-400 hover:text-white"
            >
              <MdRefresh size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`max-w-7xl mx-auto mb-10 p-5 rounded-2xl font-black text-xs uppercase text-center flex items-center justify-center gap-4 ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20'}`}
          >
            {message.type === 'error' ? <MdWarningAmber size={20} /> : <MdInfoOutline size={20} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario de Creación (Colapsable) */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-7xl mx-auto mb-12 overflow-hidden"
          >
            <div className="bg-[#0a0a0a] p-10 rounded-[2.5rem] border-2 border-dashed border-[#ff6b00]/30">
               <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-4">
                 <MdAddBox className="text-[#ff6b00]" /> RECLUTAR NUEVO AGENTE
               </h2>
               <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Username</label>
                    <input required type="text" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm font-bold focus:border-[#ff6b00] outline-none" value={newUserPayload.username} onChange={e => setNewUserPayload({...newUserPayload, username: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <input required type="email" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm font-bold focus:border-[#ff6b00] outline-none" value={newUserPayload.email} onChange={e => setNewUserPayload({...newUserPayload, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <input required type="password" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm font-bold focus:border-[#ff6b00] outline-none" value={newUserPayload.password} onChange={e => setNewUserPayload({...newUserPayload, password: e.target.value})} />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-4 bg-[#ff6b00] text-black font-black rounded-xl hover:shadow-[0_0_20px_#ff6b00] transition-all uppercase text-xs tracking-widest">ACTIVAR NODO</button>
                  </div>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Usuarios */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full" />
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando con la red central...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUsers.map((user) => (
              <motion.div 
                layout
                key={user.id}
                className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#ff6b00]/40 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b00] opacity-[0.02] blur-3xl -mr-16 -mt-16 group-hover:opacity-[0.05] transition-opacity" />
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-[#ff6b00]/50 transition-all shadow-2xl">
                    <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xl uppercase truncate leading-none tracking-tighter">{user.username}</h3>
                    <p className="text-[11px] text-gray-500 truncate mt-2 font-mono">{user.email}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest shadow-lg ${user.rol === 'ADMIN' ? 'bg-[#ff6b00] text-black' : 'bg-white/10 text-gray-400'}`}>
                    {user.rol}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 group-hover:border-[#ff6b00]/10 transition-colors">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Quave Points</p>
                    <p className="text-xl font-black text-[#ff6b00]">{user.quavePoints.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 group-hover:border-[#ff6b00]/10 transition-colors">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Fecha Nivel</p>
                    <p className="text-sm font-black text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setTargetedUserForEdit(user)}
                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    <MdEdit size={16} /> EDITAR
                  </button>
                  <button 
                    onClick={() => setDeletionTarget(user)}
                    className="p-4 bg-black text-gray-600 hover:text-red-500 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      <AnimatePresence>
        {targetedUserForEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              onClick={() => setTargetedUserForEdit(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] rounded-[2rem] md:rounded-[3rem] border-2 border-white/10 w-full max-w-2xl p-6 md:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-y-auto max-h-[95vh] md:max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8 md:mb-10">
                <div className="flex items-center gap-3 md:gap-5">
                  <MdEdit className="text-[#ff6b00] text-2xl md:text-3xl" />
                  <h3 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter">EDITAR EXPEDIENTE</h3>
                </div>
                <button onClick={() => setTargetedUserForEdit(null)} className="p-2 md:p-3 bg-white/5 hover:bg-red-500/20 rounded-xl md:rounded-2xl transition-colors">
                  <MdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Username</label>
                    <input type="text" className="w-full bg-black border-2 border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold focus:border-[#ff6b00] outline-none transition-all text-sm md:text-base" value={targetedUserForEdit.username} onChange={e => setTargetedUserForEdit({...targetedUserForEdit, username: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" className="w-full bg-black border-2 border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold focus:border-[#ff6b00] outline-none transition-all text-sm md:text-base" value={targetedUserForEdit.email} onChange={e => setTargetedUserForEdit({...targetedUserForEdit, email: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Rol del Sistema</label>
                    <select className="w-full bg-black border-2 border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold focus:border-[#ff6b00] outline-none transition-all appearance-none text-sm md:text-base" value={targetedUserForEdit.rol} onChange={e => setTargetedUserForEdit({...targetedUserForEdit, rol: e.target.value})}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Quave Points</label>
                    <input type="number" className="w-full bg-black border-2 border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold focus:border-[#ff6b00] outline-none transition-all text-sm md:text-base" value={targetedUserForEdit.quavePoints} onChange={e => setTargetedUserForEdit({...targetedUserForEdit, quavePoints: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2 md:space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Nueva Contraseña (Dejar vacío para no cambiar)</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-black border-2 border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold focus:border-red-500 outline-none transition-all text-sm md:text-base" onChange={e => setTargetedUserForEdit({...targetedUserForEdit, password: e.target.value})} />
                  </div>
                </div>

                <div className="pt-4 md:pt-6">
                  <button type="submit" className="w-full py-5 md:py-6 bg-[#ff6b00] text-black font-black rounded-xl md:rounded-2xl shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:shadow-[0_0_50px_rgba(255,107,0,0.4)] hover:scale-[1.01] transition-all uppercase tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-base">GUARDAR CAMBIOS EN LA RED</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      <AnimatePresence>
        {deletionTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setDeletionTarget(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] p-12 rounded-[3rem] border-2 border-red-500/30 max-w-sm w-full text-center relative z-10"
            >
              <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <MdWarningAmber size={48} />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">¿ELIMINAR AGENTE?</h3>
              <p className="text-gray-500 text-xs font-mono mb-10 leading-relaxed">Esta acción purgará al usuario <span className="text-white font-bold">{deletionTarget.username}</span> de todos los sectores de Quavemind. Es irreversible.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => deleteUser(deletionTarget.id)} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest text-xs">CONFIRMAR PURGA</button>
                <button onClick={() => setDeletionTarget(null)} className="w-full py-4 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]">CANCELAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
