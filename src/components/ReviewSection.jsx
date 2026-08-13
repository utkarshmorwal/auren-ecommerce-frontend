import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong.';
  if (typeof data.message === 'string') return data.message;
  if (typeof data.message === 'object') return Object.values(data.message).join(' ');
  return 'Something went wrong.';
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function ReviewSection({ productId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = () => {
    setLoading(true);
    api.get(`/api/reviews/product/${productId}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
    setShowForm(false);
    setRating(0);
    setComment('');
    setError('');
    setSubmitted(false);
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/api/reviews/product/${productId}`, { rating, comment });
      setSubmitted(true);
      setShowForm(false);
      setRating(0);
      setComment('');
      loadReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-16 sm:mt-20 max-w-3xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl">Customer reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 bg-verdant text-paper text-xs font-mono px-2 py-1 rounded">
                {avgRating.toFixed(1)} <Star size={11} fill="currentColor" strokeWidth={0} />
              </span>
              <span className="text-xs text-ink/50 font-mono">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {user && !showForm && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink hover:bg-ink-light transition-colors text-paper text-xs uppercase tracking-widest"
          >
            <MessageSquare size={14} strokeWidth={1.75} />
            Write a review
          </motion.button>
        )}
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-verdant bg-verdant/10 border border-verdant/20 rounded-lg px-4 py-3 mb-6"
        >
          Thanks — your review has been posted.
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white/60 border border-stone rounded-md p-6">
              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-3">Your rating</label>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={26}
                      strokeWidth={1.5}
                      className={(hoverRating || rating) >= n ? 'fill-verdant text-verdant' : 'fill-transparent text-ink/30'}
                    />
                  </button>
                ))}
              </div>

              <label className="block text-xs uppercase tracking-widest text-ink/50 mb-2">Your review (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="What did you like or dislike?"
                className="w-full px-4 py-2.5 rounded-lg border border-stone bg-white text-sm focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all resize-none"
              />

              {error && <p className="text-xs text-ember mt-2">{error}</p>}

              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-verdant hover:bg-verdant-light disabled:opacity-60 transition-colors text-paper text-xs uppercase tracking-widest"
                >
                  {submitting ? 'Posting...' : 'Post review'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-full border border-stone text-ink/60 text-xs uppercase tracking-widest hover:border-ink/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="text-ink/40 font-mono text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-ink/40 font-mono text-sm">No reviews yet — be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="border-b border-stone/60 pb-5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={13} strokeWidth={0} className={s < review.rating ? 'fill-verdant text-verdant' : 'fill-stone text-stone'} />
                  ))}
                </div>
                <span className="font-display text-sm">{review.userName}</span>
                <span className="text-xs text-ink/30 font-mono ml-auto">{timeAgo(review.createdAt)}</span>
              </div>
              {review.comment && <p className="text-sm text-ink/70 mt-2 leading-relaxed">{review.comment}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}