import { FaIcon } from '@/components/common/Icon';
import { CartItem } from '@/context/CartContext';
import { OrderType } from '@/types';
import React from 'react';
import { getSelectedDishOptionTotal } from '@/lib/orders/order-pricing';

interface CartItemsSummaryProps {
  cart: CartItem[];
  restaurantName?: string;
  currency: string;
  cartTotal: number;
  deliveryFee: number;
  couponDiscount: number;
  grandTotal: number;
  orderType: OrderType;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
}

export const CartItemsSummary: React.FC<CartItemsSummaryProps> = ({
  cart,
  restaurantName,
  currency,
  cartTotal,
  deliveryFee,
  couponDiscount,
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
      {cart.map(({ cartItemId, dish, quantity, optionIds }) => {
        const selectedOptions = dish.optionGroups?.flatMap((group) => group.options)
          .filter((option) => optionIds.includes(option.id)) ?? [];
        const unitPrice = dish.price + getSelectedDishOptionTotal(dish.optionGroups ?? [], optionIds);
        return (
        <div key={cartItemId} className="py-3.5 flex items-center gap-3">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{dish.name}</h4>
            <p className="text-xs text-amber-600 font-semibold">
              {(unitPrice * quantity).toLocaleString()} {currency}
            </p>
            {selectedOptions.length > 0 && (
              <p className="text-[11px] text-stone-500">
                {selectedOptions.map((option) => option.name).join(', ')}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => onUpdateQuantity(cartItemId, -1)}
                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="text-xs font-bold text-stone-900 px-1">{quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(cartItemId, 1)}
                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemoveItem(cartItemId)}
            className="text-stone-400 hover:text-red-500 p-1 text-xs transition-colors"
            title="Supprimer"
          >
            <FaIcon name="fa-solid fa-trash-can" />
          </button>
        </div>
        );
      })}
    </div>

    <div className="pt-4 mt-4 border-t border-stone-100 space-y-2 text-xs">
      <div className="flex justify-between text-stone-600">
        <span>Sous-total plats</span>
        <span className="font-semibold">{cartTotal.toLocaleString()} {currency}</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>Frais de livraison</span>
        <span className="font-semibold">
          {orderType === 'DELIVERY' ? `${deliveryFee.toLocaleString()} ${currency}` : 'Gratuit (Sur place / À emporter)'}
        </span>
      </div>
      {couponDiscount > 0 && (
        <div className="flex justify-between text-emerald-700">
          <span>Remise promotionnelle</span>
          <span className="font-semibold">−{couponDiscount.toLocaleString()} {currency}</span>
        </div>
      )}
      <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-100">
        <span>Total à régler</span>
        <span className="text-amber-600">{grandTotal.toLocaleString()} {currency}</span>
      </div>
    </div>
  </div>
);
