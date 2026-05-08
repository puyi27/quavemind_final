import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MdArrowBack, MdPlayArrow, MdPause, MdCheck, MdClose, MdSkipNext, MdHelpOutline, MdLyrics, MdLocalFireDepartment, MdFlag } from 'react-icons/md';
import api from '../services/api';

const GAME_CONFIG = {
  songdle: { title: 'SONGDLE', color: 'from-purple-600 to-pink-600' },
  album: { title: 'ÁLBUM', color: 'from-blue-600 to-cyan-600' },
  artist: { title: 'ARTISTADLE', color: 'from-green-600 to-emerald-600' },
  cover: { title: 'PORTADA', color: 'from-orange-600 to-red-600' },
  lyrics: { title: 'LYRICSDLE', color: 'from-pink-600 to-rose-600' },
  maraton: { title: 'MARATÓN', color: 'from-yellow-600 to-orange-600', infinito: true },
  contrarreloj: { title: 'CONTRARRELOJ', color: 'from-red-600 to-pink-600', tiempo: 30, total: 10 },
};

const FALLBACK_RETO = {
  id: 'fallback-1',
  nombre: 'Columbia',
  artista: 'Quevedo',
  imagen: 'https://i.scdn.co/image/ab67616d0000b27376662eb7dd22f9d375ea4a61',
  fecha: '2022',
  letra: 'Estudia en la Cato, pero es de Columbia\nEscucha a la mafia, a veces la cumbia',
  lineas: [
    'Estudia en la Cato, pero es de Columbia',
    'Escucha a la mafia, a veces la cumbia',
    'Y me llama, me dice que no cambie',
    'Que le gusta mi vibra, mi flow, mi estampa',
    'Y cuando estamos a solas, la nena se suelta',
    'Me dice al oído que quiere dar la vuelta',
    'Y yo no le digo que no...'
  ],
  inicio: 0,
  preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/4a/6d/bd/4a6dbdf9-ec2d-6bb1-f597-cdd21cc83b16/mzaf_8496355325851412093.plus.aac.p.m4a',
  clues: ['Es de Canarias.', 'Salió en verano de 2022.']
};

