'use client';

import React from 'react';

interface BillingCycleToggleProps {
  billingCycle: 'MONTHLY' | 'YEARLY';
  onCycleChange: (cycle: 'MONTHLY' | 'YEARLY') => void;
}

export const BillingCycleToggle: React.FC<BillingCycleToggleProps> = ({
  billingCycle,
  onCycleChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-paper-white p-4 rounded-2xl border border-ink-200/80">
      <div>
        <h3 className="text-base font-bold text-ink-950">
          Choisissez votre formule
        </h3>
        <p className="text-xs text-ink-500">
          Sélectionnez une durée de formule; aucun paiement automatique n’est effectué.
        </p>
      </div>

      <div className="bg-ink-100 p-1 rounded-2xl flex items-center gap-1 border border-ink-200/80">
        <button
          onClick={() => onCycleChange('MONTHLY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            billingCycle === 'MONTHLY'
              ? 'bg-paper-white text-ink-950 shadow-xs'
              : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          Durée mensuelle
        </button>
        <button
          onClick={() => onCycleChange('YEARLY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            billingCycle === 'YEARLY'
              ? 'bg-ink-950 text-brand-400 shadow-xs'
              : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          <span>Durée annuelle</span>
          <span className="px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-600 text-[0.625rem] font-black">
            -20%
          </span>
        </button>
      </div>
    </div>
  );
};
