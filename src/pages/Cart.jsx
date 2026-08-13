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
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <ShoppingBag size={40} className="text-ink/20 mx-auto mb-4" strokeWidth={1.25} />
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <p className="text-ink/50 mt-2">Add something from the catalog to get started.</p>
          <Link
            to="/catalog"
            className="inline-block mt-6 px-6 py-2.5 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
          >
            Browse catalog
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="font-display text-3xl sm:text-5xl mb-8 sm:mb-10">Your cart</h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-6 md:gap-10">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/60 border border-stone rounded-md p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/20 font-display italic text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base sm:text-lg truncate">{item.name}</h3>
                    <p className="font-mono text-sm text-ink/50 mt-0.5">₹{item.price.toFixed(2)}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(item.productId)}
                    className="text-ink/30 hover:text-ember transition-colors flex-shrink-0"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={17} strokeWidth={1.75} />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone/60">
                  <div className="flex items-center gap-2 border border-stone rounded-full px-1 py-1">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone transition-colors disabled:opacity-30"
                    >
                      <Minus size={13} strokeWidth={2} />
                    </motion.button>
                    <span className="w-6 text-center font-mono text-sm">{item.quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone transition-colors disabled:opacity-30"
                    >
                      <Plus size={13} strokeWidth={2} />
                    </motion.button>
                  </div>

                  <span className="font-mono text-sm">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="h-fit bg-white/60 border border-stone rounded-md p-6 md:sticky md:top-28"
        >
          <h2 className="font-display text-xl mb-4">Order summary</h2>

          <div className="flex justify-between text-sm text-ink/60 mb-2">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink/60 mb-4">
            <span>Shipping</span>
            <span className="font-mono text-verdant">Free</span>
          </div>
          <div className="border-t border-stone pt-4 flex justify-between font-display text-lg mb-6">
            <span>Total</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
          >
            {user ? 'Proceed to checkout' : 'Sign in to checkout'}
            <ArrowRight size={16} strokeWidth={1.75} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}