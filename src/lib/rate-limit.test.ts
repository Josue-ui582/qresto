import { describe, expect, it } from 'vitest';
import { createFixedWindowRateLimiter } from './rate-limit';

describe('createFixedWindowRateLimiter', () => {
  it('blocks requests after the configured limit until the window expires', () => {
    const limit = createFixedWindowRateLimiter();
    const options = { limit: 2, windowMs: 1_000 };

    expect(limit('client-a', options, 0).allowed).toBe(true);
    expect(limit('client-a', options, 100).allowed).toBe(true);
    expect(limit('client-a', options, 200)).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });
    expect(limit('client-a', options, 1_000).allowed).toBe(true);
  });

  it('keeps separate counters for separate clients', () => {
    const limit = createFixedWindowRateLimiter();
    const options = { limit: 1, windowMs: 1_000 };

    expect(limit('client-a', options, 0).allowed).toBe(true);
    expect(limit('client-b', options, 0).allowed).toBe(true);
    expect(limit('client-a', options, 1).allowed).toBe(false);
  });

  it('bounds the number of retained client keys', () => {
    const limit = createFixedWindowRateLimiter();
    const options = { limit: 1, windowMs: 1_000 };

    for (let index = 0; index < 10_000; index += 1) {
      expect(limit(`client-${index}`, options, 0).allowed).toBe(true);
    }

    expect(limit('client-overflow', options, 0).allowed).toBe(true);
    expect(limit('client-0', options, 0).allowed).toBe(true);
  });
});
