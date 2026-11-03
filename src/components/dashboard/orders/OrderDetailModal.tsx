// src/components/dashboard/OrderDetailModal.tsx
import React from 'react';
import { Order, OrderItem, OrderStatus } from '@/types/index';
import { Icon } from '@/components/common/Icon';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirmOrder: (orderId: string, nextStatus: OrderStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onConfirmOrder,
}) => {
  if (!order) return null;

  const isNew = order.status === 'NEW';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-paper-white w-full max-w-2xl rounded-3xl shadow-2xl border border-ink-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Entête du Modal */}
        <div className="p-5 border-b border-ink-100 flex justify-between items-center bg-ink-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-ink-900">
                #{order.trackingCode || order.id.slice(-6).toUpperCase()}
              </span>
              {isNew && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-info-100 text-info-700 border border-info-200">
                  Nouvelle commande
                </span>
              )}
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              Reçue le {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-600 flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Corps du Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section Infos Client & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-ink-50 p-4 rounded-2xl border border-ink-100">
            <div>
              <span className="text-[0.6875rem] font-bold text-ink-400 uppercase tracking-wider block mb-1">
                Client
              </span>
              <p className="font-extrabold text-ink-900 text-sm">{order.customerName || 'Client Anonyme'}</p>
              {order.customerPhone && (
                <p className="text-xs text-ink-600 font-medium flex items-center gap-1.5 mt-1">
                  📞 {order.customerPhone}
                </p>
              )}
            </div>

            <div>
              <span className="text-[0.6875rem] font-bold text-ink-400 uppercase tracking-wider block mb-1">
                Type de Commande
              </span>
              <p className="font-extrabold text-ink-900 text-sm">
                {order.type === 'DINE_IN' && `🍽️ Sur place (Table #${order.tableNumber || 'N/A'})`}
                {order.type === 'DELIVERY' && '🛵 Livraison à domicile'}
                {order.type === 'PICKUP' && '🛍️ À emporter'}
              </p>
              {order.customerAddress && order.type === 'DELIVERY' && (
                <p className="text-xs text-info-800 bg-info-50/80 p-2 rounded-xl mt-1.5 border border-info-100 font-medium">
                  📍 {order.customerAddress}
                </p>
              )}
            </div>
          </div>

          {/* Note spéciale client */}
          {order.customerNotes && (
            <div className="bg-brand-50 border border-brand-200/80 p-3.5 rounded-2xl text-xs text-brand-900">
              <span className="font-bold block mb-0.5">💬 Instructions du client :</span>
              <p className="italic">"{order.customerNotes}"</p>
            </div>
          )}

          {/* Liste des Plats Commandés avec Images */}
          <div>
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">
              Articles commandés ({order.items?.length || 0})
            </h3>

            <div className="space-y-3">
              {order.items?.map((item: OrderItem & { id?: string }, idx: number) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-ink-100 bg-paper-white shadow-2xs hover:border-ink-200 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Image du plat ou Placeholder */}
                    <div className="w-14 h-14 rounded-xl bg-ink-100 overflow-hidden shrink-0 border border-ink-200/60 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🍲</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-ink-900 text-sm">{item.name}</h4>
                      {item.notes && (
                        <p className="text-[0.6875rem] text-brand-700 italic">Note : {item.notes}</p>
                      )}
                      <p className="text-xs text-ink-500 font-medium mt-0.5">
                        Prix unitaire : {(item.price || 0).toLocaleString()} F
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black bg-ink-100 text-ink-800 px-2.5 py-1 rounded-lg block mb-1">
                      x{item.quantity}
                    </span>
                    <span className="text-xs font-black text-ink-900">
                      {((item.price || 0) * (item.quantity || 1)).toLocaleString()} F
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Résumé Financier */}
          <div className="border-t border-ink-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-ink-500">
              <span>Sous-total</span>
              <span className="font-semibold">{(order.subtotal || 0).toLocaleString()} F</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-ink-500">
                <span>Frais de livraison</span>
                <span className="font-semibold">{order.deliveryFee.toLocaleString()} F</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-ink-900 pt-2 border-t border-ink-200">
              <span>Total Général</span>
              <span className="text-positive-700 font-black text-base">
                {(order.total || 0).toLocaleString()} F
              </span>
            </div>
          </div>
        </div>

        {/* Pied de Modal (Actions) */}
        <div className="p-4 bg-ink-50/80 border-t border-ink-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-ink-300 font-bold text-xs text-ink-700 hover:bg-ink-100 transition-all cursor-pointer"
          >
            Fermer
          </button>

          {isNew && (
            <button
              type="button"
              onClick={() => {
                onConfirmOrder(order.id, 'CONFIRMED');
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-paper-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Accepter & Confirmer la commande</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
