export default function DailyLoading() {
  // Varied heights simulate real photo/video/text card mix
  const cards = [
    { h: 280 }, { h: 150 }, { h: 220 },
    { h: 130 }, { h: 340 }, { h: 200 },
    { h: 190 }, { h: 160 }, { h: 300 },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Header skeleton */}
        <div style={{ marginBottom: '48px' }}>
          <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 3, marginBottom: 22 }} />
          <div className="skeleton" style={{ height: 11, width: 96, borderRadius: 3, marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 72, width: 240, borderRadius: 6, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 14, width: 360, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 260, borderRadius: 4, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 3 }} />
        </div>

        {/* Masonry skeleton — varied heights */}
        <div className="daily-masonry">
          {cards.map((card, i) => (
            <div key={i} className="daily-card">
              <div className="skeleton" style={{ width: '100%', height: card.h, borderRadius: 'var(--radius-lg)' }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .daily-masonry { columns: 3; column-gap: 16px; }
        .daily-card { break-inside: avoid; margin-bottom: 16px; }
        @media (max-width: 900px) { .daily-masonry { columns: 2; } }
        @media (max-width: 480px) { .daily-masonry { columns: 1; } }
      `}</style>
    </div>
  );
}
