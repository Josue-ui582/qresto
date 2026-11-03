import { describe, expect, it } from 'vitest';
import { canReviewOrder } from './review-policy';

describe('verified review eligibility', () => {
  it('allows one review only after delivery', () => {
    expect(canReviewOrder('DELIVERED', false)).toBe(true);
    expect(canReviewOrder('PREPARING', false)).toBe(false);
    expect(canReviewOrder('DELIVERED', true)).toBe(false);
  });
});
