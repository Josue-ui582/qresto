export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'custom';

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function parseCalendarDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function getCalendarDate(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function localMidnightToUtc(
  date: { year: number; month: number; day: number },
  timeZone: string
): Date {
  const targetUtc = Date.UTC(date.year, date.month - 1, date.day);
  let candidate = targetUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getTimeZoneParts(new Date(candidate), timeZone);
    const representedUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    const offset = representedUtc - candidate;
    const nextCandidate = targetUtc - offset;
    if (nextCandidate === candidate) break;
    candidate = nextCandidate;
  }

  return new Date(candidate);
}

function addCalendarDays(
  date: { year: number; month: number; day: number },
  days: number
): { year: number; month: number; day: number } {
  const result = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate(),
  };
}

function formatCalendarDate(date: { year: number; month: number; day: number }): string {
  return [
    String(date.year).padStart(4, '0'),
    String(date.month).padStart(2, '0'),
    String(date.day).padStart(2, '0'),
  ].join('-');
}

export function getAnalyticsDateRange(
  period: AnalyticsPeriod,
  timeZone: string,
  now: Date,
  customStart?: string,
  customEnd?: string
): AnalyticsDateRange | null {
  if (!isValidTimeZone(timeZone)) return null;

  let firstDay: { year: number; month: number; day: number };
  let dayAfterLast: { year: number; month: number; day: number };

  if (period === 'custom') {
    const start = customStart ? parseCalendarDate(customStart) : null;
    const end = customEnd ? parseCalendarDate(customEnd) : null;
    if (!start || !end || formatCalendarDate(start) > formatCalendarDate(end)) return null;
    firstDay = start;
    dayAfterLast = addCalendarDays(end, 1);
  } else {
    const today = getCalendarDate(now, timeZone);
    if (period === 'day') {
      firstDay = today;
      dayAfterLast = addCalendarDays(today, 1);
    } else if (period === 'week') {
      const weekday = new Date(Date.UTC(today.year, today.month - 1, today.day)).getUTCDay();
      firstDay = addCalendarDays(today, -((weekday + 6) % 7));
      dayAfterLast = addCalendarDays(firstDay, 7);
    } else {
      firstDay = { ...today, day: 1 };
      dayAfterLast = today.month === 12
        ? { year: today.year + 1, month: 1, day: 1 }
        : { year: today.year, month: today.month + 1, day: 1 };
    }
  }

  return {
    startDate: localMidnightToUtc(firstDay, timeZone),
    endDate: localMidnightToUtc(dayAfterLast, timeZone),
  };
}
