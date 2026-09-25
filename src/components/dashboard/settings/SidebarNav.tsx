'use client';

import React from 'react';
import { Store, Clock, QrCode, Bell, Shield } from 'lucide-react';
import { SettingsSection } from './types';

interface SidebarNavProps {
  activeTab: SettingsSection;
  onTabChange: (tab: SettingsSection) => void;
}

const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'general', label: 'Etablissement', icon: Store },
  { id: 'opening', label: 'Horaires', icon: Clock },
  { id: 'service', label: 'Service & QR', icon: QrCode },
  { id: 'notifications', label: 'Alertes & Son', icon: Bell },
  { id: 'security', label: 'Sécurité & Accès', icon: Shield },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="lg:col-span-3 bg-white p-3 rounded-3xl border border-stone-200/80 shadow-xs space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-stone-950 text-amber-400 shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
