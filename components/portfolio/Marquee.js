'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc } from '@/lib/firestore';

/* Default logo rows — only use confirmed-working simpleicons slugs */
const ROW1_DEF = [
  { label:'Shopify',     src:'https://cdn.simpleicons.org/shopify',     invert:false },
  { label:'WordPress',   src:'https://cdn.simpleicons.org/wordpress',   invert:false },
  { label:'WooCommerce', src:'https://cdn.simpleicons.org/woocommerce', invert:false },
  { label:'Webflow',     src:'https://cdn.simpleicons.org/webflow',     invert:false },
  { label:'Squarespace', src:'https://cdn.simpleicons.org/squarespace', invert:true  },
  { label:'Meta',        src:'https://cdn.simpleicons.org/meta',        invert:false },
  { label:'Google',      src:'https://cdn.simpleicons.org/google',      invert:false },
  { label:'TikTok',      src:'https://cdn.simpleicons.org/tiktok',      invert:true  },
  { label:'Pinterest',   src:'https://cdn.simpleicons.org/pinterest',   invert:false },
  { label:'YouTube',     src:'https://cdn.simpleicons.org/youtube',     invert:false },
];
const ROW2_DEF = [
  { label:'Next.js',    src:'https://cdn.simpleicons.org/nextdotjs',    invert:true  },
  { label:'Firebase',   src:'https://cdn.simpleicons.org/firebase',     invert:false },
  { label:'React',      src:'https://cdn.simpleicons.org/react',        invert:false },
  { label:'Tailwind',   src:'https://cdn.simpleicons.org/tailwindcss',  invert:false },
  { label:'JavaScript', src:'https://cdn.simpleicons.org/javascript',   invert:false },
  { label:'PHP',        src:'https://cdn.simpleicons.org/php',          invert:false },
  { label:'Python',     src:'https://cdn.simpleicons.org/python',       invert:false },
  { label:'Figma',      src:'https://cdn.simpleicons.org/figma',        invert:false },
  { label:'GitHub',     src:'https://cdn.simpleicons.org/github',       invert:true  },
  { label:'Vercel',     src:'https://cdn.simpleicons.org/vercel',       invert:true  },
];

function LogoPill({ label, src, invert }) {
  const [err, setErr] = useState(false);
  return (
    <div className="mq-pill" style={{
      height:28, padding:'4px 12px',
      background:'rgba(255,255,255,0.07)',
      border:'1px solid rgba(255,255,255,0.05)',
      borderRadius:6,
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      flexShrink:0, gap:'6px',
    }} title={label}>
      {!err && src ? (
        <img
          className="mq-img"
          src={src} alt={label}
          style={{ height:16, width:'auto', maxWidth:36, objectFit:'contain', filter:invert?'brightness(0) invert(1)':'none', display:'block' }}
          onError={() => setErr(true)}
        />
      ) : (
        /* Text fallback — always shows if image fails */
        <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
          {label}
        </span>
      )}
    </div>
  );
}

function MarqueeRow({ items, reverse=false, speed=40 }) {
  /* Triple the array so loop has no visible seam on any screen width */
  const quadrupled = [...items, ...items, ...items, ...items];
  return (
    <div style={{
      overflow:'hidden',
      maskImage:'linear-gradient(90deg,transparent,black 5%,black 95%,transparent)',
      WebkitMaskImage:'linear-gradient(90deg,transparent,black 5%,black 95%,transparent)',
    }}>
      <div style={{
        display:'flex', gap:'10px', alignItems:'center',
        /* Animate over 1/4 of total width for seamless loop with quadrupled array */
        animation:`${reverse?'mq-rev':'mq-fwd'} ${speed}s linear infinite`,
        width:'max-content',
        willChange:'transform',
      }}>
        {quadrupled.map((item,i) => (
          <LogoPill key={i} label={item.label} src={item.src} invert={item.invert??false}/>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  const [row1, setRow1] = useState(ROW1_DEF);
  const [row2, setRow2] = useState(ROW2_DEF);

  useEffect(() => {
    getPortfolioDoc('marqueeLogos').then(d => {
      if (d?.row1?.length) setRow1(d.row1);
      if (d?.row2?.length) setRow2(d.row2);
    }).catch(() => {});
  }, []);

  return (
    <div className="marquee-section" style={{
      background:'var(--bg-base)',
      borderTop:'1px solid var(--border-1)',
      borderBottom:'1px solid var(--border-1)',
      padding:'14px 0',
      display:'flex', flexDirection:'column', gap:'10px',
      position:'relative', zIndex:1, overflow:'hidden',
    }}>
      <MarqueeRow items={row1} />
      <MarqueeRow items={row2} reverse speed={34} />
      <style>{`
        @keyframes mq-fwd { from{transform:translateX(0)} to{transform:translateX(-25%)} }
        @keyframes mq-rev { from{transform:translateX(-25%)} to{transform:translateX(0)} }
      `}</style>
    </div>
  );
}
