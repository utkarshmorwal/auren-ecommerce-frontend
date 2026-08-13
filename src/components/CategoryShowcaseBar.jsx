import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryShowcaseBar({ categories, selectedCategory, onSelect }) {
  const [hovered, setHovered] = useState(null);
  if (categories.length === 0) return null;

  const preview = categories.find((c) => c.name === hovered);

  return (
    <div
      className="relative bg-white/70 border-b border-stone"
      onMouseLeave={() => setHovered(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => onSelect(selectedCategory)}
            onMouseEnter={() => setHovered(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-widest whitespace-nowrap transition-colors border ${
              !selectedCategory ? 'bg-ink text-paper border-ink' : 'border-stone text-ink/60 hover:border-ink/30 hover:text-ink'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelect(cat.name)}
              onMouseEnter={() => setHovered(cat.name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-widest whitespace-nowrap transition-colors border ${
                selectedCategory === cat.name ? 'bg-ink text-paper border-ink' : 'border-stone text-ink/60 hover:border-ink/30 hover:text-ink'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {preview && preview.image && (
          <motion.div
            key={preview.name}
            initial={{ opacity: 0, y: -12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 -translate-x-1/2 top-full w-80 pt-3 z-50"
          >
            <div className="aspect-[4/3] rounded-md overflow-hidden shadow-2xl ring-1 ring-stone relative">
              <img src={preview.image} alt={preview.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-display text-paper text-xl leading-tight">{preview.name}</p>
                <p className="text-paper/60 text-xs font-mono mt-1">{preview.count} item{preview.count !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}