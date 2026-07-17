import fetch from 'node-fetch';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('auth: refresh rotation', () => {
  jest.setTimeout(120000);
  test('refresh token rotation and reuse detection', async () => {
    // register
    const email = `refresh${Date.now()}@example.com`;
    const username = `u${Date.now()}`;
    const password = 'sekret123';
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, username, password })
    });
    expect(regRes.ok).toBeTruthy();
    const regJson = await regRes.json();
    // get Set-Cookie header for refresh
    const setCookie = regRes.headers.get('set-cookie') || regRes.headers.get('Set-Cookie');
    expect(setCookie).toBeTruthy();
    const cookie = setCookie.split(';')[0];

    // call refresh to rotate
    const refreshRes = await fetch(`${BASE}/api/auth/refresh`, { method: 'POST', headers: { cookie } });
    expect(refreshRes.ok).toBeTruthy();
    const refreshJson = await refreshRes.json();
    expect(refreshJson.token).toBeTruthy();
    const newSet = refreshRes.headers.get('set-cookie') || refreshRes.headers.get('Set-Cookie');
    expect(newSet).toBeTruthy();
    const newCookie = newSet.split(';')[0];

    // reuse old cookie should fail
    const reuseRes = await fetch(`${BASE}/api/auth/refresh`, { method: 'POST', headers: { cookie } });
    expect(reuseRes.status).toBe(401);
  });
});
