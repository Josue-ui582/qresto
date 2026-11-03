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
    badgeBg: 'bg-info-100 text-info-700 border border-info-200',
    next: 'CONFIRMED',
    btnLabel: 'Confirmer',
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmées',
    badgeBg: 'bg-indigo-accent-100 text-indigo-accent-700 border border-indigo-accent-200',
    next: 'PREPARING',
    btnLabel: 'Lancer en cuisine',
  },
  {
    status: 'PREPARING',
    label: 'En préparation',
    badgeBg: 'bg-brand-100 text-brand-700 border border-brand-200',
    next: 'READY',
    btnLabel: 'Marquer Prête !',
  },
  {
    status: 'READY',
    label: 'Prêtes',
    badgeBg: 'bg-positive-100 text-positive-700 border border-positive-200',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'En livraison',
    badgeBg: 'bg-purple-accent-100 text-purple-accent-700 border border-purple-accent-200',
    next: 'DELIVERED',
    btnLabel: 'Livrée / Terminée',
  },
  {
    status: 'DELIVERED',
    label: 'Terminées / Servies',
    badgeBg: 'bg-ink-200 text-ink-700 border border-ink-300',
  },
  {
    status: 'CANCELLED',
    label: 'Annulées',
    badgeBg: 'bg-negative-100 text-negative-700 border border-negative-200',
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
    <div className="space-y-6 max-w-[100rem] mx-auto">
      <div>
        <h1 className="text-2xl font-black text-ink-900">Gestion des Commandes</h1>
        <p className="text-xs text-ink-500 mt-1">
          Suivi en temps réel des commandes pour <strong className="text-ink-800">{restaurantName}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-ink-100/70 p-3 rounded-2xl flex flex-col min-h-150 border border-ink-200/60"
            >
              {/* Entête */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-ink-800 truncate">{col.label}</span>
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
                  <div className="h-32 border border-dashed border-ink-300 rounded-2xl flex items-center justify-center text-xs text-ink-400 font-medium">
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
