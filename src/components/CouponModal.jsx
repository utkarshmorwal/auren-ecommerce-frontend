import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import api from '../services/api';

function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong.';
  if (typeof data.message === 'string') return data.message;
  if (typeof data.message === 'object') return Object.values(data.message).join(' ');
  return 'Something went wrong.';
}

export default function CouponModal({ open, onClose, subtotal, appliedCode, onApply }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState('');
  const [manualChecking, setManualChecking] = useState(false);
  const [selected, setSelected] = useState(appliedCode || null);

  useEffect(() => {
    if (!open) return;
    setSelected(appliedCode || null);
    setManualCode('');
    setManualError('');
    setLoading(true);
    api.get('/api/promo/list')
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, [open, appliedCode]);

  if (!open) return null;

  const selectedCoupon = coupons.find((c) => c.code === selected);
  const maxSavings = selectedCoupon ? subtotal * selectedCoupon.discountPercent : 0;

  const handleSelect = (coupon) => {
    if (subtotal < coupon.minPurchaseAmount) return;
    setSelected((prev) => (prev === coupon.code ? null : coupon.code));
  };

  const handleCheckManual = async () => {
    if (!manualCode.trim()) return;
    setManualChecking(true);
    setManualError('');
    try {
      const res = await api.post('/api/promo/validate', { code: manualCode.trim(), subtotal });
      const code = manualCode.trim().toUpperCase();
      setCoupons((prev) =>
        prev.some((c) => c.code === code)
          ? prev
          : [{ code, discountPercent: res.data.discountPercent, minPurchaseAmount: 0, description: 'Applied manually', expiresAt: null }, ...prev]
      );
      setSelected(code);
    } catch (err) {
      setManualError(extractErrorMessage(err));
    } finally {
      setManualChecking(false);
    }
  };

  const handleApply = () => {
    if (!selectedCoupon) return;
    onApply(selectedCoupon.code, selectedCoupon.discountPercent);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 z-[80] flex items-center justify-center px-4 sm:px-6 py-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-paper rounded-md w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone flex-shrink-0">
            <h2 className="font-display text-xl">Apply coupon</h2>
            <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors" aria-label="Close">
              <X size={20} strokeWidth={1.75} />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-stone flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-lg border border-stone bg-white text-sm focus:outline-none focus:ring-2 focus:ring-verdant/40 focus:border-verdant transition-all"
              />
              <button
                onClick={handleCheckManual}
                disabled={manualChecking}
                className="px-4 py-2.5 rounded-lg bg-ink hover:bg-ink-light disabled:opacity-60 transition-colors text-paper text-xs uppercase tracking-widest flex-shrink-0"
              >
                {manualChecking ? '...' : 'Check'}
              </button>
            </div>
            {manualError && <p className="text-xs text-ember mt-2">{manualError}</p>}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {loading ? (
              <p className="text-ink/40 font-mono text-sm">Loading coupons...</p>
            ) : coupons.length === 0 ? (
              <p className="text-ink/40 font-mono text-sm">No coupons available right now.</p>
            ) : (
              coupons.map((coupon) => {
                const eligible = subtotal >= coupon.minPurchaseAmount;
                const isSelected = selected === coupon.code;
                const savings = subtotal * coupon.discountPercent;
                const shortfall = coupon.minPurchaseAmount - subtotal;

                return (
                  <button
                    key={coupon.code}
                    type="button"
                    onClick={() => handleSelect(coupon)}
                    disabled={!eligible}
                    className={`w-full text-left rounded-xl border p-4 transition-colors ${
                      isSelected ? 'border-verdant bg-verdant/5' : eligible ? 'border-stone hover:border-ink/30' : 'border-stone/60 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border ${isSelected ? 'bg-verdant border-verdant' : 'border-stone'}`}>
                        {isSelected && <Check size={13} strokeWidth={2.5} className="text-paper" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-sm font-semibold border border-dashed border-ink/30 rounded px-2 py-0.5">
                          {coupon.code}
                        </span>
                        {eligible && <p className="text-sm text-verdant font-medium mt-2">Save ₹{savings.toFixed(2)}</p>}
                        <p className="text-xs text-ink/50 mt-1">{coupon.description}</p>
                        {coupon.expiresAt && <p className="text-[11px] text-ink/30 font-mono mt-1">Expires {coupon.expiresAt}</p>}
                        {!eligible && shortfall > 0 && (
                          <p className="text-xs text-ember mt-2">Add ₹{shortfall.toFixed(2)} more to unlock this coupon</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t border-stone flex items-center justify-between gap-4 flex-shrink-0">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/40">Maximum savings</p>
              <p className="font-mono text-lg">₹{maxSavings.toFixed(2)}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              disabled={!selectedCoupon}
              className="px-6 py-3 bg-verdant hover:bg-verdant-light disabled:opacity-40 transition-colors rounded-full text-sm font-sans uppercase tracking-widest text-paper flex-shrink-0"
            >
              Apply
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}