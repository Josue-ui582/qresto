import React from 'react';
import { motion } from 'motion/react';
import { Clock, RotateCw, Flame, Plus } from 'lucide-react';
import { Dish } from '@/types';

interface RestaurantDishCardProps {
  dish: Dish;
  index: number;
  onOpen3D: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
}

export const RestaurantDishCard: React.FC<RestaurantDishCardProps> = ({
  dish,
  index,
  onOpen3D,
  onAddToCart,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-stone-200/50 transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="relative h-48 overflow-hidden bg-stone-100">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          />
          {dish.has3DModel && (
            <button
              type="button"
              onClick={() => onOpen3D(dish)}
              className="absolute top-3 left-3 px-3 py-1.5 bg-stone-950/85 hover:bg-black backdrop-blur-md rounded-xl text-amber-400 text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Vue 3D 360°</span>
            </button>
          )}
          {dish.isPopular && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-stone-950 text-[10px] font-black rounded-lg shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>Populaire</span>
            </div>
          )}
        </div>
        <div className="p-5 text-left">
          <h3 className="text-base sm:text-lg font-bold text-stone-950 leading-snug mb-1 font-display group-hover:text-amber-700 transition-colors">
            {dish.name}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed mb-4 line-clamp-2 font-normal">
            {dish.description}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>~{dish.preparationTimeMin || 15} min</span>
            </span>
            {dish.allergens && dish.allergens.length > 0 && (
              <span className="truncate">Allergènes : {dish.allergens.join(', ')}</span>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between">
        <div className="text-left">
          <span className="text-lg font-black text-stone-950 font-display">
            {dish.price.toLocaleString()} FCFA
          </span>
          {dish.originalPrice && (
            <span className="block text-xs text-stone-400 line-through">
              {dish.originalPrice.toLocaleString()} FCFA
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dish.has3DModel && (
            <button
              type="button"
              onClick={() => onOpen3D(dish)}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
              title="Inspecter en 3D"
            >
              <RotateCw className="w-4 h-4 text-amber-700" />
            </button>
          )}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(dish)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
