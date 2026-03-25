'use client';
import { useState, useEffect, useRef } from 'react';
import { getApprovedReviews , trackPageView } from '@/lib/firestore';
import { getAverageRating, getRatingDistribution, formatMonthYear, getVideoType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '@/lib/utils';
import { Star, ChevronLeft, ChevronRight, Send, Check } from 'lucide-react';
import { VerifiedBadge } from '@/components/portfolio/ReviewsTeaser';
import emailjs from 'emailjs-com';

function Stars({ rating, size = 14 }) {
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {Array.from({ length:5 }, (_,i) => (
        <Star key={i} size={size} fill={i<rating?'#f5c518':'transparent'} color={i<rating?'#f5c518':'var(--border-3)'} strokeWidth={1.5}/>
      ))}
    </div>
  );
}

function Avatar({ name, imageUrl, size = 40 }) {
  const letter = name?.[0]?.toUpperCase() || '?';
  const colors = ['#234DC2','#7c3aed','#f59e0b','#10b981','#ef4444','#ec4899'];
  const color  = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, background: imageUrl?'none':color, display:'flex', alignItems:'center', justifyContent:'center' }}>
      {imageUrl
        ? <img src={imageUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        : <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:size*0.45, color:'#fff', lineHeight:1 }}>{letter}</span>
      }
    </div>
  );
}

/* Fixed VideoCard — proper allow attrs, no autoplay, fallback on bad URL */
function VideoCard({ review }) {
  const videoType = getVideoType(review.videoUrl);
  const ytSrc     = videoType === 'youtube' ? getYouTubeEmbedUrl(review.videoUrl) : null;
  const vmSrc     = videoType === 'vimeo'   ? getVimeoEmbedUrl(review.videoUrl)   : null;
  const videoRef  = useRef(null);

  return (
    <div style={{ flexShrink:0, width:200, display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ position:'relative', aspectRatio:'9/16', borderRadius:'var(--radius-lg)', overflow:'hidden', background:'var(--bg-elevated)', border:'1px solid var(--border-2)' }}>
        {videoType === 'youtube' && (
          ytSrc ? (
            <iframe
              src={ytSrc}
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={`${review.name} video review`}
            />
          ) : (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <span style={{ fontSize:'2rem' }}>📹</span>
              <a href={review.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--accent)' }}>Watch Video →</a>
            </div>
          )
        )}
        {videoType === 'vimeo' && (
          vmSrc ? (
            <iframe
              src={vmSrc}
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={`${review.name} video review`}
            />
          ) : (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <span style={{ fontSize:'2rem' }}>📹</span>
              <a href={review.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--accent)' }}>Watch Video →</a>
            </div>
          )
        )}
        {videoType === 'direct' && (
          <video
            ref={videoRef}
            src={review.videoUrl}
            controls
            playsInline
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}
          />
        )}
      </div>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px', flexWrap:'wrap' }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', color:'var(--text-1)' }}>{review.name}</div>
          {review.verified && <VerifiedBadge/>}
        </div>
        <Stars rating={review.rating} size={12}/>
        {review.service && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'4px' }}>{review.service}</div>}
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const text   = review.text || '';
  const capped = text.length > 200 && !expanded ? text.slice(0,200)+'…' : text;
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', display:'flex', flexDirection:'column', gap:'14px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Avatar name={review.name} imageUrl={review.avatarUrl}/>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'4px' }}>
              <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>{review.name}</span>
              {review.countryFlag && <span style={{ fontSize:'0.9rem' }}>{review.countryFlag}</span>}
            </div>
            {review.verified && <VerifiedBadge/>}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <Stars rating={review.rating}/>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'4px' }}>{formatMonthYear(review.approvedAt||review.submittedAt)}</div>
        </div>
      </div>
      {review.service && <span style={{ alignSelf:'flex-start', padding:'3px 10px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)' }}>{review.service}</span>}
      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7, margin:0 }}>
        {capped}
        {text.length > 200 && <button onClick={()=>setExpanded(e=>!e)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', padding:'0 4px' }}>{expanded?'Show less':'Read more'}</button>}
      </p>
    </div>
  );
}

