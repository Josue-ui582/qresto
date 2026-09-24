import React from 'react';
import { Order, OrderStatus } from '../../types';

interface KanbanColumnConfig {
  status: OrderStatus;
  label: string;
  badgeBg: string;
  next?: OrderStatus;
  btnLabel?: string;
}

interface OrdersTabProps {
  restaurantName: string;
  orders: Order[];
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    status: 'NEW',
    label: 'Nouvelles',
    badgeBg: 'bg-blue-100 text-blue-700',
    next: 'CONFIRMED',
    btnLabel: 'Confirmer',
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmées',
    badgeBg: 'bg-indigo-100 text-indigo-700',
    next: 'PREPARING',
    btnLabel: 'En cuisine',
  },
  {
    status: 'PREPARING',
    label: 'En préparation',
    badgeBg: 'bg-amber-100 text-amber-700',
    next: 'READY',
    btnLabel: 'Prête !',
  },
  {
    status: 'READY',
    label: 'Prêtes',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    next: 'DELIVERED',
    btnLabel: 'Servie',
  },
  {
    status: 'DELIVERED',
    label: 'Livrées / Servies',
    badgeBg: 'bg-stone-100 text-stone-700',
  },
  {
    status: 'CANCELLED',
    label: 'Annulées',
    badgeBg: 'bg-red-100 text-red-700',
  },
];

export const OrdersTab: React.FC<OrdersTabProps> = ({
  restaurantName,
  orders,
  onAdvanceOrderStatus,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="heading-lg">Commandes</h1>
        <p className="text-sm text-muted mt-1">
          Suivez et gérez les commandes de {restaurantName} en temps réel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          return (
            <div key={col.status} className="bg-stone-100/70 p-3 rounded-2xl flex flex-col min-h-125">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-stone-700">{col.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${col.badgeBg}`}>
                  {colOrders.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {colOrders.map((ord) => (
                  <div key={ord.id} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-stone-900">
                        #{ord.id.slice(-4).toUpperCase()}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500">
                        {ord.total.toLocaleString()} F
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 font-medium truncate">
                      {ord.customerName || 'Client anonyme'}
                    </p>

                    {col.next && col.btnLabel && (
                      <button
                        type="button"
                        onClick={() => onAdvanceOrderStatus(ord.id, col.next!)}
                        className="w-full mt-2 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-all"
                      >
                        {col.btnLabel}
                      </button>
                    )}
                  </div>
                ))}

                {colOrders.length === 0 && (
                  <div className="h-24 border border-dashed border-stone-300 rounded-xl flex items-center justify-center text-[11px] text-stone-400">
                    Aucune commande
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
