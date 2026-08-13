import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import ReviewSection from '../components/ReviewSection';
import ImageGallery from '../components/ImageGallery';
import { useQuery } from '@tanstack/react-query';

const RECENTLY_VIEWED_KEY = 'auren_recently_viewed';
const MAX_RECENTLY_VIEWED = 20;

function recordRecentlyViewed(productId) {
  try {
    const stored = JSON.parse(
      localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'
    );

    const withoutThis = stored.filter(
      (existingId) => existingId !== productId
    );

    const updated = [productId, ...withoutThis].slice(
      0,
      MAX_RECENTLY_VIEWED
    );

    localStorage.setItem(
      RECENTLY_VIEWED_KEY,
      JSON.stringify(updated)
    );
  } catch {
    // Non-critical feature
  }
}

function stockStatus(stock) {
  if (stock === 0) {
    return {
      label: 'Out of stock',
      dot: 'bg-white/30',
      text: 'text-white/40',
      pulse: false,
    };
  }

  if (stock <= 10) {
    return {
      label: `Only ${stock} left in stock`,
      dot: 'bg-amber-400',
      text: 'text-amber-300',
      pulse: true,
    };
  }

  return {
    label: 'In stock',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    pulse: false,
  };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');

  const {
    data: productData,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () =>
      api.get(`/api/products/${id}`).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [orderCountdown, setOrderCountdown] = useState('');

  useEffect(() => {
    setQuantity(1);
    setSelectedSize(null);
    setSizeError(false);
    setAdded(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    if (isError) {
      setError('Product not found.');
      return;
    }

    if (productData) {
      setProduct(productData);

      recordRecentlyViewed(productData.id);
      setError('');

      api.get('/api/products').then((allRes) => {
        if (cancelled) return;

        const others = allRes.data.filter(
          (p) =>
            p.category === productData.category &&
            p.id !== productData.id
        );

        setRelated(others);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [productData, isError]);

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const cutoff = new Date();

      cutoff.setHours(20, 0, 0, 0);

      let diff = cutoff - now;

      if (diff < 0) {
        cutoff.setDate(cutoff.getDate() + 1);
        diff = cutoff - now;
      }

      const hours = Math.floor(
        diff / (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (diff / (1000 * 60)) % 60
      );

      setOrderCountdown(`${hours}h ${minutes}m`);
    }

    updateCountdown();

    const countdownId = setInterval(
      updateCountdown,
      60000
    );

    return () => clearInterval(countdownId);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090d] text-white flex items-center justify-center px-6">

        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-300/20 border-t-cyan-300 rounded-full animate-spin mx-auto mb-5" />

          <p className="text-white/40 text-sm">
            Loading product...
          </p>
        </div>

      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#07090d] text-white flex items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-black">
            Product not found
          </h1>

          <p className="text-white/40 mt-3 max-w-md">
            It may have been removed or the link is incorrect.
          </p>

          <Link
            to="/catalog"
            className="inline-flex mt-7 px-6 py-3 rounded-full bg-cyan-400 text-black text-xs font-bold uppercase tracking-widest hover:bg-cyan-300 transition-colors"
          >
            Back to catalog
          </Link>
        </motion.div>

      </div>
    );
  }

  const status = stockStatus(product.stock);
  const wishlisted = isWishlisted(product.id);

  const hasDiscount =
    product.originalPrice &&
    product.originalPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) /
          product.originalPrice) *
          100
      )
    : 0;

  const savings = hasDiscount
    ? product.originalPrice - product.price
    : 0;

  const galleryImages = [
    product.imageUrl,
    ...(product.imageUrls || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  ].filter(Boolean);

  const sizesList = (product.sizes || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const specList = (product.specifications || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');

      return idx > -1
        ? {
            key: line.slice(0, idx).trim(),
            value: line.slice(idx + 1).trim(),
          }
        : {
            key: line,
            value: '',
          };
    });

  const highlightsList = (product.highlights || '')
    .split('\n')
    .map((h) => h.trim())
    .filter(Boolean);

  const requiresSize = sizesList.length > 0;

  const validateSize = () => {
    if (requiresSize && !selectedSize) {
      setSizeError(true);

      setTimeout(() => {
        setSizeError(false);
      }, 500);

      return false;
    }

    return true;
  };

  const handleAdd = () => {
    if (!product || product.stock === 0) return;
    if (!validateSize()) return;

    addToCart(product, quantity);

    setAdded(true);
    setShowToast(true);

    setTimeout(() => setAdded(false), 1500);
    setTimeout(() => setShowToast(false), 2600);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    if (!validateSize()) return;

    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-white relative overflow-hidden">

      {/* Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-cyan-500/[0.08] rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-[35%] right-[-15rem] w-[35rem] h-[35rem] bg-purple-600/[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-12 relative z-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-white/30 mb-7 sm:mb-9 flex-wrap">

          <Link
            to="/"
            className="hover:text-cyan-300 transition-colors"
          >
            Home
          </Link>

          <ChevronRight size={11} />

          <Link
            to="/catalog"
            className="hover:text-cyan-300 transition-colors"
          >
            Catalog
          </Link>

          <ChevronRight size={11} />

          <Link
            to={`/catalog?category=${encodeURIComponent(
              product.category
            )}`}
            className="hover:text-cyan-300 transition-colors"
          >
            {product.category}
          </Link>

          <ChevronRight size={11} />

          <span className="text-white/65 truncate max-w-[180px]">
            {product.name}
          </span>

        </div>

        {/* Main Product */}
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-14 items-start">

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:sticky lg:top-24"
          >
            <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.035] backdrop-blur-xl p-2 sm:p-3 shadow-[0_30px_100px_rgba(0,0,0,.35)]">

              <ImageGallery
                images={galleryImages}
                alt={product.name}
                hasDiscount={hasDiscount}
                discountPercent={discountPercent}
                wishlisted={wishlisted}
                onToggleWishlist={() =>
                  toggleWishlist(product)
                }
              />

            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >

            {/* Brand */}
            {product.brand && (
              <span className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                {product.brand}
              </span>
            )}

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-3 mt-4">

                <span className="flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono px-3 py-1.5 rounded-full">
                  {product.rating.toFixed(1)}

                  <Star
                    size={11}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>

                <span className="text-xs text-white/35 font-mono">
                  {product.reviewCount} ratings
                </span>

              </div>
            )}

            {/* Price */}
            <div className="mt-7">

              <div className="flex items-baseline gap-3 flex-wrap">

                <span className="font-mono text-3xl sm:text-4xl font-bold text-white">
                  ₹{product.price.toFixed(2)}
                </span>

                {hasDiscount && (
                  <>
                    <span className="font-mono text-sm sm:text-base text-white/30 line-through">
                      MRP ₹{product.originalPrice.toFixed(2)}
                    </span>

                    <span className="font-mono text-xs text-rose-300 bg-rose-400/10 border border-rose-400/15 px-2 py-1 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}

              </div>

              {hasDiscount && (
                <p className="text-sm text-emerald-300 mt-2">
                  You save ₹{savings.toFixed(2)}
                </p>
              )}

              <p className="text-[11px] text-white/25 mt-1">
                Inclusive of all taxes
              </p>

            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mt-5">

              <motion.span
                className={`w-2 h-2 rounded-full ${status.dot}`}
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
                        ease: 'easeInOut',
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

            {/* Description */}
            <p className="mt-6 text-white/55 leading-relaxed text-sm sm:text-base">
              {product.description ||
                'No description available for this product.'}
            </p>

            {/* Highlights */}
            {highlightsList.length > 0 && (
              <div className="mt-7">

                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
                  Highlights
                </h3>

                <div className="grid sm:grid-cols-2 gap-2">

                  {highlightsList.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-white/[0.035] border border-white/10 rounded-xl px-4 py-3"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 mt-1.5 flex-shrink-0" />

                      <span className="text-sm text-white/60">
                        {h}
                      </span>
                    </div>
                  ))}

                </div>

              </div>
            )}

            {/* Size */}
            {requiresSize && (
              <div className="mt-7">

                <div className="flex items-center justify-between mb-3">

                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                    Select size
                  </h3>

                  {sizeError && (
                    <span className="text-xs text-rose-300">
                      Please select a size
                    </span>
                  )}

                </div>

                <motion.div
                  animate={
                    sizeError
                      ? {
                          x: [0, -6, 6, -4, 4, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  className="flex flex-wrap gap-2"
                >

                  {sizesList.map((size) => (
                    <motion.button
                      key={size}
                      type="button"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`
                        w-12 h-12 rounded-2xl
                        border text-sm font-mono
                        transition-all
                        ${
                          selectedSize === size
                            ? 'bg-cyan-300 text-black border-cyan-300 shadow-[0_0_25px_rgba(103,232,249,.15)]'
                            : 'bg-white/[0.035] border-white/10 text-white/65 hover:border-cyan-300/50 hover:text-white'
                        }
                      `}
                    >
                      {size}
                    </motion.button>
                  ))}

                </motion.div>

              </div>
            )}

            {/* Quantity */}
            <div className="mt-7">

              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
                Quantity
              </p>

              <div className="flex items-center gap-2 border border-white/10 bg-white/[0.035] rounded-2xl px-1.5 py-1.5 w-fit">

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-25"
                >
                  <Minus size={14} />
                </motion.button>

                <span className="w-9 text-center font-mono text-sm">
                  {quantity}
                </span>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.stock, q + 1)
                    )
                  }
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-25"
                >
                  <Plus size={14} />
                </motion.button>

              </div>

            </div>

            {/* Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={product.stock === 0}
                className={`
                  flex items-center justify-center gap-2
                  py-3.5 rounded-2xl
                  text-[10px] sm:text-xs
                  font-bold uppercase tracking-[0.13em]
                  transition-all
                  disabled:opacity-30
                  ${
                    added
                      ? 'bg-emerald-400 text-black'
                      : 'bg-white text-black hover:bg-white/90'
                  }
                `}
              >

                <AnimatePresence
                  mode="wait"
                  initial={false}
                >

                  {added ? (
                    <motion.span
                      key="added"
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} />
                      Added
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag size={16} />

                      {product.stock === 0
                        ? 'Out of stock'
                        : 'Add to cart'}
                    </motion.span>
                  )}

                </AnimatePresence>

              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-[0.13em] bg-cyan-300 text-black hover:bg-cyan-200 transition-all disabled:opacity-30"
              >
                Buy now
              </motion.button>

            </div>

            {/* Specifications */}
            {specList.length > 0 && (
              <div className="mt-8">

                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
                  Specifications
                </h3>

                <div className="bg-white/[0.035] border border-white/10 rounded-2xl overflow-hidden">

                  {specList.map((spec, i) => (
                    <div
                      key={i}
                      className={`
                        grid grid-cols-2
                        px-4 py-3
                        text-sm
                        ${
                          i !== specList.length - 1
                            ? 'border-b border-white/10'
                            : ''
                        }
                      `}
                    >

                      <span className="text-white/30">
                        {spec.key}
                      </span>

                      <span className="text-white/70">
                        {spec.value}
                      </span>

                    </div>
                  ))}

                </div>

              </div>
            )}

            {/* Countdown */}
            {orderCountdown && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="text-xs text-amber-300 mt-6 font-mono bg-amber-400/[0.06] border border-amber-400/10 rounded-xl px-4 py-3"
              >
                Order within{' '}
                <span className="font-semibold">
                  {orderCountdown}
                </span>{' '}
                to get it dispatched today
              </motion.p>
            )}

            {/* Service Features */}
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">

              {[
                {
                  icon: ShieldCheck,
                  label: 'Secure checkout',
                },
                {
                  icon: RotateCcw,
                  label: '7-day returns',
                },
                {
                  icon: Truck,
                  label: `Delivery in ${
                    product.deliveryDays || 5
                  } days`,
                },
              ].map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -3 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col items-center text-center gap-2 px-2 py-4 rounded-2xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.06] hover:border-cyan-300/20 transition-all"
                >

                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    className="text-cyan-300"
                  />

                  <span className="text-[10px] text-white/40 leading-tight">
                    {label}
                  </span>

                </motion.div>
              ))}

            </div>

          </motion.div>

        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <ScrollReveal>

            <div className="mt-20 sm:mt-28">

              <div className="flex items-end justify-between mb-8">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2">
                    You may also like
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-black">
                    More from {product.category}
                  </h2>
                </div>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">

                {related.map((p, i) => (
                  <ScrollReveal
                    key={p.id}
                    direction="up"
                    delay={i * 0.06}
                  >
                    <ProductCard product={p} />
                  </ScrollReveal>
                ))}

              </div>

            </div>

          </ScrollReveal>
        )}

        {/* Reviews */}
        <div className="mt-20 sm:mt-28">

          <ReviewSection
            productId={product.id}
            onReviewAdded={() => {
              api
                .get(`/api/products/${id}`)
                .then((res) =>
                  setProduct(res.data)
                );
            }}
          />

        </div>

      </div>

      {/* Cart Toast */}
      <AnimatePresence>

        {showToast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              x: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed bottom-5 right-5 z-50 bg-[#11151c]/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 max-w-xs"
          >

            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center flex-shrink-0">
              <Check
                size={18}
                strokeWidth={2}
                className="text-emerald-300"
              />
            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold">
                Added to cart
              </p>

              <p className="text-xs text-white/40 truncate">
                {product.name}
              </p>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}