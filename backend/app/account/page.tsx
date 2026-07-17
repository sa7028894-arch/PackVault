import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((d) => setUser(d.user)).catch(console.error);
    fetch('/api/tokens').then((r) => r.json()).then((d) => setTokens(d.tokens || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function createToken() {
    const res = await fetch('/api/tokens/create', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (data.token) {
      alert('Token created. Store it now: ' + data.token);
      setTokens((t) => [...t, { id: data.id, name, createdAt: new Date().toISOString() }]);
    } else {
      alert('Error creating token: ' + JSON.stringify(data));
    }
  }

  async function revoke(id: number) {
    const res = await fetch('/api/tokens/revoke', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (data.success) {
      setTokens((t) => t.filter((x) => x.id !== id));
    }
  }

  return (
    <Layout>
      <h1>Account</h1>
      {user && (
        <div>
          <p><strong>{user.username}</strong> • {user.email} {user.emailVerified ? '(verified)' : '(unverified)'}</p>
        </div>
      )}

      <section style={{ marginTop: 18 }}>
        <h3>API Tokens</h3>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Token name" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={createToken} style={{ marginLeft: 8 }}>Create</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div>
            {tokens.map((t) => (
              <div key={t.id} style={{ border: '1px solid #eee', padding: 8, marginBottom: 6 }}>
                <div>{t.name || 'token'}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{t.createdAt}</div>
                <button onClick={() => revoke(t.id)} style={{ marginTop: 6 }}>Revoke</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
