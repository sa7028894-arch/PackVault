import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { signToken } from '../../../lib/jwt';
import { genToken, hashToken } from '../../../lib/tokens';
import { sha256Hex } from '../../../lib/tokens';
import { checkRateLimit } from '../../../lib/rateLimiter';

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
function setRefreshCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookie = `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${REFRESH_MAX_AGE}; SameSite=Strict${secure}`;
  return cookie;
}

function parseCookie(cookieHeader: string | null) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').map((c) => c.trim()).reduce((acc: any, c) => {
    const [k, ...v] = c.split('=');
    acc[k] = v.join('=');
    return acc;
  }, {});
}

export async function POST(request: Request) {
  try {
    // rate limit refresh attempts
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local';
    const rl = await checkRateLimit({ prefix: 'auth-refresh', limit: 30, windowSec: 60, ip });
    if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookie(cookieHeader);
    const raw = cookies.refreshToken;
    if (!raw) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const hashed = sha256Hex(raw);
    const t = await prisma.token.findUnique({ where: { token: hashed } });
    if (!t || t.type !== 'REFRESH') return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    if (t.expiresAt && t.expiresAt < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 401 });
    if (t.used) return NextResponse.json({ error: 'Token already used' }, { status: 401 });

    // rotate refresh token: mark old used and issue new one
    await prisma.token.update({ where: { id: t.id }, data: { used: true } });
    const newRefresh = genToken(32);
    await prisma.token.create({ data: { userId: t.userId, token: hashToken(newRefresh), type: 'REFRESH', expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000) } });

    const user = await prisma.user.findUnique({ where: { id: t.userId } });
    const access = signToken({ sub: user!.id, email: user!.email });
    const res = NextResponse.json({ token: access });
    res.headers.set('Set-Cookie', setRefreshCookie(newRefresh));
    return res;
  } catch (err) {
    console.error('Refresh error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
