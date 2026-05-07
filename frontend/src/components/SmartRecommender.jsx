import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { MdHub, MdAutoAwesome, MdCompareArrows, MdRadar, MdStream, MdPsychology } from 'react-icons/md';
import { Link } from 'react-router-dom';

const SmartRecommender = ({ artista, relacionados }) => {
  const [activeNode, setActiveNode] = useState(null);
  const [analyzing, setAnalyzing] = useState(true);
  const containerRef = useRef(null);

  // Datos de la red
  const nodes = useMemo(() => {
    if (!relacionados) return [];
    return [...relacionados]
      .sort((a, b) => b.scoreConexion - a.scoreConexion)
      .slice(0, 10);
  }, [relacionados]);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2200);
    return () => clearTimeout(timer);
  }, [artista.id]);

  const getAIReasoning = (target) => {
    if (target.esColaborador) {
      return `NODO DE COLABORACIÓN: Se ha detectado una intersección de frecuencias en ${target.sharedTracks || 1} proyectos. El ADN musical está entrelazado.`;
    }
    return `NODO DE AFINIDAD: Coincidencia estética del ${target.scoreConexion}% en el espectro urbano. Flujo rítmico altamente compatible.`;
  };

  return (
    <div className="mt-20 relative overflow-hidden rounded-[5rem] bg-[#020202] border border-white/5 p-12 lg:p-20 shadow-[0_0_150px_rgba(0,0,0,1)]">
      {/* Dynamic Digital Mesh Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" className="text-[#ff6b00]">
          <pattern id="mesh" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202]" />
      </div>

      <div className="relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="p-6 bg-gradient-to-br from-[#ff6b00] to-[#ff4d00] rounded-[2.5rem] text-black shadow-[0_0_50px_rgba(255,107,0,0.4)]"
              >
                <MdRadar className="text-5xl" />
              </motion.div>
              <div className="absolute -inset-2 border border-[#ff6b00]/20 rounded-[2.8rem] animate-ping" />
            </div>
            <div>
              <h3 className="text-4xl font-black uppercase tracking-tighter text-white">Quave Neural Engine</h3>
              <div className="flex items-center gap-3 mt-2">
                <MdStream className="text-[#ff6b00] text-xl" />
                <p className="text-[11px] font-black text-[#ff6b00] uppercase tracking-[0.6em]">Mapeo de ADN Musical Interactivo</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-2 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
             <div className="px-6 py-3 bg-[#ff6b00] rounded-2xl text-black text-[10px] font-black uppercase tracking-widest">Vista de Red</div>
             <div className="px-6 py-3 text-gray-500 text-[10px] font-black uppercase tracking-widest">Matriz de Datos</div>
          </div>
        </header>

        <div ref={containerRef} className="relative h-[1000px] lg:h-[700px] w-full flex flex-col lg:flex-row items-center overflow-hidden">
          <AnimatePresence>
            {analyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full h-full flex flex-col items-center justify-center gap-8"
              >
                <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                   <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-t-4 border-r-4 border-[#ff6b00] rounded-full"
                   />
                   <MdAutoAwesome className="absolute inset-0 m-auto text-4xl lg:text-6xl text-[#ff6b00] animate-pulse" />
                </div>
                <div className="text-center px-4">
                  <p className="text-base lg:text-lg font-black text-white uppercase tracking-[0.5em]">Sincronizando Nodos...</p>
                  <p className="text-[9px] lg:text-[10px] text-gray-500 font-bold uppercase mt-2">Analizando ecosistema de {artista.nombre}</p>
                </div>
              </motion.div>
            ) : (
              <div className="relative w-full h-full flex flex-col lg:flex-row">
                {/* Graph Area (Responsive Width) */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative w-full lg:w-[65%] h-[500px] lg:h-full border-b lg:border-b-0 lg:border-r border-white/5"
                >
                  {/* SVG Connections Layer */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                      <filter id="lineGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    {nodes.map((node, i) => {
                      const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                      return (
                        <motion.line
                          key={`line-${node.id}`}
                          x1="50%" y1="50%"
                          x2={`${50 + Math.cos(angle) * 35}%`} 
                          y2={`${50 + Math.sin(angle) * 35}%`}
                          stroke={node.esColaborador ? "#ff6b00" : "rgba(255,255,255,0.05)"}
                          strokeWidth={node.esColaborador ? "3" : "1"}
                          strokeDasharray={node.esColaborador ? "0" : "8 4"}
                          filter="url(#lineGlow)"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ 
                            pathLength: 1, 
                            opacity: activeNode?.id === node.id ? 1 : 0.3,
                            strokeWidth: activeNode?.id === node.id ? 5 : (node.esColaborador ? 3 : 1)
                          }}
                          transition={{ duration: 1.5, delay: i * 0.1 }}
                        />
                      );
                    })}
                  </svg>

                  {/* Central Core Node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative p-2 lg:p-3 bg-gradient-to-tr from-[#ff6b00] to-[#ff2a00] rounded-[2rem] lg:rounded-[3rem] shadow-[0_0_60px_rgba(255,107,0,0.4)]"
                    >
                      <div className="relative w-20 h-20 lg:w-36 lg:h-36 rounded-[1.6rem] lg:rounded-[2.2rem] overflow-hidden border-4 lg:border-8 border-black">
                        <img src={artista.imagen} alt={artista.nombre} className="w-full h-full object-cover" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Satellite Nodes */}
                  {nodes.map((node, i) => {
                    const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                    // Radius dynamic for mobile
                    const radius = window.innerWidth < 1024 ? 140 : 220; 
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <motion.div
                        key={node.id}
                        className="absolute top-1/2 left-1/2 z-40"
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{ x, y, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 40, damping: 15, delay: i * 0.1 }}
                      >
                        <Link 
                          to={`/artista/${node.id}`} 
                          className="block -translate-x-1/2 -translate-y-1/2 group"
                          onMouseEnter={() => setActiveNode(node)}
                          onMouseLeave={() => setActiveNode(null)}
                        >
                          <motion.div 
                            animate={{ 
                              y: [0, -10, 0],
                              scale: activeNode?.id === node.id ? 1.2 : 1
                            }}
                            transition={{ 
                              y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
                              scale: { duration: 0.2 }
                            }}
                            className={`relative p-1 rounded-[1.2rem] lg:rounded-[1.5rem] border-2 transition-all duration-500 ${activeNode?.id === node.id ? 'border-[#ff6b00] shadow-[0_0_30px_rgba(255,107,0,0.5)]' : 'border-white/5 grayscale group-hover:grayscale-0'}`}
                          >
                            <img src={node.imagen} alt={node.nombre} className="w-12 h-12 lg:w-16 lg:h-16 rounded-[1rem] lg:rounded-[1.2rem] object-cover" />
                            
                            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#ff6b00] text-black rounded-lg whitespace-nowrap transition-all duration-300 pointer-events-none text-[9px] font-black uppercase ${activeNode?.id === node.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                              {node.nombre}
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Info Area (Responsive Width) */}
                <div className="relative w-full lg:w-[35%] h-auto lg:h-full overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {activeNode ? (
                      <motion.div 
                        key={activeNode.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="h-full flex flex-col justify-center p-6 lg:p-10 bg-gradient-to-t lg:bg-gradient-to-l from-[#ff6b00]/10 to-transparent"
                      >
                        <div className="flex flex-col gap-6 lg:gap-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#ff6b00]/20 rounded-2xl border border-[#ff6b00]/30">
                              <MdPsychology className="text-2xl lg:text-3xl text-[#ff6b00]" />
                            </div>
                            <div>
                              <h4 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter truncate max-w-[200px]">{activeNode.nombre}</h4>
                              <p className="text-[10px] font-black text-[#ff6b00] uppercase tracking-[0.4em]">Quave AI Analysis</p>
                            </div>
                          </div>
                          
                          <p className="text-sm lg:text-base text-gray-300 italic font-medium leading-relaxed bg-black/40 p-5 lg:p-8 rounded-[2rem] border-l-4 border-[#ff6b00] backdrop-blur-sm">
                            "{getAIReasoning(activeNode)}"
                          </p>
                          
                          <div className="flex flex-col gap-6">
                             <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-end">
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nivel de Afinidad</span>
                                  <span className="text-xs font-black text-[#ff6b00]">{activeNode.scoreConexion}%</span>
                                </div>
                                <div className="flex gap-1.5 h-1.5">
                                  {[...Array(10)].map((_, i) => (
                                    <div key={i} className={`flex-1 rounded-full ${i < (activeNode.scoreConexion / 10) ? 'bg-[#ff6b00] shadow-[0_0_10px_#ff6b00]' : 'bg-white/5'}`} />
                                  ))}
                                </div>
                             </div>
                             {activeNode.id && (
                               <Link to={`/artista/${activeNode.id}`} className="w-full text-center py-4 lg:py-5 bg-white text-black font-black text-xs uppercase rounded-2xl hover:bg-[#ff6b00] transition-all tracking-[0.2em] shadow-2xl">
                                  Explorar Perfil
                               </Link>
                             )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-[300px] lg:h-full flex flex-col items-center justify-center p-10 text-center text-gray-600"
                      >
                        <MdRadar className="text-5xl mb-6 opacity-10 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                          Interacción requerida:<br/>Selecciona un nodo para mapear el ADN
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
             <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[#ff6b00]">Engine Core 5.0</span>
             <span>Neural Mesh Active</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic">
                Procesando datos en tiempo real de la escena urbana
             </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SmartRecommender;
