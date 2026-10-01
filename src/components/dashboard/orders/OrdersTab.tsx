// src/components/dashboard/OrdersTab.tsx
import React, { useState } from 'react';
import { Order, OrderStatus } from '@/types/index';
import { OrderCard } from './OrderCard';
import { OrderDetailModal } from './OrderDetailModal';

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
    badgeBg: 'bg-blue-100 text-blue-700 border border-blue-200',
    next: 'CONFIRMED',
    btnLabel: 'Confirmer',
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmées',
    badgeBg: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    next: 'PREPARING',
    btnLabel: 'Lancer en cuisine',
  },
  {
    status: 'PREPARING',
    label: 'En préparation',
    badgeBg: 'bg-amber-100 text-amber-700 border border-amber-200',
    next: 'READY',
    btnLabel: 'Marquer Prête !',
  },
  {
    status: 'READY',
    label: 'Prêtes',
    badgeBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'En livraison',
    badgeBg: 'bg-purple-100 text-purple-700 border border-purple-200',
    next: 'DELIVERED',
    btnLabel: 'Livrée / Terminée',
  },
  {
    status: 'DELIVERED',
    label: 'Terminées / Servies',
    badgeBg: 'bg-stone-200 text-stone-700 border border-stone-300',
  },
  {
    status: 'CANCELLED',
    label: 'Annulées',
    badgeBg: 'bg-red-100 text-red-700 border border-red-200',
  },
];

export const OrdersTab: React.FC<OrdersTabProps> = ({
  restaurantName,
  orders = [],
  onAdvanceOrderStatus,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getNextStatusForReady = (order: Order): { nextStatus: OrderStatus; label: string } => {
    if (order.type === 'DELIVERY') {
      return { nextStatus: 'OUT_FOR_DELIVERY', label: 'Envoyer en livraison' };
    }
    return { nextStatus: 'DELIVERED', label: 'Servie / Terminée' };
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Gestion des Commandes</h1>
        <p className="text-xs text-stone-500 mt-1">
          Suivi en temps réel des commandes pour <strong className="text-stone-800">{restaurantName}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-stone-100/70 p-3 rounded-2xl flex flex-col min-h-150 border border-stone-200/60"
            >
              {/* Entête */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-stone-800 truncate">{col.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${col.badgeBg}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Liste des cartes */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colOrders.map((ord) => {
                  const isReadyCol = col.status === 'READY';
                  const readyAction = isReadyCol ? getNextStatusForReady(ord) : null;
                  const nextStatus = isReadyCol ? readyAction?.nextStatus : col.next;
                  const btnLabel = isReadyCol ? readyAction?.label : col.btnLabel;

                  return (
                    <OrderCard
                      key={ord.id}
                      order={ord}
                      nextStatus={nextStatus}
                      btnLabel={btnLabel}
                      onAdvanceOrderStatus={onAdvanceOrderStatus}
                      onOpenDetails={(order) => setSelectedOrder(order)}
                    />
                  );
                })}

                {colOrders.length === 0 && (
                  <div className="h-32 border border-dashed border-stone-300 rounded-2xl flex items-center justify-center text-xs text-stone-400 font-medium">
                    Aucune commande
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de détail de commande */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onConfirmOrder={onAdvanceOrderStatus}
      />
    </div>
  );
};
