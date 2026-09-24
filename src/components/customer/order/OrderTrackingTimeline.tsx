import { FaIcon } from '@/components/common/Icon';
import { Order, OrderStatus } from '@/types';
import React from 'react';

interface OrderTrackingTimelineProps {
  currentOrder: Order;
  handleManualRefresh: () => void;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ currentOrder, handleManualRefresh }) => {
  const steps: { status: OrderStatus; label: string; icon: string; desc: string }[] = [
    { status: 'NEW', label: 'Commande Reçue', icon: 'fa-solid fa-receipt', desc: 'Enregistrée sur le terminal' },
    { status: 'CONFIRMED', label: 'Confirmée', icon: 'fa-solid fa-circle-check', desc: 'Validée par l\'équipe' },
    { status: 'PREPARING', label: 'En Préparation', icon: 'fa-solid fa-fire-burner', desc: 'Cuisson et dressage' },
    { status: 'READY', label: 'Commande Prête', icon: 'fa-solid fa-bell-concierge', desc: 'Votre plat est prêt !' },
    { status: 'OUT_FOR_DELIVERY', label: 'En Livraison / Service', icon: 'fa-solid fa-motorcycle', desc: 'Le coursier est en route' },
    { status: 'DELIVERED', label: 'Livrée / Servie', icon: 'fa-solid fa-utensils', desc: 'Bon appétit !' },
  ];

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'NEW': return 0;
      case 'CONFIRMED': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentOrder.status);

  return (
    <>
      {/* Alertes de statut */}
      {currentOrder.status === 'READY' && (
        <div className="p-5 rounded-3xl bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-xl flex items-center justify-between gap-4 animate-bounce-subtle mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">🎉</div>
            <div>
              <h3 className="text-lg font-extrabold">Votre commande est prête !</h3>
              <p className="text-xs text-white/90">
                {currentOrder.type === 'DINE_IN'
                  ? `Le serveur vous apporte vos plats à la Table ${currentOrder.tableNumber || ''}.`
                  : currentOrder.type === 'DELIVERY'
                  ? 'Le plat est emballé, notre livreur est prêt à partir.'
                  : 'Vous pouvez vous présenter au comptoir pour récupérer votre commande.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentOrder.status === 'CANCELLED' && (
        <div className="p-5 rounded-3xl bg-red-600 text-white shadow-lg flex items-center gap-3 mb-6">
          <FaIcon name="fa-solid fa-ban" className="text-2xl" />
          <div>
            <h3 className="text-lg font-bold">Commande annulée</h3>
            <p className="text-xs text-white/90">Cette commande a été annulée par le restaurant.</p>
          </div>
        </div>
      )}

      {/* Timeline Principale */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono font-extrabold text-sm border border-amber-300">
                {currentOrder.trackingCode}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mt-2">{currentOrder.restaurantName}</h2>
            <p className="text-xs text-stone-500">
              {currentOrder.type === 'DINE_IN'
                ? `🍽️ Sur place • Table ${currentOrder.tableNumber || 'N/A'}`
                : currentOrder.type === 'DELIVERY'
                ? `🛵 Livraison : ${currentOrder.customerAddress || 'N/A'}`
                : '🛍️ Retrait sur place'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FaIcon name="fa-solid fa-rotate" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Stepper */}
        <div className="py-8">
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-stone-100 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const isDone = currentStepIdx >= idx && currentOrder.status !== 'CANCELLED';
                const isCurrent = currentStepIdx === idx && currentOrder.status !== 'CANCELLED';
                return (
                  <div key={step.status} className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 transition-all ${
                      isCurrent ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-100 scale-110' :
                      isDone ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'
                    }`}>
                      <FaIcon name={step.icon} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-amber-600' : isDone ? 'text-stone-900' : 'text-stone-400'}`}>{step.label}</h4>
                      <p className="text-[11px] text-stone-400 md:hidden">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Historique Logs */}
        {currentOrder.statusHistory && currentOrder.statusHistory.length > 0 && (
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 mt-6">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Historique</h4>
            <div className="space-y-1.5">
              {currentOrder.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{h.note || `Statut passé à : ${h.status}`}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
