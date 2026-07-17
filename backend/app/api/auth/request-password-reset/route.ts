import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { genToken, hashToken } from '../../../lib/tokens';
import { checkRateLimit } from '../../../lib/rateLimiter';

export async function POST(request: Request) {
  try {
    // rate limit requests to avoid abuse
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local';
    const rl = await checkRateLimit({ prefix: 'auth-reset-req', limit: 5, windowSec: 60, ip });
    if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: true }); // don't reveal

    const token = genToken(32);
    await prisma.token.create({ data: { userId: user.id, token: hashToken(token), type: 'PASSWORD_RESET', expiresAt: new Date(Date.now() + 1000 * 60 * 60) } });

    // In production send email with link to the frontend reset page including the token.
    // For dev return the token in response so tests can use it.
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, resetToken: token });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Request password reset error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
