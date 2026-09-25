'use client';

import React from 'react';
import { Building2, RefreshCw, Save, Loader2 } from 'lucide-react';

interface HeaderProps {
  isLoading: boolean;
  isSaving: boolean;
  onRefresh: () => void;
  onSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLoading,
  isSaving,
  onRefresh,
  onSave,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Configuration globale</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          Paramètres du Restaurant
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
          Gérez la fiche de l'établissement, le fonctionnement des commandes et la sécurité.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <button
          onClick={onRefresh}
          disabled={isLoading || isSaving}
          className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          title="Rafraîchir les données"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>

        <button
          onClick={onSave}
          disabled={isSaving || isLoading}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
