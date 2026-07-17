import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const auth = request.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    const { verifyToken } = await import('../../../lib/jwt');
    const payload: any = verifyToken(m[1]);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const at = await prisma.accessToken.findUnique({ where: { id: Number(id) } });
    if (!at) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (at.userId !== Number(payload.sub)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.accessToken.delete({ where: { id: at.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('revoke token', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
