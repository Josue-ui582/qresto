'use client';

import React from 'react';
import { Volume2, VolumeX, Mail } from 'lucide-react';
import { RestaurantSettingsData } from '../types';

interface NotificationsSectionProps {
  formData: RestaurantSettingsData;
  onChange: <K extends keyof RestaurantSettingsData>(field: K, value: RestaurantSettingsData[K]) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-ink-100 pb-4">
        <h3 className="text-lg font-bold text-ink-950">Alertes & Notifications Sonores</h3>
        <p className="text-xs text-ink-500">Soyez immédiatement informé des nouvelles commandes entrantes.</p>
      </div>

      <div className="space-y-4">
        {/* Alerte sonore */}
        <div className="p-4 rounded-2xl border border-ink-200 bg-ink-50/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
              {formData.enableSoundAlerts ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-ink-950">Signal sonore à chaque nouvelle commande</div>
              <div className="text-[0.6875rem] text-ink-500">Joue un son d'alerte fort sur la caisse / écran de cuisine.</div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={formData.enableSoundAlerts}
            onClick={() => onChange('enableSoundAlerts', !formData.enableSoundAlerts)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              formData.enableSoundAlerts ? 'bg-brand-500' : 'bg-ink-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-paper-white rounded-full transition-transform ${
                formData.enableSoundAlerts ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Email de réception */}
        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">
            Email de réception des récapitulatifs & alertes
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="email"
              value={formData.notificationEmail}
              onChange={(e) => onChange('notificationEmail', e.target.value)}
              placeholder="gerant@restaurant.com"
              className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