export default function QuavedleGame() {
  const { gameSlug } = useParams();
  const config = GAME_CONFIG[gameSlug];

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [gameState, setGameState] = useState('playing');
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealed, setRevealed] = useState([]);
  const [lyricsRevealCount, setLyricsRevealCount] = useState(2);
  const [score, setScore] = useState(0);
  const [maratonIndex, setMaratonIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config?.tiempo || 0);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadChallenge();
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameSlug, maratonIndex]);

  useEffect(() => {
    if (gameState === 'playing' && config?.tiempo && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('lost');
            saveGameResult('lost', 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, timeLeft, config?.tiempo]);

  const loadChallenge = async () => {
    setLoading(true);
    setGuess('');
    setAttempts([]);
    setRevealed([]);
    setLyricsRevealCount(2);
    setArtistGuessed(false);
    if (config?.tiempo) setTimeLeft(config.tiempo);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const res = await api.get(`/quavedle/${gameSlug}?modo=infinite`);
      const nuevoReto = res.data?.pista;
      if (!nuevoReto) throw new Error('Fallo extrayendo datos aleatorios');
      if (nuevoReto.tipo === 'artist' && !nuevoReto.clues) {
        nuevoReto.clues = [
          nuevoReto.descripcion || 'Artista del circuito urbano en activo.',
          `Seguidores estimados: ${new Intl.NumberFormat('es-ES').format(nuevoReto.seguidores || 0)}.`,
          `Inicial: "${(nuevoReto.nombre || '?').charAt(0)}".`
        ];
      }
      setChallenge(nuevoReto);
      setGameState('playing');
    } catch (error) {
      const tipoFallback = gameSlug === 'album' || gameSlug === 'cover' || gameSlug === 'artist' || gameSlug === 'lyrics'
        ? gameSlug
        : 'songdle';
      setChallenge({ ...FALLBACK_RETO, tipo: tipoFallback });
      setGameState('playing');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (!challenge?.preview) return;
    if (isPlaying && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); return; }

    try {
      const currentDuration = [1500, 3000, 5000, 8000, 15000, 30000][attempts.length] || 1500;
      if (audioRef.current) audioRef.current.pause();

      audioRef.current = new Audio(challenge.preview);
      await audioRef.current.play();
      setIsPlaying(true);

      setTimeout(() => { if (audioRef.current && !audioRef.current.paused) { audioRef.current.pause(); setIsPlaying(false); } }, currentDuration);
      audioRef.current.onended = () => setIsPlaying(false);
    } catch (err) { setIsPlaying(false); }
  };

  const limpiarTexto = (str) => {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  };

  const [artistGuessed, setArtistGuessed] = useState(false);

  const checkEsCorrecto = (intento) => {
    const intLimpio = limpiarTexto(intento);
    const nombreLimpio = limpiarTexto((challenge?.nombre || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s*-\s*single$/i, '').trim());
    return intLimpio === nombreLimpio || (intLimpio.length >= 4 && nombreLimpio.includes(intLimpio));
  };

  const checkArtistCorrecto = (intento) => {
    const intLimpio = limpiarTexto(intento);
    const artistaLimpio = limpiarTexto(challenge?.artista || '');
    return intLimpio === artistaLimpio || (intLimpio.length >= 4 && artistaLimpio.includes(intLimpio));
  };

  const saveGameResult = async (finalState, finalScore, artistBonus = 0) => {
    try {
      await api.post('/quavedle/save-result', {
        juego: 'quavedle',
        puntuacion: finalScore + artistBonus,
        gano: finalState === 'won',
        metadatos: {
          intentos: attempts.length + 1,
          tipo: challenge?.tipo,
          slug: gameSlug,
          retoId: challenge?.id,
          artistBonus
        }
      });
    } catch (err) {
      console.warn('[GAME] No se pudo guardar el resultado.');
    }
  };

  const checkAnswer = () => {
    if (!guess.trim()) return;
    
    // 1. Verificar si es el nombre correcto (GANA LA PARTIDA)
    const isCorrect = checkEsCorrecto(guess);
    
    // 2. Verificar si es el artista (BONO DE PUNTOS)
    let bonusMessage = null;
    if (!isCorrect && !artistGuessed && checkArtistCorrecto(guess)) {
      setArtistGuessed(true);
      setScore(s => s + 25);
      bonusMessage = "¡AGENTE IDENTIFICADO! (+25 QP). Ahora identifica el título.";
    }

    const newAttempts = [...attempts, { guess, isCorrect, message: bonusMessage }];
    setAttempts(newAttempts);

    if (isCorrect) { 
      const points = Math.max(100 - (newAttempts.length * 10), 10);
      setGameState('won'); 
      setScore(s => s + points);
      saveGameResult('won', points, artistGuessed ? 0 : (bonusMessage ? 25 : 0));
    }
    else if (newAttempts.length >= 6) { 
      setGameState('lost'); 
      saveGameResult('lost', 0);
    }
    
    if (!isCorrect && challenge?.tipo === 'lyrics') setLyricsRevealCount((prev) => prev + 1);
    if (!isCorrect && (challenge?.tipo === 'cover' || challenge?.tipo === 'album' || challenge?.tipo === 'artist')) revealSquare(3);
    setGuess('');
  };

  const revealSquare = (cantidad = 1) => {
    let currentRevealed = [...revealed];
    for (let i = 0; i < cantidad; i++) {
      if (currentRevealed.length >= 16) break;
      let idx; do { idx = Math.floor(Math.random() * 16); } while (currentRevealed.includes(idx));
      currentRevealed.push(idx);
    }
    setRevealed(currentRevealed);
  };

  const handleSkip = () => {
    const newAttempts = [...attempts, { guess: 'Saltado', isCorrect: false }];
    setAttempts(newAttempts);
    if (newAttempts.length >= 6) {
      setGameState('lost');
      saveGameResult('lost', 0);
    }
    if (challenge?.tipo === 'cover') revealSquare(3);
    if (challenge?.tipo === 'lyrics') setLyricsRevealCount((prev) => prev + 2);
  };

  const handleSurrender = () => {
    setAttempts([...attempts, { guess: 'Rendición', isCorrect: false }]);
    setGameState('lost');
    saveGameResult('lost', 0);
  };

  const nextSong = () => {
    if (config?.infinito) {
      setMaratonIndex(i => i + 1);
    } else if (maratonIndex < (config?.total || 10) - 1) {
      setMaratonIndex(i => i + 1);
    } else {
      setGameState('finished');
    }
  };

  const restartGame = () => {
    setScore(0);
    setMaratonIndex(0);
    loadChallenge();
  };

  // 💎 COMPONENTE: TARJETA DE RESULTADO PREMIUM
  const InfoCard = () => (
    <div className="bg-black/40 border border-white/10 rounded-3xl p-6 mb-8 max-w-sm mx-auto shadow-2xl backdrop-blur-sm transform transition-all hover:scale-105">
      <div className="aspect-square w-40 h-40 mx-auto mb-4 overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/5">
        <img src={challenge?.imagen || 'https://via.placeholder.com/300'} alt="Art" className="w-full h-full object-cover" />
      </div>
      <h3 className="text-2xl font-black text-white leading-tight mb-2 uppercase tracking-tighter">
        {challenge?.nombre}
      </h3>

      {challenge?.tipo === 'artist' && (
        <>
          <p className="text-[#ff6b00] font-bold text-sm uppercase tracking-widest">
            POPULARIDAD: {challenge?.popularidad || 'N/A'}/100
          </p>
          <p className="text-gray-300 font-bold text-xs mt-3 leading-relaxed">
            {challenge?.descripcion || 'Artista destacado del universo urbano actual.'}
          </p>
        </>
      )}
      {challenge?.tipo === 'album' && (
        <p className="text-[#ff6b00] font-bold text-sm uppercase tracking-widest">
          {challenge?.artista} • {challenge?.fecha}
        </p>
      )}
      {(challenge?.tipo === 'songdle' || challenge?.tipo === 'lyrics' || challenge?.tipo === 'cover') && (
        <p className="text-[#ff6b00] font-bold text-sm uppercase tracking-widest">
          {challenge?.artista}
        </p>
      )}
    </div>
  );

  if (!config) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-bold uppercase">Simulación no encontrada</div>;
  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent animate-spin rounded-full mb-6"></div>
      <p className="text-[#ff6b00] font-bold uppercase tracking-widest text-xs animate-pulse">Generando Simulación Aleatoria...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 font-sans">
      <div className="max-w-2xl mx-auto py-8">
        <Link to="/quavedle" className="inline-flex items-center gap-2 text-gray-500 hover:text-white font-bold uppercase text-xs tracking-widest mb-8 transition-colors">
          <MdArrowBack className="text-lg" /> Abortar Simulación
        </Link>

        <div className={`bg-gradient-to-r ${config.color} rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">{config.title}</h1>
              <p className="text-white/80 font-bold text-sm tracking-widest uppercase mt-1">Puntos: {score}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {gameSlug === 'maraton' && (
                <p className="flex items-center gap-1 font-black text-[#ff6b00] bg-[#ff6b00]/10 border border-[#ff6b00]/30 px-4 py-2 rounded-full text-xs tracking-widest backdrop-blur-md animate-pulse">
                  <MdLocalFireDepartment className="text-sm" /> FASE {maratonIndex + 1} (SUPERVIVENCIA)
                </p>
              )}
              {gameSlug === 'contrarreloj' && (
                <p className={`font-black ${timeLeft < 10 ? 'text-red-400 bg-red-900/40 animate-pulse' : 'text-white bg-black/40'} px-4 py-2 rounded-full text-sm tracking-widest backdrop-blur-md transition-colors`}>
                  ⏱ {timeLeft} SEG (FASE {maratonIndex + 1} / {config.total})
                </p>
              )}
            </div>
          </div>
        </div>

        {gameState === 'playing' && challenge && (
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">

            {(gameSlug === 'maraton' || gameSlug === 'contrarreloj') && (
              <p className="text-center font-bold text-gray-500 uppercase tracking-widest text-xs mb-6 pb-4 border-b border-white/5">
                OBJETIVO ACTUAL: ADIVINAR {challenge.tipo === 'artist' ? 'ARTISTA' : challenge.tipo === 'album' ? 'ÁLBUM' : challenge.tipo === 'lyrics' ? 'CANCIÓN (POR LETRA)' : 'CANCIÓN (POR AUDIO)'}
              </p>
            )}

            {/* ZONAS DE MINIJUEGO */}
            {challenge.tipo === 'songdle' && (
              <div className="text-center py-2">
                <button onClick={playAudio} className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full mx-auto mb-8 flex items-center justify-center transition-all duration-300 shadow-2xl ${isPlaying ? 'bg-white text-black scale-105 shadow-[0_0_40px_rgba(255,255,255,0.5)]' : 'bg-[#ff6b00] text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(255,107,0,0.5)]'}`}>
                  {isPlaying ? <MdPause className="text-6xl" /> : <MdPlayArrow className="text-6xl ml-2" />}
                </button>
                <div className="flex gap-2 justify-center mb-6">
                  {[1, 2, 3, 5, 6, 6].map((s, i) => (
                    <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i < attempts.length ? 'w-12 bg-red-500/50' : i === attempts.length ? 'w-16 bg-[#ff6b00] shadow-[0_0_10px_#ff6b00]' : 'w-12 bg-[#222]'}`} />
                  ))}
                </div>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Audio liberado: {[1.5, 3, 5, 8, 15, 30][attempts.length]} Segundos</p>
              </div>
            )}

            {(challenge.tipo === 'album' || challenge.tipo === 'artist') && (
              <div className="text-center py-2">
                <div className={`mx-auto mb-8 overflow-hidden shadow-2xl border-4 border-[#222] ${challenge.tipo === 'artist' ? 'w-[68vw] h-[68vw] max-w-56 max-h-56 rounded-full' : 'w-[76vw] h-[76vw] max-w-64 max-h-64 rounded-3xl'}`}>
                  <img src={challenge.imagen || 'https://via.placeholder.com/300'} alt="Pista visual" className="w-full h-full object-cover transition-all duration-700" style={{ filter: `blur(${Math.max(25 - attempts.length * 5, 0)}px) brightness(${50 + attempts.length * 10}%) grayscale(${100 - attempts.length * 20}%)` }} />
                </div>

                <div className="space-y-3 text-left bg-[#111] p-6 rounded-3xl border border-white/5">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><MdHelpOutline className="text-[#ff6b00] text-lg" /> Datos Desencriptados:</p>
                  {challenge.clues && challenge.clues.slice(0, attempts.length + 1).map((clue, idx) => (
                    <p key={idx} className="text-white font-bold text-sm bg-black/40 p-3 rounded-lg border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                      🔎 {clue}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {challenge.tipo === 'cover' && (
              <div className="text-center py-2">
                <div className="relative w-[82vw] h-[82vw] max-w-72 max-h-72 mx-auto mb-8 rounded-3xl overflow-hidden border-4 border-[#222] shadow-2xl">
                  <img src={challenge.imagen || 'https://via.placeholder.com/300'} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`${revealed.includes(i) ? 'opacity-0' : 'bg-[#0a0a0a]'} border-[0.5px] border-white/5 transition-opacity duration-500`} />
                    ))}
                  </div>
                </div>
                <div className="space-y-3 text-left bg-[#111] p-6 rounded-3xl border border-white/5 max-w-xl mx-auto">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><MdHelpOutline className="text-[#ff6b00] text-lg" /> Pistas Desencriptadas:</p>
                  {challenge.clues && challenge.clues.slice(0, attempts.length + 1).map((clue, idx) => (
                    <p key={idx} className="text-white font-bold text-sm bg-black/40 p-3 rounded-lg border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                      🔎 {clue}
                    </p>
                  ))}
                  <p className="text-[10px] font-black text-[#ff6b00] uppercase tracking-widest mt-4 animate-pulse">
                    ⚡ TIP: Identificar al Agente otorga +25 QP.
                  </p>
                </div>
              </div>
            )}

            {challenge.tipo === 'lyrics' && (
              <div className="text-center py-2">
                <div className="bg-[#111] p-10 rounded-[2.5rem] mb-6 border border-white/5 relative">
                  <MdLyrics className="absolute -top-4 -right-4 text-8xl text-white/5" />
                  <div className="text-2xl font-serif italic text-white leading-relaxed text-left relative z-10 whitespace-pre-wrap">
                    "{challenge.lineas
                      ? challenge.lineas.slice(challenge.inicio, challenge.inicio + lyricsRevealCount).join('\n')
                      : challenge.letra}"
                  </div>
                </div>
                <div className="bg-[#111] p-4 rounded-2xl border border-white/5 text-left max-w-xl mx-auto">
                  <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-2">Pistas</p>
                  <p className="text-white font-bold text-sm">
                    Artista: {attempts.length > 2 || artistGuessed ? challenge.artista : `🤫 [CLASIFICADO] - Inicial: ${(challenge.artista || '?').charAt(0)}`}
                  </p>
                  <p className="text-gray-300 font-bold text-xs mt-1">Título empieza por: {(challenge.nombre || '?').charAt(0)}</p>
                  <p className="text-gray-300 font-bold text-xs mt-1">Letras del título: {(challenge.nombre || '').length || '?'}</p>
                  <p className="text-[10px] font-black text-[#ff6b00] uppercase tracking-widest mt-4 animate-pulse">
                    ⚡ TIP: Identificar al Agente otorga +25 QP.
                  </p>
                </div>
              </div>
            )}

            {/* CONTROLES MEJORADOS (Todo agrupado) */}
            <div className="mt-8 bg-[#111] p-6 rounded-3xl border border-white/5">

              {/* Log de intentos compactado encima del input */}
              <div className="flex flex-wrap gap-2 mb-4">
                {attempts.map((att, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold uppercase text-[10px] whitespace-nowrap ${att.isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {att.isCorrect ? <MdCheck /> : <MdClose />} {att.guess}
                    </div>
                    {att.message && (
                      <div className="text-[10px] font-black text-[#ff6b00] uppercase tracking-widest animate-pulse px-3">
                        ⚡ {att.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input y Botón de Sellar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && checkAnswer()} placeholder="Introduce tu respuesta..." className="flex-1 bg-black border border-[#222] rounded-2xl px-6 py-4 text-white font-bold uppercase placeholder-gray-600 focus:border-[#ff6b00] outline-none transition-all" />
                <button onClick={checkAnswer} className="px-8 py-4 bg-[#ff6b00] text-black font-black uppercase rounded-2xl hover:bg-white transition-all active:scale-95">Sellar</button>
              </div>

              {/* Botones de acción rápida: Omitir y Rendirse */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleSkip} className="flex-1 py-3 bg-[#1a1a1a] text-gray-400 font-bold uppercase text-xs rounded-xl hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <MdSkipNext className="text-lg" /> Omitir Pista
                </button>
                <button onClick={handleSurrender} className="flex-1 py-3 bg-red-950/30 text-red-500 font-bold uppercase text-xs rounded-xl hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <MdFlag className="text-lg" /> Rendirse
                </button>
              </div>

            </div>
          </div>
        )}

        {/* PANTALLA DE VICTORIA */}
        {gameState === 'won' && (
          <div className="bg-[#0a0a0a] border border-green-500/30 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(34,197,94,0.1)] mt-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><MdCheck className="text-5xl text-green-500" /></div>
            <h2 className="text-4xl font-black uppercase text-green-500 mb-8 tracking-tighter">¡Objetivo Abatido!</h2>

            {/* TARJETA DE INFO */}
            <InfoCard />

            <div className="flex gap-4 justify-center">
              {(gameSlug === 'maraton' || gameSlug === 'contrarreloj') ? (
                <button onClick={nextSong} className="px-10 py-5 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">Siguiente Fase</button>
              ) : (
                <button onClick={loadChallenge} className="px-10 py-5 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-transform">Nueva Simulación</button>
              )}
            </div>
          </div>
        )}

        {/* PANTALLA DE DERROTA */}
        {gameState === 'lost' && (
          <div className="bg-[#1a0505] border border-red-500/30 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] mt-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><MdClose className="text-5xl text-red-500" /></div>
            <h2 className="text-4xl font-black uppercase text-red-500 mb-8 tracking-tighter">Simulación Fallida</h2>

            {/* TARJETA DE INFO (REVELA LO QUE ERA) */}
            <InfoCard />

            {gameSlug === 'maraton' && (
              <div className="bg-black/50 rounded-xl p-4 mb-8 border border-[#ff6b00]/20 inline-block">
                <p className="text-[#ff6b00] font-black uppercase tracking-widest text-sm mb-1">FIN DE LA SUPERVIVENCIA</p>
                <p className="text-white font-bold">Llegaste a la Fase {maratonIndex + 1} con {score} Puntos</p>
              </div>
            )}

            <div className="flex gap-4 justify-center mt-4">
              {gameSlug === 'maraton' ? (
                <button onClick={restartGame} className="px-10 py-5 bg-red-600 text-white font-black uppercase rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.3)]">Nueva Maratón</button>
              ) : gameSlug === 'contrarreloj' ? (
                <button onClick={nextSong} className="px-10 py-5 bg-red-600 text-white font-black uppercase rounded-2xl hover:scale-105 transition-transform">Siguiente Fase</button>
              ) : (
                <button onClick={loadChallenge} className="px-10 py-5 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-transform">Reintentar</button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

