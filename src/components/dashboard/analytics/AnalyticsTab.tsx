'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AnalyticsStats, AnalyticsTabProps, AnalyticsPeriod } from './types';
import { AnalyticsHeader } from './AnalyticsHeader';
import { KpiGrid } from './KpiGrid';
import { TopItemsCard } from './TopItemsCard';
import { OrderStatusCard } from './OrderStatusCard';

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  restaurantId,
  stats: initialStats,
  currencySymbol = 'FCFA',
}) => {
  const [statsData, setStatsData] = useState<AnalyticsStats | null>(initialStats || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialStats);
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ` ${currencySymbol}`;
  };

  return (
    <div className="space-y-8">
      <AnalyticsHeader
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => fetchAnalytics(period)}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-stone-400 bg-white rounded-3xl border border-stone-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
          <span className="text-xs font-semibold">Calcul des métriques financières...</span>
        </div>
      ) : (
        <>
          <KpiGrid stats={statsData} formatCurrency={formatCurrency} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TopItemsCard items={statsData?.topItems} formatCurrency={formatCurrency} />
            <OrderStatusCard ordersByStatus={statsData?.ordersByStatus} />
          </div>
        </>
      )}
    </div>
  );
};
