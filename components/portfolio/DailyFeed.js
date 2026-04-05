'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, ExternalLink } from 'lucide-react';

// ── Video utilities ──────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function detectVideoType(url) {
  if (!url) return 'direct';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  return 'direct';
}

function getVideoThumbnail(post) {
  if (post.thumbnailUrl) return post.thumbnailUrl;
  const type = detectVideoType(post.videoUrl);
  if (type === 'youtube') {
    const id = getYouTubeId(post.videoUrl);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  }
  return null;
}

function formatDate(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return null; }
}

// ── Play button — inline SVG (Play not in Lucide v0.400) ─────
function PlayBtn() {
  return (
    <div style={{
      width: 56, height: 56,
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      border: '2px solid rgba(255,255,255,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform 0.15s, background 0.15s',
    }} className="play-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M8 5.5l11 6.5-11 6.5V5.5z" fill="white"/>
      </svg>
    </div>
  );
}

// ── Tags strip ───────────────────────────────────────────────
function Tags({ tags }) {
  if (!tags?.length) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map(tag => (
        <span key={tag} style={{
          fontFamily: 'Space Mono,monospace', fontSize: '0.52rem',
          color: 'var(--accent)', letterSpacing: '0.06em',
        }}>#{tag}</span>
      ))}
    </div>
  );
}

// ── Card footer (tags + date) ────────────────────────────────
function CardFooter({ tags, publishedAt }) {
  const date = formatDate(publishedAt);
  if (!tags?.length && !date) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
      <Tags tags={tags} />
      {date && (
        <span style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.5rem', color: 'var(--text-3)', flexShrink: 0 }}>
          {date}
        </span>
      )}
    </div>
  );
}

// ── PHOTO CARD ───────────────────────────────────────────────
function PhotoCard({ post }) {
  return (
    <div className="daily-card-inner" style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      <img
        src={post.imageUrl}
        alt={post.caption || 'Daily photo'}
        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
        loading="lazy"
      />
      {(post.caption || post.tags?.length > 0 || post.publishedAt) && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {post.caption && (
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.875rem', color: 'var(--text-1)', lineHeight: 1.55, margin: 0 }}>
              {post.caption}
            </p>
          )}
          <CardFooter tags={post.tags} publishedAt={post.publishedAt} />
        </div>
      )}
    </div>
  );
}

// ── VIDEO CARD ───────────────────────────────────────────────
function VideoCard({ post, onPlay }) {
  const thumb = getVideoThumbnail(post);
  const type  = detectVideoType(post.videoUrl);

  return (
    <div className="daily-card-inner" style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      {/* Thumbnail + play */}
      <div
        onClick={() => onPlay(post)}
        className="video-thumb"
        style={{ position: 'relative', aspectRatio: '16/9', background: '#000', cursor: 'pointer', overflow: 'hidden' }}
      >
        {thumb
          ? <img src={thumb} alt={post.caption || 'Video thumbnail'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s, opacity 0.2s' }} className="video-thumb-img" loading="lazy" />
          : <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Placeholder when no thumbnail */}
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <path d="M15 10l4.553-2.568A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
        }
        {/* Centered play button */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlayBtn />
        </div>
        {/* Platform badge */}
        {type === 'youtube' && (
          <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 7px', background: '#FF0000', borderRadius: 4, fontFamily: 'Space Mono,monospace', fontSize: '0.45rem', color: '#fff', letterSpacing: '0.08em', fontWeight: 700 }}>
            YouTube
          </div>
        )}
        {type === 'instagram' && (
          <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 7px', background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', borderRadius: 4, fontFamily: 'Space Mono,monospace', fontSize: '0.45rem', color: '#fff', letterSpacing: '0.08em', fontWeight: 700 }}>
            Instagram
          </div>
        )}
        {/* Dark gradient at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'linear-gradient(transparent, rgba(0,0,0,0.4))', pointerEvents: 'none' }} />
      </div>
      {/* Caption + meta */}
      {(post.caption || post.tags?.length > 0 || post.publishedAt) && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {post.caption && (
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.875rem', color: 'var(--text-1)', lineHeight: 1.55, margin: 0 }}>
              {post.caption}
            </p>
          )}
          <CardFooter tags={post.tags} publishedAt={post.publishedAt} />
        </div>
      )}
    </div>
  );
}

