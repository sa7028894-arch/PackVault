import React, { useState } from 'react';

function App() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm install -g packvault');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f3f4f6' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #27272a', position: 'sticky', top: 0, backgroundColor: '#09090be6', backdropFilter: 'blur(8px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 'bold' }}>
            ⬡
          </div>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.5px' }}>PackVault</span>
            <span style={{ display: 'block', fontSize: '9px', color: '#a1a1aa', letterSpacing: '1.5px' }}>BY SHOAIB AHMAD</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '14px', color: '#d4d4d8' }}>
          <span style={{ cursor: 'pointer' }}>Docs</span>
          <span style={{ cursor: 'pointer' }}>Use Cases</span>
          <span style={{ cursor: 'pointer' }}>Community</span>
          <span style={{ cursor: 'pointer' }}>Releases</span>
        </div>
        <div>
          <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#18181b', border: '1px solid #27272a', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', color: '#d4d4d8', marginBottom: '24px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
            <span>PackVault v0.2.3 by Shoaib Ahmad</span>
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: 1.1, margin: '0 0 24px 0' }}>
            Cache npm packages once.<br />
            <span style={{ color: '#dc2626' }}>Install forever.</span>
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px' }}>
            The offline-first package caching CLI. Perfect for unreliable networks, travel, classrooms, and air-gapped systems. Built for the modern developer.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
              Get Started Free →
            </button>
            <button style={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #27272a', padding: '14px 28px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
              Star on GitHub
            </button>
          </div>
        </div>

        {/* Terminal Window Mockup */}
        <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden', fontFamily: 'monospace', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
          <div style={{ backgroundColor: '#18181b', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: '#71717a' }}>bash</span>
            <div style={{ width: '30px' }}></div>
          </div>
          <div style={{ padding: '24px', fontSize: '14px', lineHeight: 1.8 }}>
            <div style={{ color: '#ef4444', marginBottom: '8px' }}>➜ <span style={{ color: '#fff' }}>packvault sync react vite tailwindcss</span></div>
            <div style={{ color: '#71717a' }}>[+] Cached react@18.2.0 and 3 dependencies</div>
            <div style={{ color: '#71717a' }}>[+] Cached vite@5.0.0 and 12 dependencies</div>
            <div style={{ color: '#71717a' }}>[+] Cached tailwindcss@3.3.0 and 28 dependencies</div>
            <div style={{ color: '#22c55e', marginTop: '8px' }}>✓ Sync complete. Ready for offline use.</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '96px 24px', borderTop: '1px solid #18181b', backgroundColor: '#0c0c0e' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 64px auto' }}>
          <span style={{ fontSize: '11px', color: '#71717a', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600' }}>A Premium Tool Developed By</span>
          <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', margin: '8px 0 16px 0' }}>SHOAIB AHMAD</div>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Built for Resilience</h2>
          <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: 1.6 }}>Modern development relies heavily on the network. PackVault severs that dependency, giving you blazing fast installs regardless of your connection quality.</p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#121216', border: '1px solid #27272a', padding: '32px', borderRadius: '16px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>The Offline Vault</h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>Sync npm metadata and tarballs into a durable local vault. Install anywhere, anytime. Zero network calls required once cached.</p>
          </div>
          <div style={{ backgroundColor: '#121216', border: '1px solid #27272a', padding: '32px', borderRadius: '16px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🛜</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>LAN Package Sharing</h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>Discover peers via mDNS. Share your vault across your local network and sync bidirectionally. Perfect for teams in the same room.</p>
          </div>
          <div style={{ backgroundColor: '#121216', border: '1px solid #27272a', padding: '32px', borderRadius: '16px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔒</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Integrity & Security</h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>Strict SHA-512 verification ensures your cached packages match the official npm registry exactly. Perform offline security audits.</p>
          </div>
          <div style={{ backgroundColor: '#121216', border: '1px solid #27272a', padding: '32px', borderRadius: '16px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚡</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Lockfile Aware</h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>Automatically parses package-lock.json to cache exactly what your project needs, down to the byte.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid #18181b', backgroundColor: '#09090b' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Ready to work offline?</h2>
        <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Install PackVault today and never let a poor connection slow you down again.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
          <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
            Install Now
          </button>
          <div onClick={copyCommand} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '12px 20px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '13px', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>npm install -g packvault</span>
            <span style={{ color: '#dc2626' }}>{copied ? 'Copied!' : '📋'}</span>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer style={{ borderTop: '1px solid #18181b', padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', fontSize: '14px', color: '#71717a', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>PackVault</div>
          <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '16px' }}>Cache npm packages once. Install forever — even offline.</p>
          <p style={{ fontSize: '12px' }}>© 2026 Shoaib Ahmad. All rights reserved.</p>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>Resources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <span>Documentation</span>
            <span>Command Reference</span>
            <span>Use Cases</span>
          </div>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>Community</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <span>Discussions</span>
            <span>Issues</span>
            <span>Releases</span>
          </div>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>More Projects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <span>IssueSwipe</span>
            <span>Abyss</span>
            <span>schema-cast</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;