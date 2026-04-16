// Next.js App Router automatically renders this while LogPage
// is awaiting its async data. Matches the /log visual language.
export default function LogLoading() {
  // Varied heights so the skeleton feels like real masonry content
  const heights = [220, 320, 180, 280, 240, 360];
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '72px 24px 120px',
      overflowX: 'hidden',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Skeleton header */}
        <div style={{ marginBottom: 56 }}>
          <div className="log-skel" style={{ height: 72, width: '40%', maxWidth: 380 }}/>
          <div className="log-skel" style={{ height: 16, width: '30%', maxWidth: 240, marginTop: 16 }}/>
        </div>
        {/* Skeleton filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
          {[48, 72, 72, 66, 72].map((w, i) => (
            <div key={i} className="log-skel" style={{ height: 36, width: w, borderRadius: 999 }}/>
          ))}
        </div>
        {/* Masonry-style skeleton cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          gridAutoRows: 'min-content',
        }} className="log-skel-grid">
          {heights.map((h, i) => (
            <div key={i} className="log-skel" style={{
              height: h,
              gridColumn: 'span 1',
              borderRadius: 16,
            }}/>
          ))}
        </div>
      </div>

      <style>{`
        .log-skel {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.03) 0%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.03) 100%
          );
          background-size: 200% 100%;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          animation: log-skel-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes log-skel-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 1023px) {
          .log-skel-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
