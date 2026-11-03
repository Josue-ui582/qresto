import React from 'react';
import { motion } from 'motion/react';
import { Clock, RotateCw, Flame, Plus } from 'lucide-react';
import { Dish } from '@/types';

interface RestaurantDishCardProps {
  dish: Dish;
  currency: string;
  selectedOptionIds: string[];
  onOptionsChange: (dishId: string, optionIds: string[]) => void;
  index: number;
  onOpen3D: (dish: Dish) => void;
  onAddToCart: (dish: Dish, optionIds: string[]) => void;
}

export const RestaurantDishCard: React.FC<RestaurantDishCardProps> = ({
  dish,
  currency,
  selectedOptionIds,
  onOptionsChange,
  index,
  onOpen3D,
  onAddToCart,
}) => {
  const updateOptionGroup = (groupId: string, optionId: string, selected: boolean) => {
    const group = dish.optionGroups?.find((optionGroup) => optionGroup.id === groupId);
    if (!group) return;

    const groupOptionIds = new Set(group.options.map((option) => option.id));
    const nextOptions = selectedOptionIds.filter((id) => !groupOptionIds.has(id));
    if (selected) nextOptions.push(optionId);
    onOptionsChange(dish.id, nextOptions);
  };
  const selectedOptions = dish.optionGroups?.flatMap((group) => group.options)
    .filter((option) => selectedOptionIds.includes(option.id)) ?? [];
  const optionTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-paper-white rounded-3xl border border-ink-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-ink-200/50 transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="relative h-48 overflow-hidden bg-ink-100">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          />
          {dish.has3DModel && (
            <button
              type="button"
              onClick={() => onOpen3D(dish)}
              className="absolute top-3 left-3 px-3 py-1.5 bg-ink-950/85 hover:bg-ink-black backdrop-blur-md rounded-xl text-brand-400 text-xs font-bold flex items-center gap-1.5 border border-brand-500/40 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Vue 3D 360°</span>
            </button>
          )}
          {dish.isPopular && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-brand-500 text-ink-950 text-[0.625rem] font-black rounded-lg shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>Populaire</span>
            </div>
          )}
        </div>
        <div className="p-5 text-left">
          <h3 className="text-base sm:text-lg font-bold text-ink-950 leading-snug mb-1 group-hover:text-brand-700 transition-colors">
            {dish.name}
          </h3>
          <p className="text-xs text-ink-500 leading-relaxed mb-4 line-clamp-2 font-normal">
            {dish.description}
          </p>
          {dish.optionGroups?.map((group) => (
            <fieldset key={group.id} className="mb-3">
              <legend className="mb-1 text-[0.6875rem] font-semibold text-ink-700">
                {group.name}{group.isRequired ? ' *' : ''}
              </legend>
              {group.maxSelection === 1 && group.minSelection <= 1 ? (
                <select
                  aria-label={group.name}
                  required={group.isRequired}
                  value={selectedOptionIds.find((id) => group.options.some((option) => option.id === id)) ?? ''}
                  onChange={(event) => {
                    const selectedId = event.target.value;
                    updateOptionGroup(group.id, selectedId, Boolean(selectedId));
                  }}
                  className="w-full rounded-lg border border-ink-200 bg-paper-white px-2.5 py-2 text-xs text-ink-800"
                >
                  <option value="">{group.isRequired ? 'Choisir une option' : 'Aucune option'}</option>
                  {group.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}{option.price > 0 ? ` (+${option.price.toLocaleString()} ${currency})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-1">
                  {group.options.map((option) => {
                    const isSelected = selectedOptionIds.includes(option.id);
                    return (
                      <label key={option.id} className="flex items-center gap-2 text-xs text-ink-600">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) => updateOptionGroup(group.id, option.id, event.target.checked)}
                        />
                        <span>
                          {option.name}{option.price > 0 ? ` (+${option.price.toLocaleString()} ${currency})` : ''}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          ))}
          <div className="flex items-center gap-3 text-[0.6875rem] text-ink-400 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-ink-400" />
              <span>~{dish.preparationTimeMin || 15} min</span>
            </span>
            {dish.allergens && dish.allergens.length > 0 && (
              <span className="truncate">Allergènes : {dish.allergens.join(', ')}</span>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 pt-0 border-t border-ink-100 flex items-center justify-between">
        <div className="text-left">
          <span className="text-lg font-black text-ink-950">
            {(dish.price + optionTotal).toLocaleString()} {currency}
          </span>
          {dish.originalPrice && (
            <span className="block text-xs text-ink-400 line-through">
              {dish.originalPrice.toLocaleString()} {currency}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dish.has3DModel && (
            <button
              type="button"
              onClick={() => onOpen3D(dish)}
              className="p-2.5 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-700 text-xs font-bold transition-all cursor-pointer"
              title="Inspecter en 3D"
            >
              <RotateCw className="w-4 h-4 text-brand-700" />
            </button>
          )}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(dish, selectedOptionIds)}
            className="restaurant-primary-button flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-paper-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
