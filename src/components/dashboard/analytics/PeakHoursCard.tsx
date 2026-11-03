'use client';

import React from 'react';
import { Clock3 } from 'lucide-react';
import { AnalyticsStats } from './types';

interface PeakHoursCardProps {
  peakHours: AnalyticsStats['peakHours'];
}

export const PeakHoursCard: React.FC<PeakHoursCardProps> = ({ peakHours }) => {
  const maxOrders = Math.max(1, ...peakHours.map(({ count }) => count));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
          <Clock3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-950">Heures de pointe</h3>
          <p className="text-xs text-stone-500">Commandes par heure locale.</p>
        </div>
      </div>
      {peakHours.length ? (
        <div className="space-y-3">
          {peakHours.slice(0, 6).map(({ hour, count }) => (
            <div key={hour} className="grid grid-cols-[48px_1fr_32px] items-center gap-3">
              <span className="text-xs font-semibold text-stone-600">{String(hour).padStart(2, '0')} h</span>
              <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.round((count / maxOrders) * 100)}%` }}
                />
              </div>
              <span className="text-right text-xs font-bold text-stone-800">{count}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-stone-400 text-xs">Aucune commande sur cette période.</p>
      )}
    </div>
  );
};
