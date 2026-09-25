'use client';

import React from 'react';
import { Check, CheckCircle2, ArrowRight } from 'lucide-react';
import { PlanCatalogItem } from './types';

interface PlanCardProps {
  plan: PlanCatalogItem;
  isCurrent: boolean;
  billingCycle: 'MONTHLY' | 'YEARLY';
  formatPrice: (amount: number) => string;
  onSelect: (plan: PlanCatalogItem) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrent,
  billingCycle,
  formatPrice,
  onSelect,
}) => {
  const price =
    billingCycle === 'YEARLY'
      ? Math.round(plan.yearlyPrice / 12)
      : plan.monthlyPrice;

  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
        plan.popular
          ? 'border-amber-500 ring-2 ring-amber-500/20'
          : 'border-stone-200/80'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
          Recommandé
        </div>
      )}

      <div>
        <h4 className="text-xl font-bold text-stone-950 font-display mb-1">
          {plan.name}
        </h4>
        <p className="text-xs text-stone-500 mb-6 leading-relaxed min-h-9">
          {plan.description}
        </p>

        {/* Affichage du Tarif */}
        <div className="mb-6 pb-6 border-b border-stone-100">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
              {formatPrice(price)}
            </span>
            <span className="text-xs text-stone-400 font-bold">/ mois</span>
          </div>
          {billingCycle === 'YEARLY' && (
            <span className="text-[11px] text-amber-700 font-bold block mt-1">
              Facturé {formatPrice(plan.yearlyPrice)} / an
            </span>
          )}
        </div>

        {/* Liste des fonctionnalités */}
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bouton d'Action */}
      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
          isCurrent
            ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
            : plan.popular
            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-md'
            : 'bg-stone-950 hover:bg-stone-800 text-white'
        }`}
      >
        {isCurrent ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Plan Actuel</span>
          </>
        ) : (
          <>
            <span>Passer à cette formule</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
