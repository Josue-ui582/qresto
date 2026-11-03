import { describe, expect, it } from 'vitest';
import { canTransitionOrderStatus } from './order-status';

describe('canTransitionOrderStatus', () => {
  it('allows the defined forward workflow and cancellation before delivery', () => {
    expect(canTransitionOrderStatus('NEW', 'CONFIRMED')).toBe(true);
    expect(canTransitionOrderStatus('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canTransitionOrderStatus('PREPARING', 'READY')).toBe(true);
    expect(canTransitionOrderStatus('READY', 'DELIVERED')).toBe(true);
    expect(canTransitionOrderStatus('READY', 'OUT_FOR_DELIVERY')).toBe(true);
    expect(canTransitionOrderStatus('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
    expect(canTransitionOrderStatus('NEW', 'CANCELLED')).toBe(true);
  });

  it('rejects skipped, reversed and terminal-state transitions', () => {
    expect(canTransitionOrderStatus('NEW', 'READY')).toBe(false);
    expect(canTransitionOrderStatus('PREPARING', 'CONFIRMED')).toBe(false);
    expect(canTransitionOrderStatus('DELIVERED', 'CANCELLED')).toBe(false);
    expect(canTransitionOrderStatus('CANCELLED', 'NEW')).toBe(false);
  });
});
