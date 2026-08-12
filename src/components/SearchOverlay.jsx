import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';

const DEBOUNCE_MS = 350;

export default function SearchOverlay({ open, onClose }) {
const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Clears local state, then tells the parent to close. Used by every close
  // trigger (backdrop, X button, Escape, picking a result) so state never
  // needs to be reset reactively from an effect.
  const handleClose = () => {
    setQuery('');
    setResults([]);
    setError('');
    onClose();
  };
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && trimmedQuery) {
      navigate(`/catalog?search=${encodeURIComponent(trimmedQuery)}`);
      handleClose();
    }
  };

  // Autofocus the input whenever the overlay opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const trimmedQuery = query.trim();

  // Debounced real-time search. Results/loading/error are only ever set from
  // inside the async callback below, never synchronously in the effect body.
  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!trimmedQuery) {
      return;
    }

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

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[60]"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            className="fixed top-0 left-0 right-0 z-[70] bg-paper text-ink border-b border-stone shadow-xl"
          >
            <div className="max-w-3xl mx-auto px-6 pt-8 pb-6">
              <div className="flex items-center gap-3 border-b-2 border-ink pb-3">
                <Search size={22} strokeWidth={1.75} className="text-ink/40 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                   onKeyDown={handleInputKeyDown}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="flex-1 bg-transparent font-display text-2xl text-ink placeholder:text-ink/30 focus:outline-none"
                />
                {loading && <Loader2 size={18} className="animate-spin text-ink/30 shrink-0" />}
                <button
                  onClick={handleClose}
                  aria-label="Close search"
                  className="text-ink/40 hover:text-ink transition-colors shrink-0"
                >
                  <X size={22} strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-6 max-h-[60vh] overflow-y-auto">
                {error && <p className="text-ember font-mono text-sm">{error}</p>}

                {!error && !loading && trimmedQuery && results.length === 0 && (
                  <p className="text-ink/40 font-mono text-sm">No products match "{trimmedQuery}".</p>
                )}

                {!error && !trimmedQuery && (
                  <p className="text-ink/40 font-mono text-sm">Start typing to search the catalog.</p>
                )}

                {trimmedQuery && results.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-widest text-ink/40 mb-4">
                      {results.length} result{results.length === 1 ? '' : 's'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                    {results.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            handleClose();
                          }}
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
