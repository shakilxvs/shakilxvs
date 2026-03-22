export const metadata = {
  title: 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
  description: 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer with 6+ years experience and 5000+ global projects.',
  alternates: { canonical: 'https://shakilxvs.vercel.app' },
};

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '4rem',
        color: '#00ff88',
        letterSpacing: '0.05em',
      }}>
        SHAKIL
      </div>
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.75rem',
        color: '#8a8a8a',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        Portfolio CMS — Phase 1 Complete ✓
      </div>
      <a href="/admin" style={{
        marginTop: '24px',
        padding: '10px 24px',
        background: '#00ff88',
        color: '#000',
        borderRadius: '10px',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        textDecoration: 'none',
        fontSize: '0.9rem',
      }}>
        Go to Admin →
      </a>
    </main>
  );
}
