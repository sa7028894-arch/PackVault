import { redis } from './redis';

export type LimitOptions = {
  limit?: number;       // number of allowed requests
  windowSec?: number;   // sliding window in seconds
  prefix?: string;      // key prefix
};

/**
 * Enforce a rate limit using Redis INCR + EXPIRE.
 *
 * Strategy:
 *  - Try user-specific key first (if userId provided).
 *  - Fallback to IP-specific key.
 *  - Use composite key: rl:{prefix}:{userId|ip}
 *
 * Returns { allowed, remaining, resetAt }.
 */
export async function checkRateLimit({
  prefix,
  limit = 60,
  windowSec = 60,
  userId,
  ip,
}: LimitOptions & { userId?: string | number | null; ip?: string }) {
  const keysToTry: string[] = [];

  if (userId) keysToTry.push(`rl:${prefix}:user:${userId}`);
  if (ip) keysToTry.push(`rl:${prefix}:ip:${ip}`);
  // final global fallback
  keysToTry.push(`rl:${prefix}:global`);

  for (const key of keysToTry) {
    const tx = redis.multi();
    tx.incr(key);
    tx.ttl(key);
    const res = await tx.exec();
    const incr = res && res[0] && res[0][1] ? Number(res[0][1]) : 0;
    let ttl = res && res[1] && res[1][1] ? Number(res[1][1]) : -1;
    if (ttl === -1) {
      await redis.expire(key, windowSec);
      ttl = windowSec;
    }
    const allowed = incr <= limit;
    const remaining = Math.max(0, limit - incr);
    const resetAt = Date.now() + ttl * 1000;
    if (!allowed) {
      return { allowed: false, remaining, resetAt, key };
    }
    return { allowed: true, remaining, resetAt, key };
  }

  return { allowed: false, remaining: 0, resetAt: Date.now() + 60 * 1000, key: 'none' };
}
