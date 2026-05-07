import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPersonAdd, MdVpnKey, MdEmail, MdAccountCircle, MdError, MdFingerprint } from 'react-icons/md';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await api.post('/auth/register', formData);
      
      // El backend ya gestiona la cookie HttpOnly, pero guardamos el token como fallback
      loginStore(res.data.usuario, res.data.token);
      
      navigate('/boveda');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'ERROR CRÍTICO: No se ha podido generar el expediente en la base de datos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#050510] to-black" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#ff6b00]/5 blur-[150px] rounded-full" />

      <div className="relative w-full max-w-xl">
        {/* Registration Card */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 md:p-14 shadow-[0_32px_64px_rgba(0,0,0,0.5)] group overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b00]/10 blur-3xl -mr-16 -mt-16 group-hover:bg-[#ff6b00]/20 transition-colors duration-700" />

          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff6b00] to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(255,107,0,0.3)] shrink-0">
              <MdPersonAdd className="text-4xl text-black" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                Nuevo <span className="text-gray-500">Expediente</span>
              </h1>
              <p className="text-[#ff6b00] font-mono text-[10px] uppercase tracking-[0.4em] mt-1 font-bold">Crea tu cuenta QuaveMind</p>
            </div>
          </div>

          {error && (
            <div className="mb-10 p-5 bg-red-500/10 border-l-4 border-red-500 rounded-r-2xl flex items-center gap-4 text-red-400 text-xs font-black uppercase tracking-tight animate-shake">
              <MdError className="text-2xl" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Nombre de Código (Username)</label>
              <div className="relative">
                <MdAccountCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 text-xl" />
                <input
                  type="text"
                  required
                  placeholder="Ej: UsuarioQuave_07"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 pl-14 text-white focus:border-[#ff6b00]/30 outline-none transition-all font-bold placeholder:text-gray-800"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Canal Seguro (Email)</label>
              <div className="relative">
                <MdEmail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 text-xl" />
                <input
                  type="email"
                  required
                  placeholder="agente@red.com"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 pl-14 text-white focus:border-[#ff6b00]/30 outline-none transition-all placeholder:text-gray-800"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Clave de Encriptación</label>
              <div className="relative">
                <MdVpnKey className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 text-xl" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 pl-14 text-white focus:border-[#ff6b00]/30 outline-none transition-all placeholder:text-gray-800"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="md:col-span-2 mt-4 group relative overflow-hidden rounded-2xl bg-white py-6 font-black uppercase text-black transition-all hover:bg-[#ff6b00] hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 tracking-[0.2em] text-sm">
                {cargando ? (
                  <div className="w-6 h-6 border-3 border-black border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <MdFingerprint className="text-2xl" /> Crear Cuenta Quave
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              ¿Ya posees autorización de nivel superior?{' '}
              <Link to="/login" className="text-white hover:text-[#ff6b00] transition-colors underline underline-offset-8 decoration-white/10">
                Regresar a la Terminal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;