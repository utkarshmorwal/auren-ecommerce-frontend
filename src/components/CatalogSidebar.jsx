import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';

// Maps common color names to a swatch color. Falls back to a neutral gray
// dot with the name shown as text if a color isn't in this list — nothing
// breaks, it just won't have a matching swatch color.
const COLOR_SWATCHES = {
  black: '#111111',
  white: '#ffffff',
  red: '#dc2626',
  blue: '#2563eb',
  navy: '#1e3a5f',
  green: '#16a34a',
  yellow: '#eab308',
  orange: '#f97316',
  pink: '#ec4899',
  purple: '#9333ea',
  gray: '#9ca3af',
  grey: '#9ca3af',
  brown: '#78350f',
  beige: '#e7dcc8',
  gold: '#d4af37',
  silver: '#c0c0c0',
  maroon: '#7f1d1d',
  teal: '#0d9488',
  multicolor: 'conic-gradient(red, orange, yellow, green, blue, purple, red)',
};

function swatchStyle(name) {
  const key = (name || '').trim().toLowerCase();
  const value = COLOR_SWATCHES[key];
  if (!value) return { background: '#d4d4d4' };
  return value.startsWith('conic') ? { backgroundImage: value } : { backgroundColor: value };
}

const RATING_OPTIONS = [4, 3];

function PriceRangeSlider({ min, max, value, onChange }) {
  const span = Math.max(max - min, 1);
  const percent = (v) => ((v - min) / span) * 100;

  const handleMinChange = (e) => {
    const next = Math.min(Number(e.target.value), value.max - 1);
    onChange({ ...value, min: next });
  };
  const handleMaxChange = (e) => {
    const next = Math.max(Number(e.target.value), value.min + 1);
    onChange({ ...value, max: next });
  };

  return (
    <div>
      <style>{`
        .price-slider-thumb { pointer-events: none; }
        .price-slider-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #4338ca;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
        .price-slider-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #4338ca;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
      `}</style>
      <div className="relative h-1.5 rounded-full bg-stone mt-3 mb-3">
        <div
          className="absolute h-1.5 rounded-full bg-verdant"
          style={{ left: `${percent(value.min)}%`, right: `${100 - percent(value.max)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value.min}
          onChange={handleMinChange}
          className="price-slider-thumb absolute w-full top-1/2 -translate-y-1/2 h-1.5 appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value.max}
          onChange={handleMaxChange}
          className="price-slider-thumb absolute w-full top-1/2 -translate-y-1/2 h-1.5 appearance-none bg-transparent"
        />
      </div>
      <div className="flex items-center justify-between text-xs font-mono text-ink/60">
        <span>₹{value.min}</span>
        <span>₹{value.max}</span>
      </div>
    </div>
  );
}

export default function CatalogSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  brandsForSelectedCategory,
  selectedBrand,
  onSelectBrand,
  colorsAvailable,
  selectedColor,
  onSelectColor,
  selectedRating,
  onSelectRating,
  priceBounds,
  priceRange,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  onClearAll,
  hasActiveFilters,
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs uppercase tracking-widest text-ember hover:text-ember-light transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-3">Category</h3>
        <div className="space-y-1">
          {categories.map(({ name, count }) => {
            const isActive = selectedCategory === name;
            return (
              <div key={name}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(name)}
                  className={`w-full flex items-center gap-2 py-1.5 text-left transition-colors ${
                    isActive ? 'text-verdant' : 'text-ink/70 hover:text-ink'
                  }`}
                >
                  <ChevronRight
                    size={13}
                    strokeWidth={2}
                    className={`flex-shrink-0 transition-transform ${isActive ? 'rotate-90 text-verdant' : 'text-ink/30'}`}
                  />
                  <span className="text-sm flex-1">{name}</span>
                  <span className="text-xs font-mono text-ink/30">({count})</span>
                </button>

                <AnimatePresence initial={false}>
                  {isActive && brandsForSelectedCategory.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden pl-[21px]"
                    >
                      <div className="space-y-2 py-2 border-l border-stone ml-1.5 pl-4">
                        {brandsForSelectedCategory.map(({ name: brandName, count: brandCount }) => (
                          <label key={brandName} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedBrand === brandName}
                              onChange={() => onSelectBrand(brandName)}
                              className="w-3.5 h-3.5 rounded border-stone accent-verdant focus:ring-verdant/40"
                            />
                            <span className="text-xs text-ink/60 group-hover:text-ink transition-colors flex-1">
                              {brandName}
                            </span>
                            <span className="text-xs font-mono text-ink/30">({brandCount})</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {colorsAvailable.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-3">Color</h3>
          <div className="flex flex-wrap gap-2.5">
            {colorsAvailable.map(({ name, count }) => {
              const isActive = selectedColor === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSelectColor(name)}
                  title={`${name} (${count})`}
                  aria-label={name}
                  aria-pressed={isActive}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    isActive ? 'ring-2 ring-verdant ring-offset-2 ring-offset-paper border-transparent' : 'border-stone/80'
                  }`}
                  style={swatchStyle(name)}
                />
              );
            })}
          </div>
          {selectedColor && <p className="text-xs text-ink/50 mt-2">{selectedColor}</p>}
        </div>
      )}

      <div>
        <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-1">Price</h3>
        <PriceRangeSlider min={priceBounds.min} max={priceBounds.max} value={priceRange} onChange={onPriceChange} />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-3">Rating</h3>
        <div className="space-y-2">
          {RATING_OPTIONS.map((r) => {
            const isActive = selectedRating === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSelectRating(r)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  isActive ? 'border-verdant bg-verdant/10 text-verdant' : 'border-stone text-ink/70 hover:border-ink/30'
                }`}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r }).map((_, i) => (
                    <Star key={i} size={13} strokeWidth={0} fill="currentColor" />
                  ))}
                </span>
                <span>& above</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-3">Availability</h3>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="w-4 h-4 rounded border-stone accent-verdant focus:ring-verdant/40"
          />
          <span className="text-sm text-ink/70 group-hover:text-ink transition-colors">In stock only</span>
        </label>
      </div>
    </div>
  );
}
