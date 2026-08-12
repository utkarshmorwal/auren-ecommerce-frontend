import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import CatalogSidebar from '../components/CatalogSidebar';
import CategoryShowcaseBar from '../components/CategoryShowcaseBar';
import { useQuery } from '@tanstack/react-query';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best matches' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'newest', label: 'Newest first' },
];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  const [allProducts, setAllProducts] = useState([]);
const [error, setError] = useState('');

const { data: fetchedProducts, isLoading: loading, isError } = useQuery({
  queryKey: searchQuery ? ['products', 'search', searchQuery] : ['products'],
  queryFn: () =>
    (searchQuery
      ? api.get('/api/products/search', { params: { name: searchQuery } })
      : api.get('/api/products')
    ).then((res) => res.data),
  staleTime: 5 * 60 * 1000, // 5 min tak cache se hi milega, dobara API call nahi hogi
});

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

 useEffect(() => {
  if (isError) {
    setError('Could not load products. Is the backend running?');
    return;
  }
  setError('');

  if (fetchedProducts) {
    setAllProducts(fetchedProducts);
    if (fetchedProducts.length > 0) {
      const prices = fetchedProducts.map((p) => p.price);
      const bounds = { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
      setPriceRange({
        min: minPriceParam ? Math.max(bounds.min, Number(minPriceParam)) : bounds.min,
        max: maxPriceParam ? Math.min(bounds.max, Number(maxPriceParam)) : bounds.max,
      });
    }
    setSelectedCategory(categoryParam || '');
    setSelectedBrand(brandParam || '');
    setSelectedColor('');
    setSelectedRating(null);
    setInStockOnly(false);
    setSortBy('relevance');
  }
}, [fetchedProducts, isError, categoryParam, brandParam, minPriceParam, maxPriceParam]);

  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 0 };
    const prices = allProducts.map((p) => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [allProducts]);

  const categories = useMemo(() => {
    const map = {};
    allProducts.forEach((p) => {
      if (!map[p.category]) {
        map[p.category] = { name: p.category, count: 0, image: p.imageUrl || null };
      }
      map[p.category].count += 1;
      if (!map[p.category].image && p.imageUrl) map[p.category].image = p.imageUrl;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  const brandsForSelectedCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const counts = {};
    allProducts
      .filter((p) => p.category === selectedCategory && p.brand && p.brand.trim())
      .forEach((p) => {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts, selectedCategory]);

  const colorsAvailable = useMemo(() => {
    const counts = {};
    allProducts.forEach((p) => {
      if (p.color && p.color.trim()) {
        counts[p.color] = (counts[p.color] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (selectedColor && p.color !== selectedColor) return false;
      if (selectedRating && !(p.rating >= selectedRating)) return false;
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
      if (inStockOnly && p.stock === 0) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result = [...result].sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    return result;
  }, [allProducts, selectedCategory, selectedBrand, selectedColor, selectedRating, priceRange, inStockOnly, sortBy]);

  const handleSelectCategory = (name) => {
    if (selectedCategory === name) {
      setSelectedCategory('');
      setSelectedBrand('');
    } else {
      setSelectedCategory(name);
      setSelectedBrand('');
    }
  };

  const handleSelectBrand = (name) => {
    setSelectedBrand((prev) => (prev === name ? '' : name));
  };

  const handleSelectColor = (name) => {
    setSelectedColor((prev) => (prev === name ? '' : name));
  };

  const handleSelectRating = (r) => {
    setSelectedRating((prev) => (prev === r ? null : r));
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedColor('');
    setSelectedRating(null);
    setPriceRange(priceBounds);
    setInStockOnly(false);
  };

  const hasActiveFilters =
    !!selectedCategory ||
    !!selectedBrand ||
    !!selectedColor ||
    !!selectedRating ||
    inStockOnly ||
    priceRange.min > priceBounds.min ||
    priceRange.max < priceBounds.max;

  const sidebarProps = {
    categories,
    selectedCategory,
    onSelectCategory: handleSelectCategory,
    brandsForSelectedCategory,
    selectedBrand,
    onSelectBrand: handleSelectBrand,
    colorsAvailable,
    selectedColor,
    onSelectColor: handleSelectColor,
    selectedRating,
    onSelectRating: handleSelectRating,
    priceBounds,
    priceRange,
    onPriceChange: setPriceRange,
    inStockOnly,
    onToggleInStock: () => setInStockOnly((v) => !v),
    onClearAll: clearAllFilters,
    hasActiveFilters,
  };

 const bannerImage = useMemo(() => {
    const match = categories.find((c) => c.name === selectedCategory);
    return match ? match.image : null;
  }, [categories, selectedCategory]);

  return (
    <div>
      {/* Dynamic header banner */}
{/* Dynamic hero banner */}
      <div className="relative bg-ink text-paper overflow-hidden min-h-[220px] sm:min-h-[440px] flex items-center">
        <motion.div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-verdant/10 blur-3xl pointer-events-none"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        <AnimatePresence mode="wait">
          {bannerImage && (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img src={bannerImage} alt={selectedCategory} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative w-full py-8 sm:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery || selectedCategory || 'all'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl"
            >
              {searchQuery ? (
                <>
                  <span className="font-mono text-xs uppercase tracking-widest text-verdant-light">Search results</span>
                  <h1 className="font-display text-3xl sm:text-5xl mt-2">"{searchQuery}"</h1>
                </>
              ) : selectedCategory ? (
                <>
                  <span className="font-mono text-xs uppercase tracking-widest text-verdant-light">Category</span>
                  <h1 className="font-display text-3xl sm:text-5xl mt-2">{selectedCategory}</h1>
                </>
              ) : (
                <>
                  <span className="font-mono text-xs uppercase tracking-widest text-verdant-light">Everything, in one place</span>
                  <h1 className="font-display text-3xl sm:text-5xl mt-2">Full catalog</h1>
                </>
              )}
              <motion.p key={filteredProducts.length} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} className="mt-3 text-paper/60">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                {searchQuery && (
                  <>
                    {' '}found.{' '}
                    <Link to="/catalog" className="text-verdant-light hover:text-verdant transition-colors">Clear search</Link>
                  </>
                )}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CategoryShowcaseBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleSelectCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-stone" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-16 bg-stone rounded" />
                  <div className="h-5 w-3/4 bg-stone rounded" />
                  <div className="h-4 w-1/3 bg-stone rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-ember font-mono text-sm">{error}</p>}

        {!loading && !error && allProducts.length > 0 && (
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            <aside className="hidden md:block">
              <div className="sticky top-28">
                <CatalogSidebar {...sidebarProps} />
              </div>
            </aside>

            <div>
              <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-stone text-sm text-ink/70"
                >
                  <SlidersHorizontal size={15} strokeWidth={1.75} />
                  Filters
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-ember" />}
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-xs uppercase tracking-widest text-ink/40 hidden sm:inline">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-stone bg-white text-sm focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {selectedCategory && (
                    <span className="flex items-center gap-1.5 text-xs bg-verdant/10 text-verdant px-3 py-1.5 rounded-full">
                      {selectedCategory}
                      <button onClick={() => handleSelectCategory(selectedCategory)} aria-label="Remove category filter">
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  )}
                  {selectedBrand && (
                    <span className="flex items-center gap-1.5 text-xs bg-verdant/10 text-verdant px-3 py-1.5 rounded-full">
                      {selectedBrand}
                      <button onClick={() => handleSelectBrand(selectedBrand)} aria-label="Remove brand filter">
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  )}
                  {selectedColor && (
                    <span className="flex items-center gap-1.5 text-xs bg-verdant/10 text-verdant px-3 py-1.5 rounded-full">
                      {selectedColor}
                      <button onClick={() => handleSelectColor(selectedColor)} aria-label="Remove color filter">
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  )}
                  {selectedRating && (
                    <span className="flex items-center gap-1.5 text-xs bg-verdant/10 text-verdant px-3 py-1.5 rounded-full">
                      {selectedRating}+ stars
                      <button onClick={() => handleSelectRating(selectedRating)} aria-label="Remove rating filter">
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="flex items-center gap-1.5 text-xs bg-verdant/10 text-verdant px-3 py-1.5 rounded-full">
                      In stock only
                      <button onClick={() => setInStockOnly(false)} aria-label="Remove in-stock filter">
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  )}
                  {(priceRange.min > priceBounds.min || priceRange.max < priceBounds.max) && (
                    <span className="flex items-center gap-1.5 text-xs bg-verdant/10 text-verdant px-3 py-1.5 rounded-full">
                      ₹{priceRange.min} – ₹{priceRange.max}
                      <button onClick={() => setPriceRange(priceBounds)} aria-label="Reset price filter">
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <p className="text-ink/40 font-mono text-sm py-12">No products match these filters.</p>
              ) : (
                <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  <AnimatePresence>
                    {filteredProducts.map((product, i) => (
                      <ScrollReveal key={product.id} direction="up" delay={(i % 3) * 0.06}>
                        <ProductCard product={product} />
                      </ScrollReveal>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {!loading && !error && allProducts.length === 0 && (
          <p className="text-ink/40 font-mono text-sm">No products found.</p>
        )}
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 z-50 md:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-paper p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-xl">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-ink/40 hover:text-ink transition-colors">
                  <X size={20} strokeWidth={1.75} />
                </button>
              </div>
              <CatalogSidebar {...sidebarProps} />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-8 py-3 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
              >
                Show {filteredProducts.length} results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}