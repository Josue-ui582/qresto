'use client';

import React from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 bg-paper-white p-4 rounded-2xl border border-ink-200/80">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par numéro ou nom de table (ex: 4, VIP, Terrasse)..."
          className="w-full pl-10 pr-4 py-2 bg-ink-50 text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-paper-white transition-all"
        />
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="p-2.5 rounded-xl border border-ink-200 hover:bg-ink-50 text-ink-600 transition-colors cursor-pointer shrink-0"
        title="Rafraîchir"
      >
        <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
      </button>
    </div>
  );
};
