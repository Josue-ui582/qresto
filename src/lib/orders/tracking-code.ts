import { randomBytes } from 'node:crypto';

const TRACKING_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateTrackingCode(): string {
  const randomValues = randomBytes(8);
  const suffix = Array.from(randomValues, (value) => TRACKING_CODE_ALPHABET[value & 31]).join('');
  return `QR-${suffix}`;
}

export const TRACKING_CODE_PATTERN = /^QR-(?:\d{4}|[A-F0-9]{12}|[A-HJ-NP-Z2-9]{8})$/i;
