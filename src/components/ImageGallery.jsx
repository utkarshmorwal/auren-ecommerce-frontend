import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const LENS_SIZE = 150;
const ZOOM_SCALE = 220; // % background-size — higher = more zoomed in

export default function ImageGallery({ images, alt, hasDiscount, discountPercent, wishlisted, onToggleWishlist }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [lensPos, setLensPos] = useState({ left: 0, top: 0 });
  const [zoomBgPosition, setZoomBgPosition] = useState('0% 0%');
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = imageRef.current.getBoundingClientRect();
    const half = LENS_SIZE / 2;
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(half, Math.min(x, rect.width - half));
    y = Math.max(half, Math.min(y, rect.height - half));
    setLensPos({ left: x - half, top: y - half });
    setZoomBgPosition(`${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`);
  };

  const activeImage = images[activeIndex] || images[0];

  return (
    <div className="flex gap-3">
      {/* Vertical thumbnail rail — desktop */}
      {images.length > 1 && (
        <div className="hidden sm:flex flex-col gap-3 w-16 flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                activeIndex === i ? 'border-verdant' : 'border-transparent hover:border-stone'
              }`}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 min-w-0">
        <div
          ref={imageRef}
          onMouseEnter={() => setZoomVisible(true)}
          onMouseLeave={() => setZoomVisible(false)}
          onMouseMove={handleMouseMove}
          className="aspect-square rounded-2xl bg-stone overflow-hidden relative cursor-crosshair"
        >
          {hasDiscount && (
            <span className="absolute top-4 left-4 z-10 bg-ember text-paper text-xs font-mono px-3 py-1.5 rounded-full">
              {discountPercent}% OFF
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleWishlist}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-paper/90 flex items-center justify-center"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} strokeWidth={1.75} className={wishlisted ? 'text-ember fill-ember' : 'text-ink/50'} />
          </motion.button>

          {activeImage ? (
            <img src={activeImage} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/20 font-display italic text-2xl">
              No image
            </div>
          )}

          {/* Lens square that follows the cursor */}
          {zoomVisible && (
            <div
              className="hidden md:block absolute border-2 border-paper/90 bg-paper/20 pointer-events-none z-20"
              style={{ left: lensPos.left, top: lensPos.top, width: LENS_SIZE, height: LENS_SIZE }}
            />
          )}
        </div>

        {/* Magnified panel beside the main image — desktop only */}
        {zoomVisible && activeImage && (
          <div
            className="hidden md:block absolute top-0 left-full ml-4 w-full aspect-square rounded-2xl border border-stone shadow-xl overflow-hidden z-30 bg-stone"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundSize: `${ZOOM_SCALE}%`,
              backgroundPosition: zoomBgPosition,
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {/* Horizontal thumbnail row — mobile only, since hover doesn't exist on touch */}
        {images.length > 1 && (
          <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  activeIndex === i ? 'border-verdant' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}