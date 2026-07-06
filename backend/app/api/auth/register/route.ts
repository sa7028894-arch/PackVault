import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;
    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, username, password: hashed } });

    const token = signToken({ sub: user.id, email: user.email });
    return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username }, token });
  } catch (err: any) {
    console.error('Register error', err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
