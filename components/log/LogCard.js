'use client';

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Video, Type, Music, Play } from 'lucide-react';

const TYPE_ICONS = { photo: ImageIcon, video: Video, text: Type, audio: Music };

// ─── Shared card wrapper ────────────────────────────────────
// Provides the base glass surface + hover lift + type badge.
function CardShell({ type, onOpen, children, extraStyle = {} }) {
  const Icon = TYPE_ICONS[type] || Type;
  return (
    <button
      onClick={onOpen}
      className="log-card"
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        padding: 0,
        background: 'var(--log-card-bg, #141414)',
        border: '1px solid var(--log-card-border, rgba(255,255,255,0.07))',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        color: 'inherit',
        font: 'inherit',
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s, border-color 0.35s',
        ...extraStyle,
      }}
    >
      <style>{`
        .log-card:hover {
          transform: scale(1.02);
          border-color: var(--log-card-hover-border, rgba(255,255,255,0.14));
          box-shadow:
            0 24px 60px -20px rgba(0,0,0,0.5),
            0 0 0 1px var(--log-card-border, rgba(255,255,255,0.03)) inset;
        }
        .log-card:focus-visible {
          outline: 2px solid var(--log-pill-active-bg, rgba(244,244,245,0.6));
          outline-offset: 3px;
        }
      `}</style>
      {children}
      {/* Type badge */}
      <span style={{
        position: 'absolute', top: 10, right: 10,
        width: 26, height: 26, borderRadius: 8,
        background: 'var(--log-badge-bg, rgba(10,10,10,0.55))',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--log-card-border, rgba(255,255,255,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--log-text, #f4f4f5)',
        pointerEvents: 'none',
      }}>
        <Icon size={12} strokeWidth={1.75}/>
      </span>
    </button>
  );
}

// ─── PHOTO ──────────────────────────────────────────────────
function PhotoCard({ post, onOpen }) {
  if (!post.media_url) return null;
  return (
    <CardShell type="photo" onOpen={onOpen}>
      {/* Natural aspect ratio preserved. next/image with fill would
          crop — we want raw intrinsic dimensions. Use <img> directly
          but still leverage the browser's lazy loading. Next/image's
          unoptimized flag would also work but adds complexity we
          don't need; a plain img is best here. */}
      <img
        src={post.media_url}
        alt={post.title || ''}
        loading="lazy"
        decoding="async"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: 16,
        }}
      />
    </CardShell>
  );
}

