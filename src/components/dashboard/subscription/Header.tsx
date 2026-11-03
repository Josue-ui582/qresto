'use client';

import React from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoading, onRefresh }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-paper-white p-6 sm:p-8 rounded-3xl border border-ink-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-700 mb-1">
          <CreditCard className="w-4 h-4 text-brand-600" />
          <span>Offres & Licence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-ink-950">
          Gestion de l'Abonnement
        </h2>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 font-normal">
          Consultez votre formule, ses limites d’usage et les opérations enregistrées.
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="px-4 py-3 rounded-2xl bg-ink-100 hover:bg-ink-200 text-ink-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer self-start lg:self-auto"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
        <span>Rafraîchir</span>
      </button>
    </div>
  );
};
