'use client';

import React from 'react';
import { Crown, Calendar } from 'lucide-react';
import { SubscriptionData } from './types';

interface ActivePlanCardProps {
  subData: SubscriptionData;
  daysRemaining: number;
}

export const ActivePlanCard: React.FC<ActivePlanCardProps> = ({ subData, daysRemaining }) => {
  return (
    <div className="bg-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Crown className="w-3.5 h-3.5" />
            <span>
              {subData.status === 'TRIAL'
                ? 'Période d’essai gratuite'
                : subData.status === 'ACTIVE'
                ? 'Abonnement Actif'
                : 'Abonnement Expiré'}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
            {subData.planDetails?.name || `Plan ${subData.planId}`}
          </h3>

          <p className="text-xs text-stone-400 max-w-lg leading-relaxed">
            {subData.planDetails?.description}
          </p>
        </div>

        {/* Métriques d'échéance */}
        <div className="bg-stone-900/80 p-5 rounded-2xl border border-stone-800 flex flex-col items-start md:items-end justify-center shrink-0 min-w-25">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
            Renouvellement dans
          </span>
          <div className="text-3xl font-black text-amber-400 font-display">
            {daysRemaining} jour(s)
          </div>
          <span className="text-[11px] text-stone-400 mt-1 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            Fin le : {new Date(subData.endDate).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  );
};
