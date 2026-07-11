import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || 'us-east-1';
const accessKey = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;
const bucket = process.env.S3_BUCKET || 'packvault';

export const s3 = new S3Client({
  region,
  endpoint: endpoint || undefined,
  credentials: accessKey && secretKey ? { accessKeyId: accessKey, secretAccessKey: secretKey } : undefined,
  forcePathStyle: true,
});

export async function createPresignedUpload(key: string, contentType = 'application/octet-stream') {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

export async function createPresignedDownload(key: string) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

export async function headObject(key: string) {
  const cmd = new HeadObjectCommand({ Bucket: bucket, Key: key });
  return s3.send(cmd);
}

export async function verifyObjectChecksum(key: string, expectedSha256: string) {
  if (!expectedSha256) return false;
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const res = await s3.send(cmd);
  const stream = res.Body as unknown as NodeJS.ReadableStream;
  return new Promise<boolean>((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    stream.on('data', (chunk: Buffer) => hash.update(chunk));
    stream.on('end', () => {
      const digest = hash.digest('hex');
      resolve(digest === expectedSha256.toLowerCase());
    });
    stream.on('error', (err: any) => reject(err));
  });
}
