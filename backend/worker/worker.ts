import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { verifyObjectChecksum } from '../lib/s3';

async function processJob(jobStr: string) {
  try {
    const job = JSON.parse(jobStr);
    const { packageVersionId, blobKey, expectedChecksum } = job;
    console.log('Processing verification job for', packageVersionId, blobKey);
    const ok = await verifyObjectChecksum(blobKey, expectedChecksum || '');
    if (ok) {
      await prisma.packageVersion.update({ where: { id: packageVersionId }, data: { checksum: expectedChecksum || undefined, publishedAt: new Date() } });
      console.log('Verification OK for', packageVersionId);
    } else {
      console.warn('Verification failed for', packageVersionId);
      // mark checksum null to indicate failure
      await prisma.packageVersion.update({ where: { id: packageVersionId }, data: { checksum: null } });
    }
  } catch (err) {
    console.error('Worker job failed', err);
  }
}

async function run() {
  console.log('Worker started: waiting for jobs...');
  while (true) {
    try {
      const res = await redis.blpop('packvault:verify', 0); // [list, value]
      if (res && res[1]) {
        await processJob(res[1]);
      }
    } catch (err) {
      console.error('Worker loop error', err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

run().catch((e) => { console.error('Worker failed', e); process.exit(1); });
