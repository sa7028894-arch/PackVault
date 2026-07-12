import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';

type Pkg = { id: number; name: string; description?: string; versions: { id: number; version: string; isPublic: boolean }[] };

export default function PackagesPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const url = `/api/packages/search?q=${encodeURIComponent(q)}&page=${page}&perPage=${perPage}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setPackages(data.packages || []);
        setTotal(data.total || 0);
      })
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [q, page, perPage]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <Layout>
      <h1>Packages</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search packages"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          style={{ width: '60%', padding: '8px 10px' }}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {packages.map((p) => (
            <div key={p.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <p style={{ marginTop: 6 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {p.versions.map((v) => (
                  <a key={v.id} href={`/packages/${encodeURIComponent(p.name)}`}>
                    <button style={{ padding: '6px 10px', marginRight: 6 }}>
                      View {v.version} {v.isPublic ? '(public)' : ''}
                    </button>
                  </a>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
            <span>Page {page} / {pages}</span>
            <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page >= pages}>Next</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
