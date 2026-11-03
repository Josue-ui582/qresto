'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Users, UserPlus } from 'lucide-react';

interface TeamHeaderProps {
  totalCount: number;
  activeCount: number;
  onAddMember: () => void;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({
  totalCount,
  activeCount,
  onAddMember,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-paper-white p-6 sm:p-8 rounded-3xl border border-ink-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-700 mb-1">
          <Users className="w-4 h-4 text-brand-600" />
          <span>Personnel & Rôles</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-ink-950">
          Gestion de l'Équipe
        </h2>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 font-normal">
          Attribuez les permissions, définissez les codes PIN de caisse et gérez vos collaborateurs.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="px-4 py-3 rounded-2xl bg-surface-warm border border-ink-200/80 text-center min-w-27.5">
          <span className="block text-2xl font-black text-ink-950">
            {totalCount}
          </span>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-ink-500">
            Membres Total
          </span>
        </div>
        <div className="px-4 py-3 rounded-2xl bg-surface-warm border border-ink-200/80 text-center min-w-27.5">
          <span className="block text-2xl font-black text-positive-600">
            {activeCount}
          </span>
          <span className="text-[0.625rem] font-bold uppercase tracking-wider text-ink-500">
            Actifs
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddMember}
          className="px-5 py-3.5 rounded-2xl bg-ink-950 hover:bg-ink-800 text-paper-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-brand-400" />
          <span>Ajouter un membre</span>
        </motion.button>
      </div>
    </div>
  );
};