// ─── VIDEO ──────────────────────────────────────────────────
// Desktop: hover to play muted loop. Mobile: autoplay when in viewport
// (per spec answer "B"). Falls back to the Cloudinary-generated .jpg
// thumbnail when not playing.
function VideoCard({ post, onOpen }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Mobile: IntersectionObserver → play when ≥60% visible, pause when not.
  useEffect(() => {
    if (!isMobile || !containerRef.current || !videoRef.current) return;
    const el = containerRef.current;
    const vid = videoRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
            vid.currentTime = 0;
          }
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isMobile]);

  const onMouseEnter = () => {
    if (isMobile || !videoRef.current) return;
    videoRef.current.play().catch(() => {});
  };
  const onMouseLeave = () => {
    if (isMobile || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  const poster = post.media_thumbnail || null;

  return (
    <CardShell type="video" onOpen={onOpen}>
      <div
        ref={containerRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          background: '#000',
        }}
      >
        {/* Poster image at natural aspect ratio — determines card height
            exactly like PhotoCard does. No forced 16:9. */}
        {poster ? (
          <img
            src={poster}
            alt={post.title || ''}
            loading="lazy"
            decoding="async"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
            }}
          />
        ) : (
          /* No poster — show video element for size */
          <video
            src={post.media_url}
            muted playsInline preload="metadata"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Video overlay for hover/viewport autoplay — sits on top of poster */}
        {post.media_url && poster && (
          <video
            ref={videoRef}
            src={post.media_url}
            muted
            loop
            playsInline
            preload="metadata"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Frosted-glass play overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'var(--log-badge-bg, rgba(10,10,10,0.5))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <Play size={18} fill="white" color="white" strokeWidth={0}
              style={{ marginLeft: 2 }}/>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ─── TEXT ───────────────────────────────────────────────────
// No media. Title in serif, description preview truncated at 3 lines
// with a fade-out mask. Subtle paper-texture background.
function TextCard({ post, onOpen }) {
  const title = post.title?.trim();
  const body  = post.description?.trim() || '';
  return (
    <CardShell
      type="text"
      onOpen={onOpen}
      extraStyle={{
        background:
          // Warm paper tone layered under the dark surface. SVG noise adds grain.
          "linear-gradient(180deg, rgba(60,40,30,0.06), rgba(10,10,10,0) 60%), url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\"), var(--log-card-bg, #141414)",
        backgroundSize: 'auto, 180px 180px, auto',
      }}
    >
      <div style={{ padding: '22px 22px 26px' }}>
        {title && (
          <h3 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '1.7rem',
            lineHeight: 1.15,
            margin: '0 0 12px',
            color: 'var(--log-text, #f4f4f5)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h3>
        )}
        {body && (
          <p style={{
            fontFamily: "'DM Sans', 'Outfit', sans-serif",
            fontSize: '0.92rem',
            lineHeight: 1.65,
            color: 'var(--log-text-sub, rgba(232,232,234,0.7))',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            // Fade-out on last line
            maskImage: 'linear-gradient(to bottom, #000 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent 100%)',
          }}>
            {body}
          </p>
        )}
      </div>
    </CardShell>
  );
}

// ─── AUDIO ──────────────────────────────────────────────────
// Decorative CSS waveform. Track title. Tap-to-open modal (audio
// itself plays in the modal, not on card — the card is a preview).
function AudioCard({ post, onOpen }) {
  const title = post.title?.trim() || 'Audio note';
  // Generate stable-looking "waveform" bars (deterministic by id for visual
  // consistency across renders / server-hydration).
  const bars = useWaveformHeights(post.id || title, 38);

  return (
    <CardShell
      type="audio"
      onOpen={onOpen}
      extraStyle={{
        background: 'linear-gradient(135deg, rgba(184,115,51,0.10), rgba(20,20,20,0.6)), var(--log-card-bg, #141414)',
      }}
    >
      <div style={{ padding: '22px' }}>
        {/* Waveform */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          height: 56,
          marginBottom: 18,
        }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              background: 'linear-gradient(180deg, rgba(232,168,112,0.8), rgba(184,115,51,0.4))',
              borderRadius: 2,
              minHeight: 2,
            }}/>
          ))}
        </div>
        {/* Row: play icon + title */}
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(232,168,112,0.18)',
            border: '1px solid rgba(232,168,112,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Play size={13} fill="rgba(232,168,112,0.9)" color="rgba(232,168,112,0.9)" strokeWidth={0}
              style={{ marginLeft: 2 }}/>
          </div>
          <div style={{
            flex: 1, minWidth: 0,
            fontFamily: "'DM Sans', 'Outfit', sans-serif",
            fontSize: '0.92rem',
            fontWeight: 500,
            color: 'rgba(244,232,224,0.9)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// Deterministic pseudo-random heights from a string seed.
// Same id → same waveform shape forever → no hydration mismatch.
function useWaveformHeights(seed, count) {
  let h = 0;
  for (let i = 0; i < (seed || 'x').length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const out = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    // Center around 50%, range 15–90%
    const v = 15 + (h % 76);
    out.push(v);
  }
  return out;
}

// ─── Dispatcher ─────────────────────────────────────────────
export default function LogCard({ post, onOpen }) {
  switch (post.type) {
    case 'photo': return <PhotoCard post={post} onOpen={onOpen}/>;
    case 'video': return <VideoCard post={post} onOpen={onOpen}/>;
    case 'text':  return <TextCard  post={post} onOpen={onOpen}/>;
    case 'audio': return <AudioCard post={post} onOpen={onOpen}/>;
    default:      return null;
  }
}
