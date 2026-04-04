export default function BlogPostLoading() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Hero section skeleton */}
      <section style={{ paddingTop: '80px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          {/* ← All Posts link */}
          <div className="skeleton" style={{ height: 10, width: 80, borderRadius: 3, marginBottom: 28 }} />
          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: 16 }}>
            <div className="skeleton" style={{ height: 22, width: 64, borderRadius: 100 }} />
            <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 100 }} />
          </div>
          {/* Title — large, 2 lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: 20 }}>
            <div className="skeleton" style={{ height: 44, width: '95%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 44, width: '72%', borderRadius: 6 }} />
          </div>
          {/* Excerpt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 24 }}>
            <div className="skeleton" style={{ height: 16, width: '100%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 16, width: '88%', borderRadius: 4 }} />
          </div>
          {/* Author + date row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
              <div className="skeleton" style={{ height: 13, width: 100, borderRadius: 4 }} />
            </div>
            <div className="skeleton" style={{ height: 10, width: 80, borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 10, width: 64, borderRadius: 3 }} />
          </div>
        </div>
      </section>

      {/* Cover image skeleton */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 48px' }}>
        <div className="skeleton" style={{ width: '100%', aspectRatio: '16/7', borderRadius: 'var(--radius-xl)' }} />
      </div>

      {/* Article body skeleton */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Paragraph blocks */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '100%', borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 14, width: '98%', borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 14, width: '94%', borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 3 }} />
          </div>
        ))}
        {/* Heading */}
        <div className="skeleton" style={{ height: 28, width: '55%', borderRadius: 5, margin: '40px 0 16px' }} />
        {/* More paragraphs */}
        {[4, 5].map(i => (
          <div key={i} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '100%', borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 14, width: '96%', borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 3 }} />
          </div>
        ))}
        {/* CTA block skeleton */}
        <div style={{ marginTop: 64, padding: 40, background: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div className="skeleton" style={{ height: 10, width: 160, borderRadius: 3 }} />
          <div className="skeleton" style={{ height: 30, width: 220, borderRadius: 5 }} />
          <div className="skeleton" style={{ height: 13, width: 180, borderRadius: 3 }} />
          <div className="skeleton" style={{ height: 40, width: 140, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
}
