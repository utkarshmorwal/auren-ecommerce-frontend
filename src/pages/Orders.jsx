import { motion } from 'framer-motion';
import { Package, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import OrderTimeline from '../components/OrderTimeline';
import { useQuery } from '@tanstack/react-query';

const statusColor = {
  PENDING: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  CONFIRMED: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
  SHIPPED: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
  DELIVERED: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();

  const {
    data: orders = [],
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () =>
      api.get(`/api/orders/user/${user.id}`).then((res) => res.data),
    enabled: !authLoading && !!user,
    staleTime: 2 * 60 * 1000,
  });

  const error = isError ? 'Could not load your orders.' : '';

  // User is not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#07090d] text-white flex items-center justify-center px-4 relative overflow-hidden">

        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20"
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
          className="text-center relative z-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/[0.045] border border-white/10 flex items-center justify-center mx-auto">
            <Package
              size={34}
              strokeWidth={1.4}
              className="text-cyan-300"
            />
          </div>

          <p className="mt-5 text-sm sm:text-base text-white/45">
            Sign in to see your orders
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

      <div className="absolute top-[45%] -left-40 w-96 h-96 bg-purple-600/[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 relative z-10">

        {/* Page Header */}
        <ScrollReveal>
          <div className="mb-8 sm:mb-12">

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <Package
                  size={18}
                  strokeWidth={1.7}
                  className="text-cyan-300"
                />
              </div>

              <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-cyan-300">
                Your purchases
              </p>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Order history
            </h1>

            <p className="mt-2 text-sm text-white/35 max-w-xl">
              Track your orders and view your purchase details.
            </p>

          </div>
        </ScrollReveal>

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white/[0.035] border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />

              <p className="text-white/40 text-sm">
                Loading orders...
              </p>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/[0.07] px-5 py-4"
          >
            <p className="text-red-300 text-xs sm:text-sm">
              {error}
            </p>
          </motion.div>
        )}

        {/* No Orders */}
        {!loading && !error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-10 sm:p-16 text-center"
          >

            <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto">
              <Package
                size={34}
                strokeWidth={1.25}
                className="text-white/25"
              />
            </div>

            <p className="mt-6 text-xl sm:text-2xl font-bold">
              No orders yet
            </p>

            <p className="mt-2 text-sm text-white/35">
              Your orders will appear here after checkout.
            </p>

          </motion.div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5 sm:space-y-7">

            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                }}
                className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,.18)]"
              >

                {/* Order Header */}
                <div className="p-5 sm:p-7">

                  <div className="flex items-center justify-between gap-4">

                    {/* Order Number */}
                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-11 h-11 rounded-2xl bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center flex-shrink-0">
                        <Package
                          size={18}
                          strokeWidth={1.7}
                          className="text-cyan-300"
                        />
                      </div>

                      <div className="min-w-0">

                        <p className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-[0.18em]">
                          Order
                        </p>

                        <p className="text-sm sm:text-base text-white/75 font-mono mt-0.5">
                          #{order.id}
                        </p>

                      </div>

                    </div>

                    {/* Status */}
                    <span
                      className={`
                        flex-shrink-0
                        text-[9px]
                        sm:text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        px-3
                        py-1.5
                        rounded-full
                        border
                        ${
                          statusColor[order.status] ||
                          'text-white/50 bg-white/5 border-white/10'
                        }
                      `}
                    >
                      {order.status}
                    </span>

                  </div>

                  {/* Timeline */}
                  <div className="mt-7 sm:mt-8 w-full overflow-x-auto">
                    <OrderTimeline status={order.status} />
                  </div>

                </div>

                {/* Order Items */}
                <div className="border-t border-white/10 px-5 sm:px-7 py-5 sm:py-6">

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                      Items
                    </p>

                    <ArrowUpRight
                      size={14}
                      className="text-white/20"
                    />
                  </div>

                  <div className="space-y-3.5">

                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-start justify-between gap-5 text-xs sm:text-sm"
                      >

                        {/* Product */}
                        <span className="min-w-0 leading-5 text-white/65">
                          <span className="break-words">
                            {item.productName}
                          </span>

                          <span className="text-white/30 ml-1">
                            × {item.quantity}
                          </span>
                        </span>

                        {/* Price */}
                        <span className="font-mono text-white/70 flex-shrink-0 whitespace-nowrap">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>

                      </div>
                    ))}

                  </div>

                </div>

                {/* Total */}
                <div className="border-t border-white/10 bg-white/[0.02] px-5 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-4">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                      Order total
                    </p>

                    <span className="text-lg sm:text-xl font-bold text-white mt-1 block">
                      Total
                    </span>
                  </div>

                  <span className="text-lg sm:text-xl font-bold font-mono whitespace-nowrap text-cyan-300">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </span>

                </div>

              </motion.div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}