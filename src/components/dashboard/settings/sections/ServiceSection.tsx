'use client';

import React from 'react';
import { Percent, Wifi, Lock } from 'lucide-react';
import { RestaurantSettingsData } from '../types';

interface ServiceSectionProps {
  formData: RestaurantSettingsData;
  onChange: <K extends keyof RestaurantSettingsData>(field: K, value: RestaurantSettingsData[K]) => void;
}

export const ServiceSection: React.FC<ServiceSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-ink-100 pb-4">
        <h3 className="text-lg font-bold text-ink-950">Service en Salle & QR Code</h3>
        <p className="text-xs text-ink-500">
          Ajustez les modalités de prise de commande à table et les services additionnels.
        </p>
      </div>

      <div className="space-y-4">
        {/* Toggle Commandes QR */}
        <div className="p-4 rounded-2xl border border-ink-200 bg-ink-50/50 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-ink-950">Autoriser les commandes directes via QR Code</div>
            <div className="text-[0.6875rem] text-ink-500 mt-0.5">
              Les clients scannent la table et envoient leur commande directement en cuisine.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.enableQrOrders}
            onClick={() => onChange('enableQrOrders', !formData.enableQrOrders)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              formData.enableQrOrders ? 'bg-brand-500' : 'bg-ink-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-paper-white rounded-full transition-transform ${
                formData.enableQrOrders ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Taxe / Service */}
        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Frais de service / Taxe (%)</label>
          <div className="relative">
            <Percent className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="number"
              min={0}
              max={30}
              value={formData.serviceFeePercent}
              onChange={(e) => onChange('serviceFeePercent', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Réseau Wi-Fi Client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">Nom du Wi-Fi Client (SSID)</label>
            <div className="relative">
              <Wifi className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={formData.wifiName}
                onChange={(e) => onChange('wifiName', e.target.value)}
                placeholder="Ex: Resto_Guest_WiFi"
                className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">Mot de passe Wi-Fi Client</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={formData.wifiPassword}
                onChange={(e) => onChange('wifiPassword', e.target.value)}
                placeholder="Mot de passe"
                className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
