'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Award,
  Loader2,
  RefreshCw,
  Printer,
  ChevronRight,
  PieChart,
  Sparkles,
  ArrowUpRight,
  UtensilsCrossed,
} from 'lucide-react';

export interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeTablesCount: number;
  ordersByStatus: Array<{ status: string; count: number }>;
  topItems: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
}

interface AnalyticsTabProps {
  restaurantId?: string;
  stats?: AnalyticsStats;
  currencySymbol?: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  restaurantId,
  stats: initialStats,
  currencySymbol = 'FCFA',
}) => {
  const [statsData, setStatsData] = useState<AnalyticsStats | null>(initialStats || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialStats);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  // Chargement dynamique des données Analytics
  const fetchAnalytics = async (selectedPeriod = period) => {
    try {
      setIsLoading(true);
      const url = restaurantId
        ? `/api/analytics?restaurantId=${restaurantId}&period=${selectedPeriod}`
        : `/api/analytics?period=${selectedPeriod}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setStatsData(data.stats);
      }
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, restaurantId]);

  // Formater les montants financiers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ` ${currencySymbol}`;
  };

  // Calcul du volume maximal pour la barre de progression des top plats
  const maxItemQuantity = useMemo(() => {
    if (!statsData?.topItems?.length) return 1;
    return Math.max(...statsData.topItems.map((i) => i.quantity));
  }, [statsData]);

  return (
    <div className="space-y-8">
      {/* Header & Filtre Temporel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Tableau de Bord Financier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            Rapports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Suivez en temps réel le chiffre d'affaires, le panier moyen et les meilleures ventes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selecteur de Période */}
          <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1 border border-stone-200/80">
            {(
              [
                { id: 'today', label: "Aujourd'hui" },
                { id: '7d', label: '7 jours' },
                { id: '30d', label: '30 jours' },
                { id: 'all', label: 'Tout' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setPeriod(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  period === item.id
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(period)}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-3 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Calcul des métriques financières...</span>
        </div>
      ) : (
        <>
          {/* Cartes de KPI Majeurs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Chiffre d'affaires */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Chiffre d'Affaires
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                {formatCurrency(statsData?.totalRevenue || 0)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Commandes encaissées</span>
              </div>
            </motion.div>

            {/* Total Commandes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total Commandes
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                {statsData?.totalOrders || 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 mt-2">
                <span>Sur la période sélectionnée</span>
              </div>
            </motion.div>

            {/* Panier Moyen */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Panier Moyen
                </span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                {formatCurrency(statsData?.averageOrderValue || 0)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 mt-2">
                <span>Dépense moy. par client</span>
              </div>
            </motion.div>

            {/* Tables Actives */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Tables Actives
                </span>
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                {statsData?.activeTablesCount || 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 mt-2">
                <span>Tables ayant commandé</span>
              </div>
            </motion.div>
          </div>

          {/* Grille : Top Ventes & Répartition */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Classement des Plats les Plus Vendus (2 colonnes) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-950 font-display">
                        Top 5 des Plats les plus vendus
                      </h3>
                      <p className="text-xs text-stone-500">
                        Articles générant le plus grand volume de commandes.
                      </p>
                    </div>
                  </div>
                </div>

                {statsData?.topItems && statsData.topItems.length > 0 ? (
                  <div className="space-y-5">
                    {statsData.topItems.map((item, index) => {
                      const percentage = Math.round((item.quantity / maxItemQuantity) * 100);

                      return (
                        <div key={item.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-black text-[11px] flex items-center justify-center">
                                #{index + 1}
                              </span>
                              <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-bold">
                                {item.category}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-stone-950 text-sm">
                                {item.quantity} vente(s)
                              </span>
                              <span className="block text-[11px] text-stone-400 font-medium">
                                {formatCurrency(item.revenue)}
                              </span>
                            </div>
                          </div>

                          {/* Barre visuelle de progression */}
                          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-amber-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-stone-400">
                    <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Aucune donnée de vente enregistrée sur cette période.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Répartition par Statut de Commande (1 colonne) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-950 font-display">
                      État des Commandes
                    </h3>
                    <p className="text-xs text-stone-500">Distribution par statut actuel.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {statsData?.ordersByStatus && statsData.ordersByStatus.length > 0 ? (
                    statsData.ordersByStatus.map((st) => (
                      <div
                        key={st.status}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          {st.status === 'PENDING'
                            ? 'En attente'
                            : st.status === 'PREPARING'
                            ? 'En cuisine'
                            : st.status === 'DELIVERED'
                            ? 'Livrée / Servie'
                            : st.status === 'CANCELLED'
                            ? 'Annulée'
                            : st.status}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-white border border-stone-200 font-black text-xs text-stone-900 shadow-2xs">
                          {st.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-stone-400 text-xs">
                      Aucune commande à afficher.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] text-stone-400 text-center font-medium">
                Mise à jour en temps réel à chaque nouvelle commande.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
