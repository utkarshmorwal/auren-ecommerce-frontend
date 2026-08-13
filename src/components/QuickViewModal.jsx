import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Heart, Star, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function stockStatus(stock) {
  if (stock === 0) return { label: 'Out of stock', dot: 'bg-ink/30', text: 'text-ink/40' };
  if (stock <= 10) return { label: `Only ${stock} left`, dot: 'bg-ember', text: 'text-ember' };
  return { label: 'In stock', dot: 'bg-verdant', text: 'text-verdant' };
}

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const status = stockStatus(product.stock);
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    if (product.stock === 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 z-[80] flex items-center justify-center px-4 sm:px-6 py-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-paper rounded-md w-full max-w-2xl max-h-[85vh] overflow-y-auto relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-paper/90 border border-stone flex items-center justify-center text-ink/50 hover:text-ink transition-colors"
            aria-label="Close quick view"
          >
            <X size={18} strokeWidth={1.75} />
          </button>

          <div className="grid sm:grid-cols-2 gap-6 p-6">
            <div className="aspect-square rounded-xl bg-stone overflow-hidden relative">
              {hasDiscount && (
                <span className="absolute top-3 left-3 z-10 bg-ember text-paper text-[11px] font-mono px-2 py-1 rounded-full">
                  {discountPercent}% OFF
                </span>
              )}
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/20 font-display italic text-xl">
                  No image
                </div>
              )}
            </div>

            <div>
              {product.brand && <span className="text-xs uppercase tracking-widest text-ink/40">{product.brand}</span>}
              <h2 className="font-display text-2xl mt-1">{product.name}</h2>

              {product.rating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 bg-verdant text-paper text-xs font-mono px-2 py-1 rounded">
                    {product.rating.toFixed(1)} <Star size={11} fill="currentColor" strokeWidth={0} />
                  </span>
                  <span className="text-xs text-ink/50 font-mono">{product.reviewCount} ratings</span>
                </div>
              )}

              <div className="flex items-baseline gap-2 mt-3">
                <span className="font-mono text-2xl">₹{product.price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="font-mono text-sm text-ink/40 line-through">₹{product.originalPrice.toFixed(2)}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                <span className={`text-xs font-mono ${status.text}`}>{status.label}</span>
              </div>

              <p className="text-sm text-ink/60 mt-4 leading-relaxed line-clamp-3">
                {product.description || 'No description available.'}
              </p>

              <div className="flex items-center gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-sans uppercase tracking-widest transition-colors disabled:opacity-40 ${
                    added ? 'bg-verdant text-paper' : 'bg-ink text-paper hover:bg-ink-light'
                  }`}
                >
                  {added ? <Check size={15} strokeWidth={2} /> : <ShoppingBag size={15} strokeWidth={1.75} />}
                  {added ? 'Added' : 'Add to cart'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWishlist(product)}
                  className="w-10 h-10 rounded-full border border-stone flex items-center justify-center flex-shrink-0"
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={16} strokeWidth={1.75} className={wishlisted ? 'text-ember fill-ember' : 'text-ink/50'} />
                </motion.button>
              </div>

              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="block text-center text-xs text-verdant hover:text-verdant-light transition-colors mt-4"
              >
                View full details →
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}