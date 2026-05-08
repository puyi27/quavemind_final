import { useEffect, useState } from 'react';
import { MdStar, MdStarHalf, MdStarOutline } from 'react-icons/md';

const RatingSystem = ({ initialRating = 0, label = 'Auditar Track', onRate }) => {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleMouseMove = (e, starValue) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const isHalf = (e.clientX - left) / width < 0.5;
    setHover(isHalf ? starValue - 0.5 : starValue);
  };

  const handleClick = () => {
    const val = hover || rating;
    setRating(val);
    if (onRate) onRate(val);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex items-center gap-3 mb-4">
        <div className="h-[1px] flex-1 bg-white/5" />
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] whitespace-nowrap">
          {label}
        </span>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>
      
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const currentValue = hover || rating;
          const normalizedVal = Math.round(currentValue * 10) / 10;
          const showFull = normalizedVal >= star;
          const showHalf = !showFull && normalizedVal >= star - 0.5;

          return (
            <button
              key={star}
              type="button"
              className="relative transition-all duration-200 hover:scale-110 focus:outline-none cursor-pointer group p-1 md:p-0"
              onMouseMove={(e) => handleMouseMove(e, star)}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const { left, width } = e.currentTarget.getBoundingClientRect();
                const isHalf = (touch.clientX - left) / width < 0.5;
                const val = isHalf ? star - 0.5 : star;
                setHover(0);
                setRating(val);
                if (onRate) onRate(val);
              }}
              onClick={handleClick}
            >
              {showFull ? (
                <MdStar size={32} className="text-[#ff6b00]" />
              ) : showHalf ? (
                <div className="relative">
                   <MdStarOutline size={32} className="text-white/10" />
                   <div className="absolute inset-0 w-1/2 overflow-hidden">
                     <MdStar size={32} className="text-[#ff6b00]" />
                   </div>
                </div>
              ) : (
                <MdStarOutline size={32} className="text-white/10 group-hover:text-white/30 transition-colors" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="h-10 mt-4 flex items-center justify-center">
        {rating > 0 ? (
          <div className="bg-[#ff6b00]/10 px-4 py-1.5 rounded-xl border border-[#ff6b00]/20">
            <span className="text-xl font-black text-[#ff6b00] italic tracking-tighter">{rating}<span className="opacity-50 text-xs ml-1">/ 5.0</span></span>
          </div>
        ) : (
          <span className="text-gray-600 font-bold text-[9px] uppercase tracking-widest">Esperando auditoría</span>
        )}
      </div>
    </div>
  );
};

export default RatingSystem;
