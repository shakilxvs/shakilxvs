'use client';
import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

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

// ── Inline play icon (Play not in Lucide v0.400) ─────────────
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M8 5.5l11 6.5-11 6.5V5.5z" fill="white"/>
    </svg>
  );
}

// ── Card footer (tags + date) ────────────────────────────────
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
      {date && (
        <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.48rem', color:'var(--text-3)', flexShrink:0, marginLeft:'auto' }}>{date}</span>
      )}
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
          {post.caption && (
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-1)', lineHeight:1.55, margin:0 }}>{post.caption}</p>
          )}
          <CardFooter tags={post.tags} publishedAt={post.publishedAt}/>
        </div>
      )}
    </div>
  );
}

// ── VIDEO CARD ───────────────────────────────────────────────
function VideoCard({ post, onPlay }) {
  const thumb = getVideoThumbnail(post);
  const type  = detectVideoType(post.videoUrl);
  const hasFooter = !!(post.caption || post.tags?.length || post.publishedAt);
  return (
    <div className="dc">
      <div
        onClick={() => onPlay(post)}
        className="vt"
        style={{ position:'relative', aspectRatio:'16/9', background:'#000', cursor:'pointer', overflow:'hidden', borderRadius: hasFooter ? '16px 16px 0 0' : 16 }}
      >
        {thumb
          ? <img src={thumb} alt={post.caption || 'Video'} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.3s' }} className="vt-img"/>
          : <div style={{ width:'100%', height:'100%', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <path d="M15 10l4.553-2.568A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
        }
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="pb" style={{ width:48, height:48, borderRadius:'50%', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', border:'2px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
            <PlayIcon/>
          </div>
        </div>
        {type === 'youtube'   && <div style={{ position:'absolute', top:8, right:8, padding:'2px 6px', background:'#FF0000', borderRadius:4, fontFamily:'Space Mono,monospace', fontSize:'0.42rem', color:'#fff', fontWeight:700 }}>YT</div>}
        {type === 'instagram' && <div style={{ position:'absolute', top:8, right:8, padding:'2px 6px', background:'linear-gradient(135deg,#f09433,#dc2743,#bc1888)', borderRadius:4, fontFamily:'Space Mono,monospace', fontSize:'0.42rem', color:'#fff', fontWeight:700 }}>IG</div>}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40, background:'linear-gradient(transparent,rgba(0,0,0,0.35))', pointerEvents:'none' }}/>
      </div>
      {hasFooter && (
        <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
          {post.caption && (
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-1)', lineHeight:1.55, margin:0 }}>{post.caption}</p>
          )}
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
    <div className="dc" style={{ backgroundImage:`linear-gradient(145deg,${t.bg},rgba(0,0,0,0))`, borderColor:`${t.border}`, padding:'20px 16px 16px', display:'flex', flexDirection:'column', gap:12, position:'relative', overflow:'hidden', minHeight:90 }}>
      <div style={{ position:'absolute', top:-12, left:8, fontFamily:'Georgia,serif', fontSize:'5rem', color:t.accent, opacity:0.12, lineHeight:1, userSelect:'none', pointerEvents:'none' }}>&ldquo;</div>
      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-1)', lineHeight:1.72, margin:0, paddingTop:12, position:'relative', zIndex:1, whiteSpace:'pre-wrap' }}>{post.text}</p>
      <CardFooter tags={post.tags} publishedAt={post.publishedAt}/>
    </div>
  );
}

// ── VIDEO MODAL ──────────────────────────────────────────────
function VideoModal({ post, onClose }) {
  const type = detectVideoType(post.videoUrl);
  const ytId = type === 'youtube' ? getYouTubeId(post.videoUrl) : null;
  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
    >
      <button
        onClick={onClose}
        style={{ position:'absolute', top:20, right:20, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:10, color:'#fff', cursor:'pointer', zIndex:10 }}
      >
        <X size={18}/>
      </button>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth: type === 'instagram' ? 380 : 920, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ width:'100%', aspectRatio: type === 'instagram' ? '9/16' : '16/9', borderRadius:20, overflow:'hidden', background:'#000', boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
          {type === 'youtube' && ytId && (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              style={{ width:'100%', height:'100%', border:'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
          {type === 'instagram' && (
            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, background:'var(--bg-elevated)', padding:32 }}>
              {post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" style={{ width:'100%', maxHeight:300, objectFit:'cover', borderRadius:12 }}/>}
              <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', textAlign:'center', lineHeight:1.6 }}>Instagram videos open best in their app.</div>
              <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 24px', background:'linear-gradient(135deg,#f09433,#dc2743,#bc1888)', color:'#fff', borderRadius:10, fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', textDecoration:'none' }}>
                Open on Instagram <ExternalLink size={14}/>
              </a>
            </div>
          )}
          {type === 'direct' && (
            <video src={post.videoUrl} controls autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'contain', background:'#000' }}/>
          )}
        </div>
        {post.caption && (
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'rgba(255,255,255,0.65)', margin:0, textAlign:'center', lineHeight:1.6 }}>{post.caption}</p>
        )}
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────
export default function DailyFeed({ posts, profile }) {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <>
      <div style={{ minHeight:'100vh', paddingTop:'96px', paddingBottom:80, position:'relative', zIndex:1 }}>
        <div style={{ position:'fixed', top:'15%', right:'-8%', width:480, height:480, background:'rgba(35,77,194,0.04)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none', zIndex:0 }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', position:'relative', zIndex:1 }}>

          {/* Minimal page header */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.22em', marginBottom:10 }}>
              Daily Life
            </div>
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.6rem,5.5vw,4.5rem)', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1, margin:'0 0 8px' }}>
              Daily
            </h1>
            {posts.length > 0 && (
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </div>
            )}
          </div>

          {/* Empty state */}
          {posts.length === 0 && (
            <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:8 }}>Nothing yet</div>
              <div>Daily updates are coming soon.</div>
            </div>
          )}

          {/* Pinterest masonry grid */}
          {posts.length > 0 && (
            <div className="dm">
              {posts.map(post => (
                <div key={post.id} className="di">
                  {post.type === 'photo' && post.imageUrl && <PhotoCard post={post}/>}
                  {post.type === 'video' && post.videoUrl && <VideoCard post={post} onPlay={setActiveVideo}/>}
                  {post.type === 'text'  && post.text     && <TextCard  post={post}/>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeVideo && <VideoModal post={activeVideo} onClose={() => setActiveVideo(null)}/>}

      <style>{`
        /* Masonry — 3 cols desktop, 2 cols everywhere else (Pinterest-style) */
        .dm { columns: 3; column-gap: 14px; }
        .di { break-inside: avoid; margin-bottom: 14px; }
        @media (max-width: 900px) { .dm { columns: 2; column-gap: 10px; } .di { margin-bottom: 10px; } }

        /* Card base */
        .dc {
          background: var(--bg-surface);
          border: 1px solid var(--border-2);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .dc:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.22); }

        /* Video hover */
        .vt:hover .pb { transform: scale(1.1); background: rgba(35,77,194,0.72) !important; }
        .vt:hover .vt-img { transform: scale(1.04); }
      `}</style>
    </>
  );
}
