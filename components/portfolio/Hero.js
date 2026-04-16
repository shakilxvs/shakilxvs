'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Star, ChevronRight } from 'lucide-react';

const DEFAULT = {
  layout: '1',
  name: 'Shakil',
  taglines: ['CMS & Custom Web Expert','Shopify Developer','Digital Marketing Strategist','eCommerce Growth Hacker','Conversion Rate Optimizer'],
  subtitle: '6+ years building premium stores, marketing systems, and custom web experiences for global brands.',
  stat1Label:'Projects Done', stat1Value:5000,
  stat2Label:'Happy Clients', stat2Value:1200,
  stat3Label:'Countries',     stat3Value:47,
  stat4Label:'Years XP',      stat4Value:6,
  cta1Text:'View My Work', cta1Url:'/projects',
  cta2Text:'Hire Me',      cta2Url:'/contact',
  responseTime:'< 2 hrs',
  profileImageUrl:'',
  l3Role:'Shopify Developer & Digital Marketer',
  l3AvailText:'Available for new projects',
};

function useTypewriter(phrases) {
  const [text,     setText]     = useState('');
  const [idx,      setIdx]      = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused,   setPaused]   = useState(false);
  useEffect(() => {
    const phrase = phrases[idx % phrases.length];
    let t;
    if (paused)        t = setTimeout(() => { setDeleting(true); setPaused(false); }, 2200);
    else if (deleting) {
      if (text.length === 0) { setDeleting(false); setIdx(i => i + 1); }
      else t = setTimeout(() => setText(s => s.slice(0, -1)), 38);
    } else {
      if (text === phrase) setPaused(true);
      else t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 65);
    }
    return () => clearTimeout(t);
  }, [text, deleting, paused, idx, phrases]);
  return text;
}

function CountUp({ target, suffix = '+', duration = 2200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function BadgeDot({ badge }) {
  if (!badge?.show) return null;
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'5px 14px', borderRadius:100, border:`1px solid ${badge.color||'#00cc66'}`, background:`${badge.color||'#00cc66'}18`, marginBottom:'16px' }}>
      <div style={{ width:7, height:7, borderRadius:'50%', background:badge.color||'#00cc66', flexShrink:0, animation:'hero-badge-pulse 2s ease-in-out infinite' }}/>
      <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:badge.color||'#00cc66', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>{badge.text||'Available for work'}</span>
    </div>
  );
}

