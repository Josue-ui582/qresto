import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createFixedWindowRateLimiter() {
  const entries = new Map<string, RateLimitEntry>();

  return (key: string, { limit, windowMs }: RateLimitOptions, now = Date.now()) => {
    const current = entries.get(key);
    if (!current || current.resetAt <= now) {
      if (entries.size >= 10_000) {
        for (const [entryKey, entry] of entries) {
          if (entry.resetAt <= now) entries.delete(entryKey);
        }
        if (entries.size >= 10_000) {
          const oldestKey = entries.keys().next().value;
          if (oldestKey !== undefined) entries.delete(oldestKey);
        }
      }
      entries.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (current.count >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    }

    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

const limitRequest = createFixedWindowRateLimiter();

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim();
  return firstForwardedIp || 'unknown';
}

export function enforceRateLimit(
  request: NextRequest,
  bucket: string,
  options: RateLimitOptions
): NextResponse | null {
  const result = limitRequest(`${bucket}:${getClientIp(request)}`, options);
  if (result.allowed) return null;

  return NextResponse.json(
    { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
    {
      status: 429,
      headers: { 'Retry-After': String(result.retryAfterSeconds) },
    }
  );
}
