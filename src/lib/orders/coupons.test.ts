import { describe, expect, it } from 'vitest';
import { calculateCouponDiscount, getCouponValidationError, type CouponTerms } from './coupons';

const activeCoupon: CouponTerms = {
  active: true,
  discount: 15,
  isPercentage: true,
  minOrder: 5000,
  startsAt: null,
  expiresAt: new Date('2026-12-01T00:00:00.000Z'),
  maxUses: 2,
  usageCount: 1,
};

describe('coupon pricing and validation', () => {
  it('calculates a percentage discount against the food subtotal', () => {
    expect(calculateCouponDiscount(10001, activeCoupon)).toBe(1500);
  });

  it('caps a fixed discount at the subtotal', () => {
    expect(calculateCouponDiscount(800, { ...activeCoupon, discount: 1500, isPercentage: false })).toBe(800);
  });

  it('rejects invalid date, minimum and usage states', () => {
    const now = new Date('2026-11-03T10:00:00.000Z');
    expect(getCouponValidationError(activeCoupon, 5000, now)).toBeNull();
    expect(getCouponValidationError({ ...activeCoupon, startsAt: new Date('2026-11-04T00:00:00.000Z') }, 5000, now))
      .toContain('pas encore');
    expect(getCouponValidationError({ ...activeCoupon, expiresAt: now }, 5000, now))
      .toContain('expiré');
    expect(getCouponValidationError(activeCoupon, 4999, now)).toContain('minimum');
    expect(getCouponValidationError({ ...activeCoupon, usageCount: 2 }, 5000, now))
      .toContain('maximal');
  });
});
