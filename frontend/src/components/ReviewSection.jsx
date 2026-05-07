import { useState } from 'react';
import { MdSend, MdRateReview, MdHistoryEdu } from 'react-icons/md';

const ReviewSection = ({ initialComment = '', onSave, label = 'Análisis del Agente' }) => {
  const [comment, setComment] = useState(initialComment);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(comment);
    setIsEditing(false);
  };

  return (
    <div className="mt-6 border-t border-white/5 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <MdRateReview className="text-[#ff6b00] text-lg" />
          {label}
        </h4>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-[#ff6b00] hover:underline uppercase"
          >
            {comment ? 'Editar Review' : 'Añadir Review'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu análisis técnico sobre esta pista..."
            className="w-full bg-black border border-[#222] rounded-2xl p-4 text-white font-medium text-sm focus:border-[#ff6b00] outline-none min-h-[120px] transition-all"
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white/5 text-gray-400 font-bold text-[10px] rounded-lg hover:text-white"
            >
              CANCELAR
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-[#ff6b00] text-black font-black text-[10px] rounded-lg hover:bg-white transition-colors"
            >
              <MdSend /> GUARDAR REPORTE
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {comment ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 italic text-gray-300 text-sm leading-relaxed relative overflow-hidden">
               <MdHistoryEdu className="absolute -right-2 -bottom-2 text-6xl text-white/5" />
               <p className="relative z-10">"{comment}"</p>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#ff6b00]/30 hover:text-gray-400 transition-all group"
            >
               <MdRateReview className="text-3xl opacity-20 group-hover:opacity-40" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sin análisis encriptado</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