// ── TEXT CARD — tweet-style ──────────────────────────────────
// 5 accent colours — assigned deterministically from post.id
const TXT_GRAD = [
  { bg: 'linear-gradient(145deg, rgba(35,77,194,0.11) 0%, rgba(35,77,194,0.03) 100%)', accent: '#234DC2', border: 'rgba(35,77,194,0.22)' },
  { bg: 'linear-gradient(145deg, rgba(124,58,237,0.11) 0%, rgba(124,58,237,0.03) 100%)', accent: '#7c3aed', border: 'rgba(124,58,237,0.22)' },
  { bg: 'linear-gradient(145deg, rgba(20,184,166,0.11) 0%, rgba(20,184,166,0.03) 100%)', accent: '#14b8a6', border: 'rgba(20,184,166,0.22)' },
  { bg: 'linear-gradient(145deg, rgba(245,197,24,0.10) 0%, rgba(245,197,24,0.03) 100%)', accent: '#f5c518', border: 'rgba(245,197,24,0.22)' },
  { bg: 'linear-gradient(145deg, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.03) 100%)', accent: '#f97316', border: 'rgba(249,115,22,0.22)' },
];
function TextCard({ post }) {
  const idx = post.id ? (post.id.charCodeAt(0) % TXT_GRAD.length) : 0;
  const { bg, accent, border } = TXT_GRAD[idx];
  return (
    <div className="daily-card-inner" style={{
      background: 'var(--bg-surface)',
      backgroundImage: bg,
      border: `1px solid ${border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '22px 18px 18px',
      display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative', overflow: 'hidden', minHeight: 100,
    }}>
      {/* Decorative large quote mark */}
      <div style={{
        position: 'absolute', top: -8, left: 10,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '5rem', color: accent, opacity: 0.15,
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
      }}>&ldquo;</div>
      <p style={{
        fontFamily: 'Outfit,sans-serif', fontSize: '0.95rem',
        color: 'var(--text-1)', lineHeight: 1.7, margin: 0,
        paddingTop: 14, position: 'relative', zIndex: 1,
        whiteSpace: 'pre-wrap',
      }}>{post.text}</p>
      <CardFooter tags={post.tags} publishedAt={post.publishedAt} />
    </div>
  );
}

// ── VIDEO MODAL ──────────────────────────────────────────────
function VideoModal({ post, onClose }) {
  const type = detectVideoType(post.videoUrl);
  const ytId = type === 'youtube' ? getYouTubeId(post.videoUrl) : null;
  const isPortrait = type === 'instagram';

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer', zIndex: 10 }}
      >
        <X size={18} />
      </button>

      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: isPortrait ? 380 : 920, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Embed area */}
        <div style={{
          width: '100%',
          aspectRatio: isPortrait ? '9/16' : '16/9',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: '#000',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}>
          {type === 'youtube' && ytId && (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
          {type === 'instagram' && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, background: 'var(--bg-elevated)', padding: 32 }}>
              {/* Show thumbnail if available */}
              {post.thumbnailUrl && (
                <img src={post.thumbnailUrl} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 4 }} />
              )}
              <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.875rem', color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.6 }}>
                Instagram videos open best in their app or browser.
              </div>
              <a
                href={post.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
              >
                Open on Instagram <ExternalLink size={14} />
              </a>
            </div>
          )}
          {type === 'direct' && (
            <video
              src={post.videoUrl}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          )}
        </div>
        {/* Caption under modal */}
        {post.caption && (
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}

// ── MAIN DailyFeed ───────────────────────────────────────────
export default function DailyFeed({ posts }) {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <>
      <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
        {/* Background orb */}
        <div style={{ position: 'absolute', top: '5%', left: '-5%', width: '500px', height: '500px', background: 'rgba(35,77,194,0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <Link
              href="/"
              className="back-link-daily"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 22, transition: 'color 0.15s' }}
            >
              <ArrowLeft size={12} /> Home
            </Link>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.65rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>
              Daily Life
            </div>
            <h1 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(3rem,7vw,6rem)', color: 'var(--text-1)', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 14 }}>
              Daily
            </h1>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1rem', color: 'var(--text-2)', maxWidth: 420, lineHeight: 1.75, margin: '0 0 12px' }}>
              Moments, thoughts and behind the scenes. A window into the daily.
            </p>
            {posts.length > 0 && (
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)' }}>
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </div>
            )}
          </div>

          {/* Empty state */}
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed var(--border-2)', borderRadius: 'var(--radius-xl)', color: 'var(--text-3)', fontFamily: 'Outfit,sans-serif' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.5rem', color: 'var(--text-2)', marginBottom: 8 }}>Nothing yet</div>
              <div>Daily updates are coming soon.</div>
            </div>
          )}

          {/* Pinterest masonry */}
          {posts.length > 0 && (
            <div className="daily-masonry">
              {posts.map(post => (
                <div key={post.id} className="daily-card">
                  {post.type === 'photo' && post.imageUrl  && <PhotoCard post={post} />}
                  {post.type === 'video' && post.videoUrl  && <VideoCard post={post} onPlay={setActiveVideo} />}
                  {post.type === 'text'  && post.text      && <TextCard  post={post} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video modal */}
      {activeVideo && <VideoModal post={activeVideo} onClose={() => setActiveVideo(null)} />}

      <style>{`
        .daily-masonry {
          columns: 3;
          column-gap: 16px;
        }
        .daily-card {
          break-inside: avoid;
          margin-bottom: 16px;
        }
        @media (max-width: 900px) { .daily-masonry { columns: 2; } }
        @media (max-width: 480px) { .daily-masonry { columns: 1; } }

        .daily-card-inner {
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .daily-card-inner:hover {
          border-color: var(--accent-border) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(0,0,0,0.22);
        }
        .video-thumb:hover .play-btn {
          transform: scale(1.1);
          background: rgba(35,77,194,0.75);
        }
        .video-thumb:hover .video-thumb-img {
          transform: scale(1.03);
          opacity: 1;
        }
        .back-link-daily:hover { color: var(--accent) !important; }
      `}</style>
    </>
  );
}
