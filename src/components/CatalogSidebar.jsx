import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';

// Maps common color names to a swatch color.
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
  multicolor:
    'conic-gradient(red, orange, yellow, green, blue, purple, red)',
};

function swatchStyle(name) {
  const key = (name || '').trim().toLowerCase();
  const value = COLOR_SWATCHES[key];

  if (!value) {
    return { backgroundColor: '#6b7280' };
  }

  return value.startsWith('conic')
    ? { backgroundImage: value }
    : { backgroundColor: value };
}

const RATING_OPTIONS = [4, 3];

function PriceRangeSlider({ min, max, value, onChange }) {
  const span = Math.max(max - min, 1);

  const percent = (v) => ((v - min) / span) * 100;

  const handleMinChange = (e) => {
    const next = Math.min(
      Number(e.target.value),
      value.max - 1
    );

    onChange({
      ...value,
      min: next,
    });
  };

  const handleMaxChange = (e) => {
    const next = Math.max(
      Number(e.target.value),
      value.min + 1
    );

    onChange({
      ...value,
      max: next,
    });
  };

  return (
    <div>
      <style>{`
        .price-slider-thumb {
          pointer-events: none;
        }

        .price-slider-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #22d3ee;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }

        .price-slider-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #22d3ee;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
      `}</style>

      <div className="relative h-1.5 rounded-full bg-white/10 mt-3 mb-3">
        <div
          className="absolute h-1.5 rounded-full bg-cyan-400"
          style={{
            left: `${percent(value.min)}%`,
            right: `${100 - percent(value.max)}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value.min}
          onChange={handleMinChange}
          className="price-slider-thumb absolute w-full top-1/2 -translate-y-1/2 h-1.5 appearance-none bg-transparent"
          aria-label="Minimum price"
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value.max}
          onChange={handleMaxChange}
          className="price-slider-thumb absolute w-full top-1/2 -translate-y-1/2 h-1.5 appearance-none bg-transparent"
          aria-label="Maximum price"
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-white/50">
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
    <div className="space-y-8 text-white">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Filters
        </h2>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs uppercase tracking-widest text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
          Category
        </h3>

        <div className="space-y-1">
          {categories.map(({ name, count }) => {
            const isActive = selectedCategory === name;

            return (
              <div key={name}>

                <button
                  type="button"
                  onClick={() => onSelectCategory(name)}
                  className={`w-full flex items-center gap-2 py-1.5 text-left transition-colors ${
                    isActive
                      ? 'text-cyan-300'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <ChevronRight
                    size={13}
                    strokeWidth={2}
                    className={`flex-shrink-0 transition-transform ${
                      isActive
                        ? 'rotate-90 text-cyan-300'
                        : 'text-white/30'
                    }`}
                  />

                  <span className="text-sm flex-1">
                    {name}
                  </span>

                  <span className="text-xs font-mono text-white/30">
                    ({count})
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isActive &&
                    brandsForSelectedCategory.length > 0 && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: 'auto',
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden pl-[21px]"
                      >
                        <div className="space-y-2 py-2 border-l border-white/10 ml-1.5 pl-4">

                          {brandsForSelectedCategory.map(
                            ({
                              name: brandName,
                              count: brandCount,
                            }) => (
                              <label
                                key={brandName}
                                className="flex items-center gap-2.5 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedBrand === brandName
                                  }
                                  onChange={() =>
                                    onSelectBrand(brandName)
                                  }
                                  className="w-3.5 h-3.5 rounded border-white/20 accent-cyan-400 focus:ring-cyan-400/40"
                                />

                                <span className="text-xs text-white/60 group-hover:text-white transition-colors flex-1">
                                  {brandName}
                                </span>

                                <span className="text-xs font-mono text-white/30">
                                  ({brandCount})
                                </span>
                              </label>
                            )
                          )}

                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      </div>

      {/* Color */}
      {colorsAvailable.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
            Color
          </h3>

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
                    isActive
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0b1018] border-transparent'
                      : 'border-white/20'
                  }`}
                  style={swatchStyle(name)}
                />
              );
            })}
          </div>

          {selectedColor && (
            <p className="text-xs text-white/50 mt-2">
              {selectedColor}
            </p>
          )}
        </div>
      )}

      {/* Price */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-1">
          Price
        </h3>

        <PriceRangeSlider
          min={priceBounds.min}
          max={priceBounds.max}
          value={priceRange}
          onChange={onPriceChange}
        />
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
          Rating
        </h3>

        <div className="space-y-2">
          {RATING_OPTIONS.map((r) => {
            const isActive = selectedRating === r;

            return (
              <button
                key={r}
                type="button"
                onClick={() => onSelectRating(r)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  isActive
                    ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                    : 'border-white/10 text-white/70 hover:border-white/20 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      strokeWidth={0}
                      fill="currentColor"
                    />
                  ))}
                </span>

                <span>& above</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
          Availability
        </h3>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="w-4 h-4 rounded border-white/20 accent-cyan-400 focus:ring-cyan-400/40"
          />

          <span className="text-sm text-white/70 group-hover:text-white transition-colors">
            In stock only
          </span>
        </label>
      </div>

    </div>
  );
}