/* ── Layout 1: Classic ───────────────────────────────────────── */
function Layout1({ h, badge, logLinkEnabled }) {
  const tagline  = useTypewriter(h.taglines?.length ? h.taglines : DEFAULT.taglines);
  const hasPhoto = !!h.profileImageUrl;
  const showLogLink = logLinkEnabled && hasPhoto;
  const stats    = [
    { v:h.stat1Value, s:'+', l:h.stat1Label },
    { v:h.stat2Value, s:'+', l:h.stat2Label },
    { v:h.stat3Value, s:'',  l:h.stat3Label },
    { v:h.stat4Value, s:'+', l:h.stat4Label },
  ];
  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:'80px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'10%', left:'-8%', width:'500px', height:'500px', background:'rgba(35,77,194,0.08)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'5%', right:'-8%', width:'400px', height:'400px', background:'rgba(25,49,171,0.06)', borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none' }}/>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center', position:'relative', zIndex:1 }} className="hero-l1-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
          <div>
            <BadgeDot badge={badge}/>
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(4rem,8vw,7rem)', lineHeight:0.92, color:'var(--text-1)', letterSpacing:'0.02em', marginBottom:'10px' }}>{h.name}</h1>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'clamp(0.75rem,1.5vw,1rem)', color:'var(--accent)', display:'flex', alignItems:'center', minHeight:'1.5em' }}>
              {tagline}
              <span style={{ display:'inline-block', width:2, height:'1em', background:'var(--accent)', marginLeft:'3px', verticalAlign:'middle', animation:'blink 1s step-end infinite' }}/>
            </div>
          </div>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(0.95rem,1.5vw,1.1rem)', color:'var(--text-2)', lineHeight:1.75, maxWidth:'480px' }}>{h.subtitle}</p>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            <Link href={h.cta1Url} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 26px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', textDecoration:'none' }}>
              {h.cta1Text} <ChevronRight size={16} strokeWidth={2.5}/>
            </Link>
            <Link href={h.cta2Url} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 26px', background:'transparent', color:'var(--text-1)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-3)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.9rem', textDecoration:'none' }}>
              {h.cta2Text} <ArrowRight size={16}/>
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', paddingTop:'24px', borderTop:'1px solid var(--border-1)' }} className="hero-l1-stats">
            {stats.map(({ v, s, l }) => (
              <div key={l} style={{ paddingRight:'12px' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'var(--accent)', lineHeight:1, marginBottom:'4px' }}><CountUp target={v} suffix={s}/></div>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
          <div style={{ position:'absolute', width:'340px', height:'340px', borderRadius:'50%', border:'1.5px dashed rgba(35,77,194,0.25)', animation:'spin 18s linear infinite', zIndex:0 }}/>
          <div style={{ position:'absolute', width:'300px', height:'300px', borderRadius:'50%', border:'1px dashed rgba(35,77,194,0.12)', animation:'spin 12s linear infinite reverse', zIndex:0 }}/>
          <div style={{ position:'absolute', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(35,77,194,0.3) 0%, rgba(35,77,194,0.1) 50%, transparent 75%)', filter:'blur(20px)', zIndex:0 }}/>
          <div style={{ width:'260px', height:'260px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(35,77,194,0.4)', background:'var(--bg-elevated)', position:'relative', zIndex:1, boxShadow:'0 0 60px rgba(35,77,194,0.25), 0 0 120px rgba(35,77,194,0.1)' }}
            className={showLogLink ? 'hero-log-ring' : undefined}>
            {showLogLink ? (
              <Link href="/log" style={{ display:'block', width:'100%', height:'100%' }}>
                <img src={h.profileImageUrl} alt={h.name} fetchPriority="high" loading="eager" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}/>
              </Link>
            ) : hasPhoto
              ? <img src={h.profileImageUrl} alt={h.name} fetchPriority="high" loading="eager" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'6rem', color:'var(--accent)', opacity:0.5 }}>{h.name?.[0]||'S'}</div>
            }
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at center, transparent 55%, rgba(9,12,20,0.6) 80%, rgba(9,12,20,0.95) 100%)', pointerEvents:'none' }}/>
          </div>
          <div style={{ position:'absolute', bottom:'10px', right:'-10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)', zIndex:2 }}>
            <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}><Clock size={16} strokeWidth={1.75}/></div>
            <div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', lineHeight:1 }}>{h.responseTime||'< 2 hrs'}</div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Avg. Response</div>
            </div>
          </div>
          <div style={{ position:'absolute', top:'20px', left:'-10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'10px 14px', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)', zIndex:2 }}>
            <Star size={14} fill="#f5c518" color="#f5c518"/>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', color:'var(--text-1)' }}>5.0</span>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>/ 5.0</span>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .hero-l1-grid  { grid-template-columns: 1fr !important; gap: 48px !important; padding-top: 20px !important; }
          .hero-l1-grid > div:last-child { order: -1; }
          .hero-l1-stats { grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; }
        }
        @keyframes hero-badge-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,204,102,0.4);} 50%{opacity:.7;box-shadow:0 0 0 4px rgba(0,204,102,0);} }
      `}</style>
    </section>
  );
}

/* ── Layout 2: Agency Bold ───────────────────────────────────── */
function Layout2({ h, badge }) {
  const subheadline = h.taglines?.[0] || DEFAULT.taglines[0];
  const stats = [
    { v:h.stat1Value, s:'+', l:h.stat1Label },
    { v:h.stat2Value, s:'+', l:h.stat2Label },
    { v:h.stat3Value, s:'',  l:h.stat3Label },
    { v:h.stat4Value, s:'+', l:h.stat4Label },
  ];
  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'80px', paddingBottom:'60px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-60%)', width:'900px', height:'700px', background:'radial-gradient(ellipse, rgba(35,77,194,0.11) 0%, rgba(35,77,194,0.04) 50%, transparent 75%)', pointerEvents:'none' }}/>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 24px', width:'100%', textAlign:'center', position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'36px' }}>
        <BadgeDot badge={badge}/>
        <div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(4.5rem,11vw,9.5rem)', lineHeight:0.88, color:'var(--text-1)', letterSpacing:'0.02em', marginBottom:'18px' }}>{h.name}</h1>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'clamp(0.75rem,1.8vw,1rem)', color:'var(--accent)', letterSpacing:'0.12em', textTransform:'uppercase' }}>{subheadline}</div>
        </div>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(1rem,1.6vw,1.15rem)', color:'var(--text-2)', lineHeight:1.75, maxWidth:'580px' }}>{h.subtitle}</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', width:'100%', maxWidth:'720px' }} className="hero-l2-stats">
          {stats.map(({ v, s, l }) => (
            <div key={l} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px 12px', textAlign:'center', transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(1.6rem,3vw,2.2rem)', color:'var(--accent)', lineHeight:1, marginBottom:'6px' }}><CountUp target={v} suffix={s}/></div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href={h.cta1Url} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 32px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.95rem', textDecoration:'none', transition:'opacity 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            {h.cta1Text} <ChevronRight size={17} strokeWidth={2.5}/>
          </Link>
          <Link href={h.cta2Url} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 32px', background:'transparent', color:'var(--text-1)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-3)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.95rem', textDecoration:'none', transition:'border-color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-3)'}>
            {h.cta2Text} <ArrowRight size={16}/>
          </Link>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', width:'100%', maxWidth:'480px' }}>
          <div style={{ flex:1, height:'1px', background:'var(--border-1)' }}/>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Trusted by global brands</span>
          <div style={{ flex:1, height:'1px', background:'var(--border-1)' }}/>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) { .hero-l2-stats { grid-template-columns: repeat(2,1fr) !important; max-width: 100% !important; } }
        @keyframes hero-badge-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,204,102,0.4);} 50%{opacity:.7;box-shadow:0 0 0 4px rgba(0,204,102,0);} }
      `}</style>
    </section>
  );
}

