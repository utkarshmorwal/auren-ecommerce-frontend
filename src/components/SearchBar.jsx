import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const DEBOUNCE_MS = 350;

export default function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const trimmedQuery = query.trim();
  const showDropdown = focused && trimmedQuery.length > 0;

  // Debounced real-time search — same pattern as the mobile SearchOverlay,
  // kept separate here since this component has its own compact dropdown UI
  // rather than a full-screen panel.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!trimmedQuery) return;

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      api
        .get('/api/products/search', { params: { name: trimmedQuery } })
        .then((res) => {
          setResults(res.data);
          setError('');
        })
        .catch(() => setError('Could not search products right now.'))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [trimmedQuery]);

  // Close the dropdown when clicking outside the search bar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setFocused(false);
      e.currentTarget.blur();
    } else if (e.key === 'Enter' && trimmedQuery) {
      navigate(`/catalog?search=${encodeURIComponent(trimmedQuery)}`);
      setFocused(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="flex items-center h-10 rounded-lg border border-paper/15 bg-paper focus-within:border-verdant-light transition-colors px-3 gap-2">
        <Search size={16} strokeWidth={1.75} className="text-ink/40 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands and more"
          aria-label="Search products"
          className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
        {loading && <Loader2 size={14} className="animate-spin text-ink/30 shrink-0" />}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-paper border border-stone rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
          >
            {error && <p className="px-4 py-3 text-sm text-ember font-mono">{error}</p>}

            {!error && !loading && results.length === 0 && (
              <p className="px-4 py-3 text-sm text-ink/40 font-mono">No products match "{trimmedQuery}".</p>
            )}

            {!error && results.length > 0 && (
              <ul>
                {results.map((product) => (
                  <li key={product.id}>
                   <button
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setFocused(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-paper-dim transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-md bg-stone overflow-hidden shrink-0">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="flex-1 text-sm text-ink truncate">{product.name}</span>
                      <span className="text-sm font-mono text-ink/60 shrink-0">₹{product.price.toFixed(2)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
