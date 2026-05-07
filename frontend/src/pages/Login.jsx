import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdSecurity, MdVpnKey, MdEmail, MdError, MdArrowForward, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // El backend ya gestiona la cookie HttpOnly, pero guardamos el token como fallback
      loginStore(res.data.usuario, res.data.token);

      navigate('/boveda');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'CONEXIÓN FALLIDA: Credenciales no reconocidas.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-[#0a0a1a] to-black" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff6b00]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md">
        {/* Card Container with Glassmorphism */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden group">
          
          {/* Top Accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent opacity-50" />
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 mb-6 group-hover:scale-110 transition-transform duration-500">
              <MdSecurity className="text-3xl text-[#ff6b00]" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Acceso <span className="text-[#ff6b00]">Quave</span>
            </h1>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Red de Inteligencia QuaveMind</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase animate-shake">
              <MdError className="text-xl shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Identidad de Usuario</label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-white/5 rounded-2xl group-focus-within/input:bg-[#ff6b00]/5 transition-colors" />
                <MdEmail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-[#ff6b00] transition-colors text-xl" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative w-full bg-transparent border border-white/5 focus:border-[#ff6b00]/30 rounded-2xl px-6 py-4 pl-14 text-white placeholder:text-gray-700 outline-none transition-all font-medium"
                  placeholder="email@quavemind.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Código de Cifrado</label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-white/5 rounded-2xl group-focus-within/input:bg-[#ff6b00]/5 transition-colors" />
                <MdVpnKey className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-[#ff6b00] transition-colors text-xl" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full bg-transparent border border-white/5 focus:border-[#ff6b00]/30 rounded-2xl px-6 py-4 pl-14 pr-14 text-white placeholder:text-gray-700 outline-none transition-all"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={cargando}
              className="group relative w-full overflow-hidden rounded-2xl bg-[#ff6b00] py-5 font-black uppercase text-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,107,0,0.2)]"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 tracking-widest">
                {cargando ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    Sincronizar Terminal <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">
              ¿No tienes autorización?{' '}
              <Link to="/register" className="text-white hover:text-[#ff6b00] font-black transition-colors underline decoration-white/20 underline-offset-4">
                Crear nuevo expediente
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
