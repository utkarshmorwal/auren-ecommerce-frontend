import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchOverlay from './SearchOverlay';
import SearchBar from './SearchBar';
import { useNotifications } from '../context/NotificationContext';

function NavLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="relative group py-1">
      <span className="group-hover:text-verdant-light transition-colors">
        {children}
      </span>
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-verdant-light transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-ink text-paper border-b border-ink-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="font-display italic text-2xl tracking-tight inline-block"
            >
              Auren
            </motion.span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 justify-center">
            <SearchBar className="max-w-xl" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-sans text-xs uppercase tracking-widest text-paper/70 shrink-0">
            <NavLink to="/catalog">Catalog</NavLink>
            <NavLink to="/orders">Orders</NavLink>

            {/* Admin Link */}
           {/* Admin Link */}
            {user?.roles?.includes('ADMIN') && (
              <span className="relative inline-block">
                <NavLink to="/admin">Admin</NavLink>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute -top-2 -right-3 w-4 h-4 rounded-full bg-ember text-[10px] font-mono flex items-center justify-center text-paper"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </span>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="lg:hidden hover:text-verdant-light transition-colors"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.75} />
            </motion.button>
            <Link to="/wishlist" className="relative">
              <motion.span
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative hover:text-verdant-light transition-colors inline-block"
                aria-label="Wishlist"
              >
                <Heart size={19} strokeWidth={1.75} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-ember text-[10px] font-mono flex items-center justify-center text-paper">
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </span>
                )}
              </motion.span>
            </Link>
            {/* Cart */}
            <Link to="/cart" className="relative" onClick={() => setMobileOpen(false)}>
              <motion.span
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative hover:text-verdant-light transition-colors inline-block"
                aria-label="Cart"
              >
                <ShoppingBag size={19} strokeWidth={1.75} />

                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                      }}
                      className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-ember text-[10px] font-mono flex items-center justify-center text-paper"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            </Link>

            {/* User - desktop only */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-paper/60">
                  <User size={14} strokeWidth={1.75} />
                  {user.email.split('@')[0]}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="hover:text-ember-light transition-colors"
                  aria-label="Log out"
                >
                  <LogOut size={19} strokeWidth={1.75} />
                </motion.button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-4 py-1.5 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-xs font-sans uppercase tracking-widest"
                >
                  Sign in
                </motion.span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-ink-light"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">
              <NavLink to="/catalog" onClick={() => setMobileOpen(false)}>Catalog</NavLink>
              <NavLink to="/orders" onClick={() => setMobileOpen(false)}>Orders</NavLink>
             {user?.roles?.includes('ADMIN') && (
                <span className="relative inline-block">
                  <NavLink to="/admin" onClick={() => setMobileOpen(false)}>Admin</NavLink>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-4 w-4 h-4 rounded-full bg-ember text-[10px] font-mono flex items-center justify-center text-paper">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
              )}

              <div className="border-t border-ink-light pt-5">
                {user ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-mono text-paper/60">
                      <User size={14} strokeWidth={1.75} />
                      {user.email.split('@')[0]}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-ember-light hover:text-ember transition-colors"
                    >
                      <LogOut size={15} strokeWidth={1.75} />
                      Log out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-block px-5 py-2 bg-verdant hover:bg-verdant-light transition-colors rounded-full text-xs font-sans uppercase tracking-widest"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  );
}