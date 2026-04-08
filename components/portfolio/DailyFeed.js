'use client';
import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

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
  if (detectVideoType(post.videoUrl) === 'youtube') {
    const id = getYouTubeId(post.videoUrl);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  }
  return null;
}
function formatDate(isoString) {
  if (!isoString) return null;
  try { return new Date(isoString).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
  catch { return null; }
}

// ── Inline play icon (Play not in Lucide v0.400) ─────────────
function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 5.5l11 6.5-11 6.5V5.5z" fill="white"/>
    </svg>
  );
}

// ── Tags ─────────────────────────────────────────────────────
function Tags({ tags }) {
  if (!tags?.length) return null;
  return (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
      {tags.map(tag => (
        <span key={tag} style={{ fontFamily:'Space Mono,monospace', fontSize:'0.5rem', color:'var(--accent)', letterSpacing:'0.06em' }}>#{tag}</span>
      ))}
    </div>
  );
}
function CardMeta({ tags, publishedAt }) {
  const date = formatDate(publishedAt);
  if (!tags?.length && !date) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginTop:2 }}>
      <Tags tags={tags}/>
      {date && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.48rem', color:'var(--text-3)', flexShrink:0 }}>{date}</span>}
    </div>
  );
}

// ── PHOTO CARD ───────────────────────────────────────────────
function PhotoCard({ post }) {
  return (
    <div className="daily-card-inner">
      <img src={post.imageUrl} alt={post.caption||'Daily photo'} style={{ width:'100%', display:'block', objectFit:'cover', borderRadius: (post.caption||post.tags?.length||post.publishedAt) ? '16px 16px 0 0' : 16 }} loading="lazy"/>
      {(post.caption||post.tags?.length>0||post.publishedAt) && (
        <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:7 }}>
          {post.caption && <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', lineHeight:1.55, margin:0 }}>{post.caption}</p>}
          <CardMeta tags={post.tags} publishedAt={post.publishedAt}/>
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
    <div className="daily-card-inner">
      <div onClick={()=>onPlay(post)} className="video-thumb-wrap" style={{ position:'relative', aspectRatio:'16/9', background:'#000', cursor:'pointer', overflow:'hidden', borderRadius: (post.caption||post.tags?.length||post.publishedAt) ? '16px 16px 0 0' : 16 }}>
        {thumb
          ? <img src={thumb} alt={post.caption||'Video'} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.3s' }} className="vt-img" loading="lazy"/>
          : <div style={{ width:'100%', height:'100%', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.568A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
        }
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="play-btn-wrap" style={{ width:54, height:54, borderRadius:'50%', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
            <PlayIcon/>
          </div>
        </div>
        {type==='youtube'   && <div style={{ position:'absolute', top:10, right:10, padding:'3px 7px', background:'#FF0000', borderRadius:4, fontFamily:'Space Mono,monospace', fontSize:'0.45rem', color:'#fff', fontWeight:700 }}>YT</div>}
        {type==='instagram' && <div style={{ position:'absolute', top:10, right:10, padding:'3px 7px', background:'linear-gradient(135deg,#f09433,#dc2743,#bc1888)', borderRadius:4, fontFamily:'Space Mono,monospace', fontSize:'0.45rem', color:'#fff', fontWeight:700 }}>IG</div>}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:48, background:'linear-gradient(transparent,rgba(0,0,0,0.4))', pointerEvents:'none' }}/>
      </div>
      {(post.caption||post.tags?.length>0||post.publishedAt) && (
        <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:7 }}>
          {post.caption && <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', lineHeight:1.55, margin:0 }}>{post.caption}</p>}
          <CardMeta tags={post.tags} publishedAt={post.publishedAt}/>
        </div>
      )}
    </div>
  );
}

// ── TEXT CARD ────────────────────────────────────────────────
const TXT_THEMES = [
  { bg:'rgba(35,77,194,0.08)',  border:'rgba(35,77,194,0.18)',  accent:'#234DC2' },
  { bg:'rgba(124,58,237,0.08)', border:'rgba(124,58,237,0.18)', accent:'#7c3aed' },
  { bg:'rgba(20,184,166,0.08)', border:'rgba(20,184,166,0.18)', accent:'#14b8a6' },
  { bg:'rgba(245,197,24,0.07)', border:'rgba(245,197,24,0.18)', accent:'#f5c518' },
  { bg:'rgba(249,115,22,0.07)', border:'rgba(249,115,22,0.18)', accent:'#f97316' },
];
function TextCard({ post }) {
  const t = TXT_THEMES[(post.id?.charCodeAt(0)||0) % TXT_THEMES.length];
  return (
    <div className="daily-card-inner" style={{ background:`var(--bg-surface)`, backgroundImage:`linear-gradient(145deg,${t.bg} 0%,rgba(0,0,0,0) 100%)`, border:`1px solid ${t.border}`, padding:'22px 18px 18px', display:'flex', flexDirection:'column', gap:14, position:'relative', overflow:'hidden', minHeight:100 }}>
      <div style={{ position:'absolute', top:-10, left:10, fontFamily:'Georgia,serif', fontSize:'5.5rem', color:t.accent, opacity:0.13, lineHeight:1, userSelect:'none', pointerEvents:'none' }}>&ldquo;</div>
      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.95rem', color:'var(--text-1)', lineHeight:1.75, margin:0, paddingTop:14, position:'relative', zIndex:1, whiteSpace:'pre-wrap' }}>{post.text}</p>
      <CardMeta tags={post.tags} publishedAt={post.publishedAt}/>
    </div>
  );
}

// ── VIDEO MODAL ──────────────────────────────────────────────
function VideoModal({ post, onClose }) {
  const type = detectVideoType(post.videoUrl);
  const ytId = type==='youtube' ? getYouTubeId(post.videoUrl) : null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <button onClick={onClose} style={{ position:'absolute', top:20, right:20, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:10, color:'#fff', cursor:'pointer', zIndex:10 }}><X size={18}/></button>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth: type==='instagram'?380:920, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ width:'100%', aspectRatio: type==='instagram'?'9/16':'16/9', borderRadius:20, overflow:'hidden', background:'#000', boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
          {type==='youtube' && ytId && (
            <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`} style={{ width:'100%', height:'100%', border:'none' }} allow="autoplay; fullscreen" allowFullScreen/>
          )}
          {type==='instagram' && (
            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, background:'var(--bg-elevated)', padding:32 }}>
              {post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" style={{ width:'100%', maxHeight:300, objectFit:'cover', borderRadius:12, marginBottom:4 }}/>}
              <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', textAlign:'center', lineHeight:1.6 }}>Instagram videos open best in their app.</div>
              <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 24px', background:'linear-gradient(135deg,#f09433,#dc2743,#bc1888)', color:'#fff', borderRadius:10, fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', textDecoration:'none' }}>
                Open on Instagram <ExternalLink size={14}/>
              </a>
            </div>
          )}
          {type==='direct' && <video src={post.videoUrl} controls autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'contain', background:'#000' }}/>}
        </div>
        {post.caption && <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'rgba(255,255,255,0.65)', margin:0, textAlign:'center', lineHeight:1.6 }}>{post.caption}</p>}
      </div>
    </div>
  );
}

// ── PROFILE HERO ─────────────────────────────────────────────
function ProfileHero({ profile, posts }) {
  const total      = posts.length;
  const photoCount = posts.filter(p => p.type==='photo').length;
  const videoCount = posts.filter(p => p.type==='video').length;
  const textCount  = posts.filter(p => p.type==='text').length;
  const hasPhoto   = !!profile?.profileImageUrl;
  const name       = profile?.name || 'Shakil';
  const initial    = name[0].toUpperCase();

  const stats = [
    total      > 0 && { n: total,      label: total===1      ? 'Post'    : 'Posts'    },
    photoCount > 0 && { n: photoCount, label: photoCount===1 ? 'Photo'   : 'Photos'   },
    videoCount > 0 && { n: videoCount, label: videoCount===1 ? 'Video'   : 'Videos'   },
    textCount  > 0 && { n: textCount,  label: textCount===1  ? 'Thought' : 'Thoughts' },
  ].filter(Boolean);

  return (
    <section style={{ minHeight:'100vh', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', paddingTop:64 }}>

      {/* Blurred background photo */}
      {hasPhoto && (
        <div style={{ position:'absolute', inset:0, zIndex:0, overflow:'hidden' }}>
          <img src={profile.profileImageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'blur(48px) saturate(1.3)', opacity:0.13, transform:'scale(1.1)', display:'block' }}/>
        </div>
      )}

      {/* Ambient orbs */}
      <div style={{ position:'absolute', top:'12%', left:'8%',  width:420, height:420, background:'rgba(35,77,194,0.14)',  borderRadius:'50%', filter:'blur(90px)',  pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'absolute', bottom:'8%', right:'6%', width:360, height:360, background:'rgba(124,58,237,0.09)', borderRadius:'50%', filter:'blur(110px)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'absolute', top:'40%', right:'20%', width:260, height:260, background:'rgba(249,115,22,0.06)',  borderRadius:'50%', filter:'blur(80px)',  pointerEvents:'none', zIndex:0 }}/>

      {/* Hero card — frosted glass */}
      <div className="daily-hero-card" style={{
        position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', alignItems:'center', gap:22,
        textAlign:'center',
        padding:'52px 44px 44px',
        background:'rgba(11,14,26,0.72)',
        backdropFilter:'blur(28px)',
        WebkitBackdropFilter:'blur(28px)',
        border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:32,
        maxWidth:480, width:'90%',
        boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Badge */}
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.28em', padding:'5px 16px', border:'1px solid var(--accent-border)', borderRadius:100, background:'var(--accent-muted)' }}>
          Daily Life
        </div>

        {/* Profile photo with animated ring */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <div className="daily-ring" style={{ width:148, height:148, borderRadius:'50%', padding:3, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden', background:'var(--bg-elevated)', border:'3px solid var(--bg-void)', flexShrink:0 }}>
              {hasPhoto
                ? <img src={profile.profileImageUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}/>
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'3.5rem', color:'var(--accent)', background:'var(--accent-muted)' }}>{initial}</div>
              }
            </div>
          </div>
        </div>

        {/* Name + tagline */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.8rem,7vw,4.2rem)', color:'var(--text-1)', letterSpacing:'0.04em', lineHeight:0.92, margin:0 }}>
            {name}
          </h1>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.65, maxWidth:320, margin:'0 auto' }}>
            Moments, thoughts &amp; behind the scenes.
          </p>
        </div>

        {/* Stats pills */}
        {stats.length > 0 && (
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {stats.map(({ n, label }) => (
              <div key={label} style={{ padding:'5px 14px', background:'rgba(35,77,194,0.1)', border:'1px solid rgba(35,77,194,0.2)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-2)' }}>
                <span style={{ color:'var(--accent)', fontWeight:700 }}>{n}</span> {label}
              </div>
            ))}
          </div>
        )}

        {/* Scroll cue */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, marginTop:4 }}>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.48rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.22em' }}>Scroll</span>
          <div style={{ display:'flex', gap:5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:4, height:4, borderRadius:'50%', background:'var(--accent)', animation:`dailyDotBounce 1.4s ease ${i*0.18}s infinite` }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll-down arrow hint at very bottom of section */}
      <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
        <div style={{ width:1, height:44, background:'linear-gradient(var(--accent),transparent)', animation:'dailyLineGrow 2s ease infinite' }}/>
      </div>
    </section>
  );
}

// ── MAIN DailyFeed ───────────────────────────────────────────
export default function DailyFeed({ posts, profile }) {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <>
      {/* Profile hero — full viewport, first impression */}
      <ProfileHero profile={profile} posts={posts}/>

      {/* Feed section */}
      <div style={{ paddingBottom:80, position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>

          {/* Section header */}
          <div style={{ paddingTop:64, paddingBottom:32, display:'flex', alignItems:'baseline', gap:12 }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1 }}>Feed</div>
            {posts.length > 0 && (
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>
                {posts.length} {posts.length===1?'post':'posts'}
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
            <div className="daily-masonry">
              {posts.map(post => (
                <div key={post.id} className="daily-card">
                  {post.type==='photo' && post.imageUrl  && <PhotoCard post={post}/>}
                  {post.type==='video' && post.videoUrl  && <VideoCard post={post} onPlay={setActiveVideo}/>}
                  {post.type==='text'  && post.text      && <TextCard  post={post}/>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video modal */}
      {activeVideo && <VideoModal post={activeVideo} onClose={()=>setActiveVideo(null)}/>}

      <style>{`
        /* ── Masonry ── */
        .daily-masonry { columns: 3; column-gap: 16px; }
        .daily-card    { break-inside: avoid; margin-bottom: 16px; }
        @media (max-width: 900px) { .daily-masonry { columns: 2; } }
        @media (max-width: 480px) { .daily-masonry { columns: 1; } }

        /* ── Card ── */
        .daily-card-inner {
          background: var(--bg-surface);
          border: 1px solid var(--border-2);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .daily-card-inner:hover {
          border-color: var(--accent-border) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        }
        .video-thumb-wrap:hover .play-btn-wrap {
          transform: scale(1.1);
          background: rgba(35,77,194,0.75) !important;
        }
        .video-thumb-wrap:hover .vt-img { transform: scale(1.03); }

        /* ── Hero card entrance ── */
        .daily-hero-card { animation: dailyHeroFadeUp 0.75s ease both; }
        @keyframes dailyHeroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Animated gradient ring around photo ── */
        .daily-ring {
          background: conic-gradient(from 0deg, var(--accent), #7c3aed, #e6683c, #f5c518, var(--accent));
          animation: dailyRingRotate 5s linear infinite;
        }
        @keyframes dailyRingRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Scroll dots ── */
        @keyframes dailyDotBounce {
          0%, 100% { transform: scaleY(1); opacity: 0.35; }
          50%       { transform: scaleY(1.8); opacity: 1; }
        }

        /* ── Scroll line ── */
        @keyframes dailyLineGrow {
          0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
          40%  { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}
