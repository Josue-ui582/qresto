import { TrackedOrder } from '@/types';
import React from 'react';

interface OrderTrackingSummaryProps {
  currentOrder: TrackedOrder;
}

export const OrderTrackingSummary: React.FC<OrderTrackingSummaryProps> = ({ currentOrder }) => {
  return (
    <div className="bg-paper-white p-6 rounded-3xl border border-ink-200 shadow-sm">
      <h3 className="text-sm font-bold text-ink-900 mb-4 pb-2 border-b border-ink-100">
        Détail des plats commandés
      </h3>
      <div className="divide-y divide-ink-100 mb-4">
        {currentOrder.items.map((item, index) => (
          <div key={index} className="py-2.5 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-ink-100 text-ink-800 text-xs font-bold flex items-center justify-center">
                {item.quantity}x
              </span>
              <span className="font-semibold text-ink-800">{item.name}</span>
            </div>
            <span className="font-bold text-ink-900">
              {(item.price * item.quantity).toLocaleString()} {currentOrder.currency}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-ink-100 flex justify-between text-base font-extrabold text-ink-900">
        <span>Total payé / à régler :</span>
        <span className="text-brand-600">{currentOrder.total.toLocaleString()} {currentOrder.currency}</span>
      </div>
    </div>
  );
};
