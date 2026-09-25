'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface TeamFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
}

const ROLE_OPTIONS = [
  { id: 'ALL', label: 'Tous' },
  { id: 'MANAGER', label: 'Gérants' },
  { id: 'CHEF', label: 'Cuisine' },
  { id: 'WAITER', label: 'Serveurs' },
  { id: 'CASHIER', label: 'Caissiers' },
];

export const TeamFilters: React.FC<TeamFiltersProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par nom, email ou téléphone..."
          className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {ROLE_OPTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => onRoleFilterChange(item.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              roleFilter === item.id
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
