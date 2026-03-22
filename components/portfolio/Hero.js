'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Star, ChevronRight } from 'lucide-react';

const DEFAULT_HERO = {
  name: 'Shakil',
  taglines: [
    'CMS & Custom Web Expert',
    'Shopify Developer',
    'Digital Marketing Strategist',
    'eCommerce Growth Hacker',
    'Conversion Rate Optimizer',
  ],
  subtitle: '6+ years building premium stores, marketing systems, and custom web experiences for global brands.',
  stat1Label: 'Projects Done', stat1Value: 5000,
  stat2Label: 'Happy Clients', stat2Value: 1200,
  stat3Label: 'Countries',     stat3Value: 47,
  stat4Label: 'Years XP',      stat4Value: 6,
  cta1Text: 'View My Work', cta1Url: '/projects',
  cta2Text: 'Hire Me',      cta2Url: '/contact',
  responseTime: '< 2 hrs',
  profileImageUrl: '',
};

function useTypewriter(phrases) {
  const [text, setText]       = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting]   = useState(false);
  const [paused, setPaused]       = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx % phrases.length];
    let timeout;

    if (paused) {
      timeout = setTimeout(() => { setDeleting(true); setPaused(false); }, 2200);
    } else if (deleting) {
      if (text.length === 0) {
        setDeleting(false);
        setPhraseIdx(i => i + 1);
        timeout = setTimeout(() => {}, 400);
      } else {
        timeout = setTimeout(() => setText(t => t.slice(0, -1)), 40);
      }
    } else {
      if (text === phrase) {
        setPaused(true);
      } else {
        timeout = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 70);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, paused, phraseIdx, phrases]);

  return text;
}

function CountUpNumber({ target, suffix = '+', duration = 2200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Hero({ data }) {
  const hero = { ...DEFAULT_HERO, ...data };
  const taglineText = useTypewriter(hero.taglines || DEFAULT_HERO.taglines);

  const stats = [
    { value: hero.stat1Value, suffix: '+', label: hero.stat1Label },
    { value: hero.stat2Value, suffix: '+', label: hero.stat2Label },
    { value: hero.stat3Value, suffix: '',  label: hero.stat3Label },
    { value: hero.stat4Value, suffix: '+', label: hero.stat4Label },
  ];

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '-5%',
        width: '500px', height: '500px',
        background: 'rgba(35,77,194,0.07)',
        borderRadius: '50%', filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%',
        width: '400px', height: '400px',
        background: 'rgba(25,49,171,0.05)',
        borderRadius: '50%', filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(35,77,194,0.15), transparent)',
        animation: 'scan 8s linear infinite',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 24px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }} className="hero-grid">

        {/* LEFT — Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Available badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px',
              background: 'rgba(35,77,194,0.08)',
              border: '1px solid rgba(35,77,194,0.25)',
              borderRadius: '100px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.65rem',
              color: 'var(--accent)',
              letterSpacing: '0.05em',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)',
                animation: 'pulse 2s ease-in-out infinite',
                flexShrink: 0,
                display: 'inline-block',
              }} />
              Available for projects
            </div>
          </div>

          {/* Name */}
          <div>
            <h1 style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(4rem, 8vw, 7rem)',
              lineHeight: 0.92,
              color: 'var(--text-1)',
              letterSpacing: '0.02em',
              marginBottom: '8px',
            }}>
              {hero.name}
            </h1>

            {/* Typewriter tagline */}
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              minHeight: '1.5em',
            }}>
              {taglineText}
              <span style={{
                display: 'inline-block',
                width: 2,
                height: '1em',
                background: 'var(--accent)',
                marginLeft: '3px',
                verticalAlign: 'middle',
                animation: 'blink 1s step-end infinite',
              }} />
            </div>
          </div>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: 'var(--text-2)',
            lineHeight: 1.7,
            maxWidth: '480px',
          }}>
            {hero.subtitle}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href={hero.cta1Url} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 26px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease, transform 0.08s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {hero.cta1Text} <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
            <Link href={hero.cta2Url} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 26px',
              background: 'transparent',
              color: 'var(--text-1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-3)',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-3)'}
            >
              {hero.cta2Text} <ArrowRight size={16} />
            </Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-1)',
          }} className="stats-strip">
            {stats.map(({ value, suffix, label }) => (
              <div key={label} style={{ paddingRight: '16px' }}>
                <div style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                  color: 'var(--accent)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>
                  <CountUpNumber target={value} suffix={suffix} />
                </div>
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.6rem',
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Profile photo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Rotating dashed ring */}
          <div style={{
            position: 'absolute',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            border: '2px dashed rgba(35,77,194,0.3)',
            animation: 'spin 18s linear infinite',
            zIndex: 0,
          }} className="rotating-ring" />
          <div style={{
            position: 'absolute',
            width: '310px',
            height: '310px',
            borderRadius: '50%',
            border: '1px dashed rgba(35,77,194,0.12)',
            animation: 'spin 12s linear infinite reverse',
            zIndex: 0,
          }} />

          {/* Photo circle */}
          <div style={{
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid var(--accent-border)',
            background: 'var(--bg-elevated)',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 0 60px rgba(35,77,194,0.2)',
          }}>
            {hero.profileImageUrl ? (
              <Image
                src={hero.profileImageUrl}
                alt={hero.name}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                priority
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '5rem',
                color: 'var(--accent)',
                background: 'var(--bg-elevated)',
              }}>
                {hero.name?.[0] || 'S'}
              </div>
            )}
          </div>

          {/* Response time card */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '0',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 2,
          }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-muted)',
              border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)',
              flexShrink: 0,
            }}>
              <Clock size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.1rem',
                color: 'var(--text-1)',
                lineHeight: 1,
              }}>
                {hero.responseTime || '< 2 hrs'}
              </div>
              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.58rem',
                color: 'var(--text-3)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Avg. Response
              </div>
            </div>
          </div>

          {/* Rating badge */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '0',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 2,
          }}>
            <Star size={14} fill="#f5c518" color="#f5c518" />
            <span style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-1)',
            }}>5.0</span>
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.6rem',
              color: 'var(--text-3)',
            }}>/ 5.0</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding-top: 40px !important;
          }
          .hero-grid > div:last-child { order: -1; }
          .stats-strip { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
          .rotating-ring { width: 240px !important; height: 240px !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--accent); }
          50%       { opacity: 0.6; box-shadow: 0 0 14px var(--accent); }
        }
        @keyframes scan {
          0%   { top: -2px; }
          100% { top: 100vh; }
        }
      `}</style>
    </section>
  );
}
