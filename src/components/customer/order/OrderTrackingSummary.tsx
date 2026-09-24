import { Order } from '@/types';
import React from 'react';

interface OrderTrackingSummaryProps {
  currentOrder: Order;
}

export const OrderTrackingSummary: React.FC<OrderTrackingSummaryProps> = ({ currentOrder }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
      <h3 className="text-sm font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">
        Détail des plats commandés
      </h3>
      <div className="divide-y divide-stone-100 mb-4">
        {currentOrder.items.map((item, index) => (
          <div key={index} className="py-2.5 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center">
                {item.quantity}x
              </span>
              <span className="font-semibold text-stone-800">{item.name}</span>
            </div>
            <span className="font-bold text-stone-900">
              {(item.price * item.quantity).toLocaleString()} FCFA
            </span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-stone-100 flex justify-between text-base font-extrabold text-stone-900">
        <span>Total payé / à régler :</span>
        <span className="text-amber-600">{currentOrder.total.toLocaleString()} FCFA</span>
      </div>
    </div>
  );
};
