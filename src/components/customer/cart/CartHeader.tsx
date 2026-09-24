import React from 'react';

interface CartHeaderProps {
  restaurantName?: string;
  restaurantCity?: string;
  onClearCart: () => void;
}

export const CartHeader: React.FC<CartHeaderProps> = ({
  restaurantName,
  restaurantCity,
  onClearCart,
}) => (
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Finaliser la commande</h1>
      {restaurantName && (
        <p className="text-sm text-stone-500 mt-1">
          Commande auprès de : <strong className="text-stone-800">{restaurantName}</strong> ({restaurantCity})
        </p>
      )}
    </div>
    <button
      type="button"
      onClick={onClearCart}
      className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      Vider le panier
    </button>
  </div>
);
