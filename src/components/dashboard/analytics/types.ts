export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'custom';

export interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeTablesCount: number;
  ordersByStatus: Array<{ status: string; count: number }>;
  ordersByType: Array<{ type: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
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
  currencySymbol?: string;
}
