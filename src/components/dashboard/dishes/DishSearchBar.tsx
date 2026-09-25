'use client';

import React from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { CategoryOption } from './types';

interface DishSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoriesList: CategoryOption[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const DishSearchBar: React.FC<DishSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategoryFilter,
  onCategoryFilterChange,
  categoriesList,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un plat (nom, ingrédient...)"
          className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-stone-700 outline-none cursor-pointer w-full"
          >
            <option value="all">Toutes les catégories</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer shrink-0"
          title="Rafraîchir"
        >
          <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>
    </div>
  );
};
