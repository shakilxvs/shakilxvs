'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon, Check, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
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
function fmtTime(s) {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── Custom audio player ────────────────────────────────────
function AudioPlayer({ src, title }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const barCount = 48;

  // Deterministic waveform from title/src
  const bars = (() => {
    let h = 0;
    const seed = title || src || 'x';
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    const out = [];
    for (let i = 0; i < barCount; i++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      out.push(15 + (h % 70));
    }
    return out;
  })();

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => { setCurrentTime(a.currentTime); setProgress(a.duration ? a.currentTime / a.duration : 0); };
    const onMeta = () => setDuration(a.duration);
    const onEnd  = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onMeta); a.removeEventListener('ended', onEnd); };
  }, []);

  const toggle = () => {
    if (!ref.current) return;
    if (playing) ref.current.pause();
    else ref.current.play().catch(() => {});
    setPlaying(!playing);
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (ref.current && duration) { ref.current.currentTime = ratio * duration; }
  };

  return (
    <div style={{ padding:'32px 28px', background:'linear-gradient(145deg, rgba(184,115,51,0.12), rgba(20,20,20,0.5)), var(--log-m-bg, #141414)' }}>
      <audio ref={ref} src={src} preload="metadata"/>

      {/* Title */}
      {title && (
        <div style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontSize:'1.2rem', color:'rgba(232,168,112,0.9)', marginBottom:24, textAlign:'center' }}>
          {title}
        </div>
      )}

      {/* Waveform */}
      <div onClick={seek} style={{ display:'flex', alignItems:'center', gap:2, height:56, cursor:'pointer', marginBottom:18, position:'relative' }}>
        {bars.map((h, i) => {
          const filled = i / barCount <= progress;
          return (
            <div key={i} style={{
              flex:1, height:`${h}%`,
              background: filled
                ? 'linear-gradient(180deg, rgba(232,168,112,0.9), rgba(184,115,51,0.7))'
                : 'linear-gradient(180deg, rgba(232,168,112,0.25), rgba(184,115,51,0.12))',
              borderRadius: 2, minHeight: 3, transition: 'background 0.15s',
            }}/>
          );
        })}
      </div>

      {/* Controls row */}
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={toggle} style={{
          width:44, height:44, borderRadius:'50%',
          background:'rgba(232,168,112,0.15)', border:'1px solid rgba(232,168,112,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'rgba(232,168,112,0.9)', flexShrink:0,
        }}>
          {playing ? <Pause size={16} strokeWidth={2}/> : <Play size={16} strokeWidth={2} style={{ marginLeft:2 }}/>}
        </button>

        {/* Time */}
        <div style={{ fontFamily:"'DM Sans','Outfit',sans-serif", fontSize:'0.78rem', color:'rgba(232,168,112,0.7)', minWidth:80 }}>
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </div>

        <div style={{ flex:1 }}/>

        {/* Mute toggle */}
        <button onClick={() => { setMuted(!muted); if (ref.current) ref.current.muted = !muted; }}
          style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(232,168,112,0.6)', display:'flex', alignItems:'center', padding:4 }}>
          {muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
        </button>
      </div>
    </div>
  );
}

