'use client';
import { useState, useEffect, useRef } from 'react';
import { getApprovedReviews } from '@/lib/firestore';
import { getAverageRating, getRatingDistribution, formatMonthYear, getVideoType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '@/lib/utils';
import { Star, CheckCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';

// ─── Star display ─────────────────────────────────────────────
function Stars({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} fill={i < rating ? '#f5c518' : 'transparent'} color={i < rating ? '#f5c518' : 'var(--border-3)'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ name, imageUrl, size = 40 }) {
  const letter = name?.[0]?.toUpperCase() || '?';
  const colors = ['#234DC2','#7c3aed','#f59e0b','#10b981','#ef4444','#ec4899'];
  const color  = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: imageUrl ? 'none' : color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {imageUrl
        ? <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: size * 0.45, color: '#fff', lineHeight: 1 }}>{letter}</span>
      }
    </div>
  );
}

// ─── Video Card ───────────────────────────────────────────────
function VideoCard({ review }) {
  const videoType = getVideoType(review.videoUrl);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleHover = (enter) => {
    if (videoType === 'direct' && videoRef.current) {
      enter ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
    }
    setPlaying(enter);
  };

  return (
    <div style={{ flexShrink: 0, width: 200, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{ position: 'relative', aspectRatio: '9/16', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-2)' }}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        {videoType === 'youtube' && (
          <iframe src={getYouTubeEmbedUrl(review.videoUrl)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; muted" allowFullScreen />
        )}
        {videoType === 'vimeo' && (
          <iframe src={getVimeoEmbedUrl(review.videoUrl)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; muted" allowFullScreen />
        )}
        {videoType === 'direct' && (
          <video ref={videoRef} src={review.videoUrl} muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-1)' }}>{review.name}</div>
          {review.verified && <span style={{ display:"inline-flex", alignItems:"center", gap:"3px", padding:"1px 8px", background:"rgba(20,184,166,0.12)", border:"1px solid rgba(20,184,166,0.25)", borderRadius:"100px", fontFamily:"Space Mono,monospace", fontSize:"0.55rem", color:"#2dd4bf", letterSpacing:"0.04em", textTransform:"uppercase" }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Verified</span>}
        </div>
        <Stars rating={review.rating} size={12} />
        {review.service && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', marginTop: '4px' }}>{review.service}</div>}
      </div>
    </div>
  );
}

// ─── Text Review Card ─────────────────────────────────────────
function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const text    = review.text || '';
  const capped  = text.length > 200 && !expanded ? text.slice(0, 200) + '…' : text;

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar name={review.name} imageUrl={review.avatarUrl} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>{review.name}</span>
              {review.countryFlag && <span style={{ fontSize: '0.9rem' }}>{review.countryFlag}</span>}
            </div>
            {review.verified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <CheckCircle size={11} color="#2dd4bf" fill="#2dd4bf" />
                <span style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: '#2dd4bf', letterSpacing: '0.05em' }}>Verified Client</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <Stars rating={review.rating} />
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '4px' }}>
            {formatMonthYear(review.approvedAt || review.submittedAt)}
          </div>
        </div>
      </div>

      {review.service && (
        <span style={{ alignSelf: 'flex-start', padding: '3px 10px', background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', borderRadius: 100, fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--accent)' }}>
          {review.service}
        </span>
      )}

      <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>
        {capped}
        {text.length > 200 && (
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.85rem', padding: '0 4px' }}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>
    </div>
  );
}

// ─── Submit Form ──────────────────────────────────────────────
function SubmitForm() {
  const [form, setForm]       = useState({ name:'', email:'', service:'', rating:0, text:'', videoUrl:'' });
  const [submitting, setSub]  = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.rating || !form.text) return;
    setSub(true);
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) setSuccess(true);
    } catch {}
    finally { setSub(false); }
  };

  const field = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
  const lbl   = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px', display:'block' };

  if (success) return (
    <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--accent-muted)", border:"2px solid var(--accent-border)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '2rem', color: 'var(--text-1)', marginBottom: '8px' }}>Review Submitted!</div>
      <p style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--text-2)', fontSize: '0.9rem' }}>Thank you! Your review will appear after verification.</p>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xl)', padding: '40px' }}>
      <div className="section-label" style={{ marginBottom: '8px' }}>Share Your Experience</div>
      <h3 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '2rem', color: 'var(--text-1)', marginBottom: '32px', letterSpacing: '0.02em' }}>Leave a Review</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div><label style={lbl}>Your Name</label><input style={field} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="James Mitchell" /></div>
        <div><label style={lbl}>Email (kept private)</label><input type="email" style={field} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Service Used</label><input style={field} value={form.service} onChange={e=>set('service',e.target.value)} placeholder="Shopify Development" /></div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Rating</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('rating', n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <Star size={28} fill={n <= form.rating ? '#f5c518' : 'transparent'} color={n <= form.rating ? '#f5c518' : 'var(--border-3)'} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Your Review</label>
        <textarea style={{ ...field, minHeight: 120, resize: 'vertical' }} value={form.text} onChange={e=>set('text',e.target.value)} placeholder="Share your experience working with Shakil..." />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={lbl}>Video Review URL (optional)</label>
        <input style={field} value={form.videoUrl} onChange={e=>set('videoUrl',e.target.value)} placeholder="https://cloudinary.com/... or YouTube link" />
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'4px' }}>Paste a Cloudinary, YouTube, or direct MP4 URL</div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !form.name || !form.email || !form.rating || !form.text}
        style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', background: (submitting||!form.name||!form.email||!form.rating||!form.text) ? 'var(--bg-elevated)' : 'var(--accent)', color: (submitting||!form.name||!form.email||!form.rating||!form.text) ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', cursor: (submitting||!form.name||!form.email||!form.rating||!form.text) ? 'not-allowed' : 'pointer', transition:'all 0.15s ease' }}
      >
        <Send size={15} />{submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}

