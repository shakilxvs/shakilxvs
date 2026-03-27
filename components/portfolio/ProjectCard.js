'use client';
import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function ProjectCard({ project }) {
  const {
    title, description, category, tags = [],
    thumbnailUrl, liveUrl, metrics, slug,
  } = project;

  const letter = title?.[0]?.toUpperCase() || 'P';

  const cardContent = (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      cursor: (liveUrl || slug) ? 'pointer' : 'default',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)';
      e.currentTarget.style.borderColor = 'var(--accent-border)';
      const overlay = e.currentTarget.querySelector('.card-overlay');
      if (overlay) overlay.style.opacity = '1';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'var(--border-2)';
      const overlay = e.currentTarget.querySelector('.card-overlay');
      if (overlay) overlay.style.opacity = '0';
    }}
    >
      {/* Thumbnail — 16:9 */}
      <div style={{
        position: 'relative',
        aspectRatio: '16/9',
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay))',
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '4rem',
            color: 'var(--accent)',
            opacity: 0.4,
          }}>
            {letter}
          </div>
        )}

        {/* Hover overlay — case study takes priority over live url */}
        {(slug || liveUrl) && (
          <div className="card-overlay" style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}>
            {slug && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.82rem' }}>
                <ArrowRight size={13}/> Case Study
              </div>
            )}
            {liveUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.82rem' }}>
                <ExternalLink size={13}/> Live Site
              </div>
            )}
          </div>
        )}

        {/* Metrics badge */}
        {metrics && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            padding: '4px 10px',
            background: 'rgba(35,77,194,0.9)',
            borderRadius: '100px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.65rem',
            color: '#fff',
            letterSpacing: '0.05em',
          }}>
            {metrics}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category */}
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.6rem',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '8px',
        }}>
          {category}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
          color: 'var(--text-1)',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          {title}
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.82rem',
          color: 'var(--text-2)',
          lineHeight: 1.6,
          marginBottom: '16px',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} style={{
              padding: '3px 10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-2)',
              borderRadius: '100px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.6rem',
              color: 'var(--text-3)',
            }}>
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span style={{
              padding: '3px 10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-2)',
              borderRadius: '100px',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.6rem',
              color: 'var(--text-3)',
            }}>
              +{tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Slug → case study page takes full priority
  if (slug) {
    return (
      <Link href={`/projects/${slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        {cardContent}
      </Link>
    );
  }
  if (liveUrl) {
    return (
      <a href={liveUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        {cardContent}
      </a>
    );
  }
  return <div style={{ height: '100%' }}>{cardContent}</div>;
}
