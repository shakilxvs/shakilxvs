'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import { ArrowRight } from 'lucide-react';

export default function FeaturedProjects({ projects = [] }) {
  // Cap at 3 cards (preserves the original .slice(0,3) behaviour)
  const items = projects.slice(0, 3);
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);

  if (items.length === 0) return null;

  // Mobile peek-carousel — same pattern as ProjectsPage.js (~78vw + 12px gap)
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardW = (window.innerWidth * 0.78) + 12;
    const idx = Math.round(el.scrollLeft / cardW);
    setActiveDot(Math.max(0, Math.min(idx, items.length - 1)));
  };

  return (
    <section style={{ padding: '100px 0', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '48px',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div className="section-label" style={{ marginBottom: '12px' }}>Work</div>
            <h2 style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--text-1)',
              letterSpacing: '0.02em', lineHeight: 1,
            }}>
              Featured Projects
            </h2>
          </div>
          <Link href="/projects" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontFamily: 'Outfit, sans-serif', fontWeight: 600,
            fontSize: '0.875rem', color: 'var(--accent)',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            View All Projects <ArrowRight size={16} />
          </Link>
        </div>

        {/* Desktop: 3-col grid (unchanged behaviour) */}
        <div className="featured-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {items.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {/* Mobile: 1 card — full width, no scroll */}
        {items.length === 1 && (
          <div className="featured-mobile-single" style={{ display:'none' }}>
            <ProjectCard project={items[0]}/>
          </div>
        )}

        {/* Mobile: 2+ cards — peek carousel + dots */}
        {items.length >= 2 && (
          <div className="featured-mobile-multi" style={{ display:'none' }}>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="featured-mobile-scroller"
              style={{
                display:'flex',
                overflowX:'auto',
                gap:'12px',
                scrollSnapType:'x mandatory',
                WebkitOverflowScrolling:'touch',
                scrollbarWidth:'none',
              }}
            >
              {items.map(p => (
                <div key={p.id} style={{ width:'78vw', flexShrink:0, scrollSnapAlign:'start' }}>
                  <ProjectCard project={p}/>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'14px' }}>
              {items.map((_, i) => (
                <div key={i} style={{ width: i===activeDot ? 18 : 6, height:6, borderRadius:3, background: i===activeDot ? 'var(--accent)' : 'var(--border-2)', transition:'all 0.25s ease' }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) { .featured-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  {
          .featured-grid           { display: none !important; }
          .featured-mobile-single  { display: block !important; }
          .featured-mobile-multi   { display: block !important; }
        }
        .featured-mobile-scroller::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
