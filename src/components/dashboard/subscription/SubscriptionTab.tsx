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
import { PLAN_CURRENCY } from '@/lib/subscription/catalog';

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  restaurantId,
  plan: initialPlan,
  onRefreshNeeded,
}) => {
  const [subData, setSubData] = useState<SubscriptionData | null>(initialPlan || null);
  const [availablePlans, setAvailablePlans] = useState<PlanCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPlan);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Modal de changement de plan
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanCatalogItem | null>(null);
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Toast Notice
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  };

  // Chargement des informations d'abonnement
  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      if (!restaurantId) {
        throw new Error('Identifiant du restaurant introuvable.');
      }

      const res = await fetch(`/api/subscription?restaurantId=${encodeURIComponent(restaurantId)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Impossible de récupérer les informations d’abonnement.');
      }

      setSubData(data.subscription || null);
      setAvailablePlans(data.availablePlans || []);
      if (data.subscription?.billingCycle) {
        setBillingCycle(data.subscription.billingCycle);
      }
    } catch (err: unknown) {
      console.error('Erreur chargement abonnement:', err);
      setLoadError(err instanceof Error ? err.message : 'Erreur lors du chargement de l’abonnement.');
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
    (amount: number, currency = PLAN_CURRENCY) => {
      return new Intl.NumberFormat('fr-FR').format(amount) + ` ${currency}`;
    },
    []
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

      showNotice('success', data.message || `Formule "${selectedPlanForUpgrade.name}" activée sans paiement.`);
      setSelectedPlanForUpgrade(null);
      fetchSubscription();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l’activation de la formule.';
      showNotice('error', errorMsg);
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!restaurantId || !window.confirm('Annuler maintenant l’abonnement ? Les modifications seront immédiatement désactivées.')) {
      return;
    }

    try {
      setIsCancelling(true);
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, action: 'CANCEL' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Impossible d’annuler l’abonnement.');
      }
      showNotice('success', data.message);
      await fetchSubscription();
      onRefreshNeeded?.();
    } catch (err: unknown) {
      showNotice('error', err instanceof Error ? err.message : 'Erreur lors de l’annulation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const usageRows = subData?.usage && subData.planDetails
    ? [
        { label: 'Plats', usage: subData.usage.dishes, limit: subData.planDetails.limits.dishes },
        { label: 'Tables actives', usage: subData.usage.tables, limit: subData.planDetails.limits.tables },
        { label: 'Membres actifs', usage: subData.usage.members, limit: subData.planDetails.limits.members },
      ]
    : [];

  return (
    <div className="space-y-8">
      <NotificationToast notice={notice} onClose={() => setNotice(null)} />

      <Header isLoading={isLoading} onRefresh={fetchSubscription} />

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-ink-400 bg-paper-white rounded-3xl border border-ink-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des informations de licence...</span>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-alert-200 bg-alert-50 p-5 text-sm font-semibold text-alert-800">
          {loadError}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-xs text-brand-900">
            Tarifs indicatifs à confirmer. Le changement de formule est sans paiement ni renouvellement automatique.
          </div>
          {subData ? (
            <ActivePlanCard
              subData={subData}
              daysRemaining={daysRemaining}
              onCancel={handleCancelSubscription}
              isCancelling={isCancelling}
            />
          ) : (
            <div className="rounded-2xl border border-ink-200 bg-paper-white p-6 text-sm text-ink-500">
              Aucun abonnement n’est actuellement associé à ce restaurant.
            </div>
          )}

          {usageRows.length > 0 && (
            <section className="bg-paper-white rounded-3xl p-6 sm:p-8 border border-ink-200/80 shadow-xs">
              <h3 className="text-lg font-bold text-ink-950 mb-4">Utilisation de votre formule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {usageRows.map(({ label, usage, limit }) => (
                  <div key={label} className="rounded-2xl bg-ink-50 border border-ink-200 p-4">
                    <div className="text-xs text-ink-500">{label}</div>
                    <div className="mt-1 text-lg font-black text-ink-950">
                      {usage} / {limit === null ? 'Illimité' : limit}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <BillingCycleToggle billingCycle={billingCycle} onCycleChange={setBillingCycle} />

          {availablePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={
                    subData?.planId === plan.id &&
                    (subData.status === 'ACTIVE' || subData.status === 'TRIAL')
                  }
                  billingCycle={billingCycle}
                  formatPrice={formatPrice}
                  onSelect={setSelectedPlanForUpgrade}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-ink-200 bg-paper-white p-6 text-sm text-ink-500">
              Aucun plan n’est disponible pour le moment.
            </div>
          )}

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
