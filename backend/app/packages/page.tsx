import React, { useEffect, useState } from 'react';

type Package = {
  id: number;
  name: string;
  description?: string;
  versions: { id: number; version: string; isPublic: boolean }[];
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/packages');
        const data = await res.json();
        setPackages(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function getDownload(pkgName: string, ver: string, isPublic: boolean) {
    try {
      const headers: any = {};
      if (!isPublic && token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/download?name=${encodeURIComponent(pkgName)}&version=${encodeURIComponent(ver)}`, { headers });
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert('Failed to get download URL: ' + JSON.stringify(data));
      }
    } catch (err) {
      alert('Error: ' + String(err));
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Packages</h1>
      <p>Enter your Bearer token below to download private package versions.</p>
      <input placeholder="Bearer token" value={token} onChange={(e) => setToken(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />

      {loading ? (
        <p>Loading packages...</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {packages.map((p) => (
            <div key={p.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <p style={{ marginTop: 6 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {p.versions.map((v) => (
                  <button key={v.id} onClick={() => getDownload(p.name, v.version, v.isPublic)} style={{ padding: '6px 10px' }}>
                    Download {v.version} {v.isPublic ? '(public)' : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
