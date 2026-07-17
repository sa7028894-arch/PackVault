import { NextResponse } from 'next/server';
import { redis } from '../../lib/redis';

export async function GET() {
  try {
    // Simple metrics pulled from Redis counters if present
    const uploads = Number(await redis.get('metrics:uploads') || 0);
    const downloads = Number(await redis.get('metrics:downloads') || 0);
    const failedChecks = Number(await redis.get('metrics:failed_checks') || 0);
    return NextResponse.json({ uploads, downloads, failedChecks });
  } catch (err) {
    console.error('Metrics error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
