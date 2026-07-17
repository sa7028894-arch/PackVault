import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '../../../lib/prisma';
import { signToken } from '../../../lib/jwt';
import { genToken, hashToken } from '../../../lib/tokens';
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
    // rate limit login attempts per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local';
    const rl = await checkRateLimit({ prefix: 'auth-login', limit: 10, windowSec: 60, ip });
    if (!rl.allowed) return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 });

    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const access = signToken({ sub: user.id, email: user.email });
    const refresh = genToken(32);
    await prisma.token.create({ data: { userId: user.id, token: hashToken(refresh), type: 'REFRESH', expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000) } });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username }, token: access });
    res.headers.set('Set-Cookie', setRefreshCookie(refresh));
    return res;
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
