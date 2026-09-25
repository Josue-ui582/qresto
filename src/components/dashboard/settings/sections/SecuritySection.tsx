'use client';

import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface SecuritySectionProps {
  onOpenSettings?: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ onOpenSettings }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-100 pb-4">
        <h3 className="text-lg font-bold text-stone-950 font-display">Sécurité & Accès</h3>
        <p className="text-xs text-stone-500">Protégez le compte administrateur du restaurant.</p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block mb-0.5">Accès Administrateur Protégé</strong>
          Pour modifier le mot de passe principal ou réinitialiser les identifiants de votre équipe, utilisez le
          sous-menu de gestion des rôles.
        </div>
      </div>

      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="px-4 py-3 rounded-2xl bg-stone-950 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Ouvrir les options avancées de sécurité</span>
        </button>
      )}
    </div>
  );
};
