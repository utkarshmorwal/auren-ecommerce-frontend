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

  const {
    data: fetchedProducts,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: searchQuery
      ? ['products', 'search', searchQuery]
      : ['products'],
    queryFn: () =>
      (
        searchQuery
          ? api.get('/api/products/search', {
              params: { name: searchQuery },
            })
          : api.get('/api/products')
      ).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 0,
  });
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
        const prices = fetchedProducts
          .map((p) => Number(p.price))
          .filter((price) => Number.isFinite(price));

        if (prices.length > 0) {
          const bounds = {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices)),
          };

          setPriceRange({
            min: minPriceParam
              ? Math.max(bounds.min, Number(minPriceParam))
              : bounds.min,
            max: maxPriceParam
              ? Math.min(bounds.max, Number(maxPriceParam))
              : bounds.max,
          });
        }
      }

      setSelectedCategory(categoryParam || '');
      setSelectedBrand(brandParam || '');
      setSelectedColor('');
      setSelectedRating(null);
      setInStockOnly(false);
      setSortBy('relevance');
    }
  }, [
    fetchedProducts,
    isError,
    categoryParam,
    brandParam,
    minPriceParam,
    maxPriceParam,
  ]);

  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) {
      return {
        min: 0,
        max: 0,
      };
    }

    const prices = allProducts
      .map((p) => Number(p.price))
      .filter((price) => Number.isFinite(price));

    if (prices.length === 0) {
      return {
        min: 0,
        max: 0,
      };
    }

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  const categories = useMemo(() => {
    const map = {};

    allProducts.forEach((product) => {
      if (!product.category) return;

      if (!map[product.category]) {
        map[product.category] = {
          name: product.category,
          count: 0,
          image: product.imageUrl || null,
        };
      }

      map[product.category].count += 1;

      if (!map[product.category].image && product.imageUrl) {
        map[product.category].image = product.imageUrl;
      }
    });

    return Object.values(map).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [allProducts]);

  const brandsForSelectedCategory = useMemo(() => {
    if (!selectedCategory) return [];

    const counts = {};

    allProducts
      .filter(
        (product) =>
          product.category === selectedCategory &&
          product.brand &&
          product.brand.trim()
      )
      .forEach((product) => {
        counts[product.brand] = (counts[product.brand] || 0) + 1;
      });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts, selectedCategory]);

  const colorsAvailable = useMemo(() => {
    const counts = {};

    allProducts.forEach((product) => {
      if (product.color && product.color.trim()) {
        counts[product.color] = (counts[product.color] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
      if (
        selectedCategory &&
        product.category !== selectedCategory
      ) {
        return false;
      }

      if (selectedBrand && product.brand !== selectedBrand) {
        return false;
      }

      if (selectedColor && product.color !== selectedColor) {
        return false;
      }

      if (
        selectedRating &&
        !(Number(product.rating) >= Number(selectedRating))
      ) {
        return false;
      }

      const price = Number(product.price);

      if (
        Number.isFinite(price) &&
        (price < priceRange.min || price > priceRange.max)
      ) {
        return false;
      }

      if (inStockOnly && Number(product.stock) === 0) {
        return false;
      }

      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort(
          (a, b) => Number(a.price) - Number(b.price)
        );
        break;

      case 'price-desc':
        result = [...result].sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
        break;

      case 'name-asc':
        result = [...result].sort((a, b) =>
          String(a.name || '').localeCompare(String(b.name || ''))
        );
        break;

      case 'newest':
        result = [...result].sort(
          (a, b) => Number(b.id) - Number(a.id)
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    allProducts,
    selectedCategory,
    selectedBrand,
    selectedColor,
    selectedRating,
    priceRange,
    inStockOnly,
    sortBy,
  ]);

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
    setSelectedBrand((previous) =>
      previous === name ? '' : name
    );
  };

  const handleSelectColor = (name) => {
    setSelectedColor((previous) =>
      previous === name ? '' : name
    );
  };

  const handleSelectRating = (rating) => {
    setSelectedRating((previous) =>
      previous === rating ? null : rating
    );
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
    onToggleInStock: () =>
      setInStockOnly((value) => !value),

    onClearAll: clearAllFilters,
    hasActiveFilters,
  };

  const bannerImage = useMemo(() => {
    const match = categories.find(
      (category) => category.name === selectedCategory
    );

    return match ? match.image : null;
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#07090d] text-white relative overflow-hidden">

      {/* Background grid */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Hero */}
      <div className="relative bg-[#05070b] overflow-hidden min-h-[300px] sm:min-h-[440px] flex items-center border-b border-white/10">

        <motion.div
          aria-hidden="true"
          className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
          animate={{ y: [0, 16, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"
          animate={{ y: [0, -16, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <AnimatePresence mode="wait">
          {bannerImage && (
            <motion.div
              key={selectedCategory}
              initial={{
                opacity: 0,
                scale: 1.08,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 1.04,
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0"
            >
              <img
                src={bannerImage}
                alt={selectedCategory}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070b]/85 to-[#05070b]/20" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-[#05070b]/20" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative w-full py-12 sm:py-20">

          <AnimatePresence mode="wait">
            <motion.div
              key={
                searchQuery ||
                selectedCategory ||
                'all'
              }
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              transition={{
                duration: 0.3,
              }}
              className="max-w-2xl"
            >

              {searchQuery ? (
                <>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                    Search results
                  </span>

                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-3">
                    "{searchQuery}"
                  </h1>
                </>
              ) : selectedCategory ? (
                <>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                    Category
                  </span>

                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-3">
                    {selectedCategory}
                  </h1>
                </>
              ) : (
                <>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                    Everything, in one place
                  </span>

                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-3">
                    Full catalog
                  </h1>
                </>
              )}

              <motion.p
                key={filteredProducts.length}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                className="mt-5 text-white/45"
              >
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? 's' : ''}

                {searchQuery && (
                  <>
                    {' '}found.{' '}

                    <Link
                      to="/catalog"
                      className="text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                      Clear search
                    </Link>
                  </>
                )}
              </motion.p>

            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* Categories */}
      <div className="relative border-b border-white/10 bg-white/[0.02]">
        <CategoryShowcaseBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleSelectCategory}
        />
      </div>

      {/* Catalog content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">

            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse"
              >
                <div className="aspect-square rounded-3xl bg-white/[0.05] border border-white/5" />

                <div className="mt-4 space-y-2">
                  <div className="h-3 w-16 bg-white/[0.06] rounded-full" />
                  <div className="h-5 w-3/4 bg-white/[0.06] rounded-full" />
                  <div className="h-4 w-1/3 bg-white/[0.06] rounded-full" />
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-fuchsia-500/10 border border-fuchsia-400/20 rounded-3xl p-5 text-fuchsia-300">
            <p className="text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Products */}
        {!loading &&
          !error &&
          allProducts.length > 0 && (
            <div className="grid md:grid-cols-[250px_1fr] gap-8 lg:gap-10">

              {/* Desktop filters */}
              <aside className="hidden md:block">
                <div className="sticky top-28">
                  <div className="bg-white/[0.035] border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
                    <CatalogSidebar {...sidebarProps} />
                  </div>
                </div>
              </aside>

              {/* Product section */}
              <div>

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">

                  <button
                    onClick={() =>
                      setMobileFiltersOpen(true)
                    }
                    className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-white/70 hover:bg-white/[0.08] transition-all"
                  >
                    <SlidersHorizontal
                      size={15}
                      strokeWidth={1.75}
                    />

                    Filters

                    {hasActiveFilters && (
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                    )}
                  </button>

                  <div className="flex items-center gap-3 ml-auto">

                    <label className="text-[10px] uppercase tracking-[0.18em] text-white/30 hidden sm:inline">
                      Sort by
                    </label>

                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(event.target.value)
                      }
                      className="px-4 py-2.5 rounded-2xl border border-white/10 bg-[#111722] text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                  </div>
                </div>

                {/* Active filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mb-7">

                    {selectedCategory && (
                      <span className="flex items-center gap-2 text-xs bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-3 py-1.5 rounded-full">
                        {selectedCategory}

                        <button
                          onClick={() =>
                            handleSelectCategory(
                              selectedCategory
                            )
                          }
                          aria-label="Remove category filter"
                          className="hover:text-white transition-colors"
                        >
                          <X
                            size={12}
                            strokeWidth={2}
                          />
                        </button>
                      </span>
                    )}

                    {selectedBrand && (
                      <span className="flex items-center gap-2 text-xs bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-3 py-1.5 rounded-full">
                        {selectedBrand}

                        <button
                          onClick={() =>
                            handleSelectBrand(
                              selectedBrand
                            )
                          }
                          aria-label="Remove brand filter"
                          className="hover:text-white transition-colors"
                        >
                          <X
                            size={12}
                            strokeWidth={2}
                          />
                        </button>
                      </span>
                    )}

                    {selectedColor && (
                      <span className="flex items-center gap-2 text-xs bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-3 py-1.5 rounded-full">
                        {selectedColor}

                        <button
                          onClick={() =>
                            handleSelectColor(
                              selectedColor
                            )
                          }
                          aria-label="Remove color filter"
                          className="hover:text-white transition-colors"
                        >
                          <X
                            size={12}
                            strokeWidth={2}
                          />
                        </button>
                      </span>
                    )}

                    {selectedRating && (
                      <span className="flex items-center gap-2 text-xs bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-3 py-1.5 rounded-full">
                        {selectedRating}+ stars

                        <button
                          onClick={() =>
                            handleSelectRating(
                              selectedRating
                            )
                          }
                          aria-label="Remove rating filter"
                          className="hover:text-white transition-colors"
                        >
                          <X
                            size={12}
                            strokeWidth={2}
                          />
                        </button>
                      </span>
                    )}

                    {inStockOnly && (
                      <span className="flex items-center gap-2 text-xs bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-3 py-1.5 rounded-full">
                        In stock only

                        <button
                          onClick={() =>
                            setInStockOnly(false)
                          }
                          aria-label="Remove in-stock filter"
                          className="hover:text-white transition-colors"
                        >
                          <X
                            size={12}
                            strokeWidth={2}
                          />
                        </button>
                      </span>
                    )}

                    {(priceRange.min > priceBounds.min ||
                      priceRange.max < priceBounds.max) && (
                      <span className="flex items-center gap-2 text-xs bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-3 py-1.5 rounded-full">
                        ₹{priceRange.min} – ₹
                        {priceRange.max}

                        <button
                          onClick={() =>
                            setPriceRange(priceBounds)
                          }
                          aria-label="Reset price filter"
                          className="hover:text-white transition-colors"
                        >
                          <X
                            size={12}
                            strokeWidth={2}
                          />
                        </button>
                      </span>
                    )}

                  </div>
                )}

                {/* Product grid */}
                {filteredProducts.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] py-16 text-center">
                    <p className="text-white/35 text-sm">
                      No products match these filters.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12"
                  >
                    <AnimatePresence>
                      {filteredProducts.map(
                        (product, index) => (
                          <ScrollReveal
                            key={product.id}
                            direction="up"
                            delay={(index % 3) * 0.06}
                          >
                            <ProductCard
                              product={product}
                            />
                          </ScrollReveal>
                        )
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

              </div>
            </div>
          )}

        {/* No products */}
        {!loading &&
          !error &&
          allProducts.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] py-16 text-center">
              <p className="text-white/35 text-sm">
                No products found.
              </p>
            </div>
          )}

      </div>

      {/* Mobile filters */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-[#0b1018] border-r border-white/10 p-5 overflow-y-auto"
            >

              <div className="flex items-center justify-between mb-7">

                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                    Refine
                  </span>

                  <div className="text-xl font-bold mt-1">
                    Filters
                  </div>
                </div>

                <button
                  onClick={() =>
                    setMobileFiltersOpen(false)
                  }
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] text-white/40 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X
                    size={18}
                    strokeWidth={1.75}
                  />
                </button>

              </div>

              <CatalogSidebar {...sidebarProps} />

              <button
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="w-full mt-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 transition-colors rounded-2xl text-sm font-semibold uppercase tracking-widest text-[#061018]"
              >
                Show {filteredProducts.length}{' '}
                results
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}