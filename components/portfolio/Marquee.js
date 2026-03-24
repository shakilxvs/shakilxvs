'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc } from '@/lib/firestore';

const ROW1_DEFAULT = [
  { label:'Shopify',     src:'https://cdn.simpleicons.org/shopify',     invert:false },
  { label:'WordPress',   src:'https://cdn.simpleicons.org/wordpress',   invert:false },
  { label:'Wix',         src:'https://upload.wikimedia.org/wikipedia/commons/7/76/Wix.com_website_logo.svg', invert:true },
  { label:'WooCommerce', src:'https://cdn.simpleicons.org/woocommerce', invert:false },
  { label:'Webflow',     src:'https://cdn.simpleicons.org/webflow',     invert:false },
  { label:'Squarespace', src:'https://cdn.simpleicons.org/squarespace', invert:true  },
  { label:'Meta',        src:'https://cdn.simpleicons.org/meta',        invert:false },
  { label:'Google',      src:'https://cdn.simpleicons.org/google',      invert:false },
  { label:'TikTok',      src:'https://cdn.simpleicons.org/tiktok',      invert:true  },
  { label:'Pinterest',   src:'https://cdn.simpleicons.org/pinterest',   invert:false },
];
const ROW2_DEFAULT = [
  { label:'Next.js',     src:'https://cdn.simpleicons.org/nextdotjs',   invert:true  },
  { label:'Firebase',    src:'https://cdn.simpleicons.org/firebase',    invert:false },
  { label:'React',       src:'https://cdn.simpleicons.org/react',       invert:false },
  { label:'Tailwind',    src:'https://cdn.simpleicons.org/tailwindcss', invert:false },
  { label:'JavaScript',  src:'https://cdn.simpleicons.org/javascript',  invert:false },
  { label:'PHP',         src:'https://cdn.simpleicons.org/php',         invert:false },
  { label:'Python',      src:'https://cdn.simpleicons.org/python',       invert:false },
  { label:'Figma',       src:'https://cdn.simpleicons.org/figma',       invert:false },
  { label:'GitHub',      src:'https://cdn.simpleicons.org/github',      invert:true  },
  { label:'Vercel',      src:'https://cdn.simpleicons.org/vercel',      invert:true  },
];

function LogoItem({ label, src, invert }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{
      height: 28, padding: '4px 10px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 6,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }} title={label}>
      {!err && src ? (
        <img
          src={src} alt={label}
          style={{
            height: 18, width: 'auto', maxWidth: 44, objectFit: 'contain',
            filter: invert ? 'brightness(0) invert(1)' : 'none',
          }}
          onError={() => setErr(true)}
        />
      ) : (
        <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          {label}
        </span>
      )}
    </div>
  );
}

function MarqueeRow({ items, reverse = false, speed = 35 }) {
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    }}>
      <div style={{
        display: 'flex', gap: '32px', alignItems: 'center',
        animation: `${reverse ? 'marqueeRev' : 'marquee'} ${speed}s linear infinite`,
        width: 'max-content',
      }}>
        {doubled.map((item, i) => (
          <LogoItem key={i} label={item.label} src={item.src} invert={item.invert ?? false} />
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  const [row1, setRow1] = useState(ROW1_DEFAULT);
  const [row2, setRow2] = useState(ROW2_DEFAULT);

  useEffect(() => {
    getPortfolioDoc('marqueeLogos').then(data => {
      if (data?.row1?.length) setRow1(data.row1);
      if (data?.row2?.length) setRow2(data.row2);
    }).catch(() => {/* keep defaults */});
  }, []);

  return (
    <div style={{
      background: 'var(--bg-base)',
      borderTop: '1px solid var(--border-1)',
      borderBottom: '1px solid var(--border-1)',
      padding: '14px 0',
      marginTop: 0,
      display: 'flex', flexDirection: 'column', gap: '10px',
      position: 'relative', zIndex: 1, overflow: 'hidden',
    }}>
      <MarqueeRow items={row1} />
      <MarqueeRow items={row2} reverse speed={28} />
      <style>{`
        @keyframes marquee    { 0%{transform:translateX(0)}    100%{transform:translateX(-50%)} }
        @keyframes marqueeRev { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
      `}</style>
    </div>
  );
}
