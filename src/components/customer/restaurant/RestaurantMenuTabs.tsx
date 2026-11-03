import { Category, Dish } from '@/types';
import React from 'react';

interface RestaurantMenuTabsProps {
  categories: Category[];
  dishes: Dish[];
  activeCategoryId: string;
  setActiveCategoryId: (id: string) => void;
}

export const RestaurantMenuTabs: React.FC<RestaurantMenuTabsProps> = ({
  categories,
  dishes,
  activeCategoryId,
  setActiveCategoryId,
}) => {
  return (
    <div className="sticky top-16 md:top-20 z-30 bg-surface-warm/95 backdrop-blur-md border-b border-ink-200/80 py-3.5 px-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategoryId('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategoryId === 'all'
              ? 'bg-ink-950 text-paper-white shadow-xs'
              : 'bg-paper-white hover:bg-ink-100 text-ink-700 border border-ink-200/70'
          }`}
        >
          Tous les plats ({dishes.length})
        </button>

        {categories.map((cat) => {
          const count = dishes.filter((d) => d.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategoryId === cat.id
                  ? 'restaurant-primary-button bg-brand-600 text-paper-white shadow-xs'
                  : 'bg-paper-white hover:bg-ink-100 text-ink-700 border border-ink-200/70'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[0.625rem] opacity-75 font-normal">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
