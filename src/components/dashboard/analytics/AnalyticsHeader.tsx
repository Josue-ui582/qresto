'use client';

import React from 'react';
import { BarChart3, RefreshCw, Printer } from 'lucide-react';
import { AnalyticsPeriod } from './types';

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const PERIOD_OPTIONS: Array<{ id: AnalyticsPeriod; label: string }> = [
  { id: 'today', label: "Aujourd'hui" },
  { id: '7d', label: '7 jours' },
  { id: '30d', label: '30 jours' },
  { id: 'all', label: 'Tout' },
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  period,
  onPeriodChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
          <BarChart3 className="w-4 h-4 text-amber-600" />
          <span>Tableau de Bord Financier</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          Rapports & Analytics
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          Suivez en temps réel le chiffre d'affaires, le panier moyen et les meilleures ventes.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1 border border-stone-200/80">
          {PERIOD_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => onPeriodChange(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === item.id
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          title="Rafraîchir les données"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-3 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Imprimer</span>
        </button>
      </div>
    </div>
  );
};
