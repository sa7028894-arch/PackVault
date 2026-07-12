import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', padding: 20 }}>
      <nav style={{ marginBottom: 18 }}>
        <a href="/" style={{ marginRight: 12 }}>Home</a>
        <a href="/packages" style={{ marginRight: 12 }}>Packages</a>
        <a href="/publish" style={{ marginRight: 12 }}>Publish</a>
        <a href="/joke">Joke</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
