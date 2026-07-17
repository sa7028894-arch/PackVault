import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { genToken, hashToken } from '../../../lib/tokens';
import { sendMail } from '../../../lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, purpose } = body; // purpose: 'verify' | 'reset'
    if (!userId || !purpose) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const token = genToken(32);
    const hashed = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * (purpose === 'verify' ? 24 : 1));

    const type = purpose === 'verify' ? 'EMAIL_VERIFY' : 'PASSWORD_RESET';
    await prisma.token.create({ data: { userId: Number(userId), token: hashed, type, expiresAt } });

    // Compose link - in production, FRONTEND_URL should be set
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const path = purpose === 'verify' ? `/account/verify?token=${token}` : `/account/reset-password?token=${token}`;
    const link = `${frontend}${path}`;

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const subject = purpose === 'verify' ? 'Verify your PackVault email' : 'Reset your PackVault password';
    const html = `<p>Hi ${user.username},</p><p>Please <a href="${link}">click here</a> to ${purpose === 'verify' ? 'verify your email' : 'reset your password'}.</p>`;
    const text = `Visit the following link to ${purpose === 'verify' ? 'verify your email' : 'reset your password'}: ${link}`;

    // In dev-mode nodemailer may not be configured; sendMail will log and resolve
    await sendMail({ to: user.email, subject, html, text });

    // Return token only in dev for convenience/testing
    if (process.env.NODE_ENV !== 'production') return NextResponse.json({ success: true, token });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('send-token error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
