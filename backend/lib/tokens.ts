import crypto from 'crypto';

export function genToken(len = 48) {
  return crypto.randomBytes(len).toString('hex');
}

export function sha256Hex(buffer: Buffer | string) {
  if (typeof buffer === 'string') buffer = Buffer.from(buffer);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export const hashToken = (t: string) => sha256Hex(t);
