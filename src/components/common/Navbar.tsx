'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Store,
  ChevronDown,
  LayoutDashboard,
  Clock,
  LogOut,
  Menu as MenuIcon,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useRouter } from 'next/navigation';

export const Navbar: React.FC = () => {
  const { currentUser, currentRestaurant, logout } = useAuth();
  const { cartCount } = useCart();
  const { currentView } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    // keep fallback behavior when JS-driven navigation is desired
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/restaurants');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fbf9f5]/90 backdrop-blur-xl border-b border-stone-200/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand Logo with animated emblem */}
          <Link href="/" className="group flex items-center gap-2 cursor-pointer select-none shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 cursor-pointer select-none shrink-0 group focus:outline-hidden"
            >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-amber-600 via-amber-500 to-orange-400 text-stone-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/35 transition-all">
              Q
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-950 leading-none">
                Q<span className="text-amber-600">Resto</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700/80">
                Africa · Digital
              </span>
            </div>
            </motion.div>
          </Link>

          {/* Central Search Bar with micro-interaction */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form action="/restaurants" method="get" className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-600 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un plat (Amiwo, Poulet...), un restaurant..."
                className="w-full pl-10 pr-4 py-2 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-xs sm:text-sm text-stone-900 rounded-full border border-stone-200/60 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-hidden placeholder:text-stone-400 font-medium"
              />
            </form>
          </div>

          {/* Right Navigation Links & Action Button */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/restaurants"
              className={`hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all px-3 py-1.5 rounded-full ${
                currentView === 'restaurants'
                  ? 'bg-amber-100/70 text-amber-800'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Restaurants</span>
            </Link>

            <Link
              href="/order-tracking"
              className={`hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all px-3 py-1.5 rounded-full ${
                currentView === 'order-tracking'
                  ? 'bg-amber-100/70 text-amber-800'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Suivre commande</span>
            </Link>

            {/* Cart Icon with bouncing counter */}
            <Link href="/cart" className="relative p-2.5 rounded-full bg-stone-100/90 hover:bg-stone-200/90 text-stone-800 hover:text-stone-950 transition-colors cursor-pointer" title="Mon panier">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-stone-800" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-linear-to-r from-amber-600 to-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-amber-600/30"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Connexion or Profile Button */}
            {currentUser ? (
              <div className="relative">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold shadow-xs hover:bg-stone-800 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">
                    {currentUser.firstName?.[0] || 'R'}
                  </div>
                  <span className="hidden sm:inline max-w-30 truncate font-medium">
                    {currentRestaurant?.name || currentUser.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-stone-200/90 py-2 z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">{currentUser.email}</p>
                      </div>
                      {currentRestaurant && (
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-600" />
                          <span>Mon Dashboard Restaurant</span>
                        </Link>
                      )}
                      <Link
                        href="/order-tracking"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-stone-500" />
                        <span>Mes Commandes</span>
                      </Link>
                      <div className="border-t border-stone-100 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:inline-block px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors">
                  Connexion
                </Link>
                <Link href="/register-restaurant" className="btn-primary px-3.5 sm:px-4 py-2 text-xs">
                  <Store className="w-3.5 h-3.5" />
                  <span>Inscrire mon resto</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-950 focus:outline-hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form action="/restaurants" method="get" className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              name="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un plat, un restaurant..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-100 text-xs text-stone-900 rounded-full border border-stone-200 outline-hidden font-medium"
            />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 flex flex-col gap-3 overflow-hidden"
          >
            <Link href="/restaurants" onClick={() => setMobileMenuOpen(false)} className="text-left py-2 font-semibold text-sm text-stone-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Explorer les restaurants</span>
            </Link>
            <Link href="/order-tracking" onClick={() => setMobileMenuOpen(false)} className="text-left py-2 font-semibold text-sm text-stone-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Suivre une commande</span>
            </Link>

            {!currentUser && (
              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-800 font-bold text-xs text-center">
                  Connexion gérant
                </Link>
                <Link href="/register-restaurant" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 text-white font-bold text-xs text-center">
                  Digitaliser mon restaurant gratuitement
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
