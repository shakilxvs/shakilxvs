export default function BlogLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
      {/* Background orb — matches real page */}
      <div style={{ position: 'absolute', top: '5%', right: '-5%', width: '500px', height: '500px', background: 'rgba(35,77,194,0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Header skeleton */}
        <div style={{ marginBottom: '56px' }}>
          <div className="skeleton" style={{ height: 11, width: 140, borderRadius: 4, marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 64, width: 160, borderRadius: 6, marginBottom: 18 }} />
          <div className="skeleton" style={{ height: 14, width: 420, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 300, borderRadius: 4 }} />
        </div>

        {/* Blog card grid — 3 cols, 6 cards, matches real grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="blog-grid">
          {[200, 180, 220, 190, 210, 170].map((titleWidth, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Cover image — 16:9 */}
              <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%', borderRadius: 0, flexShrink: 0 }} />
              {/* Card body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {/* Date + read time row */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div className="skeleton" style={{ height: 10, width: 88, borderRadius: 3 }} />
                  <div className="skeleton" style={{ height: 10, width: 56, borderRadius: 3 }} />
                </div>
                {/* Title — 2 lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div className="skeleton" style={{ height: 16, width: '92%', borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 16, width: `${titleWidth}px`, borderRadius: 4 }} />
                </div>
                {/* Excerpt — 3 lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="skeleton" style={{ height: 12, width: '100%', borderRadius: 3 }} />
                  <div className="skeleton" style={{ height: 12, width: '96%', borderRadius: 3 }} />
                  <div className="skeleton" style={{ height: 12, width: '72%', borderRadius: 3 }} />
                </div>
                {/* Read More link */}
                <div className="skeleton" style={{ height: 12, width: 80, borderRadius: 3, marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:1024px){.blog-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:640px) {.blog-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
}
