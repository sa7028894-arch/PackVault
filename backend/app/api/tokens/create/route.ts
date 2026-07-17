import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { genToken, hashToken } from '../../../lib/tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, scopes } = body;
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const auth = request.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    const { verifyToken } = await import('../../../lib/jwt');
    const payload: any = verifyToken(m[1]);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const raw = genToken(24);
    const hashed = hashToken(raw);
    const expiresAt = null; // optional expiration

    const at = await prisma.accessToken.create({ data: { userId: Number(payload.sub), token: hashed, scopes: scopes || 'publish,read', expiresAt } });

    // Return raw token once (only now)
    return NextResponse.json({ success: true, token: raw, id: at.id });
  } catch (err) {
    console.error('create access token', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
