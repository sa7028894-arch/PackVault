import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '../../../lib/prisma';
import { sha256Hex } from '../../../lib/tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    if (!token || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const hashedToken = sha256Hex(token);
    const t = await prisma.token.findUnique({ where: { token: hashedToken } });
    if (!t || t.type !== 'PASSWORD_RESET') return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    if (t.expiresAt && t.expiresAt < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: t.userId }, data: { password: hashed } });
    await prisma.token.update({ where: { id: t.id }, data: { used: true } });

    // Revoke existing refresh tokens for this user by marking all REFRESH tokens used
    await prisma.token.updateMany({ where: { userId: t.userId, type: 'REFRESH', used: false }, data: { used: true } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
