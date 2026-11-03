import { Icon } from '@/components/common/Icon';
import { OrderStatus, TrackedOrder } from '@/types';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import React from 'react';
import { whatsappLinkDigits } from '@/lib/orders/whatsapp-phone';

interface OrderTrackingTimelineProps {
  currentOrder: TrackedOrder;
  handleManualRefresh: () => void;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ currentOrder, handleManualRefresh }) => {
  const { showToast } = useToast();
  const steps: { status: OrderStatus; label: string; icon: string; desc: string }[] = [
    { status: 'NEW', label: 'Commande Reçue', icon: 'receipt', desc: 'Enregistrée sur le terminal' },
    { status: 'CONFIRMED', label: 'Confirmée', icon: 'circle-check', desc: 'Validée par l\'équipe' },
    { status: 'PREPARING', label: 'En Préparation', icon: 'fire-burner', desc: 'Cuisson et dressage' },
    { status: 'READY', label: 'Commande Prête', icon: 'bell-concierge', desc: 'Votre plat est prêt !' },
    { status: 'OUT_FOR_DELIVERY', label: 'En Livraison / Service', icon: 'motorcycle', desc: 'Le coursier est en route' },
    { status: 'DELIVERED', label: 'Livrée / Servie', icon: 'utensils', desc: 'Bon appétit !' },
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
  const restaurantWhatsapp = whatsappLinkDigits(currentOrder.restaurantPhone);

  const copyTrackingCode = async () => {
    try {
      await navigator.clipboard.writeText(currentOrder.trackingCode);
      showToast('Code de suivi copié.', 'success');
    } catch {
      showToast('Impossible de copier le code de suivi.', 'error');
    }
  };

  return (
    <>
      {/* Alertes de statut */}
      {currentOrder.status === 'READY' && (
        <div className="p-5 rounded-3xl bg-linear-to-r from-positive-600 to-teal-accent-600 text-paper-white shadow-xl flex items-center justify-between gap-4 animate-bounce-subtle mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-paper-white/20 flex items-center justify-center text-2xl shrink-0">🎉</div>
            <div>
              <h3 className="text-lg font-extrabold">Votre commande est prête !</h3>
              <p className="text-xs text-paper-white/90">
                Le restaurant vous apporte les dernières nouvelles dès que votre commande avance.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentOrder.status === 'CANCELLED' && (
        <div className="p-5 rounded-3xl bg-negative-600 text-paper-white shadow-lg flex items-center gap-3 mb-6">
          <Icon name="ban" className="text-2xl" />
          <div>
            <h3 className="text-lg font-bold">Commande annulée</h3>
            <p className="text-xs text-paper-white/90">Cette commande a été annulée par le restaurant.</p>
          </div>
        </div>
      )}

      {/* Timeline Principale */}
      <div className="bg-paper-white p-6 sm:p-8 rounded-3xl border border-ink-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-ink-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-900 font-extrabold text-sm border border-brand-300">
                {currentOrder.trackingCode}
              </span>
              <button
                type="button"
                onClick={copyTrackingCode}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900 underline"
              >
                Copier
              </button>
              <Link
                href={`/order-tracking?trackingCode=${encodeURIComponent(currentOrder.trackingCode)}`}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900 underline"
              >
                Lien direct
              </Link>
            </div>
            <h2 className="text-xl font-extrabold text-ink-900 mt-2">{currentOrder.restaurantName}</h2>
            {restaurantWhatsapp && (
              <a
                href={`https://wa.me/${restaurantWhatsapp}?text=${encodeURIComponent(
                  `Bonjour ${currentOrder.restaurantName}, je vous contacte au sujet de ma commande ${currentOrder.trackingCode}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs font-semibold text-positive-700 hover:text-positive-900 underline"
              >
                Contacter le restaurant sur WhatsApp
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-3.5 py-2 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Icon name="rotate" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Stepper */}
        <div className="py-8">
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-ink-100 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const isDone = currentStepIdx >= idx && currentOrder.status !== 'CANCELLED';
                const isCurrent = currentStepIdx === idx && currentOrder.status !== 'CANCELLED';
                return (
                  <div key={step.status} className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 transition-all ${
                      isCurrent ? 'bg-brand-500 text-paper-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-100 scale-110' :
                      isDone ? 'bg-positive-500 text-paper-white' : 'bg-ink-100 text-ink-400'
                    }`}>
                      <Icon name={step.icon} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-brand-600' : isDone ? 'text-ink-900' : 'text-ink-400'}`}>{step.label}</h4>
                      <p className="text-[0.6875rem] text-ink-400 md:hidden">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Historique Logs */}
        {currentOrder.statusHistory && currentOrder.statusHistory.length > 0 && (
          <div className="bg-ink-50 rounded-2xl p-4 border border-ink-200/80 mt-6">
            <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider mb-2">Historique</h4>
            <div className="space-y-1.5">
              {currentOrder.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-ink-600">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    <span>{h.note || `Statut passé à : ${h.status}`}</span>
                  </div>
                  <span className="text-[0.625rem] text-ink-400">
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
