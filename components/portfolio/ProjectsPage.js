'use client';
import { useState, useEffect, useRef } from 'react';
import { getProjects } from '@/lib/firestore';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { Layers } from 'lucide-react';

const CATEGORIES = ['All', 'CMS', 'Custom Built', 'Marketing', 'Design', 'Web App'];

function Skeleton() {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
      <div style={{ aspectRatio:'16/9' }} className="skeleton"/>
      <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
        <div style={{ height:10, width:'30%', borderRadius:4 }} className="skeleton"/>
        <div style={{ height:18, width:'80%', borderRadius:4 }} className="skeleton"/>
        <div style={{ height:14, width:'100%', borderRadius:4 }} className="skeleton"/>
        <div style={{ height:14, width:'70%', borderRadius:4 }} className="skeleton"/>
      </div>
    </div>
  );
}

export default function ProjectsPageClient() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState('All');
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    getProjects().then(data => {
      setProjects(data.filter(p => p.active !== false));
      setLoading(false);
    });
  }, []);

  const featuredProjects = projects.filter(p => p.featured);
  const featuredIds      = new Set(featuredProjects.map(p => p.id));
  const regularAll       = projects.filter(p => !featuredIds.has(p.id));
  const regularFiltered  = active === 'All' ? regularAll : regularAll.filter(p => p.category === active);

  const showEmpty         = !loading && regularFiltered.length === 0 && featuredProjects.length === 0;
  const showEmptyCategory = !loading && regularFiltered.length === 0 && active !== 'All';

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    // Card width is 85vw with 12px gap
    const cardW = (window.innerWidth * 0.85 - 24) + 12;
    const idx = Math.round(el.scrollLeft / cardW);
    setActiveDot(Math.max(0, Math.min(idx, featuredProjects.length - 1)));
  };

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>

        <div style={{ marginBottom:'40px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Portfolio</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'16px' }}>
            My Projects
          </h1>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1rem', color:'var(--text-2)', maxWidth:'520px', lineHeight:1.7 }}>
            5000+ projects delivered globally. A curated selection of my best work.
          </p>
        </div>

        {/* Featured section */}
        {!loading && featuredProjects.length > 0 && (
          <div style={{ marginBottom:'48px' }}>
            <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'16px' }}>
              Featured
            </div>

            {/* Desktop: 2-col grid — always shown on desktop, hidden on mobile */}
            <div className="feat-proj-desktop" style={{ display:'grid', gridTemplateColumns: featuredProjects.length >= 2 ? '1fr 1fr' : '1fr', gap:'20px' }}>
              {featuredProjects.map(p => <ProjectCard key={p.id} project={p}/>)}
            </div>

            {/* Mobile: 1 featured — full width card, no scroll */}
            {featuredProjects.length === 1 && (
              <div className="feat-proj-mobile-single" style={{ display:'none' }}>
                <ProjectCard project={featuredProjects[0]}/>
              </div>
            )}

            {/* Mobile: 2+ featured — peek carousel + dots */}
            {featuredProjects.length >= 2 && (
              <div className="feat-proj-mobile-multi" style={{ display:'none' }}>
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  style={{ display:'flex', overflowX:'auto', gap:'12px', scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch', scrollbarWidth:'none' }}
                >
                  {featuredProjects.map(p => (
                    <div key={p.id} style={{ minWidth:'calc(85vw - 24px)', maxWidth:'420px', flexShrink:0, scrollSnapAlign:'start' }}>
                      <ProjectCard project={p}/>
                    </div>
                  ))}
                </div>
                {/* Pagination dots */}
                <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'14px' }}>
                  {featuredProjects.map((_, i) => (
                    <div key={i} style={{ width: i===activeDot ? 18 : 6, height:6, borderRadius:3, background: i===activeDot ? 'var(--accent)' : 'var(--border-2)', transition:'all 0.25s ease' }}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category filter */}
        <div className="pill-bar" style={{ marginBottom:'32px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)} className={`pill${active===cat?' active':''}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }} className="projects-grid">
            {Array.from({length:6}).map((_,i) => <Skeleton key={i}/>)}
          </div>
        )}

        {showEmpty && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', gap:'16px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)' }}>
            <Layers size={40} style={{ color:'var(--text-3)' }} strokeWidth={1}/>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)' }}>No Projects Yet</div>
          </div>
        )}

        {showEmptyCategory && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', gap:'16px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)' }}>
            <Layers size={36} style={{ color:'var(--text-3)' }} strokeWidth={1}/>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)' }}>No Projects in This Category</div>
            <button onClick={() => setActive('All')} style={{ padding:'10px 20px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', cursor:'pointer' }}>
              View All
            </button>
          </div>
        )}

        {/* Regular grid */}
        {!loading && regularFiltered.length > 0 && (
          <>
            {featuredProjects.length > 0 && (
              <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'16px' }}>
                {active === 'All' ? 'All Projects' : active}
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }} className="projects-grid">
              {regularFiltered.map(p => <ProjectCard key={p.id} project={p}/>)}
            </div>
          </>
        )}

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .projects-grid      { grid-template-columns: repeat(2,1fr) !important; }
          .feat-proj-desktop  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .projects-grid            { grid-template-columns: 1fr !important; }
          .feat-proj-desktop        { display: none !important; }
          .feat-proj-mobile-single  { display: block !important; }
          .feat-proj-mobile-multi   { display: block !important; }
        }
        .feat-proj-mobile-multi > div:first-child::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
