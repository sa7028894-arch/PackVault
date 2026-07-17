import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '../../../lib/prisma';
import { signToken } from '../../../lib/jwt';
import { genToken, hashToken } from '../../../lib/tokens';

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function setRefreshCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookie = `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${REFRESH_MAX_AGE}; SameSite=Strict${secure}`;
  return cookie;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;
    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, username, password: hashed } });

    // create email verification token
    const verification = genToken(24);
    await prisma.token.create({ data: { userId: user.id, token: hashToken(verification), type: 'EMAIL_VERIFY', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) } });

    const access = signToken({ sub: user.id, email: user.email });
    // create refresh token as opaque token in DB (store hashed)
    const refresh = genToken(32);
    await prisma.token.create({ data: { userId: user.id, token: hashToken(refresh), type: 'REFRESH', expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000) } });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username }, token: access });

    // Set cookie with raw refresh token
    res.headers.set('Set-Cookie', setRefreshCookie(refresh));

    // For dev: return verification token in response so devs/tests can verify; in prod we don't expose tokens
    if (process.env.NODE_ENV !== 'production') {
      const bodyObj: any = await res.json();
      // re-create response including verification for dev convenience
      return NextResponse.json({ ...bodyObj, verificationToken: verification }, { status: 200, headers: { 'Set-Cookie': setRefreshCookie(refresh) } });
    }

    return res;
  } catch (err: any) {
    console.error('Register error', err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
