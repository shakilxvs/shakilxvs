'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Star, ChevronRight } from 'lucide-react';

const DEFAULT = {
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
};

function useTypewriter(phrases) {
  const [text, setText]       = useState('');
  const [idx, setIdx]         = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused]   = useState(false);

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

export default function Hero({ data, badge }) {
  const h = { ...DEFAULT, ...data };
  const tagline = useTypewriter(h.taglines || DEFAULT.taglines);
  const hasPhoto = !!h.profileImageUrl;

  const stats = [
    { v: h.stat1Value, s: '+', l: h.stat1Label },
    { v: h.stat2Value, s: '+', l: h.stat2Label },
    { v: h.stat3Value, s: '',  l: h.stat3Label },
    { v: h.stat4Value, s: '+', l: h.stat4Label },
  ];

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:'80px', position:'relative', overflow:'hidden' }}>
      {/* Orbs */}
      <div style={{ position:'absolute', top:'10%', left:'-8%', width:'500px', height:'500px', background:'rgba(35,77,194,0.08)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'5%', right:'-8%', width:'400px', height:'400px', background:'rgba(25,49,171,0.06)', borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none' }}/>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center', position:'relative', zIndex:1 }} className="hero-grid">

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 14px', background:'rgba(35,77,194,0.08)', border:'1px solid rgba(35,77,194,0.25)', borderRadius:'100px', width:'fit-content' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 8px var(--accent)', animation:'pulse-dot 2s ease-in-out infinite', flexShrink:0, display:'inline-block' }}/>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--accent)', letterSpacing:'0.05em' }}>Available for projects</span>
          </div>

          <div>
            
      {/* Available for work badge */}
      {badge?.show && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'5px 14px', borderRadius:100, border:`1px solid ${badge.color||'#00cc66'}`, background:`${badge.color||'#00cc66'}18`, marginBottom:'16px' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:badge.color||'#00cc66', flexShrink:0, animation:'badge-pulse 2s ease-in-out infinite' }}/>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:badge.color||'#00cc66', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>{badge.text||'Available for work'}</span>
        </div>
      )}
<h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(4rem,8vw,7rem)', lineHeight:0.92, color:'var(--text-1)', letterSpacing:'0.02em', marginBottom:'10px' }}>
              {h.name}
            </h1>
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

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', paddingTop:'24px', borderTop:'1px solid var(--border-1)' }} className="stats-strip">
            {stats.map(({ v, s, l }) => (
              <div key={l} style={{ paddingRight:'12px' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'var(--accent)', lineHeight:1, marginBottom:'4px' }}>
                  <CountUp target={v} suffix={s}/>
                </div>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Photo with glow */}
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
          {/* Rotating rings */}
          <div style={{ position:'absolute', width:'340px', height:'340px', borderRadius:'50%', border:'1.5px dashed rgba(35,77,194,0.25)', animation:'spin 18s linear infinite', zIndex:0 }}/>
          <div style={{ position:'absolute', width:'300px', height:'300px', borderRadius:'50%', border:'1px dashed rgba(35,77,194,0.12)', animation:'spin 12s linear infinite reverse', zIndex:0 }}/>

          {/* Glow behind photo */}
          <div style={{ position:'absolute', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(35,77,194,0.3) 0%, rgba(35,77,194,0.1) 50%, transparent 75%)', filter:'blur(20px)', zIndex:0 }}/>

          {/* Photo circle */}
          <div style={{ width:'260px', height:'260px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(35,77,194,0.4)', background:'var(--bg-elevated)', position:'relative', zIndex:1, boxShadow:'0 0 60px rgba(35,77,194,0.25), 0 0 120px rgba(35,77,194,0.1)' }}>
            {hasPhoto ? (
              <img src={h.profileImageUrl} alt={h.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}/>
            ) : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'6rem', color:'var(--accent)', opacity:0.5 }}>
                {h.name?.[0] || 'S'}
              </div>
            )}
            {/* Fadeout edge overlay */}
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at center, transparent 55%, rgba(9,12,20,0.6) 80%, rgba(9,12,20,0.95) 100%)', pointerEvents:'none' }}/>
          </div>

          {/* Response card */}
          <div style={{ position:'absolute', bottom:'10px', right:'-10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)', zIndex:2 }}>
            <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}>
              <Clock size={16} strokeWidth={1.75}/>
            </div>
            <div>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', lineHeight:1 }}>{h.responseTime||'< 2 hrs'}</div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Avg. Response</div>
            </div>
          </div>

          {/* Rating card */}
          <div style={{ position:'absolute', top:'20px', left:'-10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'10px 14px', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)', zIndex:2 }}>
            <Star size={14} fill="#f5c518" color="#f5c518"/>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', color:'var(--text-1)' }}>5.0</span>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>/ 5.0</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; padding-top: 20px !important; }
          .hero-grid > div:last-child { order: -1; }
          .stats-strip { grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; }
        }
      `}</style>
    </section>
  );
}
