import * as Sentry from '@sentry/node';

let initialized = false;
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  if (initialized) return;
  Sentry.init({ dsn, tracesSampleRate: 0.1 });
  initialized = true;
}

export function captureException(err: any) {
  if (!initialized) console.error('Sentry not initialized, error:', err);
  else Sentry.captureException(err);
}
