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
    <div className="min-h-[calc(100vh-5rem)] bg-[#07090d] text-white flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20 relative overflow-hidden">

      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >

        {/* Header */}
        <div className="mb-7 sm:mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <LogIn
                size={19}
                strokeWidth={1.8}
                className="text-cyan-300"
              />
            </div>

            <span className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-medium">
              Account access
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome back.
          </h1>

          <p className="mt-2 text-sm text-white/45">
            Sign in to continue shopping with Auren.
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.045] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,.35)]"
        >

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
              className="text-sm text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-400/20 rounded-2xl px-4 py-3 mb-5"
            >
              {error}
            </motion.div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2.5">
              Email address
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition-all"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2.5">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 transition-all rounded-2xl text-sm font-semibold uppercase tracking-[0.12em] text-[#061018] shadow-[0_8px_30px_rgba(34,211,238,.15)]"
          >
            <LogIn size={16} strokeWidth={2} />
            {loading ? 'Signing in...' : 'Sign in'}
          </motion.button>

          {/* Bottom divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/25">
              Auren
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-xs text-white/35">
            Secure account access
          </p>
        </form>

        {/* Register */}
        <div className="text-center mt-6">
          <span className="text-sm text-white/40">
            New to Auren?{' '}
          </span>

          <Link
            to="/register"
            className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors font-medium"
          >
            Create an account
          </Link>
        </div>

      </motion.div>
    </div>
  );
}