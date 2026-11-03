'use client';

import React from 'react';
import { Check, CheckCircle2, ArrowRight } from 'lucide-react';
import { PlanCatalogItem } from './types';

interface PlanCardProps {
  plan: PlanCatalogItem;
  isCurrent: boolean;
  billingCycle: 'MONTHLY' | 'YEARLY';
  formatPrice: (amount: number, currency?: string) => string;
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
      className={`bg-paper-white rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
        plan.popular
          ? 'border-brand-500 ring-2 ring-brand-500/20'
          : 'border-ink-200/80'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-ink-950 text-[0.625rem] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
          Recommandé
        </div>
      )}

      <div>
        <h4 className="text-xl font-bold text-ink-950 mb-1">
          {plan.name}
        </h4>
        <p className="text-xs text-ink-500 mb-6 leading-relaxed min-h-9">
          {plan.description}
        </p>

        {/* Affichage du Tarif */}
        <div className="mb-6 pb-6 border-b border-ink-100">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-ink-950">
              {formatPrice(price)}
            </span>
            <span className="text-xs text-ink-400 font-bold">/ mois</span>
          </div>
          {billingCycle === 'YEARLY' && (
            <span className="text-[0.6875rem] text-brand-700 font-bold block mt-1">
              Prix annuel indicatif : {formatPrice(plan.yearlyPrice)}
            </span>
          )}
        </div>

        {/* Liste des fonctionnalités */}
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-ink-700">
              <Check className="w-4 h-4 text-positive-600 shrink-0 mt-0.5" />
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
            ? 'bg-ink-100 text-ink-400 border border-ink-200 cursor-not-allowed'
            : plan.popular
            ? 'bg-brand-500 hover:bg-brand-400 text-ink-950 font-black shadow-md'
            : 'bg-ink-950 hover:bg-ink-800 text-paper-white'
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
