import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 text-center">
        <div>
          <Heart
            size={40}
            className="text-ink/20 mx-auto mb-4"
            strokeWidth={1.25}
          />

          <h1 className="font-display text-3xl">
            Your wishlist is empty
          </h1>

          <p className="text-ink/50 mt-2">
            Save items you love for later.
          </p>

          <Link
            to="/catalog"
            className="inline-block mt-6 px-6 py-2.5 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <ScrollReveal>
        <h1 className="font-display text-3xl sm:text-5xl">
          Your wishlist
        </h1>

        <p className="mt-3 text-ink/60">
          {items.length} item{items.length !== 1 ? 's' : ''} saved.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
        {items.map((product, i) => (
          <ScrollReveal
            key={product.id}
            direction="up"
            delay={(i % 3) * 0.06}
          >
            <ProductCard product={product} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}