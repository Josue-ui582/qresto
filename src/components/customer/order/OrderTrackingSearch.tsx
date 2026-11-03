import { Icon } from '@/components/common/Icon';
import React from 'react';

interface OrderTrackingSearchProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export const OrderTrackingSearch: React.FC<OrderTrackingSearchProps> = ({
  searchInput,
  setSearchInput,
  handleSearch,
}) => {
  return (
    <div className="bg-paper-white p-6 sm:p-8 rounded-3xl border border-ink-200 shadow-sm mb-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center text-2xl mx-auto mb-4">
        <Icon name="route" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mb-2">
        Suivi de Commande en Direct
      </h1>
      <p className="text-xs sm:text-sm text-ink-500 max-w-md mx-auto mb-6">
        Saisissez le code de suivi reçu après votre commande pour connaître son état.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
            <Icon name="ticket" />
          </div>
          <input
            type="text"
            required
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Code de suivi"
            className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-300 rounded-xl text-ink-900 font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-paper-white font-bold text-sm shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <Icon name="magnifying-glass" />
          <span>Rechercher</span>
        </button>
      </form>
    </div>
  );
};
