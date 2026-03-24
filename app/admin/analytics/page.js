'use client';
import { useState, useEffect } from 'react';
import { getAnalytics } from '@/lib/firestore';
import { MessageSquare, Star, FileDown, Eye, TrendingUp, RefreshCw } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ width:42, height:42, borderRadius:'var(--radius-md)', background:`${color}18`, border:`1px solid ${color}33`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={18} color={color}/>
        </div>
        {sub && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', letterSpacing:'0.08em' }}>{sub}</div>}
      </div>
      <div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.4rem', color:'var(--text-1)', lineHeight:1 }}>{value}</div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'4px' }}>{label}</div>
      </div>
    </div>
  );
}

function PageViewBar({ page, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const labels = {
    home: 'Home', projects: 'Projects', reviews: 'Reviews',
    contact: 'Contact', apps: 'Apps', files: 'Files', pay: 'Pay',
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'90px 1fr 48px', alignItems:'center', gap:'12px', padding:'8px 0' }}>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-2)', letterSpacing:'0.06em' }}>{labels[page] || page}</div>
      <div style={{ height:8, background:'var(--bg-elevated)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'var(--accent)', borderRadius:4, transition:'width 0.6s ease' }}/>
      </div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-1)', textAlign:'right', fontWeight:700 }}>{count.toLocaleString()}</div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = () => {
    setLoading(true);
    getAnalytics().then(d => {
      setData(d);
      setLastRefresh(new Date());
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pageViews = data?.pageViews || {};
  // Remove metadata fields
  const pvEntries = Object.entries(pageViews)
    .filter(([k]) => k !== 'lastUpdated')
    .sort(([,a],[,b]) => b - a);
  const totalPV = pvEntries.reduce((s,[,v]) => s + (v || 0), 0);
  const maxPV   = pvEntries[0]?.[1] || 1;

  const STATS = [
    { icon:Eye,          label:'Total Page Views',   value: totalPV.toLocaleString(),                  color:'#234DC2', sub:'All time' },
    { icon:MessageSquare,label:'Total Messages',      value:(data?.totalMessages||0).toLocaleString(),  color:'#10b981', sub:'Inbox' },
    { icon:Star,         label:'Approved Reviews',    value:(data?.totalReviews||0).toLocaleString(),   color:'#f5c518', sub:'Published' },
    { icon:FileDown,     label:'Files Available',     value:(data?.totalFiles||0).toLocaleString(),     color:'#7c3aed', sub:'Active' },
  ];

  return (
    <div style={{ maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'4px' }}>Overview</div>
          {lastRefresh && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>Last updated: {lastRefresh.toLocaleTimeString()}</div>}
        </div>
        <button onClick={load} disabled={loading}
          style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'8px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:loading?'not-allowed':'pointer', transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent-border)';e.currentTarget.style.color='var(--accent)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)';}}>
          <RefreshCw size={13} style={{ animation: loading?'spin 1s linear infinite':'none' }}/> Refresh
        </button>
      </div>

      {loading && !data ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px' }} className="stats-grid">
          {Array.from({length:4}).map((_,i) => <div key={i} style={{ height:120, borderRadius:'var(--radius-lg)' }} className="skeleton"/>)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px' }} className="stats-grid">
            {STATS.map(s => <StatCard key={s.label} {...s}/>)}
          </div>

          {/* Page views breakdown */}
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <TrendingUp size={16} color="var(--accent)"/>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>Page Views by Page</div>
              <div style={{ marginLeft:'auto', fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>
                Tracked from public site visits
              </div>
            </div>
            {pvEntries.length === 0 ? (
              <div style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-3)', fontSize:'0.875rem', textAlign:'center', padding:'24px 0' }}>
                No page views tracked yet. Views are counted automatically when visitors browse the site.
              </div>
            ) : (
              <div style={{ borderTop:'1px solid var(--border-1)', paddingTop:'8px' }}>
                {pvEntries.map(([page, count]) => (
                  <PageViewBar key={page} page={page} count={count||0} max={maxPV}/>
                ))}
                <div style={{ borderTop:'1px solid var(--border-1)', paddingTop:'12px', marginTop:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>TOTAL</span>
                  <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--accent)' }}>{totalPV.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div style={{ background:'rgba(35,77,194,0.05)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-lg)', padding:'16px 20px' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>About Page View Tracking</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7 }}>
              Page views are counted each time a visitor loads a page on your public site. For full analytics with session data, traffic sources, and demographics, connect Google Analytics in <strong>Settings → Tracking</strong>.
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:480px) { .stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
