import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, ShoppingBag, Check, ChevronRight, Star, Heart,
  Truck, ShieldCheck, RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import ZoomImage from '../components/ZoomImage';
import ImageGallery from '../components/ImageGallery';
import ReviewSection from '../components/ReviewSection';
import { useQuery } from '@tanstack/react-query';
const RECENTLY_VIEWED_KEY = 'auren_recently_viewed';
const MAX_RECENTLY_VIEWED = 20;

function recordRecentlyViewed(productId) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    const withoutThis = stored.filter((existingId) => existingId !== productId);
    const updated = [productId, ...withoutThis].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — safe to ignore, this feature is non-critical
  }
}

function stockStatus(stock) {
  if (stock === 0) return { label: 'Out of stock', dot: 'bg-ink/30', text: 'text-ink/40', pulse: false };
  if (stock <= 10) return { label: `Only ${stock} left in stock`, dot: 'bg-ember', text: 'text-ember', pulse: true };
  return { label: 'In stock', dot: 'bg-verdant', text: 'text-verdant', pulse: false };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
const [related, setRelated] = useState([]);
const [error, setError] = useState('');

const { data: productData, isLoading: loading, isError } = useQuery({
  queryKey: ['product', id],
  queryFn: () => api.get(`/api/products/${id}`).then((res) => res.data),
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
        (p) => p.category === productData.category && p.id !== productData.id
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

      cutoff.setHours(20, 0, 0, 0); // orders before 8 PM ship same day

      let diff = cutoff - now;

      if (diff < 0) {

        cutoff.setDate(cutoff.getDate() + 1);

        diff = cutoff - now;

      }

      const hours = Math.floor(diff / (1000 * 60 * 60));

      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setOrderCountdown(`${hours}h ${minutes}m`);

    }

    updateCountdown();

    const id = setInterval(updateCountdown, 60000);

    return () => clearInterval(id);

  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/40 font-mono text-sm">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <p className="text-ink/50 mt-2">It may have been removed or the link is incorrect.</p>
        <Link
          to="/catalog"
          className="inline-block mt-6 px-6 py-2.5 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  const status = stockStatus(product.stock);
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const savings = hasDiscount ? product.originalPrice - product.price : 0;

  const galleryImages = [product.imageUrl, ...(product.imageUrls || '').split('\n').map((s) => s.trim()).filter(Boolean)].filter(Boolean);

  const sizesList = (product.sizes || '').split(',').map((s) => s.trim()).filter(Boolean);

  const specList = (product.specifications || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');
      return idx > -1
        ? { key: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() }
        : { key: line, value: '' };
    });

  const highlightsList = (product.highlights || '').split('\n').map((h) => h.trim()).filter(Boolean);

  const requiresSize = sizesList.length > 0;


  const validateSize = () => {
    if (requiresSize && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 500);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-1.5 text-xs font-mono text-ink/40 mb-6 sm:mb-8 flex-wrap">
        <Link to="/" className="hover:text-verdant transition-colors">Home</Link>
        <ChevronRight size={12} strokeWidth={2} />
        <Link to="/catalog" className="hover:text-verdant transition-colors">Catalog</Link>
        <ChevronRight size={12} strokeWidth={2} />
       <Link to={`/catalog?category=${encodeURIComponent(product.category)}`} className="hover:text-verdant transition-colors">
          {product.category}
        </Link>
        <ChevronRight size={12} strokeWidth={2} />
        <span className="text-ink/70">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Gallery with thumbnail rail + hover zoom */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="md:sticky md:top-28"
        >
          <ImageGallery
            images={galleryImages}
            alt={product.name}
            hasDiscount={hasDiscount}
            discountPercent={discountPercent}
            wishlisted={wishlisted}
            onToggleWishlist={() => toggleWishlist(product)}
            
          />
        </motion.div>
       


        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
          {product.brand && <span className="text-xs uppercase tracking-widest text-ink/40">{product.brand}</span>}
          <h1 className="font-display text-3xl sm:text-4xl mt-1">{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-1 bg-verdant text-paper text-xs font-mono px-2 py-1 rounded">
                {product.rating.toFixed(1)} <Star size={11} fill="currentColor" strokeWidth={0} />
              </span>
              <span className="text-xs text-ink/50 font-mono">{product.reviewCount} ratings</span>
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl">₹{product.price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="font-mono text-lg text-ink/40 line-through">MRP ₹{product.originalPrice.toFixed(2)}</span>
                  <span className="font-mono text-sm text-ember">({discountPercent}% OFF)</span>
                </>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-verdant mt-1">You save ₹{savings.toFixed(2)}</p>
            )}
            <p className="text-xs text-ink/40 mt-1">inclusive of all taxes</p>
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <motion.span
              className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
              animate={status.pulse ? { opacity: [1, 0.4, 1] } : {}}
              transition={status.pulse ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
            />
            <span className={`text-xs font-mono ${status.text}`}>{status.label}</span>
          </div>

          <p className="mt-6 text-ink/60 leading-relaxed">
            {product.description || 'No description available for this product.'}
          </p>

          {highlightsList.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-2">Highlights</h3>
              <ul className="space-y-1.5">
                {highlightsList.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink/70">
                    <span className="w-1 h-1 rounded-full bg-verdant mt-2 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requiresSize && ( 
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase tracking-widest text-ink/40">Select size</h3>
                {sizeError && <span className="text-xs text-ember">Please select a size</span>}
              </div>
              <motion.div
                animate={sizeError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {sizesList.map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`w-12 h-12 rounded-full border text-sm font-mono transition-colors ${
                      selectedSize === size
                        ? 'bg-ink text-paper border-ink'
                        : 'border-stone text-ink/70 hover:border-ink'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 border border-stone rounded-full px-1 py-1 w-fit">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-stone transition-colors disabled:opacity-30"
            >
              <Minus size={14} strokeWidth={2} />
            </motion.button>
            <span className="w-8 text-center font-mono text-sm">{quantity}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-stone transition-colors disabled:opacity-30"
            >
              <Plus size={14} strokeWidth={2} />
            </motion.button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-sans uppercase tracking-widest transition-colors disabled:opacity-40 ${
                added ? 'bg-verdant text-paper' : 'bg-ink text-paper hover:bg-ink-light'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                    <Check size={16} strokeWidth={2} /> Added
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                    <ShoppingBag size={16} strokeWidth={1.75} />
                    {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-sans uppercase tracking-widest bg-verdant text-paper hover:bg-verdant-light transition-colors disabled:opacity-40"
            >
              Buy now
            </motion.button>
          </div>

          {/* Specifications — right below Buy Now */}
          {specList.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-2">Specifications</h3>
              <div className="bg-white/60 border border-stone rounded-xl overflow-hidden">
                {specList.map((spec, i) => (
                  <div key={i} className={`grid grid-cols-2 px-4 py-2.5 text-sm ${i !== specList.length - 1 ? 'border-b border-stone/60' : ''}`}>
                    <span className="text-ink/40">{spec.key}</span>
                    <span className="text-ink/80">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orderCountdown && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-ember mt-6 font-mono"
            >
              Order within <span className="font-semibold">{orderCountdown}</span> to get it dispatched today
            </motion.p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: ShieldCheck, label: 'Secure checkout' },
              { icon: RotateCcw, label: '7-day returns' },
              { icon: Truck, label: `Delivery in ${product.deliveryDays || 5} days` },
            ].map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center gap-2 px-2 py-4 rounded-xl border border-stone bg-white/60 hover:border-verdant/30 hover:shadow-sm transition-all duration-200"
              >
                <Icon size={20} strokeWidth={1.5} className="text-verdant" />
                <span className="text-[11px] text-ink/60 leading-tight">{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <ScrollReveal>
          <div className="mt-16 sm:mt-20">
            <h2 className="font-display text-2xl sm:text-3xl mb-8">More from {product.category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {related.map((p, i) => (
                <ScrollReveal key={p.id} direction="up" delay={i * 0.06}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
      <ReviewSection
        productId={product.id}
        onReviewAdded={() => {
          api.get(`/api/products/${id}`).then((res) => setProduct(res.data));
        }}
      />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 bg-ink text-paper rounded-xl shadow-xl p-4 flex items-center gap-3 max-w-xs"
          >
            <div className="w-10 h-10 rounded-full bg-verdant/20 flex items-center justify-center flex-shrink-0">
              <Check size={18} strokeWidth={2} className="text-verdant-light" />
            </div>
            <div>
              <p className="text-sm font-medium">Added to cart</p>
              <p className="text-xs text-paper/50 truncate">{product.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}