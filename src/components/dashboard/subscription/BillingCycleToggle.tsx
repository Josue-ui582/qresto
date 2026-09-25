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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
      <div>
        <h3 className="text-base font-bold text-stone-950 font-display">
          Choisissez votre formule
        </h3>
        <p className="text-xs text-stone-500">
          Économisez jusqu'à 20% en optant pour la facturation annuelle.
        </p>
      </div>

      <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1 border border-stone-200/80">
        <button
          onClick={() => onCycleChange('MONTHLY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            billingCycle === 'MONTHLY'
              ? 'bg-white text-stone-950 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Facturation Mensuelle
        </button>
        <button
          onClick={() => onCycleChange('YEARLY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            billingCycle === 'YEARLY'
              ? 'bg-stone-950 text-amber-400 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>Facturation Annuelle</span>
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 text-[10px] font-black">
            -20%
          </span>
        </button>
      </div>
    </div>
  );
};
