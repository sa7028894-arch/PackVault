import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';

export async function GET() {
  try {
    // DB check
    const dbOk = await prisma.$queryRaw`SELECT 1`;
    // Redis check
    const redisOk = await redis.ping();
    const s3Ok = true; // optional: could head an object or check config
    return NextResponse.json({ ok: true, db: !!dbOk, redis: redisOk, s3: s3Ok });
  } catch (err) {
    console.error('Health check failed', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
