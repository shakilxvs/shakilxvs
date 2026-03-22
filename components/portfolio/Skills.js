'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_SKILLS = [
  { id: '1', name: 'Shopify Development', level: 98, color: '#96bf48', description: 'Custom themes, apps, Liquid, headless Shopify, store optimization', subProjects: [] },
  { id: '2', name: 'WordPress',           level: 95, color: '#21759b', description: 'Custom themes, WooCommerce, Elementor, ACF, performance tuning', subProjects: [] },
  { id: '3', name: 'Digital Marketing',   level: 92, color: '#234DC2', description: 'Full-funnel strategy, SEO, CRO, analytics, email marketing', subProjects: [] },
  { id: '4', name: 'Dropshipping',        level: 90, color: '#ff4500', description: 'Product research, supplier sourcing, store setup, scaling', subProjects: [] },
  { id: '5', name: 'Google Ads',          level: 88, color: '#fbbc04', description: 'Search, Shopping, Display, Performance Max — $50K+/mo managed', subProjects: [] },
  { id: '6', name: 'Meta Ads',            level: 87, color: '#1877f2', description: 'Facebook & Instagram ads, retargeting, lookalike audiences', subProjects: [] },
  { id: '7', name: 'UI/UX Design',        level: 85, color: '#7c3aed', description: 'Figma, wireframing, conversion-focused design, dark mode', subProjects: [] },
  { id: '8', name: 'CMS & Custom Web',    level: 94, color: '#f59e0b', description: 'Next.js, React, Firebase, headless CMS, custom dashboards', subProjects: [] },
];

function SkillBar({ level, color, animate }) {
  return (
    <div style={{
      height: 4,
      background: 'var(--border-2)',
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: '12px',
    }}>
      <div style={{
        height: '100%',
        width: animate ? `${level}%` : '0%',
        background: color,
        borderRadius: 2,
        transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 0 8px ${color}55`,
      }} />
    </div>
  );
}

function SkillCard({ skill, index }) {
  const [expanded, setExpanded] = useState(false);
  const [animate, setAnimate]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setAnimate(true), index * 80);
      }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  const hasSubProjects = skill.subProjects?.length > 0;

  return (
    <div ref={ref}>
      <div
        onClick={() => hasSubProjects && setExpanded(e => !e)}
        style={{
          background: 'var(--bg-surface)',
          border: expanded ? '1px solid var(--accent-border)' : '1px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          cursor: hasSubProjects ? 'pointer' : 'default',
          transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)';
          if (!expanded) e.currentTarget.style.borderColor = 'var(--accent-border)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          if (!expanded) e.currentTarget.style.borderColor = 'var(--border-2)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              {/* Color dot */}
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: skill.color,
                boxShadow: `0 0 6px ${skill.color}88`,
                flexShrink: 0,
              }} />
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-1)',
              }}>
                {skill.name}
              </div>
            </div>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.82rem',
              color: 'var(--text-3)',
              lineHeight: 1.5,
            }}>
              {skill.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.6rem',
              color: skill.color,
              lineHeight: 1,
            }}>
              {skill.level}%
            </div>
            {hasSubProjects && (
              <div style={{ color: 'var(--text-3)' }}>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </div>
        </div>

        <SkillBar level={skill.level} color={skill.color} animate={animate} />
      </div>

      {/* Sub-projects panel */}
      {expanded && hasSubProjects && (
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--accent-border)',
          borderTop: 'none',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          {skill.subProjects.map((sp, i) => (
            <span key={i} style={{
              padding: '4px 12px',
              background: 'var(--accent-muted)',
              border: '1px solid var(--accent-border)',
              borderRadius: '100px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.65rem',
              color: 'var(--accent)',
            }}>
              {sp}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Skills({ data }) {
  const skills = data?.length > 0 ? data : DEFAULT_SKILLS;
  const activeSkills = skills.filter(s => s.active !== false);

  return (
    <section style={{ padding: '100px 0', position: 'relative', zIndex: 1, background: 'var(--bg-void)' }}>
      {/* Background orb */}
      <div style={{
        position: 'absolute', top: '50%', right: '-10%',
        width: '500px', height: '500px',
        background: 'rgba(35,77,194,0.04)',
        borderRadius: '50%', filter: 'blur(100px)',
        pointerEvents: 'none',
        transform: 'translateY(-50%)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div style={{ marginBottom: '60px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Expertise</div>
          <h2 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: 'var(--text-1)',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}>
            Skills & Services
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }} className="skills-grid">
          {activeSkills.map((skill, i) => (
            <SkillCard key={skill.id || i} skill={skill} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .skills-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
