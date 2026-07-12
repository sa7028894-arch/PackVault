import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { createPresignedDownload } from '../../lib/s3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const version = searchParams.get('version');
    if (!name || !version) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const pkg = await prisma.package.findUnique({ where: { name }, include: { versions: true } });
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    const pv = pkg.versions.find((v) => v.version === version);
    if (!pv) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

    // If the version is not public, require auth
    if (!pv.isPublic) {
      const auth = request.headers.get('authorization') || '';
      const m = auth.match(/^Bearer (.+)$/);
      if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
      const { verifyToken } = await import('../../lib/jwt');
      const payload: any = verifyToken(m[1]);
      if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      // allow any authenticated user (or we could require ownership)
    }

    // log download stat
    try {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local';
      const ua = request.headers.get('user-agent') || undefined;
      await prisma.downloadStat.create({ data: { packageVersionId: pv.id, ip: String(ip), userAgent: ua } });
    } catch (e) {
      console.error('Failed to log download stat', e);
    }

    const url = await createPresignedDownload(pv.blobKey);
    return NextResponse.json({ downloadUrl: url });
  } catch (err) {
    console.error('Download error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
