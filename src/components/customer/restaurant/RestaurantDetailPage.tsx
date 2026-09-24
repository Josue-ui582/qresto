'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, ArrowRight, X, RotateCw, ShoppingBag } from 'lucide-react';

// Import des sous-composants
import { RestaurantHero } from './RestaurantHero';
import { RestaurantMenuTabs } from './RestaurantMenuTabs';
import { RestaurantDishCard } from './RestaurantDishCard';
import { useNavigation } from '@/context/NavigationContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { storage } from '@/lib/storage';
import { Dish } from '@/types';
import { Dish3DViewer } from '@/components/3d/Dish3DViewer';

export const RestaurantDetailPage: React.FC = () => {
  const { navigateTo, viewParams } = useNavigation();
  const { addToCart, cartCount } = useCart();
  const { showToast } = useToast();
  
  // CORRECTION TYPESCRIPT ICI
  const slug = (viewParams.slug as string) || 'chez-mama-benin';
  const tableParam = viewParams.table as string; 

  const restaurant = storage.getRestaurantBySlug(slug) || storage.getRestaurants()[0];
  const categories = storage.getCategories(restaurant?.id);
  const dishes = storage.getDishes(restaurant?.id);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [active3DDish, setActive3DDish] = useState<Dish | null>(null);

  const filteredDishes = useMemo(() => {
    if (activeCategoryId === 'all') return dishes;
    return dishes.filter((d) => d.categoryId === activeCategoryId);
  }, [dishes, activeCategoryId]);

  const handleShareMenu = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Lien du menu copié ! Partagez-le avec vos amis.', 'success');
      } catch {
        showToast('Impossible de copier le lien dans ce navigateur.', 'error');
      }
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;
    const text = encodeURIComponent(
      `Regarde le menu digital de ${restaurant?.name || 'ce restaurant'} sur QResto : ${window.location.origin}/#menu-${restaurant?.slug || slug}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleAddToCart = (dish: Dish) => {
    addToCart(dish, 1);
    showToast(`"${dish.name}" ajouté à votre panier !`, 'success');
  };

  if (!restaurant) {
    return (
      <div className="py-24 text-center">
        <p className="text-stone-500 mb-4">Restaurant non trouvé.</p>
        <button
          onClick={() => navigateTo('restaurants')}
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
        >
          Retour aux restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] pb-28">
      {/* 1. HERO SECTION */}
      <RestaurantHero 
        restaurant={restaurant}
        onBack={() => navigateTo('restaurants')}
        onShareMenu={handleShareMenu}
        onShareWhatsApp={handleShareWhatsApp}
      />

      {/* 2. DINE-IN TABLE ALERT BANNER */}
      {tableParam && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 font-bold py-3.5 px-4 shadow-md"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-extrabold leading-tight">
                  Bienvenue à la Table #{tableParam} !
                </p>
                <p className="text-xs text-stone-900/80 font-medium">
                  Votre commande sera transmise directement en cuisine et servie à cette table.
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-stone-950 text-white rounded-full text-xs font-black uppercase tracking-wider">
              Table #{tableParam}
            </span>
          </div>
        </motion.div>
      )}

      {/* 3. MENU CATEGORIES TABS */}
      <RestaurantMenuTabs 
        categories={categories}
        dishes={dishes}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
      />

      {/* 4. DISHES LIST / GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish, idx) => (
            <RestaurantDishCard 
              key={dish.id} 
              dish={dish} 
              index={idx}
              onOpen3D={setActive3DDish}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      {/* 5. FLOATING CART BAR ON MOBILE */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo('cart', { table: tableParam })}
              className="w-full py-4 px-6 rounded-2xl bg-stone-950 text-white font-black text-sm shadow-2xl flex items-center justify-between border border-amber-500/50 hover:bg-black transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-black text-xs">
                  {cartCount}
                </span>
                <span>Voir mon panier</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <span>Commander</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. MODAL 3D DISH VIEWER */}
      <AnimatePresence>
        {active3DDish && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative text-white shadow-2xl text-left"
            >
              <button
                type="button"
                onClick={() => setActive3DDish(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Visualisation 3D Interactive</span>
                </div>
                <h3 className="text-2xl font-black text-white font-display mb-1">
                  {active3DDish.name}
                </h3>
                <p className="text-xs text-stone-400">{active3DDish.description}</p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 mb-5">
                <Dish3DViewer
                  modelType={active3DDish.model3DType || 'poulet_braise'}
                  dishName={active3DDish.name}
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <div>
                  <span className="text-2xl font-black text-amber-400 font-display">
                    {active3DDish.price.toLocaleString()} FCFA
                  </span>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    handleAddToCart(active3DDish);
                    setActive3DDish(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
