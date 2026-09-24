import { FaIcon } from '@/components/common/Icon';
import React from 'react';

interface EmptyCartProps {
  onExplore: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onExplore }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-3xl mb-4">
      <FaIcon name="fa-solid fa-basket-shopping" />
    </div>
    <h2 className="text-2xl font-bold text-stone-900 mb-2">Votre panier est vide</h2>
    <p className="text-stone-500 text-sm max-w-sm mb-6">
      Découvrez les meilleurs restaurants de Cotonou et ajoutez vos spécialités préférées !
    </p>
    <button
      type="button"
      onClick={onExplore}
      className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors"
    >
      Explorer les restaurants
    </button>
  </div>
);
