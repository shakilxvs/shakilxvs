'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, ArrowRight } from 'lucide-react';

function CountUpStat({ target, suffix = '+', label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '3rem',
        color: 'var(--accent)',
        lineHeight: 1,
        marginBottom: '6px',
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.6rem',
        color: 'var(--text-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
      }}>
        {label}
      </div>
    </div>
  );
}

export default function About({ data }) {
  const bio = data?.bio || 'I\'m Shakil — a CMS specialist, Shopify developer, and digital marketing expert with 6+ years of experience helping businesses scale online. I\'ve worked with 5000+ global clients across eCommerce, SaaS, and service industries.\n\nI build fast, conversion-focused websites and run data-driven ad campaigns that consistently deliver measurable ROI.';
  const cvUrl = data?.cvUrl || '#';

  const stats = [
    { value: data?.stat1Value || 5000, suffix: '+', label: data?.stat1Label || 'Projects' },
    { value: data?.stat2Value || 1200, suffix: '+', label: data?.stat2Label || 'Clients' },
    { value: data?.stat3Value || 47,   suffix: '',  label: data?.stat3Label || 'Countries' },
    { value: data?.stat4Value || 6,    suffix: '+', label: data?.stat4Label || 'Years' },
  ];

  return (
    <section style={{ padding: '100px 0', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Section label */}
        <div style={{ marginBottom: '60px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>About Me</div>
          <h2 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: 'var(--text-1)',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}>
            Who I Am
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'start',
        }} className="about-grid">

          {/* Bio */}
          <div>
            {bio.split('\n\n').map((para, i) => (
              <p key={i} style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.05rem',
                color: 'var(--text-2)',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}>
                {para}
              </p>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 22px',
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700, fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <Download size={15} /> Download CV
              </a>
              <Link
                href="/contact"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 22px',
                  background: 'transparent',
                  color: 'var(--text-1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-3)',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600, fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Work Together <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            {stats.map(s => (
              <CountUpStat key={s.label} target={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
