'use client';

import React from 'react';
import { PieChart } from 'lucide-react';
import { AnalyticsStats } from './types';

interface OrderStatusCardProps {
  ordersByStatus?: AnalyticsStats['ordersByStatus'];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PREPARING: 'En cuisine',
  DELIVERED: 'Livrée / Servie',
  CANCELLED: 'Annulée',
};

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ ordersByStatus = [] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-950 font-display">
              État des Commandes
            </h3>
            <p className="text-xs text-stone-500">Distribution par statut actuel.</p>
          </div>
        </div>

        <div className="space-y-3">
          {ordersByStatus.length > 0 ? (
            ordersByStatus.map((st) => (
              <div
                key={st.status}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-between"
              >
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {STATUS_LABELS[st.status] || st.status}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-stone-200 font-black text-xs text-stone-900 shadow-2xs">
                  {st.count}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-stone-400 text-xs">
              Aucune commande à afficher.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] text-stone-400 text-center font-medium">
        Mise à jour en temps réel à chaque nouvelle commande.
      </div>
    </div>
  );
};
