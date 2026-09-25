'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  PlanCatalogItem,
  SubscriptionData,
  SubscriptionTabProps,
} from './types';
import { NotificationToast } from './NotificationToast';
import { Header } from './Header';
import { ActivePlanCard } from './ActivePlanCard';
import { BillingCycleToggle } from './BillingCycleToggle';
import { PlanCard } from './PlanCard';
import { InvoicesTable } from './InvoicesTable';
import { UpgradeModal } from './UpgradeModal';

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  restaurantId,
  plan: initialPlan,
  currencySymbol = 'FCFA',
  onRefreshNeeded,
}) => {
  const [subData, setSubData] = useState<SubscriptionData | null>(initialPlan || null);
  const [availablePlans, setAvailablePlans] = useState<PlanCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPlan);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Modal de changement de plan
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanCatalogItem | null>(null);
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState<boolean>(false);

  // Toast Notice
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  };

  // Chargement des informations d'abonnement
  const fetchSubscription = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/subscription?restaurantId=${restaurantId}`);
      const data = await res.json();
      if (data.success) {
        setSubData(data.subscription);
        setAvailablePlans(data.availablePlans || []);
        if (data.subscription?.billingCycle) {
          setBillingCycle(data.subscription.billingCycle);
        }
      }
    } catch (err) {
      console.error('Erreur chargement abonnement:', err);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!initialPlan) {
      fetchSubscription();
    } else {
      setSubData(initialPlan);
    }
  }, [restaurantId, initialPlan, fetchSubscription]);

  // Formater les prix
  const formatPrice = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat('fr-FR').format(amount) + ` ${currencySymbol}`;
    },
    [currencySymbol]
  );

  // Calcul des jours restants
  const daysRemaining = useMemo(() => {
    if (!subData?.endDate) return 0;
    const end = new Date(subData.endDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }, [subData]);

  // Confirmation du changement de plan
  const handleConfirmUpgrade = async () => {
    if (!selectedPlanForUpgrade || !restaurantId) return;

    try {
      setIsSubmittingUpgrade(true);
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          planId: selectedPlanForUpgrade.id,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Impossible de mettre à jour le plan.');
      }

      showNotice('success', `Abonnement mis à jour vers "${selectedPlanForUpgrade.name}" !`);
      setSelectedPlanForUpgrade(null);
      fetchSubscription();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du paiement.';
      showNotice('error', errorMsg);
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  return (
    <div className="space-y-8">
      <NotificationToast notice={notice} onClose={() => setNotice(null)} />

      <Header isLoading={isLoading} onRefresh={fetchSubscription} />

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des informations de licence...</span>
        </div>
      ) : (
        <>
          {subData && <ActivePlanCard subData={subData} daysRemaining={daysRemaining} />}

          <BillingCycleToggle billingCycle={billingCycle} onCycleChange={setBillingCycle} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={subData?.planId === plan.id}
                billingCycle={billingCycle}
                formatPrice={formatPrice}
                onSelect={setSelectedPlanForUpgrade}
              />
            ))}
          </div>

          <InvoicesTable invoices={subData?.invoices} formatPrice={formatPrice} />
        </>
      )}

      <UpgradeModal
        selectedPlan={selectedPlanForUpgrade}
        billingCycle={billingCycle}
        isSubmitting={isSubmittingUpgrade}
        formatPrice={formatPrice}
        onClose={() => setSelectedPlanForUpgrade(null)}
        onConfirm={handleConfirmUpgrade}
      />
    </div>
  );
};
