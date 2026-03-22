import Link from 'next/link';
import ProjectCard from './ProjectCard';
import { ArrowRight } from 'lucide-react';

export default function FeaturedProjects({ projects = [] }) {
  if (projects.length === 0) return null;

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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }} className="featured-grid">
          {projects.slice(0, 3).map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .featured-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .featured-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
