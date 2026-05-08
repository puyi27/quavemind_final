import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdGraphicEq, MdSpeed, MdMood, MdAutoFixHigh, 
  MdPlayArrow, MdPause, MdLibraryMusic 
} from 'react-icons/md';
import api from '../services/api';
import { usePlayer } from '../context/MusicPlayerContext';

const Generador = () => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayback } = usePlayer();

  // Estados de los parámetros técnicos
  const [bpm, setBpm] = useState(95); // Reggaeton suele rondar 90-100
  const [energia, setEnergia] = useState(0.7); // 0 a 1
  const [vibra, setVibra] = useState(0.5); // Valencia: 0 (Oscuro/Triste) a 1 (Feliz/Party)
  const [genero, setGenero] = useState('reggaeton');

  const [playlist, setPlaylist] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const generarPlaylist = async () => {
    setCargando(true);
    setError('');
    setPlaylist([]);

    try {
      const res = await api.post('/generador/generar', {
        seed_genres: genero,
        target_tempo: bpm,
        target_energy: energia,
        target_valence: vibra,
        limit: 15
      });
      
      setPlaylist(res.data.playlist);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error crítico computando la matriz de audio.');
    } finally {
      setCargando(false);
    }
  };

  const handlePreview = async (track) => {
    if (!track.preview) return;
    if (currentTrack?.id === track.id) {
      await togglePlayback();
    } else {
      await playTrack({
        id: track.id,
        name: track.nombre,
        artist: track.artista,
        image: track.imagen,
        preview: track.preview
      });
    }
  };

  // Función auxiliar para saber qué "vibe" tiene el slider
  const getVibeText = (val) => {
    if (val < 0.3) return 'Oscuro / Maleanteo';
    if (val < 0.6) return 'Neutro / Perreo';
    return 'Luminoso / Comercial';
  };

  return (
    <div className="animate-in fade-in mx-auto max-w-[1200px] p-6 pb-32">
      {/* CABECERA */}
      <div className="mb-10 border-4 border-black bg-[var(--color-quave-card)] p-8 shadow-[8px_8px_0px_#ff6b00]">
        <div className="flex items-center gap-4 mb-2">
          <MdAutoFixHigh className="text-5xl text-[var(--color-quave-orange)]" />
          <div>
            <h1 className="font-heading text-5xl font-black uppercase text-white tracking-tighter">Matriz de Generación</h1>
            <p className="font-mono text-xs uppercase tracking-widest text-gray-400 mt-1">
              Computación de playlists mediante Audio Features
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL DE CONTROL (SLIDERS) */}
        <div className="lg:col-span-1 space-y-8">
          <div className="border-4 border-[var(--color-quave-border)] bg-black p-6">
            <h3 className="font-heading text-2xl font-black uppercase border-b-4 border-[var(--color-quave-border)] pb-2 mb-6">Parámetros</h3>
            
            {/* Género */}
            <div className="mb-8">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-quave-orange)] mb-2 block">
                Raíz Sonora
              </label>
              <select 
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="w-full bg-black border-2 border-white text-white p-3 font-mono text-xs uppercase focus:outline-none focus:border-[var(--color-quave-orange)] appearance-none cursor-pointer"
              >
                <option value="reggaeton">Reggaetón Puro</option>
                <option value="trap">Trap / Drill</option>
                <option value="latin">Música Latina General</option>
                <option value="hip-hop">Hip-Hop Clásico</option>
              </select>
            </div>

            {/* Slider BPM */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-quave-orange)] flex items-center gap-2">
                  <MdSpeed /> Velocidad (BPM)
                </label>
                <span className="font-heading text-2xl font-black text-white">{bpm}</span>
              </div>
              <input 
                type="range" min="70" max="150" step="1"
                value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-none appearance-none accent-[var(--color-quave-orange)]"
              />
              <div className="flex justify-between mt-1 font-mono text-[8px] text-gray-500 uppercase">
                <span>R&B Lento (70)</span>
                <span>Dembow (150+)</span>
              </div>
            </div>

            {/* Slider Energía */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-quave-orange)] flex items-center gap-2">
                  <MdGraphicEq /> Energía
                </label>
                <span className="font-heading text-2xl font-black text-white">{Math.round(energia * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1" step="0.1"
                value={energia} onChange={(e) => setEnergia(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-none appearance-none accent-[var(--color-quave-orange)]"
              />
            </div>

            {/* Slider Valencia (Vibe) */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-quave-orange)] flex items-center gap-2">
                  <MdMood /> Vibe (Valencia)
                </label>
                <span className="font-heading text-2xl font-black text-white">{Math.round(vibra * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1" step="0.1"
                value={vibra} onChange={(e) => setVibra(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-none appearance-none accent-[var(--color-quave-orange)]"
              />
              <p className="mt-2 font-mono text-[10px] text-center uppercase text-gray-400 border border-gray-800 p-2">
                {getVibeText(vibra)}
              </p>
            </div>

            <button
              onClick={generarPlaylist}
              disabled={cargando}
              className="w-full border-4 border-black bg-[var(--color-quave-orange)] py-4 font-heading text-xl font-black uppercase text-black hover:bg-white transition-all shadow-[4px_4px_0px_white] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {cargando ? 'Computando...' : 'Iniciar Extracción'}
            </button>
          </div>
        </div>

        {/* RESULTADOS (PLAYLIST) */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-6 border-2 border-red-600 bg-red-600/10 p-4 text-red-500 font-mono text-xs uppercase font-black">
              {error}
            </div>
          )}

          {!playlist.length && !cargando && !error && (
            <div className="border-4 border-dashed border-[var(--color-quave-border)] h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-black/50">
              <MdAutoFixHigh className="text-6xl text-[var(--color-quave-border)] mb-4" />
              <p className="font-heading text-3xl font-black uppercase text-white mb-2">Matriz Vacía</p>
              <p className="font-mono text-xs uppercase text-gray-500">Ajusta los parámetros y pulsa en Iniciar Extracción para obtener resultados basados en features matemáticos de audio.</p>
            </div>
          )}

          {playlist.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4 border-b-4 border-white pb-2">
                <h3 className="font-heading text-3xl font-black uppercase text-white">Tracks Computados</h3>
                <span className="font-mono text-[10px] uppercase text-[var(--color-quave-orange)] font-bold">{playlist.length} Resultados</span>
              </div>

              {playlist.map((track, index) => (
                <div 
                  key={track.id}
                  className="group flex items-center gap-4 border-2 border-[var(--color-quave-border)] bg-black p-4 transition-colors hover:border-[var(--color-quave-orange)]"
                >
                  <span className="font-mono text-xs text-gray-600 w-6 text-right">{(index + 1).toString().padStart(2, '0')}</span>
                  
                  <img src={track.imagen} alt="Cover" className="w-12 h-12 border border-black grayscale group-hover:grayscale-0 transition-all" />
                  
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-heading text-lg font-black uppercase text-white truncate group-hover:text-[var(--color-quave-orange)]">
                      {track.nombre}
                    </h4>
                    <p className="font-mono text-[10px] uppercase text-gray-500 truncate">{track.artista}</p>
                  </div>

                  <div className="flex gap-2">
                    {track.preview ? (
                      <button
                        onClick={() => handlePreview(track)}
                        className="p-3 bg-black border-2 border-[var(--color-quave-orange)] text-[var(--color-quave-orange)] hover:bg-[var(--color-quave-orange)] hover:text-black transition-colors"
                      >
                        {currentTrack?.id === track.id && isPlaying ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
                      </button>
                    ) : (
                      <div className="p-3 bg-transparent border-2 border-gray-800 text-gray-800">
                        <MdPlayArrow size={18} />
                      </div>
                    )}
                    <button 
                      onClick={() => navigate(`/cancion/${track.id}`)}
                      className="p-3 bg-white border-2 border-black text-black hover:bg-black hover:text-white hover:border-white transition-colors"
                    >
                      <MdLibraryMusic size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generador;