'use client';
import { useState, useEffect } from 'react';
import { getProjects , trackPageView } from '@/lib/firestore';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { Layers } from 'lucide-react';

const CATEGORIES = ['All', 'CMS', 'Custom Built', 'Marketing', 'Design', 'Web App'];

function Skeleton() {
  useEffect(() => { trackPageView('projects'); }, []);

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
      <div style={{ aspectRatio:'16/9' }} className="skeleton" />
      <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
        <div style={{ height:10, width:'30%', borderRadius:4 }} className="skeleton" />
        <div style={{ height:18, width:'80%', borderRadius:4 }} className="skeleton" />
        <div style={{ height:14, width:'100%', borderRadius:4 }} className="skeleton" />
        <div style={{ height:14, width:'70%', borderRadius:4 }} className="skeleton" />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState('All');

  useEffect(() => {
    getProjects().then(data => {
      setProjects(data.filter(p => p.active !== false));
      setLoading(false);
    });
  }, []);

  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active);

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ marginBottom:'48px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Portfolio</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'16px' }}>My Projects</h1>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1rem', color:'var(--text-2)', maxWidth:'520px', lineHeight:1.7 }}>
            5000+ projects delivered globally. A curated selection of my best work.
          </p>
        </div>
        <div className="pill-bar" style={{ marginBottom:'40px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)} className={`pill${active===cat?' active':''}`}>{cat}</button>
          ))}
        </div>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }} className="projects-grid">
            {Array.from({length:6}).map((_,i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', gap:'16px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)' }}>
            <Layers size={40} style={{ color:'var(--text-3)' }} strokeWidth={1} />
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)' }}>No Projects in This Category</div>
            <button onClick={() => setActive('All')} style={{ padding:'10px 20px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', cursor:'pointer' }}>View All</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }} className="projects-grid">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width:1024px) { .projects-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width:640px)  { .projects-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
