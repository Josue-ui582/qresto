// src/components/dashboard/OrderCard.tsx
import { Order, OrderStatus } from '@/types';
import React from 'react';

interface OrderCardProps {
  order: Order;
  nextStatus?: OrderStatus;
  btnLabel?: string;
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenDetails: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  nextStatus,
  btnLabel,
  onAdvanceOrderStatus,
  onOpenDetails,
}) => {
  const isNew = order.status === 'NEW';

  const renderTypeBadge = (type: string, tableNumber?: string | number | null) => {
    switch (type) {
      case 'DINE_IN':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-900 border border-brand-300/80 text-[0.6875rem] font-bold">
            🍽️ Sur place {tableNumber ? `— Table #${tableNumber}` : ''}
          </span>
        );
      case 'DELIVERY':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-info-50 text-info-900 border border-info-300/80 text-[0.6875rem] font-bold">
            🛵 Livraison
          </span>
        );
      case 'TAKEAWAY':
      case 'PICKUP':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-purple-accent-50 text-purple-accent-900 border border-purple-accent-300/80 text-[0.6875rem] font-bold">
            🛍️ À emporter
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-ink-100 text-ink-700 border border-ink-300/80 text-[0.6875rem] font-bold">
            {type}
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(order)}
      className={`bg-paper-white p-4 rounded-2xl border shadow-xs space-y-3 transition-all cursor-pointer relative group hover:shadow-md ${
        isNew
          ? 'border-info-300 ring-2 ring-info-500/10 hover:border-info-400'
          : 'border-ink-200/80 hover:border-brand-400/80'
      }`}
    >
      {/* Code, Heure & Total */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-black text-ink-900 tracking-tight block">
            #{order.trackingCode || (order.id ? order.id.slice(-4).toUpperCase() : '----')}
          </span>
          <span className="text-[0.6875rem] text-ink-400 font-medium">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </span>
        </div>
        <span className="text-xs font-black text-positive-800 bg-positive-50 px-2 py-1 rounded-lg border border-positive-200/80">
          {(order.total || 0).toLocaleString()} F
        </span>
      </div>

      {/* Type de commande */}
      <div>{renderTypeBadge(order.type, order.tableNumber)}</div>

      {/* Client */}
      <div className="text-xs border-t border-ink-100 pt-2.5">
        <p className="font-extrabold text-ink-900 truncate text-sm">
          {order.customerName || 'Client anonyme'}
        </p>
        {order.customerPhone && (
          <p className="text-xs text-ink-500 font-medium mt-0.5">{order.customerPhone}</p>
        )}
      </div>

      {/* Aperçu des plats */}
      {order.items && order.items.length > 0 && (
        <div className="bg-ink-50/80 p-2.5 rounded-xl space-y-1.5 text-xs border border-ink-100">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={item.dishId || `item-${idx}`} className="flex justify-between text-ink-700">
              <span className="truncate pr-1">
                <strong className="text-ink-900">{item.quantity}x</strong> {item.name}
              </span>
              <span className="text-ink-400 text-[0.625rem] shrink-0">
                {((item.price || 0) * (item.quantity || 1)).toLocaleString()} F
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-[0.625rem] text-ink-400 italic pt-0.5">
              + {order.items.length - 3} autre(s) plat(s)...
            </p>
          )}
        </div>
      )}

      {/* Indicateur pour ouvrir les détails */}
      <div className="flex items-center justify-between text-[0.6875rem] text-brand-600 font-bold pt-1">
        <span>👁️ Cliquez pour voir tout</span>
      </div>

      {/* Bouton d'action direct */}
      {nextStatus && btnLabel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Évite d'ouvrir le modal lors du clic direct sur le bouton
            onAdvanceOrderStatus(order.id, nextStatus);
          }}
          className="w-full py-2.5 rounded-xl bg-ink-950 hover:bg-ink-800 active:bg-ink-black text-brand-400 text-xs font-black transition-all shadow-xs cursor-pointer mt-1"
        >
          {btnLabel} →
        </button>
      )}
    </div>
  );
};
