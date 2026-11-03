'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AnalyticsStats, AnalyticsTabProps, AnalyticsPeriod } from './types';
import { AnalyticsHeader } from './AnalyticsHeader';
import { KpiGrid } from './KpiGrid';
import { TopItemsCard } from './TopItemsCard';
import { OrderStatusCard } from './OrderStatusCard';
import { OrdersByTypeCard } from './OrdersByTypeCard';
import { PeakHoursCard } from './PeakHoursCard';
import { serializeAnalyticsCsv } from './analytics-csv';

function localDateString(date: Date): string {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  restaurantId,
  currencySymbol = 'FCFA',
}) => {
  const today = localDateString(new Date());
  const [statsData, setStatsData] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [customStartDate, setCustomStartDate] = useState(today);
  const [customEndDate, setCustomEndDate] = useState(today);

  const fetchAnalytics = useCallback(async (signal?: AbortSignal): Promise<AnalyticsStats> => {
    if (period === 'custom' && (!customStartDate || !customEndDate)) {
      throw new Error('Choisissez les dates de début et de fin.');
    }

    const params = new URLSearchParams({
      period,
      timeZone: 'Africa/Porto-Novo',
    });
    if (restaurantId) params.set('restaurantId', restaurantId);
    if (period === 'custom') {
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
    }

    const response = await fetch(`/api/analytics?${params}`, { signal });
    const result: {
      success: boolean;
      stats?: AnalyticsStats;
      error?: string;
    } = await response.json();
    if (!response.ok || !result.success || !result.stats) {
      throw new Error(result.error || 'Impossible de charger les analytics.');
    }
    return result.stats;
  }, [customEndDate, customStartDate, period, restaurantId]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAnalytics(controller.signal)
      .then((stats) => {
        setStatsData(stats);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Erreur chargement analytics:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Impossible de charger les analytics.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [fetchAnalytics]);

  const formatCurrency = (amount: number) => (
    `${new Intl.NumberFormat('fr-FR').format(amount)} ${currencySymbol}`
  );

  const changePeriod = (nextPeriod: AnalyticsPeriod) => {
    setIsLoading(true);
    setPeriod(nextPeriod);
  };
  const changeCustomStartDate = (date: string) => {
    setIsLoading(true);
    setCustomStartDate(date);
  };
  const changeCustomEndDate = (date: string) => {
    setIsLoading(true);
    setCustomEndDate(date);
  };
  const refreshAnalytics = () => {
    setIsLoading(true);
    void fetchAnalytics()
      .then((stats) => {
        setStatsData(stats);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        console.error('Erreur chargement analytics:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Impossible de charger les analytics.');
      })
      .finally(() => setIsLoading(false));
  };

  const exportCsv = () => {
    if (!statsData) return;
    const csv = `\uFEFF${serializeAnalyticsCsv(statsData)}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `analytics-${period}-${localDateString(new Date())}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <AnalyticsHeader
        period={period}
        onPeriodChange={changePeriod}
        onRefresh={refreshAnalytics}
        onExportCsv={exportCsv}
        isLoading={isLoading}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={changeCustomStartDate}
        onCustomEndDateChange={changeCustomEndDate}
      />

      {error && (
        <div role="alert" className="rounded-2xl border border-negative-200 bg-negative-50 px-4 py-3 text-sm text-negative-700">
          {error}
        </div>
      )}

      {isLoading && !statsData ? (
        <div className="py-24 flex flex-col items-center justify-center text-ink-400 bg-paper-white rounded-3xl border border-ink-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
          <span className="text-xs font-semibold">Calcul des métriques financières...</span>
        </div>
      ) : statsData ? (
        <>
          {statsData.totalOrders === 0 && (
            <p role="status" className="rounded-2xl border border-ink-200 bg-paper-white px-4 py-3 text-sm text-ink-600">
              Aucune commande sur cette période. Les statistiques s’afficheront dès la première commande.
            </p>
          )}
          <KpiGrid stats={statsData} formatCurrency={formatCurrency} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TopItemsCard items={statsData.topItems} formatCurrency={formatCurrency} />
            <OrderStatusCard ordersByStatus={statsData.ordersByStatus} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OrdersByTypeCard ordersByType={statsData.ordersByType} />
            <PeakHoursCard peakHours={statsData.peakHours} />
          </div>
        </>
      ) : null}
    </div>
  );
};
