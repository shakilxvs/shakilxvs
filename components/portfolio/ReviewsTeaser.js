'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

/* ─── Verified Badge — shield design, clearly NOT Apple circle ───────────── */
export function VerifiedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 9px',
      background: 'rgba(20,184,166,0.12)',
      border: '1px solid rgba(20,184,166,0.3)',
      borderRadius: '6px', /* rounded rectangle, NOT pill — clearly different from Apple */
      fontFamily: 'Space Mono, monospace',
      fontSize: '0.58rem',
      color: '#2dd4bf',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {/* Shield with checkmark — not a circle */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
      Verified
    </span>
  );
}

function Stars({ rating }) {
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={13} fill={i < rating ? '#f5c518' : 'transparent'} color={i < rating ? '#f5c518' : 'var(--border-3)'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function MiniCard({ review }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <Stars rating={review.rating} />

      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-2)', lineHeight:1.75, flex:1 }}>
        &ldquo;{review.text?.slice(0, 150)}{review.text?.length > 150 ? '…' : ''}&rdquo;
      </p>

      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        {/* Avatar */}
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), #1931AB)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'1rem', color:'#fff', flexShrink:0 }}>
          {review.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ minWidth:0, display:'flex', flexDirection:'column', gap:'4px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)' }}>{review.name}</span>
            {review.countryFlag && <span style={{ fontSize:'0.875rem' }}>{review.countryFlag}</span>}
            <VerifiedBadge />
          </div>
          {review.service && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{review.service}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsTeaser({ reviews = [] }) {
  // Only show verified reviews in homepage teaser
  const top = reviews.filter(r => r.verified === true).slice(0, 3);
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);

  if (top.length === 0) return null;

  // Mobile peek-carousel — same pattern as ProjectsPage.js (~78vw + 12px gap)
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardW = (window.innerWidth * 0.78) + 12;
    const idx = Math.round(el.scrollLeft / cardW);
    setActiveDot(Math.max(0, Math.min(idx, top.length - 1)));
  };

  return (
    <section style={{ padding:'100px 0', position:'relative', zIndex:1, background:'var(--bg-base)' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'400px', background:'radial-gradient(ellipse, rgba(35,77,194,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'48px', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <div className="section-label" style={{ marginBottom:'12px' }}>Testimonials</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.5rem,5vw,4rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>What Clients Say</h2>
          </div>
          <Link href="/reviews" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.875rem', color:'var(--accent)', textDecoration:'none', whiteSpace:'nowrap' }}>
            All Reviews <ArrowRight size={16} />
          </Link>
        </div>

        {/* Desktop: 3-col grid (unchanged behaviour) */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }} className="reviews-teaser-grid">
          {top.map(r => <MiniCard key={r.id} review={r} />)}
        </div>

        {/* Mobile: 1 review — full width, no scroll */}
        {top.length === 1 && (
          <div className="reviews-teaser-mobile-single" style={{ display:'none' }}>
            <MiniCard review={top[0]}/>
          </div>
        )}

        {/* Mobile: 2+ reviews — peek carousel + dots */}
        {top.length >= 2 && (
          <div className="reviews-teaser-mobile-multi" style={{ display:'none' }}>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="reviews-teaser-mobile-scroller"
              style={{
                display:'flex',
                overflowX:'auto',
                gap:'12px',
                scrollSnapType:'x mandatory',
                WebkitOverflowScrolling:'touch',
                scrollbarWidth:'none',
              }}
            >
              {top.map(r => (
                <div key={r.id} style={{ width:'78vw', flexShrink:0, scrollSnapAlign:'start' }}>
                  <MiniCard review={r}/>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'14px' }}>
              {top.map((_, i) => (
                <div key={i} style={{ width: i===activeDot ? 18 : 6, height:6, borderRadius:3, background: i===activeDot ? 'var(--accent)' : 'var(--border-2)', transition:'all 0.25s ease' }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width:1024px) { .reviews-teaser-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width:640px)  {
          .reviews-teaser-grid          { display: none !important; }
          .reviews-teaser-mobile-single { display: block !important; }
          .reviews-teaser-mobile-multi  { display: block !important; }
        }
        .reviews-teaser-mobile-scroller::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
