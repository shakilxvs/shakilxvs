'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon, Check } from 'lucide-react';
import { incrementLogPostViews } from '@/lib/firestore';

// Convert Firestore-style { seconds, nanoseconds } / Date / ISO → formatted date
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

export default function LogModal({ post, onClose }) {
  const [copied, setCopied] = useState(false);

  // Fire-and-forget view increment when modal opens.
  // Firestore rule restricts this write to +1 on `views` only,
  // on published posts only — see firestore.rules.
  useEffect(() => {
    if (post?.id) incrementLogPostViews(post.id);
  }, [post?.id]);

  // Escape to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/log/${post.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Last-resort fallback: show URL via prompt
      window.prompt('Copy this link:', url);
    }
  };

  const date = formatDate(post.post_date);
  const title = post.title?.trim();
  const desc  = post.description?.trim();
  const tags  = Array.isArray(post.tags) ? post.tags : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        overflowY: 'auto',
        padding: '40px 20px',
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          width: '100%', maxWidth: 720,
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.7)',
          color: '#e8e8ea',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 2,
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(10,10,10,0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(244,244,245,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} strokeWidth={1.75}/>
        </button>

        {/* ── Media / content by type ─────────────────────── */}
        {post.type === 'photo' && post.media_url && (
          <img
            src={post.media_url}
            alt={title || ''}
            style={{ display:'block', width:'100%', height:'auto' }}
          />
        )}

        {post.type === 'video' && post.media_url && (
          <div style={{ width:'100%', aspectRatio:'16 / 9', background:'#000' }}>
            <video
              src={post.media_url}
              controls autoPlay playsInline
              poster={post.media_thumbnail || undefined}
              style={{ width:'100%', height:'100%', objectFit:'contain', background:'#000' }}
            />
          </div>
        )}

        {post.type === 'audio' && post.media_url && (
          <div style={{
            padding: '36px 28px 24px',
            background: 'linear-gradient(135deg, rgba(184,115,51,0.14), rgba(20,20,20,0.4))',
          }}>
            <audio
              src={post.media_url}
              controls autoPlay
              style={{ width:'100%' }}
            />
          </div>
        )}

        {/* ── Body ────────────────────────────────────────── */}
        <div style={{ padding: '26px 28px 30px' }}>
          {title && (
            <h2 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              lineHeight: 1.1,
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
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'rgba(232,232,234,0.82)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: tags.length || date ? 22 : 0,
            }}>
              {desc}
            </div>
          )}

          {tags.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom: date ? 20 : 0 }}>
              {tags.map(t => (
                <span key={t} style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: "'DM Sans', 'Outfit', sans-serif",
                  fontSize: '0.72rem',
                  color: 'rgba(232,232,234,0.6)',
                  letterSpacing: '-0.005em',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Footer row */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            gap:12, marginTop: 20, paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {date ? (
              <span style={{
                fontFamily: "'DM Sans', 'Outfit', sans-serif",
                fontSize: '0.78rem',
                color: 'rgba(232,232,234,0.45)',
              }}>
                {date}
              </span>
            ) : <span/>}
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: copied ? '#6ee7b7' : 'rgba(232,232,234,0.75)',
                fontFamily: "'DM Sans', 'Outfit', sans-serif",
                fontSize: '0.78rem',
                cursor: 'pointer',
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
      </motion.div>
    </motion.div>
  );
}
