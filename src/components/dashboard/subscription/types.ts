import type { PlanCatalogItem, PlanId } from '@/lib/subscription/catalog';

export type { PlanId, PlanCatalogItem };
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'EXPIRED' | 'CANCELLED';

export interface PlanUsage {
  dishes: number;
  tables: number;
  members: number;
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
  usage?: PlanUsage;
}

export interface SubscriptionTabProps {
  restaurantId?: string;
  plan?: SubscriptionData;
  onRefreshNeeded?: () => void;
}
