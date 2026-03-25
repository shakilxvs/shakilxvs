'use client';
import { useState, useEffect } from 'react';
import { getApps } from '@/lib/firestore';
import { getAppGradient } from '@/lib/utils';
import { ExternalLink, Search, X } from 'lucide-react';

const STATUS_STYLES = {
  'Live':           { bg:'rgba(35,77,194,0.12)',   color:'#234DC2', border:'rgba(35,77,194,0.3)',   label:'Live' },
  'Beta':           { bg:'rgba(245,197,24,0.1)',   color:'#f5c518', border:'rgba(245,197,24,0.2)',  label:'Beta' },
  'In Development': { bg:'rgba(255,255,255,0.05)', color:'#8a8a8a', border:'rgba(255,255,255,0.1)', label:'In Dev' },
};

function AppIcon({ name, size = 80 }) {
  const letter   = (name?.[0] || 'A').toUpperCase();
  const gradient = getAppGradient(name);
  return (
    <div style={{ width:size, height:size, borderRadius:Math.round(size*0.22), background:gradient, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)' }}>
      <span style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:size*0.5, color:'#fff', lineHeight:1, userSelect:'none' }}>
        {letter}
      </span>
    </div>
  );
}

function AppCard({ app, featured = false }) {
  const status   = STATUS_STYLES[app.status] || STATUS_STYLES['Live'];
  const iconSize = featured ? 80 : 72;

  const inner = (
    <div
      style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:featured ? '24px' : '20px', display:'flex', flexDirection:featured ? 'row' : 'column', alignItems:'center', gap:featured ? '20px' : '14px', textAlign:featured ? 'left' : 'center', transition:'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease', cursor:app.url ? 'pointer' : 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 20px 40px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor='var(--accent-border)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border-2)'; }}
    >
      <AppIcon name={app.name} size={iconSize}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:featured ? '1.1rem' : '0.9rem', color:'var(--text-1)', marginBottom:'6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {app.name}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:featured ? 'flex-start' : 'center', flexWrap:'wrap' }}>
          <span style={{ padding:'2px 10px', background:status.bg, border:`1px solid ${status.border}`, borderRadius:'100px', fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:status.color, letterSpacing:'0.05em' }}>
            {status.label}
          </span>
          {featured && app.url && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontFamily:'Outfit, sans-serif', fontSize:'0.8rem', color:'var(--text-3)' }}>
              <ExternalLink size={12}/> Open App
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (app.url) {
    return (
      <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', display:'block' }}>
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
}

function Skeleton() {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
      <div style={{ width:72, height:72, borderRadius:16 }} className="skeleton"/>
      <div style={{ height:14, width:'70%', borderRadius:4 }} className="skeleton"/>
      <div style={{ height:20, width:'40%', borderRadius:100 }} className="skeleton"/>
    </div>
  );
}

export default function AppsPage() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');

  useEffect(() => {
    getApps().then(data => {
      setApps(data.filter(a => a.active !== false));
      setLoading(false);
    });
  }, []);

  const q          = query.toLowerCase();
  const filtered   = apps.filter(a => !q || a.name?.toLowerCase().includes(q) || a.status?.toLowerCase().includes(q));
  // Support up to 2 featured apps — if searching, don't show featured section
  const featuredApps = query ? [] : apps.filter(a => a.featured).slice(0, 2);
  const featuredIds  = new Set(featuredApps.map(a => a.id));
  // Regular = active + not featured (when not searching). When searching, show everything in filtered
  const regular = query
    ? filtered
    : filtered.filter(a => !featuredIds.has(a.id));

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Products</div>
          <h1 style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'clamp(3rem, 6vw, 5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'16px' }}>
            My Apps
          </h1>
          <p style={{ fontFamily:'Outfit, sans-serif', fontSize:'1rem', color:'var(--text-2)', maxWidth:'480px', lineHeight:1.7 }}>
            Web apps and digital products I&apos;ve built and launched.
          </p>
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:'12px' }}>
          <Search size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }}/>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search apps…"
            style={{ width:'100%', padding:'11px 38px 11px 40px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor='var(--accent-border)'}
            onBlur={e  => e.target.style.borderColor='var(--border-2)'}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'4px' }}>
              <X size={14}/>
            </button>
          )}
        </div>

        {/* Count */}
        {!loading && apps.length > 0 && (
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginBottom:'24px', letterSpacing:'0.08em' }}>
            {query ? `${filtered.length} of ${apps.length} apps` : `${apps.length} apps`}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px' }} className="apps-grid">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i}/>)}
          </div>
        )}

        {/* No apps at all */}
        {!loading && apps.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit, sans-serif' }}>
            No apps yet — check back soon.
          </div>
        )}

        {/* No search results */}
        {!loading && apps.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
            <Search size={28} style={{ color:'var(--text-3)' }} strokeWidth={1}/>
            <div style={{ fontFamily:'Outfit, sans-serif', color:'var(--text-3)', fontSize:'0.9rem' }}>No apps match &quot;{query}&quot;</div>
            <button onClick={() => setQuery('')} style={{ color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem' }}>
              Clear search
            </button>
          </div>
        )}

        {/* Featured section (only when not searching) */}
        {!loading && featuredApps.length > 0 && (
          <div style={{ marginBottom:'32px' }}>
            <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'12px' }}>
              Featured
            </div>
            {/* 1 featured → full-width wide card. 2 featured → side by side */}
            {/* Desktop: 2-col grid. Mobile: horizontal swipe */}
            <div className="featured-apps-grid" style={{ display:'grid', gridTemplateColumns: featuredApps.length === 2 ? '1fr 1fr' : '1fr', gap:'16px' }}>
              {featuredApps.map(app => <AppCard key={app.id} app={app} featured/>)}
            </div>
            <div className="featured-apps-scroll" style={{ display:'none', overflowX:'auto', gap:'14px', scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch', paddingBottom:'8px', scrollbarWidth:'none' }}>
              {featuredApps.map(app => (
                <div key={app.id} style={{ minWidth:'82vw', maxWidth:'340px', scrollSnapAlign:'start', flexShrink:0 }}>
                  <AppCard app={app} featured/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular grid */}
        {!loading && regular.length > 0 && (
          <>
            {featuredApps.length > 0 && !query && (
              <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'12px' }}>
                All Apps
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px' }} className="apps-grid">
              {regular.map(app => <AppCard key={app.id} app={app}/>)}
            </div>
          </>
        )}

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .apps-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .apps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .featured-apps-grid { display: none !important; }
          .featured-apps-scroll { display: flex !important; }
        }
        .featured-apps-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
