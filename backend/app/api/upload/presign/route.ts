import { NextResponse } from 'next/server';
import { verifyToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';
import { createPresignedUpload } from '../../lib/s3';
import { checkRateLimit } from '../../lib/rateLimiter';

async function rateLimit(key: string, limit = 60, windowSec = 60) {
  const now = Math.floor(Date.now() / 1000);
  const res = await (global as any).redis?.multi().incr(key).expire(key, windowSec).exec();
  const count = res && res[0] && res[0][1] ? Number(res[0][1]) : 0;
  return count <= limit;
}

function getClientIP(request: Request) {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    const payload: any = verifyToken(m[1]);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const ip = getClientIP(request);
    const userId = String(payload.sub);

    // enforce email verification before allowing presign
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.emailVerified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });

    // Configurable limits: example 60 reqs per minute per user, fallback 30 reqs per minute per IP
    const perUser = await checkRateLimit({ prefix: 'presign', limit: 60, windowSec: 60, userId, ip });
    if (!perUser.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded (user)' }, { status: 429 });
    }

    const perIp = await checkRateLimit({ prefix: 'presign-ip', limit: 30, windowSec: 60, userId: null, ip });
    if (!perIp.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded (ip)' }, { status: 429 });
    }

    const body = await request.json();
    const { packageName, version, contentType, size } = body;
    if (!packageName || !version || !contentType) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const pkg = await prisma.package.findUnique({ where: { name: packageName } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    if (pkg.ownerId !== Number(payload.sub)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const key = `${packageName}/${version}/${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const uploadUrl = await createPresignedUpload(key, contentType);

    const pv = await prisma.packageVersion.create({
      data: { packageId: pkg.id, version, blobKey: key, size: size ? Number(size) : null, publishedBy: Number(payload.sub) }
    });

    return NextResponse.json({ uploadUrl, blobKey: key, versionId: pv.id });
  } catch (err) {
    console.error('Presign error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
