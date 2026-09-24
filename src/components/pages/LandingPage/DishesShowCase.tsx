'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCw, Star, Clock } from 'lucide-react';
import { dishesShowcase } from '@/constants/dishesShowcase';
import { Dish3DSelection } from '@/types';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';

interface DishesShowcaseProps {
  onSelectDish: (dish: Dish3DSelection) => void;
}

export const DishesShowcase: React.FC<DishesShowcaseProps> = ({ onSelectDish }) => {
  const { navigateTo } = useNavigation();
  const [activeSpecialtyTab, setActiveSpecialtyTab] = useState<'all' | 'signature' | 'street' | 'drinks'>('all');

  const filteredDishes = dishesShowcase.filter((dish) => {
    if (activeSpecialtyTab === 'all') return true;
    return dish.category === activeSpecialtyTab;
  });

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
              Innovation Gastronomique
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
              Plats signatures & immersion 3D
            </h2>
            <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
              Permettez à vos convives de voir exactement ce qu’ils vont déguster avant de commander.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl self-start md:self-auto">
            {[
              { id: 'all', label: 'Toutes les spécialités' },
              { id: 'signature', label: 'Plats signatures' },
              { id: 'street', label: 'Street food' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSpecialtyTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSpecialtyTab === tab.id
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dishes Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDishes.map((dish, idx) => (
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
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{dish.prepTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectDish(dish)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>Voir en 3D</span>
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                      Bénin Gourmand
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{dish.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-4 font-normal">
                    {dish.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {dish.ingredients.slice(0, 2).map((ing) => (
                      <span key={ing} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-stone-950 font-display">
                    {dish.price.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-[10px] font-bold text-stone-500 ml-1">FCFA</span>
                </div>

                  <Link href={`/restaurant/chez-mama-benin?table=4`}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Commander
                    </motion.button>
                  </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
