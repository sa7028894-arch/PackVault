import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ sub: user.id, email: user.email });
    return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username }, token });
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
