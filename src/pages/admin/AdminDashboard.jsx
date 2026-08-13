import { motion } from 'framer-motion';
import { Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function AdminDashboard() {
const { data: products = [], isLoading: productsLoading, isError: productsError } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.get('/api/products').then((res) => (Array.isArray(res.data) ? res.data : [])),
  staleTime: 5 * 60 * 1000,
});

const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useQuery({
  queryKey: ['orders', 'admin'],
  queryFn: () => api.get('/api/orders').then((res) => (Array.isArray(res.data) ? res.data : [])),
  staleTime: 2 * 60 * 1000,
});

const loading = productsLoading || ordersLoading;
const error = (productsError || ordersError) ? 'Could not load dashboard data.' : '';

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const pending = orders.filter(
    (order) => order.status === 'PENDING'
  ).length;

  const stats = [
    {
      label: 'Products',
      value: products.length,
      icon: Package,
    },
    {
      label: 'Orders',
      value: orders.length,
      icon: ShoppingCart,
    },
    {
      label: 'Revenue',
      value: `₹${revenue.toFixed(2)}`,
      icon: TrendingUp,
    },
    {
      label: 'Pending orders',
      value: pending,
      icon: Clock,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">
        Dashboard
      </h1>

      {error && (
        <p className="mb-6 text-ember font-mono text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-ink/40 font-mono text-sm">
          Loading...
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;

            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                }}
                className="bg-white/60 border border-stone rounded-md p-5"
              >
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className="text-verdant mb-3"
                />

                <div className="font-display text-2xl">
                  {s.value}
                </div>

                <div className="text-xs font-mono text-ink/40 mt-1">
                  {s.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}