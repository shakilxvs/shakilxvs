import { getProjectBySlug, getProjects } from '@/lib/firestore';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.title} — Shakil`,
    description: project.fullDescription || project.description || '',
    openGraph: {
      title: project.title,
      description: project.fullDescription || project.description || '',
      images: project.thumbnailUrl ? [{ url: project.thumbnailUrl }] : [],
    },
  };
}

export default async function CaseStudyPage({ params }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const {
    title, description, fullDescription, category, tags = [],
    thumbnailUrl, liveUrl, metrics, challenge, solution, results,
  } = project;

  const hasContent = challenge || solution || results || fullDescription;

  return (
    <div style={{ position:'relative', zIndex:1 }}>
      {/* Hero */}
      <section style={{ paddingTop:'80px', paddingBottom:'60px', borderBottom:'1px solid var(--border-1)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 24px' }}>
          {/* Back link */}
          <Link href="/projects" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'28px', transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--accent)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>
            <ArrowLeft size={12}/> All Projects
          </Link>

          {/* Category */}
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'14px' }}>
            {category}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'20px' }}>
            {title}
          </h1>

          {/* Short description */}
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.05rem', color:'var(--text-2)', lineHeight:1.7, maxWidth:'680px', marginBottom:'24px' }}>
            {description}
          </p>

          {/* Tags + metrics row */}
          <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'28px' }}>
            {metrics && (
              <span style={{ padding:'5px 14px', background:'rgba(35,77,194,0.12)', border:'1px solid var(--accent-border)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--accent)' }}>
                {metrics}
              </span>
            )}
            {tags.map((tag,i) => (
              <span key={i} style={{ padding:'5px 12px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-3)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'11px 22px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', textDecoration:'none', transition:'opacity 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              <ExternalLink size={15}/> View Live Site
            </a>
          )}
        </div>
      </section>

      {/* Thumbnail */}
      {thumbnailUrl && (
        <section style={{ background:'var(--bg-void)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
            <div style={{ aspectRatio:'16/7', overflow:'hidden', borderRadius:'var(--radius-xl)', border:'1px solid var(--border-2)', transform:'translateY(-28px)' }}>
              <img src={thumbnailUrl} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top', display:'block' }}/>
            </div>
          </div>
        </section>
      )}

      {/* Case study content */}
      {hasContent && (
        <section style={{ padding:'60px 0 80px' }}>
          <div style={{ maxWidth:900, margin:'0 auto', padding:'0 24px' }}>

            {/* Full description */}
            {fullDescription && (
              <div style={{ marginBottom:'56px' }}>
                <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.05rem', color:'var(--text-2)', lineHeight:1.85, whiteSpace:'pre-wrap' }}>
                  {fullDescription}
                </p>
              </div>
            )}

            {/* Challenge / Solution / Results grid */}
            {(challenge || solution || results) && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'24px', marginBottom:'56px' }} className="case-grid">
                {[
                  { label:'The Challenge', content:challenge, accent:'#f5c518' },
                  { label:'The Solution',  content:solution,  accent:'var(--accent)' },
                  { label:'The Results',   content:results,   accent:'#34d399' },
                ].filter(b=>b.content).map(({ label, content, accent }) => (
                  <div key={label} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'28px 24px', borderTop:`3px solid ${accent}` }}>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color: accent === 'var(--accent)' ? 'var(--accent)' : accent, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' }}>
                      {label}
                    </div>
                    <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-2)', lineHeight:1.75, whiteSpace:'pre-wrap' }}>
                      {content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section style={{ padding:'60px 0 80px', borderTop:'1px solid var(--border-1)', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'14px' }}>
            Interested in working together?
          </div>
          <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', marginBottom:'20px' }}>
            Let's Build Something
          </h2>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'12px 24px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', textDecoration:'none' }}>
              Get in Touch
            </Link>
            <Link href="/projects" style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'12px 22px', background:'transparent', color:'var(--text-1)', border:'1px solid var(--border-3)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.9rem', textDecoration:'none' }}>
              <ArrowLeft size={14}/> More Projects
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:640px){.case-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
}
