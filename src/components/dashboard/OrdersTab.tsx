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
    // Le statut suivant et le libellé sont gérés de façon dynamique dans le composant
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
  // Correction 1 : Prise en compte de TAKEAWAY & PICKUP + formatage sécurisé
  const renderTypeBadge = (type: string, tableNumber?: string | number | null) => {
    switch (type) {
      case 'DINE_IN':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold">
            🍽️ Sur place {tableNumber ? `— Table #${tableNumber}` : ''}
          </span>
        );
      case 'DELIVERY':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-300 text-[10px] font-bold">
            🛵 Livraison
          </span>
        );
      case 'TAKEAWAY':
      case 'PICKUP':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-300 text-[10px] font-bold">
            🛍️ À emporter
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-300 text-[10px] font-bold">
            {type}
          </span>
        );
    }
  };

  // Calcule dynamiquement la cible du bouton pour la colonne READY
  const getNextStatusForReady = (order: Order): { nextStatus: OrderStatus; label: string } => {
    if (order.type === 'DELIVERY') {
      return { nextStatus: 'OUT_FOR_DELIVERY', label: 'Envoyer en livraison' };
    }
    return { nextStatus: 'DELIVERED', label: 'Servie / Terminée' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            <div key={col.status} className="bg-stone-100/80 p-2.5 rounded-2xl flex flex-col min-h-125 border border-stone-200/60">
              {/* Entête de colonne */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-stone-800 truncate">{col.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${col.badgeBg}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cartes de commande */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colOrders.map((ord) => {
                  // Détermination du bouton pour READY
                  const isReadyCol = col.status === 'READY';
                  const readyAction = isReadyCol ? getNextStatusForReady(ord) : null;
                  const nextStatus = isReadyCol ? readyAction?.nextStatus : col.next;
                  const btnLabel = isReadyCol ? readyAction?.label : col.btnLabel;

                  return (
                    <div
                      key={ord.id}
                      className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm space-y-2 hover:border-amber-400/80 transition-all"
                    >
                      {/* Header : Code & Heure & Total */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-black text-stone-900 block font-mono">
                            #{ord.trackingCode || (ord.id ? ord.id.slice(-4).toUpperCase() : '----')}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {ord.createdAt
                              ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '--:--'}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {(ord.total || 0).toLocaleString()} F
                        </span>
                      </div>

                      {/* Type de commande */}
                      <div className="flex items-center gap-1 pt-1">
                        {renderTypeBadge(ord.type, ord.tableNumber)}
                      </div>

                      {/* Infos Client */}
                      <div className="text-xs border-t border-stone-100 pt-2">
                        <p className="font-bold text-stone-900 truncate">
                          {ord.customerName || 'Client anonyme'}
                        </p>
                        {ord.customerPhone && (
                          <p className="text-[10px] text-stone-500 font-medium">{ord.customerPhone}</p>
                        )}
                        {ord.customerAddress && ord.type === 'DELIVERY' && (
                          <p className="text-[10px] text-blue-700 bg-blue-50/50 p-1 rounded mt-1 line-clamp-2 border border-blue-100">
                            📍 {ord.customerAddress}
                          </p>
                        )}
                      </div>

                      {/* Articles de la commande */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="bg-stone-50 p-2 rounded-lg space-y-1 text-[11px] border border-stone-100">
                          {ord.items.map((item, idx) => (
                            <div key={item.dishId || `item-${idx}`} className="flex justify-between text-stone-700">
                              <span className="truncate pr-1">
                                <strong className="text-stone-900">{item.quantity}x</strong> {item.name}
                              </span>
                              <span className="text-stone-500 shrink-0 font-medium">
                                {((item.price || 0) * (item.quantity || 1)).toLocaleString()} F
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes client */}
                      {ord.customerNotes && (
                        <p className="text-[10px] italic bg-amber-50 text-amber-900 p-1.5 rounded border border-amber-200/80">
                          💬 "{ord.customerNotes}"
                        </p>
                      )}

                      {/* Mode de paiement */}
                      <div className="flex justify-between items-center text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                        <span className="font-medium">{ord.paymentMethod ? ord.paymentMethod.replace('_', ' ') : 'CASH'}</span>
                        <span
                          className={
                            ord.paymentStatus === 'PAID'
                              ? 'text-emerald-700 font-extrabold bg-emerald-50 px-1 rounded'
                              : 'text-amber-700 font-extrabold bg-amber-50 px-1 rounded'
                          }
                        >
                          {ord.paymentStatus === 'PAID' ? 'PAYÉ' : 'À PAYER'}
                        </span>
                      </div>

                      {/* Bouton d'action */}
                      {nextStatus && btnLabel && (
                        <button
                          type="button"
                          onClick={() => onAdvanceOrderStatus(ord.id, nextStatus)}
                          className="w-full mt-2 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-400 text-[11px] font-black transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                        >
                          {btnLabel} →
                        </button>
                      )}
                    </div>
                  );
                })}

                {colOrders.length === 0 && (
                  <div className="h-28 border border-dashed border-stone-300 rounded-xl flex items-center justify-center text-[11px] text-stone-400 font-medium">
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
