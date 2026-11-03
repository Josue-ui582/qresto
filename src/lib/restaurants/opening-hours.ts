type DailySchedule = {
  open: string;
  close: string;
  active: boolean;
};

type OpeningHours = Record<string, DailySchedule>;

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function parseOpeningHours(value: string | null | undefined): OpeningHours | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as OpeningHours;
  } catch {
    return null;
  }
}

function toMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isRestaurantOpenNow(
  openingHours: string | null | undefined,
  now: Date = new Date(),
  timeZone = 'Africa/Porto-Novo'
): boolean {
  const schedule = parseOpeningHours(openingHours);
  if (!schedule) return false;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === 'weekday')?.value.toLowerCase();
  const hour = Number(parts.find((part) => part.type === 'hour')?.value);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value);
  const dayIndex = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(weekday ?? '');
  if (dayIndex < 0 || !Number.isInteger(hour) || !Number.isInteger(minute)) return false;

  const currentMinute = hour * 60 + minute;
  const today = schedule[WEEKDAYS[dayIndex]];
  if (today?.active) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (open !== null && close !== null) {
      if (close > open && currentMinute >= open && currentMinute < close) return true;
      if (close <= open && currentMinute >= open) return true;
    }
  }

  const previousDay = schedule[WEEKDAYS[(dayIndex + 6) % 7]];
  if (!previousDay?.active) return false;
  const previousOpen = toMinutes(previousDay.open);
  const previousClose = toMinutes(previousDay.close);
  return previousOpen !== null
    && previousClose !== null
    && previousClose <= previousOpen
    && currentMinute < previousClose;
}
