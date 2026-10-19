'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCw, Clock, Loader2, UtensilsCrossed } from 'lucide-react';
import { Dish3DSelection, DishModelType } from '@/types';
import Link from 'next/link';

interface ShowcaseDish {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  prepTime: string;
  ingredients?: string[];
  model3DType?: string | null;
  category?: {
    id: string;
    name: string;
  };
  restaurant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
  };
}

interface DishesShowcaseProps {
  onSelectDish: (dish: Dish3DSelection) => void;
}

const dishModelTypes: readonly string[] = [
  'poulet_braise',
  'poisson_grille',
  'igname_pile',
  'burger',
  'alloco',
  'cocktail',
];

function isDishModelType(value: string | null | undefined): value is DishModelType {
  return value !== undefined && value !== null && dishModelTypes.includes(value);
}

export const DishesShowcase: React.FC<DishesShowcaseProps> = ({ onSelectDish }) => {
  const [dishes, setDishes] = useState<ShowcaseDish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetchShowcaseDishes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/dishes/showcase');
        if (!res.ok) throw new Error('Erreur lors du chargement des plats');
        const data = await res.json();
        setDishes(data.dishes || []);
      } catch (error) {
        console.error('Erreur chargement vitrine plats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowcaseDishes();
  }, []);

  // Extraire les noms uniques de catégories pour les filtres
  const categoriesList = Array.from(
    new Set(dishes.map((d) => d.category?.name).filter(Boolean))
  ) as string[];

  const filteredDishes = dishes.filter((dish) => {
    if (activeCategory === 'all') return true;
    return dish.category?.name === activeCategory;
  });

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-center gap-6 text-center"
        >
          <div className="max-w-3xl">
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
              Innovation Gastronomique
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950">
              Plats signatures & immersion 3D
            </h2>
            <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
              Permettez à vos convives de voir exactement ce qu’ils vont déguster avant de commander.
            </p>
          </div>

          {/* Filtres par Catégorie */}
          {categoriesList.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-stone-200/60 p-1">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeCategory === 'all'
                  ? 'bg-white text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
                  }`}
              >
                Toutes les spécialités
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeCategory === cat
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-950'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <span className="text-xs font-medium">Chargement des plats...</span>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDishes.map((dish, idx) => {
              const restaurantSlug = dish.restaurant?.slug;
              const modelType = isDishModelType(dish.model3DType) ? dish.model3DType : null;

              return (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:shadow-stone-200/60 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-stone-400">
                          <UtensilsCrossed className="w-8 h-8" />
                        </div>
                      )}
                      {dish.prepTime && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{dish.prepTime}</span>
                        </div>
                      )}

                      {modelType && (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectDish({
                              id: dish.id,
                              name: dish.name,
                              description: dish.description || '',
                              price: dish.price,
                              currency: dish.restaurant.currency,
                              image: dish.image || '',
                              ingredients: dish.ingredients || [],
                              prepTime: dish.prepTime,
                              modelType,
                              restaurantSlug: dish.restaurant.slug,
                            })
                          }
                          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                        >
                          <RotateCw
                            className="w-3.5 h-3.5 animate-spin"
                            style={{ animationDuration: '8s' }}
                          />
                          <span>Voir en 3D</span>
                        </button>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1.5">
                        {dish.restaurant?.name && (
                          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider truncate max-w-32.5">
                            {dish.restaurant.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-stone-900 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-4 font-normal">
                          {dish.description}
                        </p>
                      )}

                      {dish.ingredients && dish.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {dish.ingredients.slice(0, 2).map((ing) => (
                            <span
                              key={ing}
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-stone-950">
                        {dish.price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500 ml-1">{dish.restaurant?.currency}</span>
                    </div>

                    {restaurantSlug ? (
                      <Link href={`/restaurant/${restaurantSlug}`}>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Commander
                        </motion.button>
                      </Link>
                    ) : (
                      <motion.button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-xl bg-stone-300 text-stone-500 font-bold text-xs cursor-not-allowed"
                      >
                        Indisponible
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 max-w-md mx-auto">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-800">Aucun plat disponible pour le moment</p>
            <p className="text-xs text-stone-500 mt-1">
              Les plats enregistrés par les restaurants partenaires apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
