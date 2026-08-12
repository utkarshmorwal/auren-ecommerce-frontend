import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import OrderTimeline from '../components/OrderTimeline';
import { useQuery } from '@tanstack/react-query';
const statusColor = {
  PENDING: 'text-ember bg-ember/10',
  CONFIRMED: 'text-verdant bg-verdant/10',
  SHIPPED: 'text-verdant bg-verdant/10',
  DELIVERED: 'text-verdant bg-verdant/10',
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();

const { data: orders = [], isLoading: loading, isError } = useQuery({
  queryKey: ['orders', user?.id],
  queryFn: () => api.get(`/api/orders/user/${user.id}`).then((res) => res.data),
  enabled: !authLoading && !!user,
  staleTime: 2 * 60 * 1000, // 2 min — orders thodi jaldi refresh honi chahiye products se
});

const error = isError ? 'Could not load your orders.' : '';

  // User is not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Package
            size={32}
            strokeWidth={1.5}
            className="mx-auto text-ink/25"
          />

          <p className="mt-4 text-sm sm:text-base text-ink/50 font-mono">
            Sign in to see your orders
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

      {/* Page Header */}
      <ScrollReveal>
        <div className="mb-7 sm:mb-10">

          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-verdant mb-2">
            Your purchases
          </p>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">
            Order history
          </h1>

          <p className="mt-2 text-sm text-ink/50">
            Track your orders and view your purchase details.
          </p>

        </div>
      </ScrollReveal>

      {/* Loading */}
      {loading && (
        <div className="mt-8 sm:mt-10">
          <p className="text-ink/40 font-mono text-sm">
            Loading orders...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 rounded-xl border border-ember/20 bg-ember/5 px-4 py-3">
          <p className="text-ember font-mono text-xs sm:text-sm">
            {error}
          </p>
        </div>
      )}

      {/* No Orders */}
      {!loading && !error && orders.length === 0 && (
        <div className="mt-8 sm:mt-10 rounded-2xl border border-stone bg-white/60 p-8 sm:p-12 text-center">

          <Package
            size={34}
            strokeWidth={1.25}
            className="mx-auto text-ink/20"
          />

          <p className="mt-4 font-display text-xl sm:text-2xl">
            No orders yet
          </p>

          <p className="mt-1 text-sm text-ink/40">
            Your orders will appear here after checkout.
          </p>

        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="mt-7 sm:mt-10 space-y-4 sm:space-y-6">

          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
              }}
              className="
                bg-white/70
                border border-stone
                rounded-2xl
                overflow-hidden
              "
            >

              {/* =========================
                  ORDER HEADER
              ========================== */}
              <div className="p-4 sm:p-6">

                <div className="flex items-center justify-between gap-3">

                  {/* Order Number */}
                  <div className="flex items-center gap-2.5 min-w-0">

                    <div className="
                      w-9 h-9
                      sm:w-10 sm:h-10
                      rounded-full
                      bg-stone
                      flex items-center justify-center
                      flex-shrink-0
                    ">
                      <Package
                        size={17}
                        strokeWidth={1.75}
                        className="text-ink/45"
                      />
                    </div>

                    <div className="min-w-0">

                      <p className="
                        font-mono
                        text-[10px]
                        sm:text-xs
                        text-ink/40
                        uppercase
                        tracking-wider
                      ">
                        Order
                      </p>

                      <p className="
                        font-mono
                        text-sm
                        sm:text-base
                        text-ink/70
                      ">
                        #{order.id}
                      </p>

                    </div>

                  </div>

                  {/* Status */}
                  <span
                    className={`
                      flex-shrink-0
                      text-[10px]
                      sm:text-xs
                      font-mono
                      uppercase
                      tracking-wider
                      px-2.5
                      sm:px-3
                      py-1.5
                      rounded-full
                      ${
                        statusColor[order.status] ||
                        'text-ink/50 bg-stone'
                      }
                    `}
                  >
                    {order.status}
                  </span>

                </div>

                {/* =========================
                    ORDER TIMELINE
                ========================== */}
                <div className="mt-6 sm:mt-7 w-full">
                  <OrderTimeline status={order.status} />
                </div>

              </div>

              {/* =========================
                  ORDER ITEMS
              ========================== */}
              <div className="
                border-t
                border-stone
                px-4
                sm:px-6
                py-4
                sm:py-5
              ">

                <div className="space-y-3">

                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                        text-xs
                        sm:text-sm
                        text-ink/70
                      "
                    >

                      {/* Product name */}
                      <span className="
                        min-w-0
                        leading-5
                      ">
                        {item.productName}

                        <span className="text-ink/40">
                          {' '}× {item.quantity}
                        </span>
                      </span>

                      {/* Item price */}
                      <span className="
                        font-mono
                        flex-shrink-0
                        whitespace-nowrap
                      ">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>

                    </div>
                  ))}

                </div>

              </div>

              {/* =========================
                  TOTAL
              ========================== */}
              <div className="
                border-t
                border-stone
                px-4
                sm:px-6
                py-4
                sm:py-5
                flex
                items-center
                justify-between
                gap-4
              ">

                <span className="
                  font-display
                  text-lg
                  sm:text-xl
                ">
                  Total
                </span>

                <span className="
                  font-mono
                  text-base
                  sm:text-lg
                  font-medium
                  whitespace-nowrap
                ">
                  ₹{Number(order.totalAmount).toFixed(2)}
                </span>

              </div>

            </motion.div>
          ))}

        </div>
      )}

    </div>
  );
}