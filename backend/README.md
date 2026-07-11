# Rate limiting

- The Redis-backed limiter is implemented at backend/lib/rateLimiter.ts
- Presign endpoint enforces a per-user limit (60 reqs / 60s) and a per-IP limit (30 reqs / 60s).
- Tweak the values in backend/app/api/upload/presign/route.ts as needed.
