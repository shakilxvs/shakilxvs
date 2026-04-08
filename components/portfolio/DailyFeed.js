'use client';
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Play, Pause } from 'lucide-react';

// ── Utilities ────────────────────────────────────────────────
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
  if (detectVideoType(post.videoUrl) === 'youtube') {
    const id = getYouTubeId(post.videoUrl);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  }
  return null;
}
function formatDate(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
  catch { return null; }
}

// ── Card footer ──────────────────────────────────────────────
function CardFooter({ tags, publishedAt }) {
  const date = formatDate(publishedAt);
  if (!tags?.length && !date) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginTop:4, flexWrap:'wrap' }}>
      {tags?.length > 0 && (
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {tags.map(tag => (
            <span key={tag} style={{ fontFamily:'Space Mono,monospace', fontSize:'0.5rem', color:'var(--accent)', letterSpacing:'0.05em' }}>#{tag}</span>
          ))}
        </div>
      )}
      {date && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.48rem', color:'var(--text-3)', flexShrink:0, marginLeft:'auto' }}>{date}</span>}
    </div>
  );
}

// ── PHOTO CARD ───────────────────────────────────────────────
function PhotoCard({ post }) {
  const hasFooter = !!(post.caption || post.tags?.length || post.publishedAt);
  return (
    <div className="dc">
      <img
        src={post.imageUrl}
        alt={post.caption || 'Daily photo'}
        loading="lazy"
        style={{ width:'100%', display:'block', objectFit:'cover', borderRadius: hasFooter ? '16px 16px 0 0' : 16 }}
      />
      {hasFooter && (
        <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
          {post.caption && <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-1)', lineHeight:1.55, margin:0 }}>{post.caption}</p>}
          <CardFooter tags={post.tags} publishedAt={post.publishedAt}/>
        </div>
      )}
    </div>
  );
}

