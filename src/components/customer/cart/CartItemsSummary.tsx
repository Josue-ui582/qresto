import { FaIcon } from '@/components/common/Icon';
import { CartItem } from '@/context/CartContext';
import { OrderType } from '@/types';
import React from 'react';

interface CartItemsSummaryProps {
  cart: CartItem[];
  restaurantName?: string;
  cartTotal: number;
  deliveryFee: number;
  grandTotal: number;
  orderType: OrderType;
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
}

export const CartItemsSummary: React.FC<CartItemsSummaryProps> = ({
  cart,
  restaurantName,
  cartTotal,
  deliveryFee,
  grandTotal,
  orderType,
  onUpdateQuantity,
  onRemoveItem,
}) => (
  <div className="card p-5">
    <h3 className="text-base font-bold text-text mb-4 pb-3 border-b border-soft flex items-center justify-between">
      <span>Articles sélectionnés ({cart.length})</span>
      <span className="text-xs font-semibold text-brand">{restaurantName}</span>
    </h3>

    <div className="divide-y divide-stone-100">
      {cart.map(({ dish, quantity }) => (
        <div key={dish.id} className="py-3.5 flex items-center gap-3">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{dish.name}</h4>
            <p className="text-xs text-amber-600 font-semibold">
              {(dish.price * quantity).toLocaleString()} FCFA
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => onUpdateQuantity(dish.id, -1)}
                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="text-xs font-bold text-stone-900 px-1">{quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(dish.id, 1)}
                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemoveItem(dish.id)}
            className="text-stone-400 hover:text-red-500 p-1 text-xs transition-colors"
            title="Supprimer"
          >
            <FaIcon name="fa-solid fa-trash-can" />
          </button>
        </div>
      ))}
    </div>

    <div className="pt-4 mt-4 border-t border-stone-100 space-y-2 text-xs">
      <div className="flex justify-between text-stone-600">
        <span>Sous-total plats</span>
        <span className="font-semibold">{cartTotal.toLocaleString()} FCFA</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>Frais de livraison</span>
        <span className="font-semibold">
          {orderType === 'DELIVERY' ? `${deliveryFee.toLocaleString()} FCFA` : 'Gratuit (Sur place / À emporter)'}
        </span>
      </div>
      <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-100">
        <span>Total à régler</span>
        <span className="text-amber-600">{grandTotal.toLocaleString()} FCFA</span>
      </div>
    </div>
  </div>
);