// ─── Custom video player ────────────────────────────────────
function VideoPlayer({ src, poster }) {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => { setCurrentTime(v.currentTime); setProgress(v.duration ? v.currentTime / v.duration : 0); };
    const onMeta = () => setDuration(v.duration);
    const onEnd  = () => { setPlaying(false); setShowControls(true); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('ended', onEnd);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    // Auto-play
    v.play().catch(() => {});
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('loadedmetadata', onMeta); v.removeEventListener('ended', onEnd); v.removeEventListener('play', onPlay); v.removeEventListener('pause', onPause); };
  }, []);

  const toggle = () => {
    if (!ref.current) return;
    if (playing) ref.current.pause(); else ref.current.play().catch(() => {});
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (ref.current && duration) ref.current.currentTime = ratio * duration;
  };

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
      onClick={toggle}
      style={{ position:'relative', width:'100%', height:'100%', background:'#000', cursor:'pointer' }}
    >
      <video ref={ref} src={src} poster={poster || undefined}
        muted={muted} playsInline preload="metadata"
        onContextMenu={e => e.preventDefault()}
        style={{ display:'block', width:'100%', height:'100%', objectFit:'contain' }}/>

      {/* Big center play button when paused */}
      {!playing && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
          <div style={{
            width:64, height:64, borderRadius:'50%',
            background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)',
            border:'1px solid rgba(255,255,255,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <Play size={24} fill="#fff" color="#fff" strokeWidth={0} style={{ marginLeft:3 }}/>
          </div>
        </div>
      )}

      {/* Bottom controls bar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:'absolute', bottom:0, left:0, right:0,
          background:'linear-gradient(transparent, rgba(0,0,0,0.85))',
          padding:'32px 16px 14px',
          opacity: showControls ? 1 : 0,
          transition:'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Progress bar */}
        <div onClick={seek} style={{
          height:4, background:'rgba(255,255,255,0.2)', borderRadius:2,
          cursor:'pointer', marginBottom:12, position:'relative',
        }}>
          <div style={{ height:'100%', width:`${progress * 100}%`, background:'#fff', borderRadius:2, transition:'width 0.1s linear' }}/>
          <div style={{
            position:'absolute', top:'50%', left:`${progress * 100}%`,
            width:12, height:12, borderRadius:'50%', background:'#fff',
            transform:'translate(-50%, -50%)',
            boxShadow:'0 2px 8px rgba(0,0,0,0.4)',
            opacity: showControls ? 1 : 0,
            transition:'opacity 0.15s',
          }}/>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {/* Play/Pause */}
          <button onClick={toggle} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', padding:0 }}>
            {playing ? <Pause size={18} strokeWidth={2}/> : <Play size={18} strokeWidth={2} style={{ marginLeft:1 }}/>}
          </button>

          {/* Time */}
          <span style={{ fontFamily:"'DM Sans','Outfit',sans-serif", fontSize:'0.78rem', color:'rgba(255,255,255,0.8)', minWidth:80, userSelect:'none' }}>
            {fmtTime(currentTime)} / {fmtTime(duration)}
          </span>

          <div style={{ flex:1 }}/>

          {/* Mute */}
          <button onClick={() => { setMuted(!muted); if (ref.current) ref.current.muted = !muted; }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', padding:0 }}>
            {muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen}
            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', padding:0 }}>
            <Maximize2 size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Content column ─────────────────────────────────────────
function ContentBlock({ post, onCopy, copied }) {
  const date  = formatDate(post.post_date);
  const title = post.title?.trim();
  const desc  = post.description?.trim();
  const tags  = Array.isArray(post.tags) ? post.tags : [];
  return (
    <div className="log-m-content">
      <div className="log-m-content-inner">
        {title && (
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)',
            lineHeight: 1.18, letterSpacing: '-0.01em',
            margin: '0 0 14px', color: 'var(--log-m-text)', fontWeight: 400,
          }}>
            {title}
          </h2>
        )}
        {desc && (
          <div style={{
            fontFamily: "'DM Sans', 'Outfit', sans-serif",
            fontSize: '0.92rem', lineHeight: 1.75,
            color: 'var(--log-m-text-sub)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {desc}
          </div>
        )}
        {tags.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:18 }}>
            {tags.map(t => (
              <span key={t} style={{
                padding: '4px 10px', borderRadius: 999,
                background: 'var(--log-m-tag-bg)', border: '1px solid var(--log-m-tag-border)',
                fontFamily: "'DM Sans', 'Outfit', sans-serif",
                fontSize: '0.72rem', color: 'var(--log-m-text-muted)',
              }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="log-m-footer">
        {date ? (
          <span style={{ fontFamily:"'DM Sans','Outfit',sans-serif", fontSize:'0.78rem', color:'var(--log-m-text-muted)' }}>
            {date}
          </span>
        ) : <span/>}
        <button onClick={onCopy} className="log-m-copy" style={{ color: copied ? '#6ee7b7' : undefined }}>
          {copied ? <><Check size={13} strokeWidth={2}/> Copied</> : <><LinkIcon size={13} strokeWidth={1.75}/> Copy link</>}
        </button>
      </div>
    </div>
  );
}

// ─── Modal inner ────────────────────────────────────────────
function ModalContent({ post, onClose }) {
  const [copied, setCopied] = useState(false);
  const isText  = post.type === 'text';
  const isAudio = post.type === 'audio';
  const isVideo = post.type === 'video';
  const isPhoto = post.type === 'photo';

  useEffect(() => { if (post?.id) incrementLogPostViews(post.id); }, [post?.id]);
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
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { window.prompt('Copy this link:', url); }
  };

  // Layout class — text/audio get single column, photo/video get two-column
  const layoutClass = (isText || isAudio) ? 'log-m-single' : '';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="log-m-backdrop"
    >
      <style>{`
        :root {
          --log-m-bg: #141414;
          --log-m-media-bg: #000;
          --log-m-text: #f4f4f5;
          --log-m-text-sub: rgba(232,232,234,0.82);
          --log-m-text-muted: rgba(232,232,234,0.5);
          --log-m-border: rgba(255,255,255,0.07);
          --log-m-tag-bg: rgba(255,255,255,0.04);
          --log-m-tag-border: rgba(255,255,255,0.08);
          --log-m-close-bg: rgba(255,255,255,0.08);
          --log-m-copy-bg: rgba(255,255,255,0.04);
        }
        [data-theme="light"] {
          --log-m-bg: #ffffff;
          --log-m-media-bg: #f0f0f0;
          --log-m-text: #0d1117;
          --log-m-text-sub: #4a5568;
          --log-m-text-muted: #8896b3;
          --log-m-border: rgba(0,0,0,0.08);
          --log-m-tag-bg: rgba(0,0,0,0.04);
          --log-m-tag-border: rgba(0,0,0,0.08);
          --log-m-close-bg: rgba(0,0,0,0.06);
          --log-m-copy-bg: rgba(0,0,0,0.04);
        }

        .log-m-backdrop {
          position: fixed; inset: 0; z-index: 10001;
          background: rgba(0,0,0,0.82);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          overflow-y: auto;
        }
        .log-m-close {
          position: fixed; top: 16px; right: 16px; z-index: 10002;
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--log-m-close-bg); backdrop-filter: blur(10px);
          border: 1px solid var(--log-m-border); color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .log-m-close:hover { background: rgba(255,255,255,0.2); }

        /* ── Two-column container (photo/video) ────── */
        .log-m-container {
          position: relative;
          display: flex; flex-direction: row;
          width: 100%; max-width: 960px;
          max-height: 85vh;
          background: var(--log-m-bg);
          border: 1px solid var(--log-m-border);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6);
        }
        .log-m-media {
          flex: 1.2; min-width: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--log-m-media-bg);
          max-height: 85vh; overflow: hidden;
        }
        .log-m-media img { display: block; width: 100%; height: 100%; object-fit: contain; background: var(--log-m-media-bg); }
        .log-m-media video { display: block; width: 100%; height: 100%; object-fit: contain; background: var(--log-m-media-bg); }
        .log-m-content {
          flex: 0 0 340px; width: 340px;
          display: flex; flex-direction: column;
          border-left: 1px solid var(--log-m-border);
          max-height: 85vh;
        }
        .log-m-content-inner {
          flex: 1; overflow-y: auto; padding: 24px 22px;
          scrollbar-width: none;
        }
        .log-m-content-inner::-webkit-scrollbar { width: 0; }
        .log-m-footer {
          padding: 14px 22px; border-top: 1px solid var(--log-m-border);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-shrink: 0;
        }
        .log-m-copy {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px; background: var(--log-m-copy-bg);
          border: 1px solid var(--log-m-border); border-radius: 8px;
          color: var(--log-m-text-muted);
          font-family: 'DM Sans', 'Outfit', sans-serif; font-size: 0.78rem;
          cursor: pointer; transition: background 0.2s;
        }
        .log-m-copy:hover { background: var(--log-m-tag-bg); }

        /* ── Single-column container (text / audio) ── */
        .log-m-single {
          max-width: 580px;
          flex-direction: column;
        }
        .log-m-single .log-m-content {
          flex: 1; width: 100%;
          border-left: none; max-height: none;
        }

        /* ── MOBILE ────────────────────────────────── */
        @media (max-width: 768px) {
          .log-m-backdrop {
            align-items: flex-start;
            padding: 16px 10px 40px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .log-m-container {
            flex-direction: column;
            width: 100%; max-width: 100%;
            max-height: none;
            border-radius: 16px;
            margin-top: 4px;
          }
          .log-m-media { flex: none; max-height: 60vh; }
          .log-m-media img, .log-m-media video { max-height: 60vh; }
          .log-m-content {
            flex: none; width: 100%;
            border-left: none;
            border-top: 1px solid var(--log-m-border);
            max-height: none;
          }
          .log-m-content-inner { max-height: none; }
          .log-m-close { top: 30px; right: 20px; width: 34px; height: 34px; }
          .log-m-single { max-width: 100%; }
          .log-m-single .log-m-content { border-top: none; }
        }
      `}</style>

      <button onClick={onClose} aria-label="Close" className="log-m-close">
        <X size={17} strokeWidth={2}/>
      </button>

      <motion.div
        role="dialog" aria-modal="true"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`log-m-container ${layoutClass}`}
      >
        {/* Photo — media left */}
        {isPhoto && post.media_url && (
          <div className="log-m-media">
            <img src={post.media_url} alt={post.title?.trim() ? `${post.title.trim()} — Shakil Ahmed (@shakilxvs)` : 'Photography by Shakil Ahmed — @shakilxvs'}/>
          </div>
        )}

        {/* Video — custom player, no download */}
        {isVideo && post.media_url && (
          <div className="log-m-media">
            <VideoPlayer src={post.media_url} poster={post.media_thumbnail}/>
          </div>
        )}

        {/* Audio — custom player inside single-column layout */}
        {isAudio && post.media_url && (
          <AudioPlayer src={post.media_url} title={post.title?.trim()}/>
        )}

        {/* Content — always rendered */}
        <ContentBlock post={post} onCopy={handleCopy} copied={copied}/>
      </motion.div>
    </motion.div>
  );
}

export default function LogModal({ post, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<ModalContent post={post} onClose={onClose}/>, document.body);
}
