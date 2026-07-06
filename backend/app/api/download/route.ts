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

    const url = await createPresignedDownload(pv.blobKey);
    return NextResponse.json({ downloadUrl: url });
  } catch (err) {
    console.error('Download error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
