'use client';

import React from 'react';
import { Search, Loader2 } from 'lucide-react';

interface CategorySearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CategorySearchBar: React.FC<CategorySearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une catégorie..."
          className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
        />
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
        title="Rafraîchir"
      >
        <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
      </button>
    </div>
  );
};
