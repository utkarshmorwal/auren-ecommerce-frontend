import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingBag } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

function timeAgo(dateString) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  const prevCount = useRef(unreadCount);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setPulse(true);

      const timer = setTimeout(
        () => setPulse(false),
        1000
      );

      return () => clearTimeout(timer);
    }

    prevCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const handleViewOrder = async (notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error(
        'Could not mark notification as read:',
        error
      );
    }

    setOpen(false);

    // Open Admin Orders and remember which order
    navigate('/admin/orders', {
      state: {
        orderId: notification.orderId,
      },
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <motion.button
        type="button"
        animate={
          pulse
            ? {
                rotate: [
                  0,
                  -12,
                  12,
                  -8,
                  8,
                  0,
                ],
              }
            : {}
        }
        transition={{ duration: 0.5 }}
        onClick={() =>
          setOpen((current) => !current)
        }
        className="relative text-ink/60 hover:text-ink transition-colors"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          strokeWidth={1.75}
        />

        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
            }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ember text-[10px] font-mono flex items-center justify-center text-paper"
          >
            {unreadCount > 9
              ? '9+'
              : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.96,
            }}
            transition={{
              duration: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-paper border border-stone rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone">
              <span className="font-display text-sm">
                Notifications
              </span>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] uppercase tracking-widest text-verdant hover:text-verdant-light transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-ink/40 font-mono text-sm py-10">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-stone/60 last:border-0 ${
                      !n.read
                        ? 'bg-verdant/5'
                        : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-verdant/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShoppingBag
                        size={15}
                        strokeWidth={1.75}
                        className="text-verdant"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        New order{' '}
                        <span className="font-mono">
                          #{n.orderId}
                        </span>
                      </p>

                      <p className="text-xs text-ink/50 mt-0.5">
                        {n.customerName} · ₹
                        {Number(
                          n.totalAmount || 0
                        ).toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-ink/30 font-mono">
                          {timeAgo(n.createdAt)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleViewOrder(n)
                          }
                          className="text-[11px] uppercase tracking-widest text-verdant hover:text-verdant-light transition-colors"
                        >
                          View order
                        </button>
                      </div>
                    </div>

                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-ember mt-2 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}