import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

export default function PackageDetail({ params }: { params: { name: string } }) {
  const name = params.name;
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/packages?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => { if (mounted) setPkg(data); })
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [name]);

  async function getDownload(versionId: number, ver: string, isPublic: boolean) {
    try {
      const headers: any = {};
      if (!isPublic && token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/download?name=${encodeURIComponent(name)}&version=${encodeURIComponent(ver)}`, { headers });
      const data = await res.json();
      if (data.downloadUrl) {
        // open in new tab
        window.open(data.downloadUrl, '_blank');
        // optionally log download
        try { await fetch('/api/download/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ versionId }) }); } catch (_) {}
      } else {
        alert('Failed to get download URL: ' + JSON.stringify(data));
      }
    } catch (err) {
      alert('Error: ' + String(err));
    }
  }

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (!pkg || pkg.error) return <Layout><p>Package not found.</p></Layout>;

  return (
    <Layout>
      <h1>{pkg.name}</h1>
      <p>{pkg.description}</p>
      <div style={{ marginTop: 12 }}>
        <label>Bearer token for private downloads:</label>
        <input value={token} onChange={(e) => setToken(e.target.value)} style={{ width: '100%', marginTop: 6 }} />
      </div>

      <h3 style={{ marginTop: 18 }}>Versions</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {pkg.versions.map((v: any) => (
          <div key={v.id} style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{v.version}</strong>
                <div style={{ fontSize: 12, color: '#666' }}>{v.isPublic ? 'Public' : 'Private'} {v.publishedAt ? `• ${new Date(v.publishedAt).toLocaleString()}` : ''}</div>
              </div>
              <div>
                <button onClick={() => getDownload(v.id, v.version, v.isPublic)} style={{ padding: '6px 10px' }}>
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </Layout>
  );
}
