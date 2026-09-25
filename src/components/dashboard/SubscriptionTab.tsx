'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  Clock,
  Receipt,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Crown,
  ArrowRight,
  Download,
  Building2,
  RefreshCw,
} from 'lucide-react';

export type PlanId = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED';

export interface PlanCatalogItem {
  id: PlanId;
  name: string;
  popular?: boolean;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxTables: number;
  features: string[];
}

export interface InvoiceData {
  id: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  description: string;
  createdAt: string | Date;
}

export interface SubscriptionData {
  id: string;
  restaurantId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  billingCycle: 'MONTHLY' | 'YEARLY';
  startDate: string | Date;
  endDate: string | Date;
  autoRenew: boolean;
  planDetails?: PlanCatalogItem;
  invoices?: InvoiceData[];
}

interface SubscriptionTabProps {
  restaurantId?: string;
  plan?: SubscriptionData;
  currencySymbol?: string;
  onRefreshNeeded?: () => void;
}

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

  // Upgrade Modal
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanCatalogItem | null>(null);
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState<boolean>(false);

  // Toast Notice
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  };

  // Chargement des infos d'abonnement
  const fetchSubscription = async () => {
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
  };

  useEffect(() => {
    if (!initialPlan) {
      fetchSubscription();
    } else {
      setSubData(initialPlan);
    }
  }, [restaurantId, initialPlan]);

  // Formater les prix
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ` ${currencySymbol}`;
  };

  // Calcul du nombre de jours restants
  const daysRemaining = useMemo(() => {
    if (!subData?.endDate) return 0;
    const end = new Date(subData.endDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }, [subData]);

  // Exécution du changement de plan
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
    } catch (err: any) {
      showNotice('error', err.message || 'Erreur lors du paiement.');
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center justify-between border text-xs sm:text-sm font-bold shadow-lg ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span>{notice.msg}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Offres & Licence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Gestion de l'Abonnement
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Consultez votre formule actuelle, changez de plan et gérez vos factures.
          </p>
        </div>

        <button
          onClick={fetchSubscription}
          disabled={isLoading}
          className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer self-start lg:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          <span>Rafraîchir</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Chargement des informations de licence...</span>
        </div>
      ) : (
        <>
          {/* CARTE FORFAIT ACTIF */}
          {subData && (
            <div className="bg-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    <Crown className="w-3.5 h-3.5" />
                    <span>
                      {subData.status === 'TRIAL'
                        ? 'Période d’essai gratuite'
                        : subData.status === 'ACTIVE'
                        ? 'Abonnement Actif'
                        : 'Abonnement Expiré'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                    {subData.planDetails?.name || `Plan ${subData.planId}`}
                  </h3>

                  <p className="text-xs text-stone-400 max-w-lg leading-relaxed">
                    {subData.planDetails?.description}
                  </p>
                </div>

                {/* Métriques d'échéance */}
                <div className="bg-stone-900/80 p-5 rounded-2xl border border-stone-800 flex flex-col items-start md:items-end justify-center shrink-0 min-w-25">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                    Renouvellement dans
                  </span>
                  <div className="text-3xl font-black text-amber-400 font-display">
                    {daysRemaining} jour(s)
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    Fin le : {new Date(subData.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SÉLECTEUR DE PERIODE (MENSUEL / ANNUEL) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
            <div>
              <h3 className="text-base font-bold text-stone-950 font-display">
                Choisissez votre formule
              </h3>
              <p className="text-xs text-stone-500">
                Économisez jusqu'à 20% en optant pour la facturation annuelle.
              </p>
            </div>

            <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1 border border-stone-200/80">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Facturation Mensuelle
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'YEARLY'
                    ? 'bg-stone-950 text-amber-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span>Facturation Annuelle</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 text-[10px] font-black">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* GRILLE DES PLANS TARIFAIRES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(availablePlans.length > 0 ? availablePlans : []).map((plan) => {
              const isCurrent = subData?.planId === plan.id;
              const price =
                billingCycle === 'YEARLY'
                  ? Math.round(plan.yearlyPrice / 12)
                  : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                    plan.popular
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-stone-200/80'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
                      Recommandé
                    </div>
                  )}

                  <div>
                    <h4 className="text-xl font-bold text-stone-950 font-display mb-1">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-stone-500 mb-6 leading-relaxed min-h-9">
                      {plan.description}
                    </p>

                    {/* Affichage du Tarif */}
                    <div className="mb-6 pb-6 border-b border-stone-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
                          {formatPrice(price)}
                        </span>
                        <span className="text-xs text-stone-400 font-bold">/ mois</span>
                      </div>
                      {billingCycle === 'YEARLY' && (
                        <span className="text-[11px] text-amber-700 font-bold block mt-1">
                          Facturé {formatPrice(plan.yearlyPrice)} / an
                        </span>
                      )}
                    </div>

                    {/* Liste des fonctionnalités */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bouton d'Action */}
                  <button
                    onClick={() => setSelectedPlanForUpgrade(plan)}
                    disabled={isCurrent}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-md'
                        : 'bg-stone-950 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Plan Actuel</span>
                      </>
                    ) : (
                      <>
                        <span>Passer à cette formule</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* HISTORIQUE DE FACTURATION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-950 font-display">
                  Historique des Factures
                </h3>
                <p className="text-xs text-stone-500">
                  Téléchargez vos reçus et justificatifs de paiement.
                </p>
              </div>
            </div>

            {subData?.invoices && subData.invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-bold">
                      <th className="pb-3 font-bold">Description</th>
                      <th className="pb-3 font-bold">Date</th>
                      <th className="pb-3 font-bold">Montant</th>
                      <th className="pb-3 font-bold">Statut</th>
                      <th className="pb-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {subData.invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 font-bold text-stone-900">
                          {invoice.description}
                        </td>
                        <td className="py-3.5 text-stone-500">
                          {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3.5 font-black text-stone-950">
                          {formatPrice(invoice.amount)}
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            ● Payée
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => window.print()}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            title="Télécharger le reçu"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-stone-400 text-xs">
                Aucune facture enregistrée pour le moment.
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= MODAL DE CONFIRMATION DE PLAN ================= */}
      <AnimatePresence>
        {selectedPlanForUpgrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      Confirmer le changement
                    </h3>
                    <p className="text-[11px] text-stone-500">Mise à niveau instantanée.</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Formule sélectionnée
                  </span>
                  <div className="text-lg font-bold text-stone-950 font-display">
                    {selectedPlanForUpgrade.name}
                  </div>
                  <div className="text-sm font-black text-amber-700 mt-1">
                    {formatPrice(
                      billingCycle === 'YEARLY'
                        ? selectedPlanForUpgrade.yearlyPrice
                        : selectedPlanForUpgrade.monthlyPrice
                    )}{' '}
                    <span className="text-xs text-stone-500 font-normal">
                      ({billingCycle === 'YEARLY' ? 'Facturation Annuelle' : 'Facturation Mensuelle'})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  En confirmant, votre établissement basculera immédiatement sur les fonctionnalités de la formule{' '}
                  <strong className="text-stone-900">{selectedPlanForUpgrade.name}</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmUpgrade}
                  disabled={isSubmittingUpgrade}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {isSubmittingUpgrade ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activation...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Activer maintenant</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
