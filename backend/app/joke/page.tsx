import React, { useState } from 'react';

export default function JokePage() {
  const [joke, setJoke] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadJoke() {
    setLoading(true);
    try {
      const res = await fetch('/api/joke');
      const data = await res.json();
      setJoke(data);
    } catch (e) {
      setJoke({ error: 'Failed to load joke' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Random Joke Generator</h1>
      <button
        onClick={loadJoke}
        disabled={loading}
        style={{ padding: '8px 12px', marginBottom: 12 }}
      >
        {loading ? 'Loading...' : 'Get Random Joke'}
      </button>

      {joke && (
        <div style={{ marginTop: 20, background: '#f7f7f7', padding: 12, borderRadius: 6 }}>
          {joke.error ? (
            <p style={{ margin: 0, color: 'red' }}>{joke.error}</p>
          ) : (
            <p style={{ margin: 0 }}>
              {joke.joke ?? (joke.setup ? `${joke.setup} ${joke.punchline}` : JSON.stringify(joke))}
            </p>
          )}
        </div>
      )}

      <p style={{ marginTop: 12, color: '#666' }}>Jokes provided by icanhazdadjoke.com</p>
    </main>
  );
}
