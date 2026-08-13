import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Truck, RotateCcw, PackageCheck, Copy, Check, Star,
  ChevronLeft, ChevronRight, Clock, ShoppingBag, Percent, Gem, Gift,
  Sparkles, TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import ScrollReveal from '../components/ScrollReveal';
import ProductCard from '../components/ProductCard';
import { useQuery } from '@tanstack/react-query';

const MotionLink = motion(Link);

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Verified buyer', quote: 'The stock counter actually matches what shows up — no more ordering something that turns out to be sold out.', rating: 5 },
  { name: 'Rohit M.', role: 'Verified buyer', quote: 'Checkout took less than a minute. Delivery estimate was spot on too.', rating: 5 },
  { name: 'Ananya K.', role: 'Verified buyer', quote: 'Clean site, easy returns, and support actually responded fast when I had a question.', rating: 4 },
];

const HERO_SLIDES = [
  {
    id: 'new-arrivals',
    eyebrow: 'New arrivals, restocked weekly',
    title: 'Everything in stock, nothing overpriced.',
    subtitle: "Auren tracks live inventory on every product, so what you see is what's actually on the shelf.",
    cta: 'Shop the catalog',
    to: '/catalog',
    theme: 'from-[#05070b] via-[#101827] to-[#172033]',
    icon: ShoppingBag,
  },
  {
    id: 'sale',
    eyebrow: 'Limited-time offers',
    title: 'Deep discounts, while stock lasts.',
    subtitle: 'Our biggest markdowns of the month, across every category.',
    cta: 'Shop the sale',
    to: '/catalog',
    theme: 'from-fuchsia-700 via-purple-700 to-indigo-700',
    icon: Percent,
  },
  {
    id: 'premium',
    eyebrow: 'Handpicked',
    title: 'Premium picks, curated weekly.',
    subtitle: "The pieces our team can't stop recommending.",
    cta: 'Explore picks',
    to: '/catalog',
    theme: 'from-cyan-700 via-blue-700 to-indigo-700',
    icon: Gem,
  },
  {
    id: 'welcome',
    eyebrow: 'First order?',
    title: 'Get 10% off with code WELCOME10.',
    subtitle: 'Applied instantly at checkout — no minimum order.',
    cta: 'Start shopping',
    to: '/catalog',
    theme: 'from-[#071018] via-[#12304a] to-cyan-700',
    icon: Gift,
  },
  {
    id: 'delivery',
    eyebrow: 'Pan-India delivery',
    title: 'From cart to doorstep, fast.',
    subtitle: 'Real-time stock tracking and quick dispatch on every order.',
    cta: "See what's new",
    to: '/catalog',
    theme: 'from-[#172033] to-[#05070b]',
    icon: Truck,
  },
];

const PRICE_BUCKETS = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: Infinity },
];

const CURATED_QUICK_LINKS = [
  { id: 'new', label: 'New', to: '/catalog', icon: Sparkles, tone: 'bg-[#0b1018]' },
  { id: 'bestsellers', label: 'Bestsellers', to: '/catalog', icon: Star, tone: 'bg-cyan-500' },
  { id: 'offers', label: 'Offers', to: '/catalog', icon: Percent, tone: 'bg-fuchsia-500' },
  { id: 'trending', label: 'Trending', to: '/catalog', icon: TrendingUp, tone: 'bg-[#0b1018]-light' },
];

const RECENTLY_VIEWED_KEY = 'auren_recently_viewed';

function getRecentlyViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
  } catch {
    return [];
  }
}

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, targetMs - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    hours: String(Math.floor(totalSeconds / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
  };
}

const HERO_AUTOPLAY_MS = 5000;

const headlineContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
};
const headlineWordVariants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = HERO_SLIDES[index];
  const Icon = slide.icon;

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 70]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  const prev = () => setIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => setIndex((i) => (i + 1) % HERO_SLIDES.length);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative min-h-[560px] sm:min-h-[700px] overflow-hidden border-b border-white/10"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          exit={{ clipPath: 'inset(0 0 0 100%)' }}
          transition={{ duration: 0.85, ease: [0.83, 0, 0.17, 1] }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.theme}`}
        >
          <motion.div
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: HERO_AUTOPLAY_MS / 1000 + 0.5, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            />
            <motion.div
              aria-hidden="true"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-paper/5 blur-3xl"
            />
            <motion.div
              aria-hidden="true"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -left-32 top-1/3 w-72 h-72 rounded-full bg-paper/5 blur-3xl"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute top-5 right-5 sm:top-8 sm:right-8 z-10 font-mono text-[10px] sm:text-xs text-white/50 tracking-widest"
          >
            {String(index + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
          </motion.div>

          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 h-full relative">
            <motion.div style={{ y: parallaxY }} className="grid md:grid-cols-[1.15fr_.85fr] gap-10 lg:gap-16 items-center min-h-[560px] sm:min-h-[700px]">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 mb-3 sm:mb-5"
                >
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: 32 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-px bg-paper/50"
                  />
                  <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/70">{slide.eyebrow}</p>
                </motion.div>

                <motion.h1
                  variants={headlineContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="font-sans font-black text-4xl sm:text-6xl lg:text-7xl leading-[.98] max-w-3xl text-white tracking-[-0.04em]"
                >
                  {slide.title.split(' ').map((word, wi) => (
                    <span key={wi} className="inline-block overflow-hidden pb-1 mr-[0.28em] align-top">
                      <motion.span variants={headlineWordVariants} className="inline-block">
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3 sm:mt-6 text-sm sm:text-lg text-white/70 max-w-[85%] sm:max-w-md"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MotionLink
                    to={slide.to}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative inline-block mt-5 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-paper text-white rounded-full text-xs sm:text-sm font-sans uppercase tracking-widest w-fit overflow-hidden"
                  >
                    <span className="relative z-10">{slide.cta}</span>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
                  </MotionLink>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
                  className="hidden sm:flex flex-wrap items-center gap-2 mt-8"
                >
                  <motion.span
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    className="text-[11px] font-mono text-white/60 bg-white/[0.07] px-3 py-1.5 rounded-full"
                  >
                    ★ 4.8 rated
                  </motion.span>
                  <motion.span
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    className="text-[11px] font-mono text-white/60 bg-white/[0.07] px-3 py-1.5 rounded-full"
                  >
                    Free shipping ₹999+
                  </motion.span>
                </motion.div>
              </div>

              <div className="hidden md:flex items-center justify-center relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-72 h-72 rounded-full border border-white/10"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-56 h-56 rounded-full border border-dashed border-white/10"
                />
                <motion.div
                  initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-40 h-40 rounded-full bg-white/[0.07] backdrop-blur-sm flex items-center justify-center relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute inset-0 rounded-full bg-white/[0.07]"
                  />
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10"
                  >
                    <Icon size={56} strokeWidth={1} className="text-white/90" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows hidden on mobile — they overlapped the subtitle text on narrow screens. The progress dots below already let users jump between slides. */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-sm items-center justify-center text-white transition-colors"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-sm items-center justify-center text-white transition-colors"
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>

      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 w-full max-w-md px-6">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="relative h-1 flex-1 rounded-full bg-white/[0.14] overflow-hidden"
          >
            {i < index && <div className="absolute inset-0 bg-paper/80" />}
            {i === index && !paused && (
              <motion.div
                key={`${s.id}-fill`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: HERO_AUTOPLAY_MS / 1000, ease: 'linear' }}
                className="absolute inset-y-0 left-0 bg-paper"
              />
            )}
            {i === index && paused && <div className="absolute inset-0 bg-paper" />}
          </button>
        ))}
      </div>
    </section>
  );
}

function SkeletonRow({ count = 4 }) {
  return (
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-44 sm:w-56 flex-shrink-0 animate-pulse">
          <div className="aspect-square rounded-2xl bg-[#151a24]" />
          <div className="mt-4 h-3.5 rounded-full bg-[#151a24] w-4/5" />
          <div className="mt-2.5 h-3.5 rounded-full bg-[#151a24] w-2/5" />
        </div>
      ))}
    </div>
  );
}

function SkeletonTiles({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-2xl bg-[#151a24] animate-pulse" />
      ))}
    </div>
  );
}

function SkeletonCircles({ count = 6 }) {
  return (
    <div className="flex gap-6 sm:gap-8 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2.5 flex-shrink-0 animate-pulse">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#151a24]" />
          <div className="h-3 w-12 bg-[#151a24] rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SectionSkeleton({ tiles = false, count = 4 }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-20">
      <div className="h-7 w-48 bg-[#151a24] rounded-full animate-pulse mb-8" />
      {tiles ? <SkeletonTiles count={count} /> : <SkeletonRow count={count} />}
    </section>
  );
}

function CircularQuickLinks({ categories }) {
  if (categories.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-14">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex-shrink-0"
            >
              <Link to={`/catalog?category=${encodeURIComponent(cat.name)}`} className="group flex flex-col items-center gap-2.5 w-20 sm:w-24">
                <motion.div
                  whileHover={{ scale: 1.08, y: -3 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-cyan-400 shadow-[0_8px_30px_rgba(0,0,0,.18)] group-hover:shadow-[0_18px_55px_rgba(0,0,0,.35)] transition-all duration-300 bg-[#151a24]"
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-sans italic text-white/30">{cat.name.charAt(0)}</div>
                  )}
                </motion.div>
                <span className="text-xs text-white/70 group-hover:text-cyan-400 transition-colors text-center truncate w-full">{cat.name}</span>
              </Link>
            </motion.div>
          ))}

          {CURATED_QUICK_LINKS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.35, delay: (categories.length + i) * 0.04 }}
                className="flex-shrink-0"
              >
                <Link to={c.to} className="group flex flex-col items-center gap-2.5 w-20 sm:w-24">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -3 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,0,0,.18)] group-hover:shadow-[0_18px_55px_rgba(0,0,0,.35)] transition-shadow duration-300 ${c.tone}`}
                  >
                    <Icon size={26} strokeWidth={1.5} />
                  </motion.div>
                  <span className="text-xs text-white/70 group-hover:text-cyan-400 transition-colors text-center truncate w-full">{c.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}

