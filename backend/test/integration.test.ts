import fetch from 'node-fetch';
import crypto from 'crypto';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function waitForServer(retries = 30, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`${BASE}/api/joke`);
      if (r.ok) return true;
    } catch (e) {
      // ignore
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
  throw new Error('Server did not become ready in time');
}

function sha256Hex(buf: Buffer) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

describe('integration: publish and download flow', () => {
  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    await waitForServer();
  });

  test('register -> create package -> presign -> upload -> complete -> download', async () => {
    const email = `test+${Date.now()}@example.com`;
    const username = `test${Date.now()}`;
    const password = 'secret123';

    // register
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    expect(regRes.ok).toBeTruthy();
    const reg = await regRes.json();
    expect(reg.token).toBeTruthy();
    const token = reg.token;

    // create package
    const pkgName = `pkg-${Date.now()}`;
    const createRes = await fetch(`${BASE}/api/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: pkgName, description: 'integration test' })
    });
    expect(createRes.status).toBe(201);
    const pkg = await createRes.json();
    expect(pkg.name).toBe(pkgName);

    // presign
    const presignRes = await fetch(`${BASE}/api/upload/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ packageName: pkgName, version: '1.0.0', contentType: 'application/octet-stream', size: 11 })
    });
    expect(presignRes.ok).toBeTruthy();
    const presign = await presignRes.json();
    expect(presign.uploadUrl).toBeTruthy();
    expect(presign.versionId).toBeTruthy();

    // upload a small blob
    const payload = Buffer.from('hello world');
    const uploadRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: payload
    });
    expect(uploadRes.ok).toBeTruthy();

    const checksum = sha256Hex(payload);

    // complete
    const completeRes = await fetch(`${BASE}/api/upload/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ packageName: pkgName, versionId: presign.versionId, checksum, makePublic: true })
    });
    expect(completeRes.ok).toBeTruthy();
    const complete = await completeRes.json();
    expect(complete.success).toBeTruthy();
    expect(complete.downloadUrl).toBeTruthy();

    // fetch download URL
    const dlRes = await fetch(complete.downloadUrl);
    expect(dlRes.ok).toBeTruthy();
    const dlBuf = Buffer.from(await dlRes.arrayBuffer());
    expect(dlBuf.equals(payload)).toBeTruthy();
  });

  test('checksum mismatch should fail', async () => {
    const email = `test2+${Date.now()}@example.com`;
    const username = `test2${Date.now()}`;
    const password = 'secret123';

    // register
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    expect(regRes.ok).toBeTruthy();
    const reg = await regRes.json();
    const token = reg.token;

    const pkgName = `pkg2-${Date.now()}`;
    const createRes = await fetch(`${BASE}/api/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: pkgName, description: 'integration test 2' })
    });
    expect(createRes.status).toBe(201);

    const presignRes = await fetch(`${BASE}/api/upload/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ packageName: pkgName, version: '1.0.0', contentType: 'application/octet-stream', size: 5 })
    });
    expect(presignRes.ok).toBeTruthy();
    const presign = await presignRes.json();

    // upload
    const payload = Buffer.from('abcde');
    const uploadRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: payload
    });
    expect(uploadRes.ok).toBeTruthy();

    // provide wrong checksum
    const wrongChecksum = 'deadbeef';
    const completeRes = await fetch(`${BASE}/api/upload/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ packageName: pkgName, versionId: presign.versionId, checksum: wrongChecksum })
    });
    // should fail with 400
    expect(completeRes.status).toBe(400);
    const body = await completeRes.json();
    expect(body.error).toMatch(/Checksum/i);
  });
});
