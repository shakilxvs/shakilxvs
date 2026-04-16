'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon, Check } from 'lucide-react';
import { incrementLogPostViews } from '@/lib/firestore';

function formatDate(ts) {
  if (!ts) return null;
  let date;
  if (ts instanceof Date) date = ts;
  else if (typeof ts === 'string') date = new Date(ts);
  else if (ts.seconds != null)     date = new Date(ts.seconds * 1000);
  else if (typeof ts.toDate === 'function') date = ts.toDate();
  else return null;
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

// ─── Media column (left on desktop, top on mobile) ────────
function MediaBlock({ post }) {
  if (post.type === 'photo' && post.media_url) {
    return (
      <div className="log-m-media">
        <img src={post.media_url} alt={post.title || ''}
          style={{ display:'block', width:'100%', height:'100%', objectFit:'contain', background:'#000' }}/>
      </div>
    );
  }
  if (post.type === 'video' && post.media_url) {
    return (
      <div className="log-m-media">
        <video src={post.media_url} controls autoPlay playsInline
          poster={post.media_thumbnail || undefined}
          style={{ display:'block', width:'100%', height:'100%', objectFit:'contain', background:'#000' }}/>
      </div>
    );
  }
  if (post.type === 'audio' && post.media_url) {
    return (
      <div className="log-m-media log-m-media-audio">
        <div style={{ padding:'40px 28px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, height:'100%' }}>
          <div style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontSize:'1.4rem', color:'rgba(232,168,112,0.9)', textAlign:'center' }}>
            {post.title || 'Audio'}
          </div>
          <audio src={post.media_url} controls autoPlay style={{ width:'100%', maxWidth:360 }}/>
        </div>
      </div>
    );
  }
  // Text type — no media column
  return null;
}

// ─── Content column (right on desktop, bottom on mobile) ───
function ContentBlock({ post, onCopy, copied }) {
  const date  = formatDate(post.post_date);
  const title = post.title?.trim();
  const desc  = post.description?.trim();
  const tags  = Array.isArray(post.tags) ? post.tags : [];

  return (
    <div className="log-m-content">
      <div style={{ flex:1, overflowY:'auto', padding:'24px 22px' }} className="log-m-content-scroll">
        {title && (
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            margin: '0 0 14px',
            color: '#f4f4f5',
            fontWeight: 400,
          }}>
            {title}
          </h2>
        )}

        {desc && (
          <div style={{
            fontFamily: "'DM Sans', 'Outfit', sans-serif",
            fontSize: '0.92rem',
            lineHeight: 1.75,
            color: 'rgba(232,232,234,0.82)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {desc}
          </div>
        )}

        {tags.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:18 }}>
            {tags.map(t => (
              <span key={t} style={{
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: "'DM Sans', 'Outfit', sans-serif",
                fontSize: '0.72rem', color: 'rgba(232,232,234,0.6)',
              }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer — pinned at bottom */}
      <div style={{
        padding: '14px 22px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        flexShrink: 0,
      }}>
        {date ? (
          <span style={{
            fontFamily: "'DM Sans', 'Outfit', sans-serif",
            fontSize: '0.78rem', color: 'rgba(232,232,234,0.4)',
          }}>
            {date}
          </span>
        ) : <span/>}
        <button onClick={onCopy} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          color: copied ? '#6ee7b7' : 'rgba(232,232,234,0.7)',
          fontFamily: "'DM Sans', 'Outfit', sans-serif",
          fontSize: '0.78rem', cursor: 'pointer',
          transition: 'color 0.2s, background 0.2s',
        }}
          onMouseEnter={e => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        >
          {copied
            ? <><Check size={13} strokeWidth={2}/> Copied</>
            : <><LinkIcon size={13} strokeWidth={1.75}/> Copy link</>}
        </button>
      </div>
    </div>
  );
}

// ─── Modal inner ──────────────────────────────────────────
function ModalContent({ post, onClose }) {
  const [copied, setCopied] = useState(false);
  const hasMedia = post.type !== 'text';

  useEffect(() => {
    if (post?.id) incrementLogPostViews(post.id);
  }, [post?.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleCopy = async () => {
    const url = `${window.location.origin}/log/${post.id}`;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else { const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { window.prompt('Copy this link:', url); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="log-m-backdrop"
    >
      <style>{`
        /* ── Backdrop ─────────────────────────────────── */
        .log-m-backdrop {
          position: fixed; inset: 0; z-index: 10001;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 0;
        }

        /* ── Close button ─────────────────────────────── */
        .log-m-close {
          position: fixed; z-index: 10002;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .log-m-close:hover { background: rgba(255,255,255,0.18); }

        /* ── Container ────────────────────────────────── */
        .log-m-container {
          position: relative;
          display: flex; flex-direction: row;
          width: 92vw; max-width: 960px;
          height: auto; max-height: 88vh;
          background: #141414;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.7);
          color: #e8e8ea;
        }

        /* ── Media column ─────────────────────────────── */
        .log-m-media {
          flex: 1.2; min-width: 0;
          display: flex; align-items: center; justify-content: center;
          background: #000;
          max-height: 88vh;
          overflow: hidden;
        }
        .log-m-media img,
        .log-m-media video {
          max-height: 88vh;
        }
        .log-m-media-audio {
          background: linear-gradient(135deg, rgba(184,115,51,0.14), rgba(20,20,20,0.6)), #0a0a0a;
        }

        /* ── Content column ───────────────────────────── */
        .log-m-content {
          flex: 0 0 340px; width: 340px;
          display: flex; flex-direction: column;
          border-left: 1px solid rgba(255,255,255,0.06);
          max-height: 88vh;
        }
        .log-m-content-scroll {
          scrollbar-width: none;
        }
        .log-m-content-scroll::-webkit-scrollbar {
          width: 0; background: transparent;
        }

        /* ── Text-only posts (no media) ───────────────── */
        .log-m-text-only .log-m-content {
          flex: 1; width: 100%; max-width: 580px;
          border-left: none;
        }

        /* ── Desktop close button position ────────────── */
        .log-m-close { top: 16px; right: 16px; }

        /* ── MOBILE ───────────────────────────────────── */
        @media (max-width: 768px) {
          .log-m-backdrop {
            align-items: stretch;
            padding: 0;
          }
          .log-m-container {
            flex-direction: column;
            width: 100%; max-width: 100%;
            height: 100vh; max-height: 100vh;
            border-radius: 0;
            border: none;
          }
          .log-m-media {
            flex: none;
            max-height: 55vh;
          }
          .log-m-media img,
          .log-m-media video {
            max-height: 55vh;
          }
          .log-m-content {
            flex: 1; width: 100%;
            border-left: none;
            border-top: 1px solid rgba(255,255,255,0.06);
            max-height: none;
          }
          .log-m-close { top: 12px; right: 12px; }

          .log-m-text-only .log-m-content {
            max-width: 100%;
          }
        }
      `}</style>

      {/* Close button */}
      <button onClick={onClose} aria-label="Close" className="log-m-close">
        <X size={17} strokeWidth={2}/>
      </button>

      {/* Container */}
      <motion.div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`log-m-container ${!hasMedia ? 'log-m-text-only' : ''}`}
      >
        {hasMedia && <MediaBlock post={post}/>}
        <ContentBlock post={post} onCopy={handleCopy} copied={copied}/>
      </motion.div>
    </motion.div>
  );
}

// ─── Portal wrapper ────────────────────────────────────────
export default function LogModal({ post, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(
    <ModalContent post={post} onClose={onClose}/>,
    document.body
  );
}
