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
      <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">Finaliser la commande</h1>
      {restaurantName && (
        <p className="text-sm text-ink-500 mt-1">
          Commande auprès de : <strong className="text-ink-800">{restaurantName}</strong> ({restaurantCity})
        </p>
      )}
    </div>
    <button
      type="button"
      onClick={onClearCart}
      className="text-xs font-semibold text-negative-600 hover:text-negative-700 bg-negative-50 hover:bg-negative-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      Vider le panier
    </button>
  </div>
);
