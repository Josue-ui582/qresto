'use client';

import React from 'react';
import { BarChart3, RefreshCw, Printer, Download } from 'lucide-react';
import { AnalyticsPeriod } from './types';

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  isLoading: boolean;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
}

const PERIOD_OPTIONS: Array<{ id: AnalyticsPeriod; label: string }> = [
  { id: 'day', label: 'Jour' },
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'custom', label: 'Personnalisée' },
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  period,
  onPeriodChange,
  onRefresh,
  onExportCsv,
  isLoading,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-paper-white p-6 sm:p-8 rounded-3xl border border-ink-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-700 mb-1">
          <BarChart3 className="w-4 h-4 text-brand-600" />
          <span>Tableau de Bord Analytics</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-ink-950">
          Rapports & Analytics
        </h2>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 font-normal">
          Consultez les commandes et ventes sur une période, dans le fuseau horaire configuré.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-ink-100 p-1 rounded-2xl flex items-center gap-1 border border-ink-200/80">
          {PERIOD_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => onPeriodChange(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === item.id
                  ? 'bg-paper-white text-ink-950 shadow-xs'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="analytics-start-date">Date de début</label>
            <input
              id="analytics-start-date"
              type="date"
              value={customStartDate}
              max={customEndDate}
              onChange={(event) => onCustomStartDateChange(event.target.value)}
              className="px-3 py-2 rounded-xl border border-ink-200 bg-paper-white text-xs text-ink-700"
            />
            <label className="sr-only" htmlFor="analytics-end-date">Date de fin</label>
            <input
              id="analytics-end-date"
              type="date"
              value={customEndDate}
              min={customStartDate}
              onChange={(event) => onCustomEndDateChange(event.target.value)}
              className="px-3 py-2 rounded-xl border border-ink-200 bg-paper-white text-xs text-ink-700"
            />
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-3 rounded-2xl bg-paper-white hover:bg-ink-50 border border-ink-200 text-ink-700 transition-colors cursor-pointer"
          title="Rafraîchir les données"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
        </button>

        <button
          onClick={onExportCsv}
          className="px-4 py-3 rounded-2xl bg-paper-white hover:bg-ink-50 border border-ink-200 text-ink-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exporter CSV</span>
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-3 rounded-2xl bg-ink-950 hover:bg-ink-800 text-paper-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4 text-brand-400" />
          <span>Imprimer</span>
        </button>
      </div>
    </div>
  );
};