function CountUp({ target, suffix = '', duration = 1.4 }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return (
    <motion.span onViewportEnter={() => setStarted(true)} viewport={{ once: true, amount: 0.6 }}>
      {value.toLocaleString()}
      {suffix}
    </motion.span>
  );
}

function StatsStrip({ stats }) {
  return (
    <ScrollReveal>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8 text-center">
          <div>
            <p className="font-sans text-2xl sm:text-4xl text-cyan-400"><CountUp target={stats.products} suffix="+" /></p>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mt-1.5 sm:mt-2">Products in stock</p>
          </div>
          <div>
            <p className="font-sans text-2xl sm:text-4xl text-cyan-400"><CountUp target={stats.categories} /></p>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mt-1.5 sm:mt-2">Categories</p>
          </div>
          <div>
            <p className="font-sans text-2xl sm:text-4xl text-cyan-400"><CountUp target={stats.brands} /></p>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mt-1.5 sm:mt-2">Brands</p>
          </div>
          <div>
            <p className="font-sans text-2xl sm:text-4xl text-cyan-400">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}★</p>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mt-1.5 sm:mt-2">Avg. rating</p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

function ProductRow({ title, subtitle, products, viewAllTo = '/catalog', rightSlot }) {
  if (products.length === 0) return null;
  return (
    <ScrollReveal>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-20">
        <div className="flex items-end justify-between mb-5 sm:mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="font-sans text-xl sm:text-3xl">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-white/50 mt-1 sm:mt-1.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {rightSlot}
            <Link to={viewAllTo} className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400 hover:text-cyan-400-light transition-colors whitespace-nowrap">
              View all
            </Link>
          </div>
        </div>
        <div className="flex gap-5 sm:gap-7 overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="w-48 sm:w-64 flex-shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

function BrandMarquee({ brands }) {
  if (brands.length < 3) return null;
  const loop = [...brands, ...brands];

  return (
    <div className="overflow-hidden">
      <style>{`
        @keyframes auren-brand-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .auren-brand-track {
          animation: auren-brand-marquee 30s linear infinite;
        }
        .auren-brand-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex gap-4 w-max auren-brand-track">
        {loop.map((brand, i) => (
          <Link
            key={`${brand}-${i}`}
            to={`/catalog?brand=${encodeURIComponent(brand)}`}
            className="group flex flex-col items-center justify-center gap-2 sm:gap-3 w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-2xl border border-white/10 bg-white/[0.035] hover:border-cyan-400 hover:shadow-[0_18px_55px_rgba(0,0,0,.35)] transition-all duration-300"
          >
            <span className="font-sans text-lg sm:text-2xl italic text-white/70 group-hover:text-cyan-400 transition-colors">{brand.charAt(0)}</span>
            <span className="text-[10px] sm:text-xs text-white/60 group-hover:text-white transition-colors text-center px-2 truncate w-full">{brand}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <ScrollReveal>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-4">
        <div className="rounded-3xl bg-gradient-to-br from-ink to-ink-light text-white overflow-hidden relative">
          <motion.div
            aria-hidden="true"
            className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative p-8 sm:p-16 text-center max-w-2xl mx-auto">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400-light">Stay in the loop</span>
            <h2 className="font-sans text-2xl sm:text-4xl mt-2 sm:mt-3">Get first access to new drops.</h2>
            <p className="text-white/60 mt-2 sm:mt-3 text-xs sm:text-sm">Restocks, price drops, and offers — straight to your inbox, no spam.</p>
            <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full sm:w-72 px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.07] border border-white/15 placeholder:text-white/40 text-white text-sm focus:outline-none focus:border-verdant-light transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-7 py-2.5 sm:py-3 bg-cyan-500 hover:bg-cyan-500-light transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-white whitespace-nowrap w-full sm:w-auto"
              >
                {submitted ? 'Subscribed ✓' : 'Subscribe'}
              </motion.button>
            </form>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

export default function Home() {
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
  const [copied, setCopied] = useState(false);

  const offerEndsAt = useMemo(() => {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }, []);
  const countdown = useCountdown(offerEndsAt);

  const categories = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (!map[p.category]) map[p.category] = { name: p.category, image: p.imageUrl, count: 0 };
      map[p.category].count += 1;
    });
    return Object.values(map).slice(0, 8);
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => { if (p.brand && p.brand.trim()) set.add(p.brand); });
    return Array.from(set).slice(0, 10);
  }, [products]);

  const priceBuckets = useMemo(() => {
    return PRICE_BUCKETS.map((b) => {
      const matching = products.filter((p) => p.price >= b.min && p.price < b.max);
      const withImage = matching.find((p) => p.imageUrl);
      return {
        ...b,
        count: matching.length,
        image: withImage ? withImage.imageUrl : null,
      };
    }).filter((b) => b.count > 0);
  }, [products]);

  const newArrivals = useMemo(() => [...products].sort((a, b) => b.id - a.id).slice(0, 8), [products]);

  const bestSellers = useMemo(() => {
    const flagged = products.filter((p) => p.bestSeller);
    if (flagged.length >= 4) return flagged.slice(0, 8);
    return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  }, [products]);

  const trendingProducts = useMemo(
    () => [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 8),
    [products]
  );

  const limitedOffers = useMemo(() => {
    const discountOf = (p) => (p.originalPrice && p.originalPrice > p.price ? (p.originalPrice - p.price) / p.originalPrice : 0);
    return [...products].filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a)).slice(0, 8);
  }, [products]);

  const recentlyViewed = useMemo(() => {
    const ids = getRecentlyViewedIds();
    return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 8);
  }, [products]);

  const collections = useMemo(() => {
    const list = [];
    if (bestSellers.length > 0) list.push({ id: 'staff-picks', title: 'Staff picks', subtitle: 'The pieces our team keeps recommending', products: bestSellers.slice(0, 4) });
    if (newArrivals.length > 0) list.push({ id: 'just-in', title: 'Just in', subtitle: 'Fresh additions to the catalog', products: newArrivals.slice(0, 4) });
    if (limitedOffers.length > 0) list.push({ id: 'value-picks', title: 'Best value', subtitle: 'Our biggest discounts right now', products: limitedOffers.slice(0, 4) });
    return list;
  }, [bestSellers, newArrivals, limitedOffers]);

  const stats = useMemo(() => {
    const uniqueCategories = new Set(products.map((p) => p.category)).size;
    const uniqueBrands = new Set(products.filter((p) => p.brand).map((p) => p.brand)).size;
    const rated = products.filter((p) => p.rating > 0);
    const avgRating = rated.length ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length : 0;
    return {
      products: products.length,
      categories: uniqueCategories,
      brands: uniqueBrands,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }, [products]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME10').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="bg-[#07090d] text-white relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30"
        style={{backgroundImage:'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize:'48px 48px'}} />
      <HeroCarousel />

      {loading ? (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-14">
          <SkeletonCircles />
        </section>
      ) : (
        <CircularQuickLinks categories={categories} />
      )}

      {!loading && <StatsStrip stats={stats} />}

      {loading ? (
        <SectionSkeleton tiles count={4} />
      ) : categories.length > 0 && (
        <ScrollReveal>
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-16 relative">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="font-sans text-xl sm:text-3xl">Shop by category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link to={`/catalog?category=${encodeURIComponent(cat.name)}`} className="group block">
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="aspect-[1/1.08] rounded-3xl bg-[#151a24] overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,.18)] group-hover:shadow-[0_18px_55px_rgba(0,0,0,.35)] transition-shadow duration-300"
                    >
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 font-sans italic">
                          {cat.name}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
                        <p className="font-sans text-white text-sm sm:text-lg leading-tight">{cat.name}</p>
                        <p className="text-white/60 text-[10px] sm:text-xs font-mono mt-0.5">{cat.count} item{cat.count !== 1 ? 's' : ''}</p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {!loading && priceBuckets.length > 0 && (
        <ScrollReveal>
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-20">
            <h2 className="font-sans text-xl sm:text-3xl mb-5 sm:mb-8">Shop by price</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
              {priceBuckets.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    to={`/catalog?minPrice=${b.min}${b.max === Infinity ? '' : `&maxPrice=${b.max}`}`}
                    className="group block"
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="aspect-[1/1.08] rounded-3xl overflow-hidden relative bg-[#151a24] shadow-[0_8px_30px_rgba(0,0,0,.18)] group-hover:shadow-[0_18px_55px_rgba(0,0,0,.35)] transition-all duration-300"
                    >
                      {b.image ? (
                        <img
                          src={b.image}
                          alt={b.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone to-white/40" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1.5 p-2">
                        <span className="font-sans text-sm sm:text-xl text-white px-2">{b.label}</span>
                        <span className="text-[10px] sm:text-xs font-mono text-white/70">{b.count} item{b.count !== 1 ? 's' : ''}</span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {loading ? <SectionSkeleton /> : (
        <ProductRow title="New arrivals" subtitle="Fresh additions to the catalog" products={newArrivals} />
      )}

      {loading ? <SectionSkeleton /> : (
        <ProductRow title="Best sellers" subtitle="What everyone's adding to cart" products={bestSellers} />
      )}

      {loading ? <SectionSkeleton /> : (
        <ProductRow title="Trending products" subtitle="Most talked-about right now" products={trendingProducts} />
      )}

      {loading ? <SectionSkeleton /> : (
        <ProductRow
          title="Limited-time offers"
          subtitle="Our biggest discounts, while stock lasts"
          products={limitedOffers}
          rightSlot={
            <span className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-fuchsia-400 bg-fuchsia-500/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <Clock size={12} strokeWidth={1.75} />
              {countdown.hours}:{countdown.minutes}:{countdown.seconds}
            </span>
          }
        />
      )}

      <ScrollReveal>
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-4">
          <div className="rounded-3xl bg-[#0b1018] text-white overflow-hidden relative">
            <motion.div
              aria-hidden="true"
              className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative grid sm:grid-cols-[1fr_auto] gap-8 sm:gap-12 p-8 sm:p-14 items-center">
              <div>
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400-light">First order?</span>
                <h2 className="font-sans text-2xl sm:text-4xl mt-2">Get 10% off, on us.</h2>
                <p className="text-white/60 mt-2 sm:mt-3 text-xs sm:text-sm max-w-sm">
                  Use the code at checkout — applied instantly, no minimum order.
                </p>
                <div className="flex items-center gap-3 mt-4 sm:mt-6">
                  <div className="flex items-center gap-3 border border-white/15 rounded-full pl-4 sm:pl-5 pr-2 py-1.5 sm:py-2">
                    <span className="font-mono text-sm sm:text-lg tracking-widest">WELCOME10</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyCode}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cyan-500 hover:bg-cyan-500-light transition-colors flex items-center justify-center flex-shrink-0"
                      aria-label="Copy promo code"
                    >
                      {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={1.75} />}
                    </motion.button>
                  </div>
                </div>
              </div>
              <MotionLink
                to="/catalog"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="sm:justify-self-end inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-paper text-white rounded-full text-xs sm:text-sm font-sans uppercase tracking-widest w-fit"
              >
                Start shopping
              </MotionLink>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {!loading && collections.length > 0 && (
        <ScrollReveal>
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-20">
            <h2 className="font-sans text-xl sm:text-3xl mb-6 sm:mb-10">Featured collections</h2>
            <div className="space-y-8 sm:space-y-12">
              {collections.map((c) => (
                <div key={c.id}>
                  <div className="flex items-baseline justify-between mb-4 sm:mb-5 gap-4 flex-wrap">
                    <h3 className="font-sans text-lg sm:text-xl">{c.title}</h3>
                    <p className="text-[10px] sm:text-xs text-white/40">{c.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-10">
                    {c.products.map((product, i) => (
                      <ScrollReveal key={product.id} direction="up" delay={i * 0.05}>
                        <ProductCard product={product} />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {!loading && brands.length >= 3 && (
        <ScrollReveal>
          <section className="max-w-7xl mx-auto py-8 sm:py-16 relative">
            <h2 className="font-sans text-xl sm:text-3xl mb-5 sm:mb-8 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">Featured brands</h2>
            <BrandMarquee brands={brands} />
          </section>
        </ScrollReveal>
      )}

      {!loading && (
        <ProductRow title="Recently viewed" subtitle="Pick up where you left off" products={recentlyViewed} />
      )}

      <ScrollReveal>
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-20">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-16">
            <ScrollReveal direction="left">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-fuchsia-400">Live inventory</span>
              <h2 className="font-sans text-2xl sm:text-4xl mt-2 sm:mt-3">Stock levels, straight from the source.</h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/60">
                No more ordering something that's already sold out. Every listing reflects real, current stock.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.1}>
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400">Fast checkout</span>
              <h2 className="font-sans text-2xl sm:text-4xl mt-2 sm:mt-3">From cart to confirmed in seconds.</h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/60">
                A streamlined checkout built for speed, with real-time totals as you shop.
              </p>
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-16 relative">
          <h2 className="font-sans text-xl sm:text-3xl mb-5 sm:mb-8">What customers are saying</h2>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white/[0.045] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={13} strokeWidth={0} className={s < t.rating ? 'fill-verdant text-cyan-400' : 'fill-stone text-stone'} />
                  ))}
                </div>
                <p className="text-sm text-white/70 leading-relaxed">"{t.quote}"</p>
                <p className="font-sans text-sm mt-4">{t.name}</p>
                <p className="text-xs text-white/40 font-mono">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <ShieldCheck size={18} strokeWidth={1.5} className="text-cyan-400" />
              <span className="text-[10px] sm:text-xs text-white/60">Secured by Razorpay</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <RotateCcw size={18} strokeWidth={1.5} className="text-cyan-400" />
              <span className="text-[10px] sm:text-xs text-white/60">7-day returns</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <Truck size={18} strokeWidth={1.5} className="text-cyan-400" />
              <span className="text-[10px] sm:text-xs text-white/60">Pan-India delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <PackageCheck size={18} strokeWidth={1.5} className="text-cyan-400" />
              <span className="text-[10px] sm:text-xs text-white/60">Real-time stock</span>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <NewsletterSection />

      <ScrollReveal direction="zoom">
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-14 sm:py-24 text-center relative">
          <h2 className="font-sans text-3xl sm:text-5xl">Ready to see what's on the shelf?</h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/60">Browse the full catalog below.</p>
          <MotionLink
            to="/catalog"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block mt-7 sm:mt-9 px-8 sm:px-10 py-3.5 sm:py-4 bg-cyan-500 hover:bg-cyan-500-light transition-colors rounded-full text-xs sm:text-sm font-sans uppercase tracking-widest text-white"
          >
            Shop the catalog
          </MotionLink>
        </section>
      </ScrollReveal>
    </div>
  );
}