import React, { useState } from 'react';

export default function PublishPage() {
  const [token, setToken] = useState('');
  const [packageName, setPackageName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return setMessage('Please provide your Bearer token');
    if (!packageName || !version || !file) return setMessage('Missing fields');

    setUploading(true);
    setMessage('Requesting upload URL...');
    try {
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packageName, version, contentType: file.type, size: file.size })
      });
      const presign = await presignRes.json();
      if (!presign.uploadUrl) {
        setMessage('Failed to get upload URL: ' + JSON.stringify(presign));
        setUploading(false);
        return;
      }

      setMessage('Uploading file to storage...');
      const uploadRes = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      if (!uploadRes.ok) {
        setMessage('Upload failed: ' + uploadRes.statusText);
        setUploading(false);
        return;
      }

      setMessage('Completing upload...');
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packageName, versionId: presign.versionId })
      });
      const complete = await completeRes.json();
      if (!complete.success) {
        setMessage('Complete failed: ' + JSON.stringify(complete));
        setUploading(false);
        return;
      }

      setMessage('Upload complete! Download URL: ' + complete.downloadUrl);
    } catch (err: any) {
      setMessage('Error: ' + String(err.message || err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Publish Package</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
        <label>
          Your Bearer token (from /api/auth/login):
          <input value={token} onChange={(e) => setToken(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Package name:
          <input value={packageName} onChange={(e) => setPackageName(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Version:
          <input value={version} onChange={(e) => setVersion(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          File:
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" disabled={uploading} style={{ padding: '8px 12px' }}>{uploading ? 'Uploading...' : 'Publish'}</button>
      </form>

      {message && <div style={{ marginTop: 12, background: '#f7f7f7', padding: 12, borderRadius: 6 }}>{message}</div>}

      <p style={{ marginTop: 12, color: '#666' }}>This page demonstrates publishing a package using presigned uploads.</p>
    </main>
  );
}
