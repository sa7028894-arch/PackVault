import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../../lib/jwt';

export async function GET(request: Request) {
  // list packages (public)
  const packages = await prisma.package.findMany({ include: { owner: true, versions: true } });
  return NextResponse.json(packages);
}

export async function POST(request: Request) {
  // create package metadata
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  const payload: any = verifyToken(m[1]);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const body = await request.json();
  const { name, description } = body;
  if (!name) return NextResponse.json({ error: 'Missing package name' }, { status: 400 });

  try {
    const pkg = await prisma.package.create({ data: { name, description, ownerId: Number(payload.sub) } });
    return NextResponse.json(pkg, { status: 201 });
  } catch (err: any) {
    console.error('Create package error', err);
    if (err.code === 'P2002') return NextResponse.json({ error: 'Package name already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
