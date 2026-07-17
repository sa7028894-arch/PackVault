import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../../lib/jwt';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  const payload: any = verifyToken(m[1]);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username, emailVerified: user.emailVerified } });
}
