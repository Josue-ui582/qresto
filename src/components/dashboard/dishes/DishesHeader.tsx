'use client';

import React from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed, Plus } from 'lucide-react';
import { DishStats } from './types';

interface DishesHeaderProps {
  stats: DishStats;
  onOpenCreateModal: () => void;
}

export const DishesHeader: React.FC<DishesHeaderProps> = ({
  stats,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
          <UtensilsCrossed className="w-4 h-4 text-amber-600" />
          <span>Gestion de la Carte</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          Plats et Menu
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          Gérez vos plats, ajustez leurs prix et activez/désactivez leur disponibilité en temps réel.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-25">
          <span className="block text-2xl font-black text-stone-950 font-display">
            {stats.total}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Total Plats
          </span>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-center min-w-25">
          <span className="block text-2xl font-black text-emerald-700 font-display">
            {stats.available}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            En Carte
          </span>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-center min-w-25">
          <span className="block text-2xl font-black text-amber-700 font-display">
            {stats.unavailable}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Épuisés
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCreateModal}
          className="px-5 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Ajouter un plat</span>
        </motion.button>
      </div>
    </div>
  );
};
