export type AnalyticsPeriod = 'today' | '7d' | '30d' | 'all';

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

export interface AnalyticsTabProps {
  restaurantId?: string;
  stats?: AnalyticsStats;
  currencySymbol?: string;
}
