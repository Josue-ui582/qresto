import { describe, expect, it } from 'vitest';
import { getAnalyticsDateRange, parseCalendarDate } from './analytics-period';

describe('parseCalendarDate', () => {
  it('accepts calendar dates and rejects malformed or impossible dates', () => {
    expect(parseCalendarDate('2026-11-03')).toEqual({ year: 2026, month: 11, day: 3 });
    expect(parseCalendarDate('2026-02-29')).toBeNull();
    expect(parseCalendarDate('2026-1-03')).toBeNull();
  });
});

describe('getAnalyticsDateRange', () => {
  const now = new Date('2026-11-03T08:00:00.000Z');
  const timeZone = 'Africa/Porto-Novo';

  it('uses the timezone-local calendar day', () => {
    expect(getAnalyticsDateRange('day', timeZone, now)).toEqual({
      startDate: new Date('2026-11-02T23:00:00.000Z'),
      endDate: new Date('2026-11-03T23:00:00.000Z'),
    });
  });

  it('starts the week on Monday and the month on its first local day', () => {
    expect(getAnalyticsDateRange('week', timeZone, now)).toEqual({
      startDate: new Date('2026-11-01T23:00:00.000Z'),
      endDate: new Date('2026-11-08T23:00:00.000Z'),
    });
    expect(getAnalyticsDateRange('month', timeZone, now)).toEqual({
      startDate: new Date('2026-10-31T23:00:00.000Z'),
      endDate: new Date('2026-11-30T23:00:00.000Z'),
    });
  });

  it('includes both custom calendar dates using an exclusive next-day boundary', () => {
    expect(getAnalyticsDateRange('custom', timeZone, now, '2026-10-31', '2026-11-02')).toEqual({
      startDate: new Date('2026-10-30T23:00:00.000Z'),
      endDate: new Date('2026-11-02T23:00:00.000Z'),
    });
  });

  it('rejects invalid custom ranges and time zones', () => {
    expect(getAnalyticsDateRange('custom', timeZone, now, '2026-11-03', '2026-11-02')).toBeNull();
    expect(getAnalyticsDateRange('day', 'Invalid/Zone', now)).toBeNull();
  });
});
