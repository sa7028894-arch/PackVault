import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/jwt';

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    const payload: any = verifyToken(m[1]);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const tokens = await prisma.accessToken.findMany({ where: { userId: Number(payload.sub) }, orderBy: { id: 'desc' } });
    return NextResponse.json({ tokens: tokens.map((t) => ({ id: t.id, scopes: t.scopes, createdAt: t.createdAt })) });
  } catch (err) {
    console.error('tokens list', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
