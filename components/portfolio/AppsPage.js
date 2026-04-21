'use client';
import { useState, useEffect, useRef } from 'react';
import { getApps } from '@/lib/firestore';
import { getAppGradient } from '@/lib/utils';
import { ExternalLink, Search, X } from 'lucide-react';

const STATUS_STYLES = {
  'Live':           { bg:'rgba(35,77,194,0.12)', color:'#234DC2', border:'rgba(35,77,194,0.3)',   label:'Live' },
  'Beta':           { bg:'rgba(245,197,24,0.1)', color:'#f5c518', border:'rgba(245,197,24,0.2)',  label:'Beta' },
  'In Development': { bg:'rgba(255,255,255,0.05)',color:'#8a8a8a', border:'rgba(255,255,255,0.1)',label:'In Dev' },
};

/* Build the list of candidate favicon URLs to try, in priority order.
   - First: the site's own /favicon.ico (fast, no 3rd-party dependency, works
     for anything with a conventional favicon).
   - Then: DuckDuckGo's icon service as a fallback for modern sites that only
     declare their favicon via <link rel="icon"> at a non-standard path.
   We deliberately AVOID Google's /s2/favicons because it serves a generic
   globe placeholder with 200 status — which defeats any fallback logic. */
function getFaviconCandidates(url) {
  if (!url) return [];
  try {
    const hostname = new URL(url).hostname;
    return [
      `https://${hostname}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    ];
  } catch {
    return [];
  }
}

/* Preload + verify a candidate list in priority order. Resolves with the
   first URL that actually loads as a real image, or null if none do.
   naturalWidth>0 guards against broken-image responses that fire onload
   with a 0x0 image (some error services do this). */
function preloadFirstValid(urls) {
  return new Promise(resolve => {
    let i = 0;
    const tryNext = () => {
      if (i >= urls.length) { resolve(null); return; }
      const src = urls[i++];
      const img = new Image();
      img.onload  = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) resolve(src);
        else tryNext();
      };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });
}

/* 3-stage cascade: uploaded iconUrl → favicon from app URL → letter + gradient.
   Matches the preview component in the admin so the admin sees exactly what
   the public page will render.

   Why we preload via new Image() instead of just rendering <img onError>:
   1. Hydration-safe — server and client both render the letter fallback on
      initial render (deterministic state, no dynamic branching). The image
      upgrade happens exclusively via useEffect post-hydration, so there's
      never a server/client HTML mismatch.
   2. Reliable error detection — some favicon services return 200 with a
      placeholder image, or 404 with an image body; <img onError> is
      unreliable across these edge cases. naturalWidth>0 + onload is the
      canonical way to verify a real image loaded.
   3. No broken-image flash — we never mount an <img> tag for a URL that
      won't load. */
function AppIcon({ name, iconUrl, url, size = 80 }) {
  // loadedKind: null (letter) | 'icon' (uploaded) | 'favicon' (from URL)
  // loadedSrc: the exact URL confirmed to load, passed to the <img> tag
  const [loadedKind, setLoadedKind] = useState(null);
  const [loadedSrc,  setLoadedSrc]  = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadedKind(null);
    setLoadedSrc(null);

    (async () => {
      // Priority 1: uploaded icon. Check independently so we know which
      // styling branch to use (cover-fill vs. centered-on-white).
      if (iconUrl) {
        const ok = await preloadFirstValid([iconUrl]);
        if (cancelled) return;
        if (ok) { setLoadedKind('icon'); setLoadedSrc(ok); return; }
      }
      // Priority 2: favicon candidates derived from the app URL.
      const favHit = await preloadFirstValid(getFaviconCandidates(url));
      if (cancelled) return;
      if (favHit) { setLoadedKind('favicon'); setLoadedSrc(favHit); }
      // else: letter fallback (default state, no state change needed).
    })();

    return () => { cancelled = true; };
  }, [iconUrl, url]);

  const letter = (name?.[0] || 'A').toUpperCase();
  const radius = Math.round(size * 0.22);
  const shadow = '0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)';

  if (loadedKind === 'icon') {
    return (
      <div style={{ width:size, height:size, borderRadius:radius, overflow:'hidden', background:'var(--bg-elevated)', flexShrink:0, boxShadow:shadow }}>
        <img src={loadedSrc} alt={name||'icon'}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      </div>
    );
  }
  if (loadedKind === 'favicon') {
    return (
      <div style={{ width:size, height:size, borderRadius:radius, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:shadow }}>
        <img src={loadedSrc} alt={name||'favicon'}
          style={{ width:'68%', height:'68%', objectFit:'contain', display:'block', userSelect:'none' }}/>
      </div>
    );
  }
  // Letter + gradient — default state (initial render, still loading, or all sources failed)
  const gradient = getAppGradient(name);
  return (
    <div style={{ width:size, height:size, borderRadius:radius, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:shadow }}>
      <span style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:size*0.5, color:'#fff', lineHeight:1, userSelect:'none' }}>
        {letter}
      </span>
    </div>
  );
}

function AppCard({ app, featured = false }) {
  const status   = STATUS_STYLES[app.status] || STATUS_STYLES['Live'];
  const iconSize = featured ? 72 : 64;
  const hasBanner = !!(app.bannerUrl);

  const cardContent = (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease', cursor:app.url?'pointer':'default' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 20px 40px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor='var(--accent-border)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border-2)'; }}
    >
      {/* Banner image */}
      {hasBanner && (
        <div style={{ width:'100%', height: featured ? 160 : 120, overflow:'hidden', background:'var(--bg-elevated)' }}>
          <img src={app.bannerUrl} alt={app.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
        </div>
      )}
      {/* Card body */}
      <div style={{ padding: featured ? '20px 24px 24px' : '16px 20px 20px', display:'flex', flexDirection: featured ? 'row' : 'column', alignItems:'center', gap: featured ? '18px' : '12px', textAlign: featured ? 'left' : 'center' }}>
        <AppIcon name={app.name} iconUrl={app.iconUrl} url={app.url} size={iconSize}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize: featured ? '1.05rem' : '0.9rem', color:'var(--text-1)', marginBottom:'6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {app.name}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent: featured ? 'flex-start' : 'center', flexWrap:'wrap' }}>
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
    </div>
  );

  if (app.url) {
    return (
      <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', display:'block' }}>
        {cardContent}
      </a>
    );
  }
  return <div>{cardContent}</div>;
}

function Skeleton() {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
      <div style={{ width:64, height:64, borderRadius:14 }} className="skeleton"/>
      <div style={{ height:14, width:'70%', borderRadius:4 }} className="skeleton"/>
      <div style={{ height:20, width:'40%', borderRadius:100 }} className="skeleton"/>
    </div>
  );
}

export default function AppsPage() {
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    getApps().then(data => {
      setApps(data.filter(a => a.active !== false));
      setLoading(false);
    });
  }, []);

  const q            = query.toLowerCase();
  const filtered     = apps.filter(a => !q || a.name?.toLowerCase().includes(q) || a.status?.toLowerCase().includes(q));
  const featuredApps = query ? [] : apps.filter(a => a.featured).slice(0, 2);
  const featuredIds  = new Set(featuredApps.map(a => a.id));
  const regular      = query ? filtered : filtered.filter(a => !featuredIds.has(a.id));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardW = (window.innerWidth * 0.85 - 24) + 12;
    const idx = Math.round(el.scrollLeft / cardW);
    setActiveDot(Math.max(0, Math.min(idx, featuredApps.length - 1)));
  };

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>

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
          <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps…"
            style={{ width:'100%', padding:'11px 38px 11px 40px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
            onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
            onBlur={e=>e.target.style.borderColor='var(--border-2)'}
          />
          {query && (
            <button onClick={()=>setQuery('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'4px' }}>
              <X size={14}/>
            </button>
          )}
        </div>

        {!loading && apps.length > 0 && (
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginBottom:'24px', letterSpacing:'0.08em' }}>
            {query ? `${filtered.length} of ${apps.length} apps` : `${apps.length} apps`}
          </div>
        )}

        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px' }} className="apps-grid">
            {Array.from({length:8}).map((_,i) => <Skeleton key={i}/>)}
          </div>
        )}

        {!loading && apps.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit, sans-serif' }}>
            No apps yet — check back soon.
          </div>
        )}

        {!loading && apps.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
            <Search size={28} style={{ color:'var(--text-3)' }} strokeWidth={1}/>
            <div style={{ fontFamily:'Outfit, sans-serif', color:'var(--text-3)', fontSize:'0.9rem' }}>No apps match &quot;{query}&quot;</div>
            <button onClick={()=>setQuery('')} style={{ color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem' }}>
              Clear search
            </button>
          </div>
        )}

        {/* Featured section */}
        {!loading && featuredApps.length > 0 && (
          <div style={{ marginBottom:'32px' }}>
            <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'12px' }}>
              Featured
            </div>

            {/* Desktop: grid (1 or 2 col) */}
            <div className="feat-apps-desktop" style={{ display:'grid', gridTemplateColumns: featuredApps.length >= 2 ? '1fr 1fr' : '1fr', gap:'16px' }}>
              {featuredApps.map(app => <AppCard key={app.id} app={app} featured/>)}
            </div>

            {/* Mobile: 1 featured — full width */}
            {featuredApps.length === 1 && (
              <div className="feat-apps-mobile-single" style={{ display:'none' }}>
                <AppCard app={featuredApps[0]} featured/>
              </div>
            )}

            {/* Mobile: 2 featured — peek carousel + dots */}
            {featuredApps.length >= 2 && (
              <div className="feat-apps-mobile-multi" style={{ display:'none' }}>
                <div ref={scrollRef} onScroll={handleScroll}
                  style={{ display:'flex', overflowX:'auto', gap:'12px', scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch', scrollbarWidth:'none' }}>
                  {featuredApps.map(app => (
                    <div key={app.id} style={{ minWidth:'calc(85vw - 24px)', maxWidth:'360px', flexShrink:0, scrollSnapAlign:'start' }}>
                      <AppCard app={app} featured/>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'14px' }}>
                  {featuredApps.map((_, i) => (
                    <div key={i} style={{ width: i===activeDot ? 18 : 6, height:6, borderRadius:3, background: i===activeDot ? 'var(--accent)' : 'var(--border-2)', transition:'all 0.25s ease' }}/>
                  ))}
                </div>
              </div>
            )}
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
        @media (max-width: 1280px) { .apps-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 1024px) { .apps-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px) {
          .apps-grid              { grid-template-columns: repeat(2, 1fr) !important; }
          .feat-apps-desktop      { display: none !important; }
          .feat-apps-mobile-single { display: block !important; }
          .feat-apps-mobile-multi  { display: block !important; }
        }
        .feat-apps-mobile-multi > div:first-child::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
