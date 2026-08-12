import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-12 sm:mt-16">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">

            <Link
              to="/"
              className="inline-block font-display italic text-2xl sm:text-3xl text-paper hover:text-verdant-light transition-colors"
            >
              Auren
            </Link>

            <p className="mt-3 text-xs sm:text-sm leading-5 text-paper/45 max-w-xs">
              Live inventory, honest prices.
              Quality products with a simple and reliable shopping experience.
            </p>

          </div>


          {/* Shop */}
          <div>

            <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-paper/35 mb-4">
              Shop
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm text-paper/60">

              <li>
                <Link
                  to="/"
                  className="hover:text-verdant-light transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/catalog"
                  className="hover:text-verdant-light transition-colors"
                >
                  Catalog
                </Link>
              </li>

              <li>
                <Link
                  to="/cart"
                  className="hover:text-verdant-light transition-colors"
                >
                  Cart
                </Link>
              </li>

              <li>
                <Link
                  to="/wishlist"
                  className="hover:text-verdant-light transition-colors"
                >
                  Wishlist
                </Link>
              </li>

            </ul>

          </div>


          {/* Account */}
          <div>

            <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-paper/35 mb-4">
              Account
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm text-paper/60">

              <li>
                <Link
                  to="/login"
                  className="hover:text-verdant-light transition-colors"
                >
                  Sign in
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="hover:text-verdant-light transition-colors"
                >
                  Register
                </Link>
              </li>

              <li>
                <Link
                  to="/orders"
                  className="hover:text-verdant-light transition-colors"
                >
                  My Orders
                </Link>
              </li>

            </ul>

          </div>


          {/* Support */}
          <div className="col-span-2 md:col-span-1">

            <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-paper/35 mb-4">
              Support
            </h3>

            <p className="text-xs sm:text-sm leading-5 text-paper/45 max-w-xs">
              Need help with your order or account?
              We're here to help.
            </p>

            <p className="mt-3 text-xs sm:text-sm text-paper/60">
              Fast & reliable support
            </p>

          </div>

        </div>

      </div>


      {/* Bottom Bar */}
      <div className="border-t border-paper/10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">

            <p className="text-[10px] sm:text-xs text-paper/35 text-center">
              © {new Date().getFullYear()} Auren. All rights reserved.
            </p>

            <div className="flex items-center gap-4 sm:gap-5 text-[10px] sm:text-xs text-paper/35">

              <a
                href="#"
                className="hover:text-paper/70 transition-colors"
              >
                Privacy
              </a>

              <a
                href="#"
                className="hover:text-paper/70 transition-colors"
              >
                Terms
              </a>

              <span className="hidden sm:inline text-paper/15">
                |
              </span>

              <span className="hidden sm:inline">
                React • Spring Boot • MySQL
              </span>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}