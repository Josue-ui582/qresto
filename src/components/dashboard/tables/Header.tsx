'use client';

import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, Plus } from 'lucide-react';

interface HeaderProps {
  tablesCount: number;
  totalCapacity: number;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tablesCount,
  totalCapacity,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
          <LayoutGrid className="w-4 h-4 text-amber-600" />
          <span>Plan de Salle & QR Codes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          Gestion des Tables
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          Générez et imprimez les QR codes uniques pour chaque table afin de fluidifier les prises de commandes.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
          <span className="block text-2xl font-black text-stone-950 font-display">
            {tablesCount}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Tables
          </span>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
          <span className="block text-2xl font-black text-amber-600 font-display">
            {totalCapacity}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Couverts Total
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCreateModal}
          className="px-5 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Ajouter une table</span>
        </motion.button>
      </div>
    </div>
  );
};