// ─── Main Reviews Page ────────────────────────────────────────
export default function ReviewsPage() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    getApprovedReviews().then(data => { setReviews(data); setLoading(false); });
  }, []);

  const avg      = getAverageRating(reviews);
  const dist     = getRatingDistribution(reviews);
  const videos   = reviews.filter(r => r.videoUrl);

  const scroll = (dir) => {
    if (swiperRef.current) swiperRef.current.scrollBy({ left: dir * 230, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Testimonials</div>
          <h1 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(3rem,6vw,5rem)', color: 'var(--text-1)', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '16px' }}>Client Reviews</h1>
        </div>

        {/* Stats bar */}
        {!loading && reviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xl)', padding: '32px 40px', marginBottom: '60px' }} className="stats-bar">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '5rem', color: 'var(--accent)', lineHeight: 1 }}>{avg.toFixed(1)}</div>
              <Stars rating={Math.round(avg)} size={18} />
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', marginTop: '8px', letterSpacing: '0.1em' }}>{reviews.length} REVIEWS</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[5,4,3,2,1].map(n => {
                const count = dist[n] || 0;
                const pct   = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.65rem', color: 'var(--text-3)', width: '12px', textAlign: 'right' }}>{n}</div>
                    <Star size={11} fill="#f5c518" color="#f5c518" />
                    <div style={{ flex: 1, height: 6, background: 'var(--border-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', width: '24px' }}>{count}</div>
                  </div>
                );
              })}
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={11} color="#2dd4bf" fill="#2dd4bf" />
                Verified reviews confirmed by Shakil after working with each client
              </div>
            </div>
          </div>
        )}

        {/* Video reel swiper */}
        {videos.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div className="section-label">Video Reviews</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => scroll(-1)} style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-2)', background: 'var(--bg-surface)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} /></button>
                <button onClick={() => scroll(1)}  style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-2)', background: 'var(--bg-surface)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div ref={swiperRef} style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '8px', scrollbarWidth: 'none' }} className="scrollbar-hide">
              {videos.map(r => <VideoCard key={r.id} review={r} />)}
            </div>
          </div>
        )}

        {/* Reviews grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }} className="reviews-grid">
            {Array.from({length:6}).map((_,i) => <div key={i} style={{ height:200, borderRadius:'var(--radius-lg)' }} className="skeleton" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No reviews yet.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'80px' }} className="reviews-grid">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}

        {/* Submit form */}
        <SubmitForm />
      </div>

      <style>{`
        @media (max-width:1024px) { .reviews-grid { grid-template-columns: repeat(2,1fr) !important; } .stats-bar { grid-template-columns: 1fr !important; } }
        @media (max-width:640px)  { .reviews-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
