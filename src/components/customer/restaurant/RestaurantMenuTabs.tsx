import { Dish } from '@/types';
import React from 'react';

interface RestaurantMenuTabsProps {
  categories: any[]; // Remplacez 'any' par 'Category'
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
    <div className="sticky top-16 md:top-20 z-30 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-stone-200/80 py-3.5 px-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategoryId('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeCategoryId === 'all'
              ? 'bg-stone-950 text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/70'
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
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/70'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
