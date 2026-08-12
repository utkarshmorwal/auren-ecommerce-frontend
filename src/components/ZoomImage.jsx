import { useState } from 'react';

export default function ZoomImage({ src, alt }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('center');

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-zoom-in"
      onMouseMove={handleMove}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-200 ease-out"
          style={{ transformOrigin: origin, transform: zoomed ? 'scale(1.9)' : 'scale(1)' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ink/20 font-display italic text-2xl">
          No image
        </div>
      )}
    </div>
  );
}