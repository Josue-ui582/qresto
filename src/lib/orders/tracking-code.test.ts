import { describe, expect, it } from 'vitest';
import { generateTrackingCode, TRACKING_CODE_PATTERN } from './tracking-code';

describe('generateTrackingCode', () => {
  it('creates an eight-character code without ambiguous characters', () => {
    const trackingCode = generateTrackingCode();

    expect(trackingCode).toMatch(/^QR-[A-HJ-NP-Z2-9]{8}$/);
    expect(TRACKING_CODE_PATTERN.test(trackingCode)).toBe(true);
  });

  it('continues to accept the historical tracking code formats', () => {
    expect(TRACKING_CODE_PATTERN.test('QR-1234')).toBe(true);
    expect(TRACKING_CODE_PATTERN.test('QR-123456789ABC')).toBe(true);
  });
});
