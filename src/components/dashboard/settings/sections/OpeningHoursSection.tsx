'use client';

import React from 'react';
import { DaySchedule, OpeningHoursMap } from '../types';

interface OpeningHoursSectionProps {
  openingHours: OpeningHoursMap;
  onChange: <K extends keyof DaySchedule>(day: string, field: K, value: DaySchedule[K]) => void;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export const OpeningHoursSection: React.FC<OpeningHoursSectionProps> = ({ openingHours, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-100 pb-4">
        <h3 className="text-lg font-bold text-stone-950 font-display">Horaires d'Ouverture</h3>
        <p className="text-xs text-stone-500">
          Définissez les créneaux pendant lesquels les clients peuvent commander sur place.
        </p>
      </div>

      <div className="space-y-3">
        {Object.keys(DAY_LABELS).map((dayKey) => {
          const daySchedule = openingHours[dayKey] || { open: '10:00', close: '22:00', active: true };

          return (
            <div
              key={dayKey}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                daySchedule.active ? 'bg-stone-50/50 border-stone-200' : 'bg-stone-100/40 border-stone-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={daySchedule.active}
                  onChange={(e) => onChange(dayKey, 'active', e.target.checked)}
                  className="w-4 h-4 rounded-md accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-stone-900 min-w-22.5">{DAY_LABELS[dayKey]}</span>
              </div>

              {daySchedule.active ? (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <input
                    type="time"
                    value={daySchedule.open}
                    onChange={(e) => onChange(dayKey, 'open', e.target.value)}
                    className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
                  />
                  <span className="text-xs text-stone-400 font-bold">à</span>
                  <input
                    type="time"
                    value={daySchedule.close}
                    onChange={(e) => onChange(dayKey, 'close', e.target.value)}
                    className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
                  />
                </div>
              ) : (
                <span className="text-xs text-stone-400 italic font-semibold">Fermé ce jour</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
