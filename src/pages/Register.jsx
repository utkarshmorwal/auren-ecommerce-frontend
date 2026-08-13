import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, RotateCcw, ArrowRight, User, Lock } from 'lucide-react';
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

    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    <div className="min-h-[calc(100vh-5rem)] bg-[#f5f5f2] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full max-w-5xl"
      >

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] bg-white rounded-[28px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.08)] border border-black/5">

          {/* LEFT SIDE */}
          <div className="hidden lg:flex relative bg-[#181818] text-white p-12 flex-col justify-between overflow-hidden">

            <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full border border-white/10" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-10">
                <span className="text-black font-bold text-xl">A</span>
              </div>

              <p className="text-white/40 text-xs uppercase tracking-[0.25em] mb-4">
                Join Auren
              </p>

              <h2 className="font-display text-5xl leading-[1.05] max-w-sm">
                Your style.
                <br />
                Your collection.
                <br />
                Your account.
              </h2>

              <p className="mt-6 text-white/45 text-sm leading-relaxed max-w-sm">
                Create your account and discover products curated for
                your everyday style.
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <div className="w-8 h-px bg-white/20" />
                <span>Simple. Secure. Personal.</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-6 sm:p-10 lg:p-14">

            {/* HEADER */}
            <div className="mb-8">

              <div className="flex items-center justify-between mb-7">

                <div className="lg:hidden w-10 h-10 rounded-xl bg-[#181818] text-white flex items-center justify-center">
                  <span className="font-bold">A</span>
                </div>

                <div className="ml-auto text-xs text-black/40">
                  Step {step} of 2
                </div>

              </div>

              {/* STEP INDICATOR */}
              <div className="flex gap-2 mb-7">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    step === 1
                      ? 'w-12 bg-black'
                      : 'w-8 bg-black/15'
                  }`}
                />

                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    step === 2
                      ? 'w-12 bg-black'
                      : 'w-8 bg-black/15'
                  }`}
                />
              </div>

              <p className="text-[11px] uppercase tracking-[0.2em] text-black/35 mb-2">
                {step === 1 ? 'Get started' : 'Verification'}
              </p>

              <h1 className="font-display text-3xl sm:text-4xl text-[#171717]">
                {step === 1
                  ? 'Create your account'
                  : 'Verify your email'}
              </h1>

              {step === 2 && (
                <p className="text-sm text-black/45 mt-3 leading-relaxed">
                  We sent a 6-digit verification code to{' '}
                  <span className="text-black font-medium">
                    {form.email}
                  </span>
                </p>
              )}
            </div>

            <AnimatePresence mode="wait">

              {/* STEP 1 */}
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        x: [0, -5, 5, -3, 3, 0],
                      }}
                      transition={{ duration: 0.4 }}
                      className="rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* NAME */}
                  <div>
                    <label className="block text-xs font-medium text-black/55 mb-2">
                      Full name
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        strokeWidth={1.7}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                      />

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-black/10 bg-[#fafafa] text-sm outline-none focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 transition-all"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-xs font-medium text-black/55 mb-2">
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        strokeWidth={1.7}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                      />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-black/10 bg-[#fafafa] text-sm outline-none focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-xs font-medium text-black/55 mb-2">
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={16}
                        strokeWidth={1.7}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25"
                      />

                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-black/10 bg-[#fafafa] text-sm outline-none focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 transition-all"
                        placeholder="At least 6 characters"
                      />
                    </div>

                    <p className="text-[11px] text-black/30 mt-2">
                      Use at least 6 characters for your password.
                    </p>
                  </div>

                  {/* BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-4 bg-[#181818] hover:bg-black disabled:opacity-50 text-white rounded-2xl text-xs uppercase tracking-[0.15em] font-medium transition-all"
                  >
                    {loading ? (
                      'Sending code...'
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={16} strokeWidth={1.8} />
                      </>
                    )}
                  </motion.button>
                </motion.form>

              ) : (

                /* STEP 2 */
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleVerifyAndRegister}
                  className="space-y-5"
                >

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        x: [0, -5, 5, -3, 3, 0],
                      }}
                      transition={{ duration: 0.4 }}
                      className="rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-black/55 mb-2">
                      Verification code
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ''))
                      }
                      required
                      className="w-full px-4 py-5 rounded-2xl border border-black/10 bg-[#fafafa] text-center text-3xl tracking-[0.5em] font-mono outline-none focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 transition-all"
                      placeholder="000000"
                    />

                    <p className="text-center text-xs text-black/30 mt-3">
                      Enter the 6-digit code sent to your email.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#181818] hover:bg-black disabled:opacity-40 text-white rounded-2xl text-xs uppercase tracking-[0.15em] font-medium transition-all"
                  >
                    <ShieldCheck size={16} strokeWidth={1.8} />

                    {loading
                      ? 'Creating account...'
                      : 'Verify & create account'}
                  </motion.button>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-black/45 hover:text-black transition-colors"
                    >
                      ← Edit details
                    </button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0}
                      className="flex items-center gap-2 text-xs text-black/60 hover:text-black disabled:text-black/25 transition-colors"
                    >
                      <RotateCcw size={13} strokeWidth={1.8} />

                      {cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : 'Resend code'}
                    </button>

                  </div>
                </motion.form>
              )}

            </AnimatePresence>

            {/* LOGIN LINK */}
            <div className="mt-8 pt-6 border-t border-black/5 text-center">
              <p className="text-sm text-black/40">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-black font-medium hover:underline underline-offset-4 transition-all"
                >
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}