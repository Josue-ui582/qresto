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

export interface SubscriptionTabProps {
  restaurantId?: string;
  plan?: SubscriptionData;
  currencySymbol?: string;
  onRefreshNeeded?: () => void;
}
