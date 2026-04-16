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

function ModalContent({ post, onClose }) {
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/log/${post.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
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
        position: 'fixed', inset: 0, zIndex: 10001,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0',
      }}
    >
      {/* Close button — top-right, always above everything */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 10002,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
      >
        <X size={18} strokeWidth={2}/>
      </button>

      {/* Scrollable center panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.7)',
          color: '#e8e8ea',
          margin: '0 16px',
        }}
        className="log-modal-scroll"
      >
        <style>{`
          .log-modal-scroll::-webkit-scrollbar { width: 0; background: transparent; }
          .log-modal-scroll { scrollbar-width: none; }
        `}</style>

        {/* ── Media by type ─────────────────────────────── */}
        {post.type === 'photo' && post.media_url && (
          <img
            src={post.media_url}
            alt={title || ''}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              objectFit: 'contain',
              background: '#000',
            }}
          />
        )}

        {post.type === 'video' && post.media_url && (
          <div style={{ width:'100%', background:'#000' }}>
            <video
              src={post.media_url}
              controls autoPlay playsInline
              poster={post.media_thumbnail || undefined}
              style={{
                display: 'block',
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                background: '#000',
              }}
            />
          </div>
        )}

        {post.type === 'audio' && post.media_url && (
          <div style={{
            padding: '36px 24px 24px',
            background: 'linear-gradient(135deg, rgba(184,115,51,0.14), rgba(20,20,20,0.4))',
          }}>
            <audio
              src={post.media_url}
              controls autoPlay
              style={{ width:'100%' }}
            />
          </div>
        )}

        {/* ── Body ────────────────────────────────────── */}
        <div style={{ padding: '22px 24px 26px' }}>
          {title && (
            <h2 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              margin: '0 0 12px',
              color: '#f4f4f5',
              fontWeight: 400,
            }}>
              {title}
            </h2>
          )}

          {desc && (
            <div style={{
              fontFamily: "'DM Sans', 'Outfit', sans-serif",
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(232,232,234,0.82)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: tags.length || date ? 20 : 0,
            }}>
              {desc}
            </div>
          )}

          {tags.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom: date ? 18 : 0 }}>
              {tags.map(t => (
                <span key={t} style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: "'DM Sans', 'Outfit', sans-serif",
                  fontSize: '0.72rem',
                  color: 'rgba(232,232,234,0.6)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Footer row */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            gap:12, paddingTop: 16,
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

// ─── Portal wrapper ────────────────────────────────────────
// Renders the modal at document.body level via createPortal.
// This escapes the <main> stacking context (z-index: 1) so the
// modal appears ABOVE the navbar (z-index: 1000) and scroll
// progress bar (z-index: 9999).
export default function LogModal({ post, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <ModalContent post={post} onClose={onClose}/>,
    document.body
  );
}
