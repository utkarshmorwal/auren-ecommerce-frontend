import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(user ? '/checkout' : '/login');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#07090d] text-white flex items-center justify-center px-6 relative overflow-hidden">

        {/* Background grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center relative z-10"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/[0.045] border border-white/10 flex items-center justify-center">
            <ShoppingBag
              size={34}
              className="text-cyan-300"
              strokeWidth={1.4}
            />
          </div>

          <span className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">
            Your collection
          </span>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
            Your cart is empty
          </h1>

          <p className="text-white/40 mt-3 max-w-sm mx-auto text-sm">
            Add something from the catalog to get started.
          </p>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 mt-7 px-7 py-3.5 bg-cyan-400 hover:bg-cyan-300 transition-all rounded-2xl text-sm font-semibold uppercase tracking-widest text-[#061018]"
          >
            Browse catalog
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#07090d] text-white relative overflow-hidden">

      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="absolute -top-40 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">

        {/* Page heading */}
        <div className="mb-8 sm:mb-10">
          <span className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">
            Shopping bag
          </span>

          <div className="flex items-end justify-between gap-4 mt-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Your cart
            </h1>

            <span className="text-xs sm:text-sm text-white/35 pb-1">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_340px] gap-6 md:gap-10">

          {/* Cart items */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="bg-white/[0.045] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-4">

                    {/* Product image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#111722] border border-white/10 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] uppercase tracking-wider">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {item.name}
                      </h3>

                      <p className="text-sm text-white/40 mt-1">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Remove */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.productId)}
                      className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] text-white/35 hover:text-fuchsia-300 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10 transition-all flex items-center justify-center flex-shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </motion.button>
                  </div>

                  {/* Bottom controls */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">

                    {/* Quantity */}
                    <div className="flex items-center gap-1 border border-white/10 bg-black/20 rounded-2xl p-1">

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-25"
                      >
                        <Minus size={13} strokeWidth={2} />
                      </motion.button>

                      <span className="w-7 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-25"
                      >
                        <Plus size={13} strokeWidth={2} />
                      </motion.button>

                    </div>

                    {/* Item total */}
                    <span className="font-semibold text-sm sm:text-base">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-fit bg-white/[0.045] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 md:sticky md:top-28 shadow-[0_20px_60px_rgba(0,0,0,.25)]"
          >

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Order summary
              </h2>

              <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <ShoppingBag
                  size={17}
                  className="text-cyan-300"
                  strokeWidth={1.7}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm text-white/45 mb-3">
              <span>Subtotal</span>
              <span className="text-white">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-white/45 mb-5">
              <span>Shipping</span>
              <span className="text-cyan-300 font-medium">
                Free
              </span>
            </div>

            <div className="border-t border-white/10 pt-5 flex justify-between items-end mb-7">
              <span className="text-white/60">
                Total
              </span>

              <span className="text-xl font-bold">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-400 hover:bg-cyan-300 transition-all rounded-2xl text-sm font-semibold uppercase tracking-widest text-[#061018] shadow-[0_8px_30px_rgba(34,211,238,.12)]"
            >
              {user ? 'Proceed to checkout' : 'Sign in to checkout'}
              <ArrowRight size={16} strokeWidth={1.75} />
            </motion.button>

            <p className="text-center text-[11px] text-white/25 mt-4">
              Secure checkout · Free shipping
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}