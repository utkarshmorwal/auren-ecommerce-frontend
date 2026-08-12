import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ChevronLeft, BarChart3, Users } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (to, end) => (end ? location.pathname === to : location.pathname.startsWith(to));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
     <div className="flex items-center justify-between mb-4 md:mb-6">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-ink/40 hover:text-ink transition-colors">
          <ChevronLeft size={14} strokeWidth={2} /> Back to store
        </Link>
        <NotificationBell />
      </div>

      <div className="flex md:hidden gap-2 overflow-x-auto pb-4 -mx-4 px-4 mb-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
              isActive(to, end) ? 'bg-ink text-paper' : 'bg-white/60 border border-stone text-ink/60'
            }`}
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden md:block space-y-1">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-3">Admin panel</p>
          {links.map(({ to, label, icon: Icon, end }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(to, end) ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-stone'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}