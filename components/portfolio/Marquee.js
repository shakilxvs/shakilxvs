'use client';

const ROW1 = [
  'Shopify', 'WordPress', 'Wix', 'Webflow', 'Meta Ads', 'Google Ads',
  'TikTok', 'Pinterest', 'Dropshipping', 'WooCommerce', 'SEO', 'CRO',
  'Shopify', 'WordPress', 'Wix', 'Webflow', 'Meta Ads', 'Google Ads',
  'TikTok', 'Pinterest', 'Dropshipping', 'WooCommerce', 'SEO', 'CRO',
];

const ROW2 = [
  'UI Design', 'Firebase', 'Next.js', 'Squarespace', 'Email Marketing',
  'Store Optimization', 'Landing Pages', 'Conversion Rate', 'Analytics',
  'UI Design', 'Firebase', 'Next.js', 'Squarespace', 'Email Marketing',
  'Store Optimization', 'Landing Pages', 'Conversion Rate', 'Analytics',
];

function MarqueeRow({ items, reverse = false, speed = 35 }) {
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    }}>
      <div style={{
        display: 'flex',
        gap: '0',
        animation: `${reverse ? 'marqueeRev' : 'marquee'} ${speed}s linear infinite`,
        width: 'max-content',
      }}>
        {items.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 18px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.68rem',
            color: 'rgba(141,161,220,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            whiteSpace: 'nowrap',
          }}>
            {item}
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, flexShrink: 0, display: 'inline-block' }} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div style={{
      /* Distinctly different from the page bg — subtle accent-tinted stripe */
      background: 'linear-gradient(180deg, #080d1e 0%, #0b1125 50%, #080d1e 100%)',
      borderTop: '1px solid rgba(35,77,194,0.25)',
      borderBottom: '1px solid rgba(35,77,194,0.25)',
      padding: '18px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    }}>
      {/* Subtle center glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(35,77,194,0.06) 0%, transparent 100%)', pointerEvents: 'none' }}/>
      <MarqueeRow items={ROW1} />
      <MarqueeRow items={ROW2} reverse speed={28} />
      <style>{`
        @keyframes marquee    { 0%{transform:translateX(0)}       100%{transform:translateX(-50%)} }
        @keyframes marqueeRev { 0%{transform:translateX(-50%)}    100%{transform:translateX(0)}    }
      `}</style>
    </div>
  );
}
