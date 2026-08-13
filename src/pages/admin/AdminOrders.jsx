import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const STATUSES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
];

const statusColor = {
  PENDING: 'text-ember bg-ember/10',
  CONFIRMED: 'text-verdant bg-verdant/10',
  SHIPPED: 'text-verdant bg-verdant/10',
  DELIVERED: 'text-verdant bg-verdant/10',
};

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { data: orders = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () => api.get('/api/orders').then((res) => (Array.isArray(res.data) ? res.data : [])),
    staleTime: 2 * 60 * 1000,
  });


 const handleStatusChange = async (orderId, status) => {
  setUpdatingId(orderId);
  setError('');

  try {
    await api.put(
      `/api/orders/${orderId}/status`,
      {},
      { params: { status } }
    );

    queryClient.setQueryData(['orders', 'admin'], (prev = []) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  } catch (err) {
    console.error('Order status update error:', err);
    setError('Could not update order status.');
  } finally {
    setUpdatingId(null);
  }
};

  const formatAmount = (amount) => {
    return Number(amount || 0).toFixed(2);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">
          Orders
        </h1>

        <button
  type="button"
  onClick={() => refetch()}
  disabled={loading}
          className="text-xs font-mono uppercase tracking-widest text-verdant hover:text-verdant-light transition-colors disabled:opacity-40"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="mb-6 text-ember font-mono text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-ink/40 font-mono text-sm">
          Loading...
        </p>
      ) : orders.length === 0 ? (
        <p className="text-ink/40 font-mono text-sm">
          No orders yet.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const isSelected =
              selectedOrderId === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.03,
                }}
                className="bg-white/60 border border-stone rounded-md p-5"
              >
                {/* ORDER HEADER */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrderId(
                      isSelected ? null : order.id
                    )
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="font-mono text-sm text-ink/50">
                        Order #{order.id}
                      </span>

                      <span className="text-sm text-ink/60 ml-3">
                        {order.shippingName ||
                          'No shipping name'}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full ${
                        statusColor[order.status] ||
                        'text-ink/50 bg-stone'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm text-ink/60">
                    <span>
                      {(order.items || []).length} item
                      {(order.items || []).length !== 1
                        ? 's'
                        : ''}
                    </span>

                    <span className="font-mono">
                      ₹{formatAmount(order.totalAmount)}
                    </span>
                  </div>
                </button>

                {/* ORDER DETAILS */}
                {isSelected && (
                  <div className="mt-5 pt-5 border-t border-stone">

                    {/* STATUS */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="text-xs font-mono text-ink/40 uppercase tracking-widest">
                        Order status
                      </span>

                      <select
                        value={order.status || 'PENDING'}
                        disabled={
                          updatingId === order.id
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value
                          )
                        }
                        className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-verdant/40 ${
                          statusColor[order.status] ||
                          'text-ink/50 bg-stone'
                        }`}
                      >
                        {STATUSES.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-2">
                      {(order.items || []).map(
                        (item, index) => (
                          <div
                            key={
                              item.productId ||
                              `${order.id}-${index}`
                            }
                            className="flex justify-between gap-4 text-sm text-ink/70"
                          >
                            <span>
                              {item.productName ||
                                'Product'}{' '}
                              × {item.quantity}
                            </span>

                            <span className="font-mono">
                              ₹
                              {formatAmount(
                                Number(item.price || 0) *
                                  Number(
                                    item.quantity || 0
                                  )
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* SHIPPING ADDRESS */}
                    {order.shippingAddress && (
                      <div className="mt-4 text-sm text-ink/60">
                        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-1">
                          Shipping address
                        </p>

                        <p>
                          {order.shippingAddress}

                          {order.shippingCity
                            ? `, ${order.shippingCity}`
                            : ''}

                          {order.shippingState
                            ? `, ${order.shippingState}`
                            : ''}

                          {order.shippingPostalCode
                            ? ` - ${order.shippingPostalCode}`
                            : ''}
                        </p>
                      </div>
                    )}

                    {/* PHONE */}
                    {order.shippingPhone && (
                      <div className="mt-3 text-sm text-ink/60">
                        <span className="font-mono text-xs text-ink/40 uppercase tracking-widest">
                          Phone:{' '}
                        </span>
                        {order.shippingPhone}
                      </div>
                    )}

                    {/* PAYMENT STATUS */}
                    {order.paymentStatus && (
                      <div className="mt-3 text-sm text-ink/60">
                        <span className="font-mono text-xs text-ink/40 uppercase tracking-widest">
                          Payment:{' '}
                        </span>
                        <span className="text-verdant">
                          {order.paymentStatus}
                        </span>
                      </div>
                    )}

                    {/* TOTAL */}
                    <div className="mt-4 pt-4 border-t border-stone flex justify-between font-display text-lg">
                      <span>Total</span>

                      <span className="font-mono">
                        ₹{formatAmount(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}