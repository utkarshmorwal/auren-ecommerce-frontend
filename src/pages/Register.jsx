import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data.message === 'string') return data.message;
  if (typeof data.message === 'object') return Object.values(data.message).join(' ');
  return 'Something went wrong. Please try again.';
}

export default function Register() {
  const { register, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendOtp(form.email);
      setStep(2);
      setCooldown(30);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    try {
      await sendOtp(form.email);
      setCooldown(30);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      await register(form.name, form.email, form.password);
      navigate('/catalog');
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
          <span className="font-mono text-xs uppercase tracking-widest text-ember">
            {step === 1 ? 'Get started' : 'Almost there'}
          </span>
          <h1 className="font-display text-4xl mt-2">
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </h1>
          {step === 2 && (
            <p className="text-sm text-ink/50 mt-2">
              We sent a 6-digit code to <span className="text-ink">{form.email}</span>
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSendOtp}
              className="bg-white/60 border border-stone rounded-2xl p-8 space-y-5"
            >
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
                <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder="Utkarsh"
                />
              </div>

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
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder="At least 6 characters"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-verdant hover:bg-verdant-light disabled:opacity-60 transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
              >
                <Mail size={16} strokeWidth={1.75} />
                {loading ? 'Sending code...' : 'Send verification code'}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifyAndRegister}
              className="bg-white/60 border border-stone rounded-2xl p-8 space-y-5"
            >
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
                <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-stone bg-paper text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
                  placeholder="000000"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 bg-verdant hover:bg-verdant-light disabled:opacity-60 transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
              >
                <ShieldCheck size={16} strokeWidth={1.75} />
                {loading ? 'Verifying...' : 'Verify & create account'}
              </motion.button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-ink/50 hover:text-ink transition-colors"
                >
                  ← Edit details
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="flex items-center gap-1.5 text-verdant hover:text-verdant-light disabled:text-ink/30 transition-colors"
                >
                  <RotateCcw size={13} strokeWidth={1.75} />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-ink/50 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-verdant hover:text-verdant-light transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
