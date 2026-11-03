import { Icon } from '@/components/common/Icon';
import React from 'react';

interface EmptyCartProps {
  onExplore: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onExplore }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center text-3xl mb-4">
      <Icon name="basket-shopping" />
    </div>
    <h2 className="text-2xl font-bold text-ink-900 mb-2">Votre panier est vide</h2>
    <p className="text-ink-500 text-sm max-w-sm mb-6">
      Découvrez les meilleurs restaurants de Cotonou et ajoutez vos spécialités préférées !
    </p>
    <button
      type="button"
      onClick={onExplore}
      className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-paper-white font-bold text-sm shadow-md transition-colors"
    >
      Explorer les restaurants
    </button>
  </div>
);
