import type { PlanLimit } from './catalog';

export type SubscriptionState = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
export type PlanResource = 'dishes' | 'tables' | 'members';

export function getEffectiveSubscriptionState(
  status: SubscriptionState,
  endDate: Date,
  now: Date = new Date()
): SubscriptionState {
  if ((status === 'TRIAL' || status === 'ACTIVE') && endDate <= now) {
    return 'EXPIRED';
  }
  return status;
}

export function isResourceLimitReached(limit: PlanLimit, usage: number): limit is number {
  return limit !== null && usage >= limit;
}

export function canModifyWithSubscriptionState(status: SubscriptionState): boolean {
  return status === 'ACTIVE' || status === 'TRIAL';
}

export function createPlanLimitMessage(
  planName: string,
  resource: PlanResource,
  limit: number
): string {
  const labels: Record<PlanResource, string> = {
    dishes: 'plats',
    tables: 'tables actives',
    members: 'membres actifs',
  };
  return `La formule ${planName} est limitée à ${limit} ${labels[resource]}. Supprimez ou désactivez un élément, ou choisissez une autre formule.`;
}
