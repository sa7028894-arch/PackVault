import { NextResponse } from 'next/server';
import { verifyToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';
import { createPresignedDownload } from '../../lib/s3';

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    const payload: any = verifyToken(m[1]);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { packageName, versionId, checksum } = body;
    if (!packageName || !versionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const pv = await prisma.packageVersion.findUnique({ where: { id: Number(versionId) }, include: { package: true } });
    if (!pv) return NextResponse.json({ error: 'Package version not found' }, { status: 404 });
    if (pv.package.name !== packageName) return NextResponse.json({ error: 'Package mismatch' }, { status: 400 });

    // verify owner
    const pkg = pv.package;
    if (pkg.ownerId !== Number(payload.sub)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // optionally verify checksum by fetching head from S3 (not implemented)
    const updated = await prisma.packageVersion.update({ where: { id: pv.id }, data: { checksum: checksum || undefined, publishedAt: new Date() } });

    const downloadUrl = await createPresignedDownload(pv.blobKey);
    return NextResponse.json({ success: true, downloadUrl, version: updated });
  } catch (err) {
    console.error('Complete upload error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
