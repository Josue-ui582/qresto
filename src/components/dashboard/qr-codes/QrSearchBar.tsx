'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface QrSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
}

export const QrSearchBar: React.FC<QrSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  resultCount,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 bg-paper-white p-4 rounded-2xl border border-ink-200/80">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filtrer par numéro ou nom de table..."
          className="w-full pl-10 pr-4 py-2 bg-ink-50 text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-paper-white transition-all"
        />
      </div>
      <div className="text-xs font-semibold text-ink-500 hidden sm:block">
        {resultCount} résultat(s)
      </div>
    </div>
  );
};
