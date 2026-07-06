import { redis } from './redis';

// very small helper wrapper for simple rate limiting
export async function checkRateLimit(key: string, limit = 60, windowSec = 60) {
  const tx = redis.multi();
  tx.incr(key);
  tx.ttl(key);
  const res = await tx.exec();
  const incr = res && res[0] && res[0][1] ? Number(res[0][1]) : 0;
  const ttl = res && res[1] && res[1][1] ? Number(res[1][1]) : -1;
  if (ttl === -1) {
    await redis.expire(key, windowSec);
  }
  return incr <= limit;
}
