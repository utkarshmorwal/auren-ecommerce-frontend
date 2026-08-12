import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, X, Check, ArrowRight, ShieldCheck, Truck, MapPin, User as UserIcon, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CouponModal from '../components/CouponModal';
import { useQueryClient } from '@tanstack/react-query';

function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data.message === 'string') return data.message;
  if (typeof data.message === 'object') return Object.values(data.message).join(' ');
  return 'Something went wrong. Please try again.';
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
  });

  const [promo, setPromo] = useState(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  const discountAmount = promo ? subtotal * promo.discountPercent : 0;
  const total = subtotal - discountAmount;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyCoupon = (code, discountPercent) => {
    setPromo({ code, discountPercent });
  };

  const handleRemovePromo = () => {
    setPromo(null);
  };

  const finalizeOrder = async (paymentDetails) => {
    await api.post('/api/orders', {
      userId: user.id,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      promoCode: promo ? promo.code : null,
      ...form,
      ...paymentDetails,
    });
    setSuccess(true);
    clearCart();
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    setTimeout(() => navigate('/orders'), 1600);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!window.Razorpay) {
      setError('Payment system failed to load. Please refresh and try again.');
      return;
    }

    setError('');
    setPlacing(true);

    try {
      const orderRes = await api.post('/api/payment/create-order', { amount: total });
      const { orderId, amount, currency, keyId } = orderRes.data;

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'Auren',
        description: 'Order payment',
        order_id: orderId,
        prefill: {
          name: form.shippingName,
          email: user.email,
          contact: form.shippingPhone,
        },
        theme: { color: '#0f766e' },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI',
                instruments: [
                  { method: 'upi' },
                ],
              },
              other: {
                name: 'Other payment methods',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        handler: async function (response) {
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await finalizeOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              paymentStatus: 'PAID',
            });
          } catch (err) {
            setError('Payment verification failed. Please contact support if money was deducted.');
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
            setError('Payment cancelled.');
          },
        },
      });

      razorpay.on('payment.failed', function () {
        setPlacing(false);
        setError('Payment failed. Please try again with a different method.');
      });

      razorpay.open();
    } catch (err) {
      setError(extractErrorMessage(err));
      setPlacing(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 text-center">
        <div>
          <ShoppingBag size={40} className="text-ink/20 mx-auto mb-4" strokeWidth={1.25} />
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <Link
            to="/catalog"
            className="inline-block mt-6 px-6 py-2.5 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
            className="w-16 h-16 rounded-full bg-verdant/15 flex items-center justify-center mx-auto mb-6"
          >
            <Check size={28} className="text-verdant" strokeWidth={2} />
          </motion.div>
          <h1 className="font-display text-4xl">Payment successful</h1>
          <p className="text-ink/60 mt-2">Taking you to your order history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-display text-3xl sm:text-5xl mb-8 sm:mb-10"
      >
        Checkout
      </motion.h1>

      <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-[1fr_360px] gap-6 md:gap-10">
        <div className="space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/60 border border-stone rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={16} strokeWidth={1.75} className="text-verdant" />
              <h2 className="font-display text-xl">Shipping details</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-ink/50 mb-2">
                  <UserIcon size={12} strokeWidth={2} /> Full name
                </label>
                <input
                  type="text" name="shippingName" value={form.shippingName} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-ink/50 mb-2">
                  <Phone size={12} strokeWidth={2} /> Phone number
                </label>
                <input
                  type="tel" name="shippingPhone" value={form.shippingPhone} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">Address</label>
                <input type="text" name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder="House no., street, area"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">City</label>
                <input
                  type="text" name="shippingCity" value={form.shippingCity} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">State</label>
                <input
                  type="text" name="shippingState" value={form.shippingState} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">Postal code</label>
                <input
                  type="text" name="shippingPostalCode" value={form.shippingPostalCode} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder=""
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/60 border border-stone rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag size={16} strokeWidth={1.75} className="text-verdant" />
              <h2 className="font-display text-xl">Order items</h2>
              <span className="text-xs font-mono text-ink/40 ml-auto">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-stone overflow-hidden flex-shrink-0">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
               <div className="flex-1 min-w-0 overflow-hidden">
  <p className="text-sm truncate">{item.name}</p>
  <p className="text-xs text-ink/40 font-mono">Qty {item.quantity}</p>
</div>
                  <span className="font-mono text-sm flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center gap-3 bg-verdant/5 border border-verdant/15 rounded-2xl px-5 py-4"
          >
            <Truck size={18} strokeWidth={1.75} className="text-verdant flex-shrink-0" />
            <p className="text-sm text-ink/70 min-w-0">Estimated delivery in <span className="font-mono">5–7 days</span>, tracked from dispatch.</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="h-fit bg-white/60 border border-stone rounded-2xl p-6 md:sticky md:top-28"
        >
          <h2 className="font-display text-xl mb-5">Order summary</h2>

          {!promo ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setCouponModalOpen(true)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-dashed border-verdant/40 bg-verdant/5 hover:bg-verdant/10 transition-colors mb-5"
            >
              <span className="flex items-center gap-2 text-sm text-verdant">
                <Tag size={15} strokeWidth={1.75} />
                Apply coupon
              </span>
              <ArrowRight size={14} strokeWidth={1.75} className="text-verdant" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between bg-verdant/10 border border-verdant/20 rounded-xl px-4 py-3 mb-5"
            >
              <div className="flex items-center gap-2">
                <Check size={15} strokeWidth={2} className="text-verdant" />
                <span className="text-sm text-verdant font-mono">{promo.code} applied</span>
              </div>
              <button type="button" onClick={handleRemovePromo} className="text-verdant hover:text-ember transition-colors" aria-label="Remove coupon">
                <X size={15} strokeWidth={2} />
              </button>
            </motion.div>
          )}

          <div className="border-t border-stone pt-4 space-y-2.5">
            <div className="flex justify-between text-sm text-ink/60">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            {promo && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between text-sm text-verdant"
              >
                <span>Discount ({Math.round(promo.discountPercent * 100)}%)</span>
                <span className="font-mono">−₹{discountAmount.toFixed(2)}</span>
              </motion.div>
            )}
            <div className="flex justify-between text-sm text-ink/60">
              <span>Shipping</span>
              <span className="font-mono text-verdant">Free</span>
            </div>
            <div className="border-t border-stone pt-3 flex justify-between font-display text-lg">
              <span>Total</span>
              <motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-mono">
                ₹{total.toFixed(2)}
              </motion.span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
              className="text-sm text-ember bg-ember/10 border border-ember/20 rounded-lg px-4 py-3 mt-4"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={placing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-verdant hover:bg-verdant-light disabled:opacity-60 transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper mt-5"
          >
            {placing ? 'Processing...' : 'Pay & place order'}
            {!placing && <ArrowRight size={16} strokeWidth={1.75} />}
          </motion.button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-ink/40 mt-3">
            <ShieldCheck size={13} strokeWidth={1.75} />
            Secured by Razorpay
          </p>
        </motion.div>
      </form>

      <CouponModal
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        subtotal={subtotal}
        appliedCode={promo?.code}
        onApply={handleApplyCoupon}
      />
    </div>
  );
}