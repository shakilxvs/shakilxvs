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
      maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
    }}>
      <div style={{
        display: 'flex',
        gap: '0',
        animation: `${reverse ? 'marqueeRev' : 'marquee'} ${speed}s linear infinite`,
        width: 'max-content',
      }}
      className="marquee-pause-on-hover"
      >
        {items.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 20px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.75rem',
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            whiteSpace: 'nowrap',
          }}>
            {item}
            <span style={{
              width: 4, height: 4,
              borderRadius: '50%',
              background: 'var(--accent)',
              opacity: 0.5,
              flexShrink: 0,
              display: 'inline-block',
            }} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div style={{
      background: 'var(--bg-void)',
      borderTop: '1px solid var(--border-1)',
      borderBottom: '1px solid var(--border-1)',
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    }}>
      <MarqueeRow items={ROW1} />
      <MarqueeRow items={ROW2} reverse speed={28} />

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRev {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-pause-on-hover:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
