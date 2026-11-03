import { describe, expect, it } from 'vitest';
import { isRestaurantOpenNow } from './opening-hours';

const schedule = JSON.stringify({
  monday: { open: '11:00', close: '23:00', active: true },
  tuesday: { open: '11:00', close: '02:00', active: true },
  wednesday: { open: '11:00', close: '23:00', active: false },
  thursday: { open: '11:00', close: '23:00', active: false },
  friday: { open: '11:00', close: '23:00', active: false },
  saturday: { open: '11:00', close: '23:00', active: false },
  sunday: { open: '11:00', close: '23:00', active: false },
});

describe('isRestaurantOpenNow', () => {
  it('uses the configured weekday and local time', () => {
    expect(isRestaurantOpenNow(schedule, new Date('2026-11-02T15:00:00Z'))).toBe(true);
    expect(isRestaurantOpenNow(schedule, new Date('2026-11-02T22:30:00Z'))).toBe(false);
  });

  it('keeps an after-midnight schedule open into the following day', () => {
    expect(isRestaurantOpenNow(schedule, new Date('2026-11-04T00:30:00Z'))).toBe(true);
  });

  it('treats missing or invalid schedules as closed', () => {
    expect(isRestaurantOpenNow(null)).toBe(false);
    expect(isRestaurantOpenNow('{not json}')).toBe(false);
  });
});
