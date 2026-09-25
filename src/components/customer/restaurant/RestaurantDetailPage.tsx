'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, ArrowRight, X, RotateCw, ShoppingBag, Loader2, UtensilsCrossed } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';

// Import des sous-composants
import { RestaurantHero } from './RestaurantHero';
import { RestaurantMenuTabs } from './RestaurantMenuTabs';
import { RestaurantDishCard } from './RestaurantDishCard';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Dish, Category, Restaurant } from '@/types';
import { Dish3DViewer } from '@/components/3d/Dish3DViewer';

export const RestaurantDetailPage: React.FC = () => {
  const { viewParams } = useNavigation();
  const router = useRouter();
  const nextParams = useParams();
  const searchParams = useSearchParams();
  const { addToCart, cartCount } = useCart();
  const { showToast } = useToast();

  // Extraction du slug et de la table depuis les paramètres de navigation ou de l'URL
  const slug =
    (nextParams?.slug as string) ||
    (viewParams?.slug as string) ||
    '';

  const tableParam =
    (searchParams?.get('table') as string) ||
    (viewParams?.table as string) ||
    '';

  // États locaux pour les données réelles BDD
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [active3DDish, setActive3DDish] = useState<Dish | null>(null);

  // 1. Récupération des données réelles depuis l'API
  useEffect(() => {
    if (!slug) return;

    const fetchRestaurantDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/restaurants/${slug}`);

        if (res.status === 404) {
          throw new Error('Restaurant introuvable.');
        }

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des données.');
        }

        const data = await res.json();
        const fetchedRestaurant = data.restaurant;

        if (fetchedRestaurant) {
          setRestaurant(fetchedRestaurant);
          const fetchedCategories: Category[] = fetchedRestaurant.categories || [];
          setCategories(fetchedCategories);

          // Extraction et mise à plat des plats contenus dans les catégories
          const allDishes: Dish[] = fetchedCategories.flatMap((cat: any) =>
            (cat.dishes || []).map((d: any) => ({
              ...d,
              categoryId: d.categoryId || cat.id,
            }))
          );
          setDishes(allDishes);
        }
      } catch (err: any) {
        console.error('Erreur API detail restaurant:', err);
        setError(err.message || 'Impossible de charger le menu du restaurant.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [slug]);

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
      `Regarde le menu digital de ${restaurant?.name || 'ce restaurant'} sur QResto : ${window.location.origin}/restaurant/${restaurant?.slug || slug}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleAddToCart = (dish: Dish) => {
    addToCart(dish, 1);
    showToast(`"${dish.name}" ajouté à votre panier !`, 'success');
  };

  // Chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-stone-600">Chargement du menu...</p>
      </div>
    );
  }

  // Erreur ou restaurant inexistant
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-stone-500 mb-4 font-medium">{error || 'Restaurant non trouvé.'}</p>
        <Link
          href="/restaurants"
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold inline-block hover:bg-stone-800 transition-colors"
        >
          Retour aux restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] pb-28">
      {/* 1. HERO SECTION */}
      <RestaurantHero 
        restaurant={restaurant}
        onBack={() => router.push('/restaurants')}
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
      {categories.length > 0 && (
        <RestaurantMenuTabs 
          categories={categories}
          dishes={dishes}
          activeCategoryId={activeCategoryId}
          setActiveCategoryId={setActiveCategoryId}
        />
      )}

      {/* 4. DISHES LIST / GRID OU ÉTAT VIDE PROFESSIONNEL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {filteredDishes.length > 0 ? (
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
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 max-w-lg mx-auto my-8">
            <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-900 mb-1">Menu en cours de configuration</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Cet établissement prépare sa carte. Les plats seront bientôt disponibles en ligne.
            </p>
          </div>
        )}
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
              onClick={() => router.push(`/cart?table=${encodeURIComponent(tableParam || '')}`)}
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
