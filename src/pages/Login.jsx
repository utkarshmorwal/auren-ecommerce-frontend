import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data.message === 'string') return data.message;
  if (typeof data.message === 'object') return Object.values(data.message).join(' ');
  return 'Something went wrong. Please try again.';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-verdant">Welcome back</span>
          <h1 className="font-display text-4xl mt-2">Sign in to Auren</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/60 border border-stone rounded-2xl p-8 space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
              className="text-sm text-ember bg-ember/10 border border-ember/20 rounded-lg px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-verdant hover:bg-verdant-light disabled:opacity-60 transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
          >
            <LogIn size={16} strokeWidth={1.75} />
            {loading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-ink/50 mt-6">
          New to Auren?{' '}
          <Link to="/register" className="text-verdant hover:text-verdant-light transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}