/* Full validation */
function validate(form) {
  const errors = {};
  if (!form.name.trim())  errors.name  = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.rating)       errors.rating = 'Please select a rating';
  if (!form.text.trim())  errors.text  = 'Please write your review';
  if (form.videoUrl?.trim()) {
    try { new URL(form.videoUrl); } catch { errors.videoUrl = 'Enter a valid URL'; }
  }
  return errors;
}

const ERR_STYLE = { fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color:'var(--fire)', marginTop:'4px', display:'block' };

function SubmitForm() {
  const [form, setForm]       = useState({ name:'', email:'', service:'', rating:0, text:'', videoUrl:'' });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState(false);
  const [submitting, setSub]  = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async () => {
    setTouched(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSub(true);
    try {
      const res = await fetch('/api/reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      if (res.ok) {
        setSuccess(true);
        /* EmailJS notification — silent fail */
        try {
          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            { subject:`New Review from ${form.name}`, from_name:form.name, from_email:form.email,
            to_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'shakilxvs@gmail.com',
            email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'shakilxvs@gmail.com', message:`Rating: ${form.rating}/5\nService: ${form.service}\n\n${form.text}`, to_name:'Shakil' },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
          );
        } catch {}
      }
    } catch {} finally { setSub(false); }
  };

  const fi = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px', display:'block' };

  if (success) return (
    <div style={{ textAlign:'center', padding:'60px 24px', background:'var(--bg-surface)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-xl)' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-muted)', border:'2px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
        <Check size={28} color="var(--accent)" strokeWidth={2.5}/>
      </div>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', marginBottom:'8px', letterSpacing:'0.05em' }}>Review Submitted!</div>
      <p style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-2)', fontSize:'0.9rem' }}>Thank you! Your review will appear after verification.</p>
    </div>
  );

  const disabled = submitting || !form.name || !form.email || !form.rating || !form.text;

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'40px' }}>
      <div className="section-label" style={{ marginBottom:'8px' }}>Share Your Experience</div>
      <h3 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', marginBottom:'32px', letterSpacing:'0.02em' }}>Leave a Review</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }} className="review-form-grid">
        <div>
          <label style={lb}>Your Name</label>
          <input style={{ ...fi, borderColor: touched&&errors.name?'var(--fire)':'var(--border-2)' }} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="James Mitchell" onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor=touched&&errors.name?'var(--fire)':'var(--border-2)'}/>
          {touched && errors.name && <span style={ERR_STYLE}>{errors.name}</span>}
        </div>
        <div>
          <label style={lb}>Email (kept private)</label>
          <input type="email" style={{ ...fi, borderColor: touched&&errors.email?'var(--fire)':'var(--border-2)' }} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor=touched&&errors.email?'var(--fire)':'var(--border-2)'}/>
          {touched && errors.email && <span style={ERR_STYLE}>{errors.email}</span>}
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={lb}>Service Used</label>
          <input style={fi} value={form.service} onChange={e=>set('service',e.target.value)} placeholder="Shopify Development" onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
        </div>
      </div>
      <div style={{ marginBottom:'16px' }}>
        <label style={lb}>Rating</label>
        <div style={{ display:'flex', gap:'8px' }}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>set('rating',n)} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px' }}>
              <Star size={28} fill={n<=form.rating?'#f5c518':'transparent'} color={n<=form.rating?'#f5c518':'var(--border-3)'} strokeWidth={1.5}/>
            </button>
          ))}
        </div>
        {touched && errors.rating && <span style={ERR_STYLE}>{errors.rating}</span>}
      </div>
      <div style={{ marginBottom:'16px' }}>
        <label style={lb}>Your Review</label>
        <textarea style={{ ...fi, minHeight:120, resize:'vertical', borderColor: touched&&errors.text?'var(--fire)':'var(--border-2)' }} value={form.text} onChange={e=>set('text',e.target.value)} placeholder="Share your experience..." onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor=touched&&errors.text?'var(--fire)':'var(--border-2)'}/>
        {touched && errors.text && <span style={ERR_STYLE}>{errors.text}</span>}
      </div>
      <div style={{ marginBottom:'24px' }}>
        <label style={lb}>Video Review URL (optional)</label>
        <input style={{ ...fi, borderColor: touched&&errors.videoUrl?'var(--fire)':'var(--border-2)' }} value={form.videoUrl} onChange={e=>set('videoUrl',e.target.value)} placeholder="YouTube, Vimeo or Cloudinary link" onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor=touched&&errors.videoUrl?'var(--fire)':'var(--border-2)'}/>
        {touched && errors.videoUrl && <span style={ERR_STYLE}>{errors.videoUrl}</span>}
      </div>
      <button onClick={handleSubmit} disabled={disabled} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', background:disabled?'var(--bg-elevated)':'var(--accent)', color:disabled?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', cursor:disabled?'not-allowed':'pointer', transition:'all 0.15s ease' }}>
        <Send size={15}/>{submitting?'Submitting…':'Submit Review'}
      </button>
      <style>{`@media(max-width:640px){.review-form-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

export default function ReviewsPageClient() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    trackPageView('reviews');
    getApprovedReviews().then(data=>{ setReviews(data); setLoading(false); });
  }, []);

  const avg    = getAverageRating(reviews);
  const dist   = getRatingDistribution(reviews);
  const videos = reviews.filter(r=>r.videoUrl);

  const scroll = (dir) => { if (swiperRef.current) swiperRef.current.scrollBy({ left:dir*230, behavior:'smooth' }); };

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ marginBottom:'48px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Testimonials</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>Client Reviews</h1>
        </div>

        {!loading && reviews.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'40px', alignItems:'center', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'32px 40px', marginBottom:'60px' }} className="stats-bar-grid">
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'5rem', color:'var(--accent)', lineHeight:1 }}>{avg.toFixed(1)}</div>
              <div style={{ display:'flex', justifyContent:'center', marginTop:'6px' }}><Stars rating={Math.round(avg)} size={18}/></div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'8px', letterSpacing:'0.1em' }}>{reviews.length} REVIEWS</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[5,4,3,2,1].map(n=>{
                const count=dist[n]||0; const pct=reviews.length?(count/reviews.length)*100:0;
                return (
                  <div key={n} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)', width:'12px', textAlign:'right' }}>{n}</div>
                    <Star size={11} fill="#f5c518" color="#f5c518"/>
                    <div style={{ flex:1, height:6, background:'var(--border-2)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:'var(--accent)', borderRadius:3 }}/>
                    </div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', width:'24px' }}>{count}</div>
                  </div>
                );
              })}
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'4px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>Verified reviews confirmed by Shakil after working with each client</span>
              </div>
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div style={{ marginBottom:'80px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div className="section-label">Video Reviews</div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={()=>scroll(-1)} style={{ width:36, height:36, borderRadius:'var(--radius-md)', border:'1px solid var(--border-2)', background:'var(--bg-surface)', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={16}/></button>
                <button onClick={()=>scroll(1)}  style={{ width:36, height:36, borderRadius:'var(--radius-md)', border:'1px solid var(--border-2)', background:'var(--bg-surface)', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronRight size={16}/></button>
              </div>
            </div>
            <div ref={swiperRef} style={{ display:'flex', gap:'16px', overflowX:'auto', scrollSnapType:'x mandatory', paddingBottom:'8px', scrollbarWidth:'none' }} className="scrollbar-hide">
              {videos.map(r=><VideoCard key={r.id} review={r}/>)}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }} className="reviews-grid">
            {Array.from({length:6}).map((_,i)=><div key={i} style={{ height:200, borderRadius:'var(--radius-lg)' }} className="skeleton"/>)}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No reviews yet.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'80px' }} className="reviews-grid">
            {reviews.map(r=><ReviewCard key={r.id} review={r}/>)}
          </div>
        )}

        <SubmitForm/>
      </div>
      <style>{`
        @media(max-width:1024px){.reviews-grid{grid-template-columns:repeat(2,1fr)!important;}.stats-bar-grid{grid-template-columns:1fr!important;}}
        @media(max-width:640px){.reviews-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
}

