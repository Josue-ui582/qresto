'use client';

import React from 'react';
import { Store, Phone, MapPin, Coins } from 'lucide-react';
import { RestaurantSettingsData } from '../types';
import { getAccessibleForeground } from '@/lib/branding/color-contrast';

interface GeneralSectionProps {
  formData: RestaurantSettingsData;
  onChange: <K extends keyof RestaurantSettingsData>(field: K, value: RestaurantSettingsData[K]) => void;
}

export const GeneralSection: React.FC<GeneralSectionProps> = ({ formData, onChange }) => {
  const previewColor = formData.primaryColor || '#d97706';
  const previewBackground = formData.primaryColor || 'var(--qr-warning)';
  const previewForeground = getAccessibleForeground(previewColor) || 'var(--qr-text-inverse)';

  return (
    <div className="space-y-6">
      <div className="border-b border-ink-100 pb-4">
        <h3 className="text-lg font-bold text-ink-950">Informations Générales</h3>
        <p className="text-xs text-ink-500">Coordonnées publiques affichées sur les menus QR et reçus.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Nom du Restaurant</label>
          <div className="relative">
            <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Ex: Le Mamba Gourmand"
              className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Téléphone Officiel</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+221 77 000 00 00"
              className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-ink-100 pt-4">
          <label className="text-xs font-bold text-ink-700">
            URL du logo
            <input type="url" maxLength={2048} value={formData.logo}
              onChange={(event) => onChange('logo', event.target.value)}
              placeholder="https://exemple.com/logo.png"
              className="mt-1 w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-xs font-semibold" />
          </label>
          <label className="text-xs font-bold text-ink-700">
            URL de l’image de couverture
            <input type="url" maxLength={2048} value={formData.coverImage}
              onChange={(event) => onChange('coverImage', event.target.value)}
              placeholder="https://exemple.com/couverture.jpg"
              className="mt-1 w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-xs font-semibold" />
          </label>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-ink-700">
              Couleur principale
              <input type="color" value={previewColor}
                onChange={(event) => onChange('primaryColor', event.target.value)}
                className="mt-1 block h-11 w-16 cursor-pointer rounded-lg border border-ink-200 bg-paper-white p-1" />
            </label>
            <button type="button" onClick={() => onChange('primaryColor', '')}
              className="mt-5 text-xs font-semibold text-ink-600 underline">
              Réinitialiser
            </button>
            <span className="mt-5 rounded-lg px-3 py-2 text-xs font-bold"
              style={{ backgroundColor: previewBackground, color: previewForeground }}>
              Aperçu du contraste
            </span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Adresse Physique</label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Ex: Rue des Almadies, Dakar"
              className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Devise d'Affichage</label>
          <div className="relative">
            <Coins className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <select
              value={formData.currency}
              onChange={(e) => onChange('currency', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="FCFA">FCFA (CFA)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="MAD">MAD (Dh)</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-ink-700 mb-1.5">Slogan / Description courte</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Présentez brièvement votre établissement aux clients..."
            className="w-full p-3.5 bg-ink-50 border border-ink-200 rounded-2xl text-xs font-semibold text-ink-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};
