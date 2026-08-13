import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Package, DollarSign, Star, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const COLORS = ['#4338ca', '#6366f1', '#e11d48', '#fb7185', '#17151f', '#211e2e'];

function StatCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/60 border border-stone rounded-md p-5"
    >
      <Icon size={18} strokeWidth={1.75} className="text-verdant mb-3" />
      <p className="font-mono text-2xl">{value}</p>
      <p className="text-xs uppercase tracking-widest text-ink/40 mt-1">{label}</p>
      {sub && <p className="text-xs text-ink/50 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminAnalytics() {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => api.get('/api/products/admin/all').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () => api.get('/api/orders').then((res) => res.data),
    staleTime: 2 * 60 * 1000,
  });

  const loading = productsLoading || ordersLoading;

  const revenue = useMemo(
  () =>
    orders.reduce(
      (sum, order) =>
        sum + Number(order.totalAmount || 0),
      0
    ),
  [orders]
);

  const revenueByDay = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map[day] = (map[day] || 0) + (o.totalAmount || 0);
    });
    return Object.entries(map)
      .map(([date, total]) => ({ date, total: Math.round(total) }))
      .slice(-14);
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        map[item.productName] = (map[item.productName] || 0) + item.quantity;
      });
    });
    return Object.entries(map)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [orders]);

  const categoryRevenue = useMemo(() => {
    const productMap = {};
    products.forEach((p) => { productMap[p.name] = p.category; });
    const map = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const category = productMap[item.productName] || 'Other';
        map[category] = (map[category] || 0) + item.price * item.quantity;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [orders, products]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.active && p.stock > 0 && p.stock <= 10).sort((a, b) => a.stock - b.stock).slice(0, 5),
    [products]
  );

  const avgOrderValue = orders.length ? revenue / orders.length : 0;
  const avgRating = useMemo(() => {
    const rated = products.filter((p) => p.rating > 0);
    return rated.length ? rated.reduce((s, p) => s + p.rating, 0) / rated.length : 0;
  }, [products]);

  if (loading) {
    return <p className="text-ink/40 font-mono text-sm">Loading analytics...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-4xl mb-8">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={DollarSign} label="Total revenue" value={`₹${revenue.toFixed(0)}`} delay={0} />
        <StatCard icon={Package} label="Total orders" value={orders.length} delay={0.05} />
        <StatCard icon={TrendingUp} label="Avg. order value" value={`₹${avgOrderValue.toFixed(0)}`} delay={0.1} />
        <StatCard icon={Star} label="Avg. product rating" value={avgRating > 0 ? avgRating.toFixed(1) : '—'} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/60 border border-stone rounded-md p-6"
        >
          <h2 className="font-display text-lg mb-4">Revenue over time</h2>
          {revenueByDay.length === 0 ? (
            <p className="text-ink/40 font-mono text-sm">Not enough order data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5dcc5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#1c1a1799' }} />
                <YAxis tick={{ fontSize: 11, fill: '#1c1a1799' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5dcc5', fontSize: 12 }} />
                <Line type="monotone" dataKey="total" stroke="#4338ca" strokeWidth={2} dot={{ fill: '#4338ca', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white/60 border border-stone rounded-md p-6"
        >
          <h2 className="font-display text-lg mb-4">Orders by status</h2>
          {ordersByStatus.length === 0 ? (
            <p className="text-ink/40 font-mono text-sm">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5dcc5" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#1c1a1799' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#1c1a1799' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5dcc5', fontSize: 12 }} />
                <Bar dataKey="count" fill="#4338ca" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/60 border border-stone rounded-md p-6"
        >
          <h2 className="font-display text-lg mb-4">Top-selling products</h2>
          {topProducts.length === 0 ? (
            <p className="text-ink/40 font-mono text-sm">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5dcc5" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#1c1a1799' }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#1c1a1799' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5dcc5', fontSize: 12 }} />
                <Bar dataKey="qty" fill="#e11d48" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white/60 border border-stone rounded-md p-6"
        >
          <h2 className="font-display text-lg mb-4">Revenue by category</h2>
          {categoryRevenue.length === 0 ? (
            <p className="text-ink/40 font-mono text-sm">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 11 }}>
                  {categoryRevenue.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5dcc5', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-ember/5 border border-ember/20 rounded-md p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} strokeWidth={1.75} className="text-ember" />
            <h2 className="font-display text-lg">Low stock alert</h2>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-ink/70">{p.name}</span>
                <span className="font-mono text-ember">{p.stock} left</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}