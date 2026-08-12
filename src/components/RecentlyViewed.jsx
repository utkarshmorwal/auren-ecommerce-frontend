import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import ProductCard from './ProductCard';
import ScrollReveal from './ScrollReveal';

export default function RecentlyViewed({ excludeId }) {
  const { items } = useRecentlyViewed();
  const filtered = items.filter((p) => p.id !== excludeId);

  if (filtered.length === 0) return null;

  return (
    <ScrollReveal>
      <div className="mt-16 sm:mt-20">
        <h2 className="font-display text-2xl sm:text-3xl mb-8">Recently viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.slice(0, 4).map((p, i) => (
            <ScrollReveal key={p.id} direction="up" delay={i * 0.06}>
              <ProductCard product={p} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}