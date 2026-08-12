import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';

const MAX_TABS = 7;

export default function CategoryMegaMenu() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    api.get('/api/products').then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  const categories = (() => {
    const map = {};
    products.forEach((p) => {
      if (!map[p.category]) {
        map[p.category] = { name: p.category, image: p.imageUrl, count: 0, brands: {}, sample: [] };
      }
      const cat = map[p.category];
      cat.count += 1;
      if (p.brand && p.brand.trim()) cat.brands[p.brand] = (cat.brands[p.brand] || 0) + 1;
      if (cat.sample.length < 3) cat.sample.push(p);
    });
    return Object.values(map)
      .map((c) => ({ ...c, brandList: Object.keys(c.brands).slice(0, 5) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_TABS);
  })();

  const handleEnter = (name) => {
    clearTimeout(closeTimer.current);
    setActiveCategory(name);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setActiveCategory(null), 150);
  };

  const active = categories.find((c) => c.name === activeCategory);

  if (categories.length === 0) return null;

  return (
    <div className="relative" onMouseLeave={handleLeave}>
      <div className="hidden lg:flex items-center gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/catalog?category=${encodeURIComponent(cat.name)}`}
            onMouseEnter={() => handleEnter(cat.name)}
            className={`text-xs uppercase tracking-widest transition-colors py-1 ${
              activeCategory === cat.name ? 'text-verdant-light' : 'text-paper/70 hover:text-paper'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => handleEnter(active.name)}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[640px] max-w-[90vw] bg-paper text-ink rounded-2xl shadow-2xl border border-stone overflow-hidden z-50"
          >
            <div className="grid grid-cols-[180px_1fr] gap-6 p-6">
              <div className="aspect-square rounded-xl bg-stone overflow-hidden relative">
                {active.image ? (
                  <img src={active.image} alt={active.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display italic text-ink/30">{active.name}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-display text-paper text-lg leading-tight">{active.name}</p>
                  <p className="text-paper/60 text-xs font-mono mt-0.5">{active.count} items</p>
                </div>
              </div>

              <div>
                {active.brandList.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-widest text-ink/40 mb-2.5">Shop by brand</p>
                    <div className="flex flex-wrap gap-2">
                      {active.brandList.map((brand) => (
                        <Link
                          key={brand}
                          to={`/catalog?category=${encodeURIComponent(active.name)}&brand=${encodeURIComponent(brand)}`}
                          className="px-3 py-1.5 rounded-full border border-stone text-xs text-ink/70 hover:border-verdant hover:text-verdant transition-colors"
                        >
                          {brand}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-xs uppercase tracking-widest text-ink/40 mb-2.5">Popular right now</p>
                  <div className="grid grid-cols-3 gap-3">
                    {active.sample.map((p) => (
                      <Link key={p.id} to={`/product/${p.id}`} className="group block">
                        <div className="aspect-square rounded-lg bg-stone overflow-hidden">
                          {p.imageUrl && (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          )}
                        </div>
                        <p className="text-xs text-ink/60 mt-1.5 truncate group-hover:text-verdant transition-colors">{p.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/catalog?category=${encodeURIComponent(active.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-verdant hover:text-verdant-light transition-colors"
                >
                  Shop all {active.name}
                  <ArrowRight size={13} strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}