/* ── Layout 3: Minimal Card ──────────────────────────────────── */
function Layout3({ h, badge, logLinkEnabled }) {
  const hasPhoto  = !!h.profileImageUrl;
  const showLogLink = logLinkEnabled && hasPhoto;
  const role      = h.l3Role      || DEFAULT.l3Role;
  const availText = h.l3AvailText || DEFAULT.l3AvailText;
  const stats = [
    { v:h.stat1Value, s:'+', l:h.stat1Label },
    { v:h.stat2Value, s:'+', l:h.stat2Label },
    { v:h.stat3Value, s:'',  l:h.stat3Label },
    { v:h.stat4Value, s:'+', l:h.stat4Label },
  ];
  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:'80px', paddingBottom:'60px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'20%', right:'-5%', width:'450px', height:'450px', background:'rgba(35,77,194,0.07)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1.15fr', gap:'72px', alignItems:'center', position:'relative', zIndex:1 }} className="hero-l3-grid">
        {/* LEFT — Portrait photo */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', inset:'-10px', borderRadius:'calc(var(--radius-xl) + 4px)', background:'rgba(35,77,194,0.05)', border:'1px solid rgba(35,77,194,0.1)', pointerEvents:'none' }}/>
          <div style={{ position:'relative', borderRadius:'var(--radius-xl)', overflow:'hidden', aspectRatio:'3/4', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', boxShadow:'0 24px 60px rgba(0,0,0,0.45)' }}
            className={showLogLink ? 'hero-log-ring hero-log-ring-rect' : undefined}>
            {showLogLink ? (
              <Link href="/log" style={{ display:'block', width:'100%', height:'100%' }}>
                <img src={h.profileImageUrl} alt={h.name} fetchPriority="high" loading="eager" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}/>
              </Link>
            ) : hasPhoto
              ? <img src={h.profileImageUrl} alt={h.name} fetchPriority="high" loading="eager" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}/>
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'8rem', color:'var(--accent)', opacity:0.25 }}>{h.name?.[0]||'S'}</div>
            }
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'45%', background:'linear-gradient(to top, rgba(5,7,15,0.85), transparent)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:'16px', left:'16px', right:'16px', background:'rgba(5,7,15,0.82)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(35,77,194,0.28)', borderRadius:'var(--radius-md)', padding:'10px 14px', display:'flex', alignItems:'center', gap:'9px' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#00cc66', flexShrink:0, animation:'hero-badge-pulse 2s ease-in-out infinite' }}/>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'rgba(255,255,255,0.85)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{availText}</span>
            </div>
          </div>
        </div>
        {/* RIGHT — Content */}
        <div style={{ display:'flex', flexDirection:'column', gap:'22px' }}>
          <BadgeDot badge={badge}/>
          <div>
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5.5rem)', lineHeight:0.9, color:'var(--text-1)', letterSpacing:'0.02em', marginBottom:'10px' }}>{h.name}</h1>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'clamp(0.65rem,1.2vw,0.82rem)', color:'var(--accent)', letterSpacing:'0.06em' }}>{role}</div>
          </div>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(0.92rem,1.4vw,1.05rem)', color:'var(--text-2)', lineHeight:1.8 }}>{h.subtitle}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {stats.map(({ v, s, l }) => (
              <div key={l} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', padding:'14px 16px', transition:'border-color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.75rem', color:'var(--accent)', lineHeight:1, marginBottom:'3px' }}><CountUp target={v} suffix={s}/></div>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
            <Link href={h.cta1Url} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 28px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', textDecoration:'none', transition:'opacity 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              {h.cta1Text} <ArrowRight size={16}/>
            </Link>
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <Clock size={13} color="var(--text-3)" strokeWidth={1.75}/>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', whiteSpace:'nowrap' }}>{h.responseTime||'< 2 hrs'} avg. response</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ display:'flex', gap:'2px' }}>{Array.from({length:5}).map((_,i)=><Star key={i} size={13} fill="#f5c518" color="#f5c518"/>)}</div>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>5.0 rating · 1200+ happy clients</span>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .hero-l3-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-l3-grid > div:first-child { max-width: 340px; margin: 0 auto; }
        }
        @keyframes hero-badge-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,204,102,0.4);} 50%{opacity:.7;box-shadow:0 0 0 4px rgba(0,204,102,0);} }
      `}</style>
    </section>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function Hero({ data, badge, logLinkEnabled }) {
  const h      = { ...DEFAULT, ...data };
  const layout = String(h.layout || '1');
  if (layout === '2') return <Layout2 h={h} badge={badge}/>;
  if (layout === '3') return <Layout3 h={h} badge={badge} logLinkEnabled={logLinkEnabled}/>;
  return <Layout1 h={h} badge={badge} logLinkEnabled={logLinkEnabled}/>;
}
