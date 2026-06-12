import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPsychology, MdAutoAwesome, MdHub, MdTrendingUp, MdWhatshot, MdExplore } from 'react-icons/md';
import { Link } from 'react-router-dom';

const AINeuralDiscovery = ({ title, type, data, description }) => {
  const [activeNode, setActiveNode] = useState(null);
  const [analyzing, setAnalyzing] = useState(true);
  const containerRef = useRef(null);

  const nodes = useMemo(() => {
    if (!data) return [];
    // Prioritize emerging artists or trending ones
    return [...data]
      .sort((a, b) => (type === 'emerging' ? a.popularidad - b.popularidad : b.popularidad - a.popularidad))
      .slice(0, 10);
  }, [data, type]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [radius, setRadius] = useState(200);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setRadius(window.innerWidth < 1024 ? 110 : 200);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, [data]);

  const getDiscoveryInsight = (node) => {
    if (type === 'emerging') {
      return `POTENCIAL DETECTADO: Este artista muestra patrones de crecimiento similares a los líderes de la escena. Su score de innovación es del ${node.popularidad + 20}%.`;
    }
    return `NODO CORE: Pilar fundamental de la escena. Su influencia se expande a través de ${node.generos?.length || 2} sub-corrientes musicales.`;
  };

  return (
    <div className="relative overflow-hidden rounded-[3rem] lg:rounded-[4rem] bg-[#050505] border border-white/5 p-6 lg:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
      {/* Background FX */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#ff6b0010_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 lg:mb-16 gap-6">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="p-4 lg:p-5 bg-[#ff6b00] rounded-3xl text-black shadow-[0_0_40px_rgba(255,107,0,0.3)] shrink-0">
              {type === 'emerging' ? <MdTrendingUp className="text-3xl lg:text-4xl" /> : <MdExplore className="text-3xl lg:text-4xl" />}
            </div>
            <div>
              <h3 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter text-white">{title}</h3>
              <p className="text-[9px] lg:text-[10px] font-black text-[#ff6b00] uppercase tracking-[0.3em] lg:tracking-[0.5em] mt-1 lg:mt-2">{description || 'Análisis de Red por Quave AI'}</p>
            </div>
          </div>
          
          <div className="px-4 py-2 lg:px-6 lg:py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">Escaneo Activo</span>
          </div>
        </header>

        <div className="relative min-h-[500px] lg:min-h-0 lg:h-[600px] w-full flex items-center justify-center overflow-hidden">
           <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full flex flex-col items-center justify-center gap-6"
              >
                <MdPsychology className="text-7xl text-[#ff6b00] animate-pulse" />
                <p className="text-xs font-black text-white uppercase tracking-[0.4em] text-center">Procesando ADN de la Escena...</p>
              </motion.div>
            ) : isMobile ? (
              /* MOBILE DNA LAYOUT */
              <motion.div 
                key="mobile-dna"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full flex flex-col pt-4 pb-12"
              >
                {/* Central Spine */}
                <div className="absolute top-10 bottom-10 left-1/2 w-0.5 bg-gradient-to-b from-[#ff6b00] via-[#ff6b00]/30 to-transparent -translate-x-1/2" />
                
                {/* Hub */}
                <div className="relative z-10 flex justify-center mb-12">
                  <div className="w-20 h-20 bg-[#ff6b00] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,107,0,0.5)]">
                    <MdHub className="text-4xl text-black" />
                    <div className="absolute -inset-2 border border-[#ff6b00]/30 rounded-full animate-ping" />
                  </div>
                </div>

                {/* Nodes */}
                <div className="flex flex-col gap-8 relative z-10">
                  {nodes.map((node, i) => {
                    const isLeft = i % 2 === 0;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: i * 0.1 }}
                        key={node.id} 
                        className={`flex w-full items-center relative ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                         <div className="w-1/2" />
                         
                         {/* Connector Dot */}
                         <div className="absolute left-1/2 w-4 h-4 bg-[#050505] border-2 border-[#ff6b00] rounded-full -translate-x-1/2 shadow-[0_0_10px_#ff6b00]" />

                         {/* Horizontal connector line */}
                         <div className={`absolute top-1/2 h-0.5 bg-[#ff6b00]/30 -translate-y-1/2 ${isLeft ? 'right-1/2 w-8' : 'left-1/2 w-8'}`} />

                         {/* Card */}
                         <div className={`w-1/2 flex ${isLeft ? 'justify-end pr-8' : 'justify-start pl-8'}`}>
                           <div className="w-full max-w-[160px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center shadow-xl">
                             <div className="relative mb-3">
                               <img src={node.imagen} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#ff6b00]" alt={node.nombre} />
                               {type === 'emerging' && (
                                 <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#ff6b00] rounded-full flex items-center justify-center text-black">
                                   <MdWhatshot className="text-[10px]" />
                                 </div>
                               )}
                             </div>
                             <h4 className="text-xs font-black text-white uppercase leading-tight mb-2 line-clamp-2">{node.nombre}</h4>
                             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                               <div className="h-full bg-[#ff6b00]" style={{ width: `${node.popularidad}%` }} />
                             </div>
                             <Link to={`/artista/${node.id}`} className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ff6b00] transition-colors shadow-lg active:scale-95">
                               Perfil
                             </Link>
                           </div>
                         </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* DESKTOP CIRCULAR LAYOUT */
              <motion.div 
                key="desktop-circle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 w-full h-full flex flex-row gap-0"
              >
                {/* Visual Area */}
                <div className="relative flex-1 h-full shrink-0">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    {nodes.map((node, i) => {
                      const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                      return (
                        <motion.line
                          key={node.id}
                          x1="50%" y1="50%"
                          x2={`calc(50% + ${Math.cos(angle) * radius}px)`} 
                          y2={`calc(50% + ${Math.sin(angle) * radius}px)`}
                          stroke="rgba(255,107,0,0.15)"
                          strokeWidth="2"
                          initial={{ pathLength: 0, opacity: 0.2 }}
                          animate={{ pathLength: 1, opacity: activeNode?.id === node.id ? 1 : 0.2 }}
                          transition={{ duration: 1 }}
                        />
                      );
                    })}
                  </svg>

                  {/* Scene Core */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative w-32 h-32 bg-[#ff6b00] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,107,0,0.4)]">
                      <MdHub className="text-5xl text-black" />
                      <div className="absolute -inset-4 border border-[#ff6b00]/20 rounded-full animate-ping" />
                    </div>
                  </div>

                  {/* Satellite Nodes */}
                  {nodes.map((node, i) => {
                    const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <motion.div
                        key={node.id}
                        className="absolute top-1/2 left-1/2 z-20 cursor-pointer"
                        initial={{ x: 0, y: 0 }}
                        animate={{ x, y }}
                        onClick={() => setActiveNode(node)}
                        onMouseEnter={() => setActiveNode(node)}
                      >
                        <div className="block -translate-x-1/2 -translate-y-1/2 group">
                          <motion.div 
                            whileHover={{ scale: 1.2 }}
                            className={`relative p-1 rounded-2xl border-2 transition-all duration-500 ${activeNode?.id === node.id ? 'border-[#ff6b00] shadow-[0_0_30px_#ff6b00] grayscale-0' : 'border-white/10 grayscale hover:grayscale-0 bg-black/50 backdrop-blur-sm'}`}
                          >
                            <img src={node.imagen} alt={node.nombre} className="w-16 h-16 rounded-xl object-cover" />
                            {type === 'emerging' && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff6b00] rounded-full flex items-center justify-center text-black shadow-lg">
                                <MdWhatshot className="text-xs" />
                              </div>
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Info Area */}
                <div className="relative w-[320px] lg:w-[380px] shrink-0 h-full overflow-y-auto border-l border-white/5 p-10">
                  <AnimatePresence mode="wait">
                    {activeNode ? (
                      <motion.div
                        key={activeNode.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="flex items-center gap-4">
                          <img src={activeNode.imagen} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#ff6b00]" />
                          <div>
                            <h4 className="text-xl font-black text-white uppercase">{activeNode.nombre}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-bold text-[#ff6b00] uppercase tracking-widest">Score AI: {activeNode.popularidad + 15}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border-l-4 border-[#ff6b00] text-sm text-gray-300 italic leading-relaxed">
                          "{getDiscoveryInsight(activeNode)}"
                        </div>

                        <div className="flex flex-col gap-4">
                           <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                              <span>Afinidad con la Escena</span>
                              <span className="text-[#ff6b00]">{activeNode.popularidad}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${activeNode.popularidad}%` }}
                                className="h-full bg-[#ff6b00]" 
                              />
                           </div>
                           <Link to={`/artista/${activeNode.id}`} className="mt-4 w-full py-4 bg-white text-black text-center font-black text-[11px] uppercase rounded-xl hover:bg-[#ff6b00] transition-colors tracking-widest">
                              Explorar Perfil
                           </Link>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 gap-4">
                        <MdPsychology className="text-5xl opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Selecciona un artista para analizar su impacto</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AINeuralDiscovery;
