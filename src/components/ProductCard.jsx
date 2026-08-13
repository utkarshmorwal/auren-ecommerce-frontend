import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Star, Heart, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const MotionLink = motion(Link);

function stockStatus(stock) {
  if (stock === 0) {
    return {
      label: 'Out of stock',
      dot: 'bg-ink/30',
      text: 'text-ink/40',
      pulse: false
    };
  }

  if (stock <= 10) {
    return {
      label: `Only ${stock} left`,
      dot: 'bg-ember',
      text: 'text-ember',
      pulse: true
    };
  }

  return {
    label: 'In stock',
    dot: 'bg-verdant',
    text: 'text-verdant',
    pulse: false
  };
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewAdded, setQuickViewAdded] = useState(false);

  const status = stockStatus(product.stock);
  const wishlisted = isWishlisted(product.id);

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  // Get alternate image without unnecessary work
  const secondImage = product.imageUrls
    ? product.imageUrls
        .split('\n')
        .map((s) => s.trim())
        .find(Boolean)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) return;

    addToCart(product, 1);
    setAdded(true);

    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const openQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickViewAdded(false);
  };

  const handleQuickViewAdd = () => {
    if (product.stock === 0) return;

    addToCart(product, 1);
    setQuickViewAdded(true);

    setTimeout(() => setQuickViewAdded(false), 1200);
  };

  return (
    <>
      <MotionLink
        to={`/product/${product.id}`}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="group block"
      >
        <div className="aspect-square rounded-md bg-stone overflow-hidden relative shadow-sm group-hover:shadow-xl transition-shadow duration-300">

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
            {product.isNew && (
              <span className="bg-ink text-paper text-[11px] font-mono px-2 py-1 rounded-full">
                NEW
              </span>
            )}

            {product.bestSeller && (
              <span className="bg-verdant text-paper text-[11px] font-mono px-2 py-1 rounded-full">
                BESTSELLER
              </span>
            )}

            {hasDiscount && (
              <span className="bg-ember text-paper text-[11px] font-mono px-2 py-1 rounded-full">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-paper/90 flex items-center justify-center"
            aria-label={
              wishlisted ? 'Remove from wishlist' : 'Add to wishlist'
            }
          >
            <Heart
              size={15}
              strokeWidth={1.75}
              className={
                wishlisted
                  ? 'text-ember fill-ember'
                  : 'text-ink/50'
              }
            />
          </motion.button>

          {/* Product Image */}
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className={`w-full h-full object-cover transition-all duration-500 ${
                  secondImage
                    ? 'group-hover:opacity-0'
                    : 'group-hover:scale-105'
                }`}
              />

              {secondImage && (
                <img
                  src={secondImage}
                  alt={`${product.name} alternate view`}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/20 font-display italic text-xl">
              No image
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openQuickView}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-paper/90 text-ink/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye size={16} strokeWidth={1.75} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 ${
                added
                  ? 'bg-verdant opacity-100'
                  : 'bg-ink text-paper opacity-0 group-hover:opacity-100'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <Check
                  size={16}
                  strokeWidth={2}
                  className="text-paper"
                />
              ) : (
                <ShoppingBag
                  size={16}
                  strokeWidth={1.75}
                />
              )}
            </motion.button>
          </div>
        </div>

        {/* Product Information */}
        <div className="mt-4">
          {product.brand && (
            <p className="text-[11px] uppercase tracking-widest text-ink/40">
              {product.brand}
            </p>
          )}

          <h3 className="font-display text-lg leading-snug mt-0.5">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-sm">
              ₹{product.price.toFixed(2)}
            </span>

            {hasDiscount && (
              <span className="font-mono text-xs text-ink/40 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex items-center gap-0.5 bg-verdant text-paper text-[11px] font-mono px-1.5 py-0.5 rounded">
                {product.rating.toFixed(1)}
                <Star
                  size={10}
                  fill="currentColor"
                  strokeWidth={0}
                />
              </span>

              <span className="text-[11px] text-ink/40 font-mono">
                ({product.reviewCount})
              </span>
            </div>
          )}

          <p className="text-xs uppercase tracking-widest text-ink/40 mt-1.5">
            {product.category}
          </p>

          <div className="flex items-center gap-1.5 mt-2">
            <motion.span
              className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
              animate={
                status.pulse
                  ? { opacity: [1, 0.4, 1] }
                  : {}
              }
              transition={
                status.pulse
                  ? {
                      duration: 1.6,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
                  : {}
              }
            />

            <span className={`text-xs font-mono ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>
      </MotionLink>

      {/* IMPORTANT:
          Quick View portal is created ONLY when opened.
          Previously this structure existed for every ProductCard.
      */}
      {quickViewOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeQuickView}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[70]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1]
              }}
              onClick={closeQuickView}
              role="dialog"
              aria-modal="true"
              aria-label={`Quick view of ${product.name}`}
              className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-paper rounded-md w-full max-w-2xl grid sm:grid-cols-2 gap-6 p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={closeQuickView}
                  aria-label="Close quick view"
                  className="absolute top-4 right-4 z-10 text-ink/40 hover:text-ink transition-colors"
                >
                  <X size={20} strokeWidth={1.75} />
                </button>

                <div className="aspect-square rounded-xl bg-stone overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/20 font-display italic text-xl">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  {product.brand && (
                    <p className="text-[11px] uppercase tracking-widest text-ink/40">
                      {product.brand}
                    </p>
                  )}

                  <h2 className="font-display text-2xl leading-snug mt-0.5 pr-8">
                    {product.name}
                  </h2>

                  {product.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="flex items-center gap-0.5 bg-verdant text-paper text-[11px] font-mono px-1.5 py-0.5 rounded">
                        {product.rating.toFixed(1)}
                        <Star
                          size={10}
                          fill="currentColor"
                          strokeWidth={0}
                        />
                      </span>

                      <span className="text-[11px] text-ink/40 font-mono">
                        ({product.reviewCount} ratings)
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="font-mono text-2xl">
                      ₹{product.price.toFixed(2)}
                    </span>

                    {hasDiscount && (
                      <>
                        <span className="font-mono text-sm text-ink/40 line-through">
                          ₹{product.originalPrice.toFixed(2)}
                        </span>

                        <span className="font-mono text-xs text-ember">
                          ({discountPercent}% OFF)
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <motion.span
                      className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      animate={
                        status.pulse
                          ? { opacity: [1, 0.4, 1] }
                          : {}
                      }
                      transition={
                        status.pulse
                          ? {
                              duration: 1.6,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }
                          : {}
                      }
                    />

                    <span
                      className={`text-xs font-mono ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-ink/60 leading-relaxed mt-4 line-clamp-4">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto pt-6 flex flex-col gap-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleQuickViewAdd}
                      disabled={product.stock === 0}
                      className={`flex items-center justify-center gap-2 py-3 rounded-full text-sm font-sans uppercase tracking-widest transition-colors disabled:opacity-40 ${
                        quickViewAdded
                          ? 'bg-verdant text-paper'
                          : 'bg-ink text-paper hover:bg-ink-light'
                      }`}
                    >
                      {quickViewAdded ? (
                        <>
                          <Check size={16} strokeWidth={2} />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag
                            size={16}
                            strokeWidth={1.75}
                          />
                          {product.stock === 0
                            ? 'Out of stock'
                            : 'Add to cart'}
                        </>
                      )}
                    </motion.button>

                    <Link
                      to={`/product/${product.id}`}
                      onClick={closeQuickView}
                      className="text-center text-xs uppercase tracking-widest text-ink/50 hover:text-verdant transition-colors py-1"
                    >
                      View full details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}