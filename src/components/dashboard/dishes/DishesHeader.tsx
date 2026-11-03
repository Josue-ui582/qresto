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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-paper-white p-6 sm:p-8 rounded-3xl border border-ink-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-700 mb-1">
          <UtensilsCrossed className="w-4 h-4 text-brand-600" />
          <span>Gestion de la Carte</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-ink-950">
          Plats et Menu
        </h2>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 font-normal">
          Gérez vos plats, ajustez leurs prix et activez/désactivez leur disponibilité en temps réel.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-4 py-3 rounded-2xl bg-surface-warm border border-ink-200/80 text-center min-w-25">
          <span className="block text-2xl font-black text-ink-950">
            {stats.total}
          </span>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-ink-500">
            Total Plats
          </span>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-positive-50/50 border border-positive-200/60 text-center min-w-25">
          <span className="block text-2xl font-black text-positive-700">
            {stats.available}
          </span>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-positive-800">
            En Carte
          </span>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-brand-50/50 border border-brand-200/60 text-center min-w-25">
          <span className="block text-2xl font-black text-brand-700">
            {stats.unavailable}
          </span>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-brand-800">
            Épuisés
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCreateModal}
          className="px-5 py-3.5 rounded-2xl bg-ink-950 hover:bg-ink-800 text-paper-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-brand-400" />
          <span>Ajouter un plat</span>
        </motion.button>
      </div>
    </div>
  );
};
