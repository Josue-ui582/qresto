'use client';

import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { AnalyticsStats } from './types';

const SERVICE_LABELS: Record<string, string> = {
  DINE_IN: 'Sur place',
  PICKUP: 'À emporter',
  DELIVERY: 'Livraison',
};

interface OrdersByTypeCardProps {
  ordersByType: AnalyticsStats['ordersByType'];
}

export const OrdersByTypeCard: React.FC<OrdersByTypeCardProps> = ({ ordersByType }) => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
        <UtensilsCrossed className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-stone-950">Modes de service</h3>
        <p className="text-xs text-stone-500">Commandes par mode choisi.</p>
      </div>
    </div>
    <div className="space-y-3">
      {ordersByType.length ? ordersByType.map(({ type, count }) => (
        <div key={type} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700">{SERVICE_LABELS[type] ?? type}</span>
          <span className="px-3 py-1 rounded-xl bg-white border border-stone-200 font-black text-xs text-stone-900 shadow-2xs">
            {count}
          </span>
        </div>
      )) : (
        <p className="py-8 text-center text-stone-400 text-xs">Aucune commande sur cette période.</p>
      )}
    </div>
  </div>
);
