import { describe, expect, it } from 'vitest';
import { PLAN_CURRENCY, PLANS_CATALOG } from './catalog';
import {
  canModifyWithSubscriptionState,
  createPlanLimitMessage,
  getEffectiveSubscriptionState,
  isResourceLimitReached,
} from './policy';

describe('subscription policy', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');

  it('expires active and trial subscriptions at their end date', () => {
    const expiredAt = new Date('2026-06-15T11:59:59.999Z');
    expect(getEffectiveSubscriptionState('TRIAL', expiredAt, now)).toBe('EXPIRED');
    expect(getEffectiveSubscriptionState('ACTIVE', expiredAt, now)).toBe('EXPIRED');
    expect(getEffectiveSubscriptionState('TRIAL', now, now)).toBe('EXPIRED');
  });

  it('preserves cancellation and payment-pending states', () => {
    const future = new Date('2026-06-20T12:00:00.000Z');
    expect(getEffectiveSubscriptionState('CANCELLED', future, now)).toBe('CANCELLED');
    expect(getEffectiveSubscriptionState('PAST_DUE', future, now)).toBe('PAST_DUE');
    expect(canModifyWithSubscriptionState('CANCELLED')).toBe(false);
    expect(canModifyWithSubscriptionState('EXPIRED')).toBe(false);
    expect(canModifyWithSubscriptionState('PAST_DUE')).toBe(false);
    expect(canModifyWithSubscriptionState('TRIAL')).toBe(true);
    expect(canModifyWithSubscriptionState('ACTIVE')).toBe(true);
  });

  it('enforces finite limits and reports unlimited resources', () => {
    const starter = PLANS_CATALOG.find((plan) => plan.id === 'STARTER');
    const pro = PLANS_CATALOG.find((plan) => plan.id === 'PRO');
    const enterprise = PLANS_CATALOG.find((plan) => plan.id === 'ENTERPRISE');
    expect(PLAN_CURRENCY).toBe('FCFA');
    expect(starter?.limits).toEqual({ dishes: 30, tables: 10, members: 3 });
    expect([starter?.monthlyPrice, starter?.yearlyPrice]).toEqual([15000, 144000]);
    expect(pro?.limits).toEqual({ dishes: null, tables: null, members: null });
    expect([pro?.monthlyPrice, pro?.yearlyPrice]).toEqual([35000, 336000]);
    expect([enterprise?.monthlyPrice, enterprise?.yearlyPrice]).toEqual([75000, 720000]);
    expect(isResourceLimitReached(3, 3)).toBe(true);
    expect(isResourceLimitReached(3, 2)).toBe(false);
    expect(isResourceLimitReached(null, 1000)).toBe(false);
    expect(createPlanLimitMessage('Starter', 'members', 3)).toContain('3 membres actifs');
  });
});
