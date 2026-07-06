import { NextResponse } from 'next/server';
import { verifyToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';
import { createPresignedUpload } from '../../lib/s3';
import { redis } from '../../lib/redis';

async function rateLimit(key: string, limit = 60, windowSec = 60) {
  const now = Math.floor(Date.now() / 1000);
  const res = await redis.multi().incr(key).expire(key, windowSec).exec();
  // res is array of results; when first time, incr returns 1
  const count = res && res[0] && res[0][1] ? Number(res[0][1]) : 0;
  return count <= limit;
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    const payload: any = verifyToken(m[1]);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const ip = request.headers.get('x-forwarded-for') || 'local';
    const allowed = await rateLimit(`rl:presign:${payload.sub}:${ip}`, 60, 60);
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await request.json();
    const { packageName, version, contentType, size } = body;
    if (!packageName || !version || !contentType) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const pkg = await prisma.package.findUnique({ where: { name: packageName } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    if (pkg.ownerId !== Number(payload.sub)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const key = `${packageName}/${version}/${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const uploadUrl = await createPresignedUpload(key, contentType);

    const pv = await prisma.packageVersion.create({ data: { packageId: pkg.id, version, blobKey: key, size: size ? Number(size) : null, publishedBy: Number(payload.sub) } });

    return NextResponse.json({ uploadUrl, blobKey: key, versionId: pv.id });
  } catch (err) {
    console.error('Presign error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
