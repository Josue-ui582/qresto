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
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300/80 text-[11px] font-bold">
            🍽️ Sur place {tableNumber ? `— Table #${tableNumber}` : ''}
          </span>
        );
      case 'DELIVERY':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-300/80 text-[11px] font-bold">
            🛵 Livraison
          </span>
        );
      case 'TAKEAWAY':
      case 'PICKUP':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-300/80 text-[11px] font-bold">
            🛍️ À emporter
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-300/80 text-[11px] font-bold">
            {type}
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(order)}
      className={`bg-white p-4 rounded-2xl border shadow-xs space-y-3 transition-all cursor-pointer relative group hover:shadow-md ${
        isNew
          ? 'border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-400'
          : 'border-stone-200/80 hover:border-amber-400/80'
      }`}
    >
      {/* Code, Heure & Total */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-black text-stone-900 font-mono tracking-tight block">
            #{order.trackingCode || (order.id ? order.id.slice(-4).toUpperCase() : '----')}
          </span>
          <span className="text-[11px] text-stone-400 font-medium">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </span>
        </div>
        <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80">
          {(order.total || 0).toLocaleString()} F
        </span>
      </div>

      {/* Type de commande */}
      <div>{renderTypeBadge(order.type, order.tableNumber)}</div>

      {/* Client */}
      <div className="text-xs border-t border-stone-100 pt-2.5">
        <p className="font-extrabold text-stone-900 truncate text-sm">
          {order.customerName || 'Client anonyme'}
        </p>
        {order.customerPhone && (
          <p className="text-xs text-stone-500 font-medium mt-0.5">{order.customerPhone}</p>
        )}
      </div>

      {/* Aperçu des plats */}
      {order.items && order.items.length > 0 && (
        <div className="bg-stone-50/80 p-2.5 rounded-xl space-y-1.5 text-xs border border-stone-100">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={item.dishId || `item-${idx}`} className="flex justify-between text-stone-700">
              <span className="truncate pr-1">
                <strong className="text-stone-900">{item.quantity}x</strong> {item.name}
              </span>
              <span className="text-stone-400 text-[10px] shrink-0">
                {((item.price || 0) * (item.quantity || 1)).toLocaleString()} F
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-[10px] text-stone-400 italic pt-0.5">
              + {order.items.length - 3} autre(s) plat(s)...
            </p>
          )}
        </div>
      )}

      {/* Indicateur pour ouvrir les détails */}
      <div className="flex items-center justify-between text-[11px] text-amber-600 font-bold pt-1">
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
          className="w-full py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 active:bg-black text-amber-400 text-xs font-black transition-all shadow-xs cursor-pointer mt-1"
        >
          {btnLabel} →
        </button>
      )}
    </div>
  );
};
