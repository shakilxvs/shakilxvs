export default function DailyLoading() {
  const cards = [280, 160, 230, 140, 320, 200, 175, 145, 290];
  return (
    <>
      {/* Profile hero skeleton */}
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:64, paddingTop:128, position:'relative' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:22, padding:'52px 44px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:32, maxWidth:480, width:'90%' }}>
          <div className="skeleton" style={{ height:24, width:120, borderRadius:100 }}/>
          <div className="skeleton" style={{ width:148, height:148, borderRadius:'50%', flexShrink:0 }}/>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div className="skeleton" style={{ height:52, width:220, borderRadius:6 }}/>
            <div className="skeleton" style={{ height:14, width:280, borderRadius:4 }}/>
            <div className="skeleton" style={{ height:14, width:200, borderRadius:4 }}/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[80,90,88].map((w,i) => <div key={i} className="skeleton" style={{ height:26, width:w, borderRadius:100 }}/>)}
          </div>
        </div>
      </div>

      {/* Feed skeleton */}
      <div style={{ paddingBottom:80 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ paddingTop:64, paddingBottom:32 }}>
            <div className="skeleton" style={{ height:48, width:120, borderRadius:6 }}/>
          </div>
          <div className="daily-masonry">
            {cards.map((h,i) => (
              <div key={i} className="daily-card">
                <div className="skeleton" style={{ width:'100%', height:h, borderRadius:16 }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .daily-masonry { columns: 3; column-gap: 16px; }
        .daily-card    { break-inside: avoid; margin-bottom: 16px; }
        @media (max-width: 900px) { .daily-masonry { columns: 2; } }
        @media (max-width: 480px) { .daily-masonry { columns: 1; } }
      `}</style>
    </>
  );
}
