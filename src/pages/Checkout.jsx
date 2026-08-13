import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Tag,
  X,
  Check,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  User as UserIcon,
  Phone,
} from 'lucide-react';
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
        theme: { color: '#06b6d4' },
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
      <div className="min-h-[calc(100vh-5rem)] bg-[#07090d] text-white flex items-center justify-center px-6 text-center relative overflow-hidden">

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/[0.045] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag
              size={34}
              className="text-cyan-300"
              strokeWidth={1.4}
            />
          </div>

          <span className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">
            Checkout
          </span>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
            Your cart is empty
          </h1>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 mt-7 px-7 py-3.5 bg-cyan-400 hover:bg-cyan-300 transition-colors rounded-2xl text-sm font-semibold uppercase tracking-widest text-[#061018]"
          >
            Browse catalog
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#07090d] text-white flex items-center justify-center px-6 relative overflow-hidden">

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.15,
              type: 'spring',
              stiffness: 200,
              damping: 12,
            }}
            className="w-20 h-20 rounded-3xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-7"
          >
            <Check
              size={32}
              className="text-cyan-300"
              strokeWidth={2}
            />
          </motion.div>

          <span className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">
            Order confirmed
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
            Payment successful
          </h1>

          <p className="text-white/40 mt-3">
            Taking you to your order history...
          </p>
        </motion.div>
      </div>
    );
  }

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

      <div className="absolute -top-40 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 sm:mb-10"
        >
          <span className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">
            Secure checkout
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
            Checkout
          </h1>

          <p className="text-white/35 text-sm mt-2">
            Complete your details and securely place your order.
          </p>
        </motion.div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid md:grid-cols-[1fr_360px] gap-6 md:gap-10"
        >

          {/* Left column */}
          <div className="space-y-6 md:space-y-8">

            {/* Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/[0.045] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7"
            >

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <MapPin
                    size={17}
                    strokeWidth={1.75}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                    Step 01
                  </span>

                  <h2 className="font-bold text-lg">
                    Shipping details
                  </h2>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                {/* Full name */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2.5">
                    <UserIcon size={12} strokeWidth={2} />
                    Full name
                  </label>

                  <input
                    type="text"
                    name="shippingName"
                    value={form.shippingName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400/50 transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Phone */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2.5">
                    <Phone size={12} strokeWidth={2} />
                    Phone number
                  </label>

                  <input
                    type="tel"
                    name="shippingPhone"
                    value={form.shippingPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400/50 transition-all"
                    placeholder="Enter your mobile number"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2.5">
                    Address
                  </label>

                  <input
                    type="text"
                    name="shippingAddress"
                    value={form.shippingAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400/50 transition-all"
                    placeholder="House no., street, area"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2.5">
                    City
                  </label>

                  <input
                    type="text"
                    name="shippingCity"
                    value={form.shippingCity}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400/50 transition-all"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2.5">
                    State
                  </label>

                  <input
                    type="text"
                    name="shippingState"
                    value={form.shippingState}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400/50 transition-all"
                  />
                </div>

                {/* Postal */}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2.5">
                    Postal code
                  </label>

                  <input
                    type="text"
                    name="shippingPostalCode"
                    value={form.shippingPostalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400/50 transition-all"
                  />
                </div>

              </div>
            </motion.div>

            {/* Order items */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/[0.045] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7"
            >

              <div className="flex items-center gap-3 mb-6">

                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <ShoppingBag
                    size={17}
                    strokeWidth={1.75}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                    Step 02
                  </span>

                  <h2 className="font-bold text-lg">
                    Order items
                  </h2>
                </div>

                <span className="text-xs text-white/30 ml-auto">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>

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

                    <div className="w-14 h-14 rounded-2xl bg-[#111722] border border-white/10 overflow-hidden flex-shrink-0">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm truncate">
                        {item.name}
                      </p>

                      <p className="text-xs text-white/30 mt-1">
                        Qty {item.quantity}
                      </p>
                    </div>

                    <span className="text-sm font-medium flex-shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>

                  </motion.div>
                ))}

              </div>
            </motion.div>

            {/* Delivery */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex items-center gap-4 bg-cyan-400/[0.05] border border-cyan-400/15 rounded-3xl px-5 py-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                <Truck
                  size={18}
                  strokeWidth={1.75}
                  className="text-cyan-300"
                />
              </div>

              <p className="text-sm text-white/55">
                Estimated delivery in{' '}
                <span className="text-white font-medium">
                  5–7 days
                </span>
                , tracked from dispatch.
              </p>
            </motion.div>

          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="h-fit bg-white/[0.045] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 md:sticky md:top-28 shadow-[0_20px_60px_rgba(0,0,0,.25)]"
          >

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Order summary
              </h2>

              <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <ShoppingBag
                  size={16}
                  className="text-cyan-300"
                  strokeWidth={1.7}
                />
              </div>
            </div>

            {/* Coupon */}
            {!promo ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => setCouponModalOpen(true)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3.5 rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.04] hover:bg-cyan-400/[0.08] transition-colors mb-6"
              >
                <span className="flex items-center gap-2 text-sm text-cyan-300">
                  <Tag size={15} strokeWidth={1.75} />
                  Apply coupon
                </span>

                <ArrowRight
                  size={14}
                  strokeWidth={1.75}
                  className="text-cyan-300"
                />
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between bg-cyan-400/10 border border-cyan-400/20 rounded-2xl px-4 py-3.5 mb-6"
              >
                <div className="flex items-center gap-2">
                  <Check
                    size={15}
                    strokeWidth={2}
                    className="text-cyan-300"
                  />

                  <span className="text-sm text-cyan-300 font-mono">
                    {promo.code} applied
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-cyan-300 hover:text-fuchsia-300 transition-colors"
                  aria-label="Remove coupon"
                >
                  <X size={15} strokeWidth={2} />
                </button>
              </motion.div>
            )}

            {/* Totals */}
            <div className="border-t border-white/10 pt-5 space-y-3">

              <div className="flex justify-between text-sm text-white/45">
                <span>Subtotal</span>
                <span className="text-white">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              {promo && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between text-sm text-cyan-300"
                >
                  <span>
                    Discount ({Math.round(promo.discountPercent * 100)}%)
                  </span>

                  <span>
                    −₹{discountAmount.toFixed(2)}
                  </span>
                </motion.div>
              )}

              <div className="flex justify-between text-sm text-white/45">
                <span>Shipping</span>

                <span className="text-cyan-300">
                  Free
                </span>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-end">
                <span className="text-white/60">
                  Total
                </span>

                <motion.span
                  key={total}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold"
                >
                  ₹{total.toFixed(2)}
                </motion.span>
              </div>

            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{
                  opacity: 1,
                  x: [0, -6, 6, -4, 4, 0],
                }}
                transition={{ duration: 0.4 }}
                className="text-sm text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-400/20 rounded-2xl px-4 py-3 mt-5"
              >
                {error}
              </motion.div>
            )}

            {/* Payment button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={placing}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all rounded-2xl text-sm font-semibold uppercase tracking-widest text-[#061018] mt-6 shadow-[0_8px_30px_rgba(34,211,238,.12)]"
            >
              {placing ? 'Processing...' : 'Pay & place order'}

              {!placing && (
                <ArrowRight
                  size={16}
                  strokeWidth={1.75}
                />
              )}
            </motion.button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-white/30 mt-4">
              <ShieldCheck
                size={13}
                strokeWidth={1.75}
                className="text-cyan-300"
              />
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
    </div>
  );
}