import React from 'react';
import { FaIcon } from '../common/Icon';
import { Restaurant } from '../../types';

interface DashboardTopbarProps {
  topSearch: string;
  setTopSearch: (val: string) => void;
  demoModeWithData: boolean;
  toggleDemoMode: () => void;
  currentRestaurant: Restaurant;
  allRestaurants: Restaurant[];
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  onSelectRestaurant: (restaurantId: string) => void;
  onViewMenu: () => void;
  pendingOrdersCount: number;
  onNotificationClick: () => void;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  topSearch,
  setTopSearch,
  demoModeWithData,
  toggleDemoMode,
  currentRestaurant,
  allRestaurants,
  dropdownOpen,
  setDropdownOpen,
  onSelectRestaurant,
  onViewMenu,
  pendingOrdersCount,
  onNotificationClick,
}) => {
  return (
    <header className="h-16 bg-surface border-b border-soft px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="relative flex-1 max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <FaIcon name="fa-solid fa-magnifying-glass" className="text-xs" />
        </div>
        <input
          type="text"
          value={topSearch}
          onChange={(e) => setTopSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-9 pr-4 py-2 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-xs sm:text-sm text-stone-900 rounded-full border border-stone-200/60 focus:border-stone-400 outline-hidden transition-all placeholder:text-stone-400"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={toggleDemoMode}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${demoModeWithData ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
          <span>{demoModeWithData ? 'Activité : Démo' : 'Activité : Réel (0F)'}</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
          >
            <FaIcon name="fa-solid fa-store" className="text-stone-500 text-xs" />
            <span className="max-w-35 truncate">{currentRestaurant.name}</span>
            <FaIcon name="fa-solid fa-chevron-down" className="text-[10px] text-stone-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fade-in-up">
              <div className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Changer de restaurant
              </div>
              {allRestaurants.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectRestaurant(r.id)}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                    r.id === currentRestaurant.id
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                  {r.id === currentRestaurant.id && (
                    <FaIcon name="fa-solid fa-check" className="text-amber-600 text-xs" />
                  )}
                </button>
              ))}
              <div className="border-t border-stone-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={onViewMenu}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center gap-2"
                >
                  <FaIcon name="fa-solid fa-eye" className="text-stone-400" />
                  <span>Voir le menu client</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNotificationClick}
          className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
          title="Notifications"
        >
          <FaIcon name="fa-regular fa-bell" className="text-base" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
            {pendingOrdersCount}
          </span>
        </button>

        <div className="w-8 h-8 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center select-none">
          M
        </div>
      </div>
    </header>
  );
};
