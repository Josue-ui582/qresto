'use client';

import React from 'react';
import { QrCode, Plus } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  onOpenCreateModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onOpenCreateModal }) => {
  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <QrCode className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-stone-900 font-display">
        {searchQuery ? 'Aucune table trouvée' : 'Aucune table configurée'}
      </h3>
      <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed font-normal">
        {searchQuery
          ? `Aucune table ne correspond à "${searchQuery}".`
          : 'Créez votre première table pour imprimer son QR Code et permettre à vos clients de commander.'}
      </p>

      {!searchQuery && (
        <button
          onClick={onOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer la Table #1</span>
        </button>
      )}
    </div>
  );
};
