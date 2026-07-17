import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;
    if (!refreshToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const t = await prisma.token.findUnique({ where: { token: refreshToken } });
    if (!t || t.type !== 'REFRESH') return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

    // mark used so it cannot be used again
    await prisma.token.update({ where: { id: t.id }, data: { used: true } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