// ── VIDEO CARD — inline playback, matches review page style ──
function VideoCard({ post }) {
  const type      = detectVideoType(post.videoUrl);
  const thumb     = getVideoThumbnail(post);
  const videoRef  = useRef(null);
  const [playing,    setPlaying]    = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const [ytStarted,  setYtStarted]  = useState(false);
  const hasFooter = !!(post.caption || post.tags?.length || post.publishedAt);
  // YouTube = landscape 16/9  |  direct/IG = portrait 9/16 (matches review page)
  const aspect = type === 'youtube' ? '16/9' : '9/16';

  const toggleDirect = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      document.querySelectorAll('video').forEach(v => { if (v !== vid) v.pause(); });
      vid.play();
    } else {
      vid.pause();
    }
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    vid.addEventListener('play',  onPlay);
    vid.addEventListener('pause', onPause);
    vid.addEventListener('ended', onEnded);
    return () => {
      vid.removeEventListener('play',  onPlay);
      vid.removeEventListener('pause', onPause);
      vid.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <div className="dc">
      <div
        style={{ position:'relative', aspectRatio:aspect, background:'#000', overflow:'hidden', borderRadius: hasFooter ? '16px 16px 0 0' : 16 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >

        {/* ── YOUTUBE: thumbnail → click → inline iframe ── */}
        {type === 'youtube' && (
          ytStarted
            ? <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(post.videoUrl)}?autoplay=1&rel=0&modestbranding=1`}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            : <>
                {thumb && <img src={thumb} alt={post.caption||'Video'} loading="lazy" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.3s' }} className="vt-img"/>}
                <div
                  onClick={() => setYtStarted(true)}
                  style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)', cursor:'pointer' }}
                >
                  <div className="pb" style={{ width:56, height:56, borderRadius:'50%', background:'rgba(220,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.15s, background 0.15s' }}>
                    <Play size={22} fill="#fff" color="#fff" style={{ marginLeft:3 }}/>
                  </div>
                </div>
                <div style={{ position:'absolute', top:10, right:10, padding:'3px 8px', background:'#FF0000', borderRadius:4, fontFamily:'Space Mono,monospace', fontSize:'0.42rem', color:'#fff', fontWeight:700 }}>YouTube</div>
              </>
        )}

        {/* ── DIRECT: inline video with custom play/pause (matches review page) ── */}
        {type === 'direct' && (
          <>
            <video
              ref={videoRef}
              src={post.videoUrl}
              playsInline
              preload="metadata"
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}
            />
            <div
              onClick={toggleDirect}
              style={{
                position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: playing && !hovered ? 'transparent' : 'rgba(0,0,0,0.32)',
                cursor:'pointer', transition:'background 0.2s',
              }}
            >
              <button
                onClick={e => { e.stopPropagation(); toggleDirect(); }}
                style={{
                  width:52, height:52, borderRadius:'50%',
                  background:'rgba(255,255,255,0.15)',
                  backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
                  border:'2px solid rgba(255,255,255,0.55)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer',
                  opacity:    playing && !hovered ? 0 : 1,
                  transform:  playing && !hovered ? 'scale(0.85)' : 'scale(1)',
                  transition: 'opacity 0.2s, transform 0.2s',
                  color:'#fff',
                }}
              >
                {playing
                  ? <Pause size={20} fill="#fff" strokeWidth={0}/>
                  : <Play  size={20} fill="#fff" strokeWidth={0} style={{ marginLeft:2 }}/>
                }
              </button>
            </div>
          </>
        )}

        {/* ── INSTAGRAM: thumbnail + open externally ── */}
        {type === 'instagram' && (
          <>
            {thumb
              ? <img src={thumb} alt={post.caption||'Video'} loading="lazy" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#f09433,#dc2743,#bc1888)' }}/>
            }
            <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, background:'rgba(0,0,0,0.35)', textDecoration:'none' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(6px)', border:'2px solid rgba(255,255,255,0.55)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ExternalLink size={20} color="#fff"/>
              </div>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.85)', letterSpacing:'0.1em' }}>Open on Instagram</span>
            </a>
            <div style={{ position:'absolute', top:8, right:8, padding:'2px 6px', background:'linear-gradient(135deg,#f09433,#dc2743,#bc1888)', borderRadius:4, fontFamily:'Space Mono,monospace', fontSize:'0.42rem', color:'#fff', fontWeight:700 }}>IG</div>
          </>
        )}
      </div>

      {hasFooter && (
        <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
          {post.caption && <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-1)', lineHeight:1.55, margin:0 }}>{post.caption}</p>}
          <CardFooter tags={post.tags} publishedAt={post.publishedAt}/>
        </div>
      )}
    </div>
  );
}

// ── TEXT CARD ────────────────────────────────────────────────
const TXT_THEMES = [
  { bg:'rgba(35,77,194,0.07)',  border:'rgba(35,77,194,0.18)',  accent:'#234DC2' },
  { bg:'rgba(124,58,237,0.07)', border:'rgba(124,58,237,0.18)', accent:'#7c3aed' },
  { bg:'rgba(20,184,166,0.07)', border:'rgba(20,184,166,0.18)', accent:'#14b8a6' },
  { bg:'rgba(245,197,24,0.06)', border:'rgba(245,197,24,0.18)', accent:'#f5c518' },
  { bg:'rgba(249,115,22,0.06)', border:'rgba(249,115,22,0.18)', accent:'#f97316' },
];
function TextCard({ post }) {
  const t = TXT_THEMES[(post.id?.charCodeAt(0) || 0) % TXT_THEMES.length];
  return (
    <div className="dc" style={{ backgroundImage:`linear-gradient(145deg,${t.bg},rgba(0,0,0,0))`, borderColor:t.border, padding:'20px 16px 16px', display:'flex', flexDirection:'column', gap:12, position:'relative', overflow:'hidden', minHeight:90 }}>
      <div style={{ position:'absolute', top:-12, left:8, fontFamily:'Georgia,serif', fontSize:'5rem', color:t.accent, opacity:0.12, lineHeight:1, userSelect:'none', pointerEvents:'none' }}>&ldquo;</div>
      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-1)', lineHeight:1.72, margin:0, paddingTop:12, position:'relative', zIndex:1, whiteSpace:'pre-wrap' }}>{post.text}</p>
      <CardFooter tags={post.tags} publishedAt={post.publishedAt}/>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────
export default function DailyFeed({ posts, profile }) {
  return (
    <>
      <div style={{ minHeight:'100vh', paddingTop:'96px', paddingBottom:80, position:'relative', zIndex:1 }}>
        <div style={{ position:'fixed', top:'15%', right:'-8%', width:480, height:480, background:'rgba(35,77,194,0.04)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none', zIndex:0 }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', position:'relative', zIndex:1 }}>

          {/* Header */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.22em', marginBottom:10 }}>Daily Life</div>
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.6rem,5.5vw,4.5rem)', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1, margin:'0 0 8px' }}>Daily</h1>
            {posts.length > 0 && (
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </div>
            )}
          </div>

          {/* Empty */}
          {posts.length === 0 && (
            <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:8 }}>Nothing yet</div>
              <div>Daily updates are coming soon.</div>
            </div>
          )}

          {/* Pinterest masonry */}
          {posts.length > 0 && (
            <div className="dm">
              {posts.map(post => (
                <div key={post.id} className="di">
                  {post.type === 'photo' && post.imageUrl && <PhotoCard post={post}/>}
                  {post.type === 'video' && post.videoUrl && <VideoCard post={post}/>}
                  {post.type === 'text'  && post.text     && <TextCard  post={post}/>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dm { columns: 3; column-gap: 14px; }
        .di { break-inside: avoid; margin-bottom: 14px; }
        @media (max-width: 900px) { .dm { columns: 2; column-gap: 10px; } .di { margin-bottom: 10px; } }
        .dc { background: var(--bg-surface); border: 1px solid var(--border-2); border-radius: 16px; overflow: hidden; transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .dc:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.22); }
        .vt-img:hover { transform: scale(1.04); }
        .pb:hover { transform: scale(1.12) !important; background: rgba(200,0,0,0.95) !important; }
      `}</style>
    </>
  );
}
