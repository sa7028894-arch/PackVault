import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get('perPage') || '10')));

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const total = await prisma.package.count({ where });
    const packages = await prisma.package.findMany({
      where,
      include: { versions: true },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return NextResponse.json({ packages, total, page, perPage });
  } catch (err) {
    console.error('Search error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
