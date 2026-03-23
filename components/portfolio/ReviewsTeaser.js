import Link from 'next/link';
import { ArrowRight, Star, CheckCircle } from 'lucide-react';

function MiniCard({ review }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ display:'flex', gap:'2px' }}>
        {Array.from({length:5},(_,i)=>(
          <Star key={i} size={13} fill={i<review.rating?'#f5c518':'transparent'} color={i<review.rating?'#f5c518':'var(--border-3)'} strokeWidth={1.5}/>
        ))}
      </div>
      <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7, flex:1 }}>
        "{review.text?.slice(0,140)}{review.text?.length>140?'…':''}"
      </p>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'1rem', color:'var(--accent)', flexShrink:0 }}>
          {review.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', color:'var(--text-1)', display:'flex', alignItems:'center', gap:'4px' }}>
            {review.name}
            {review.verified && <CheckCircle size={11} color="#2dd4bf" fill="#2dd4bf"/>}
          </div>
          {review.service && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{review.service}</div>}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsTeaser({ reviews = [] }) {
  const top = reviews.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <section style={{ padding:'100px 0', background:'var(--bg-void)', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'48px', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <div className="section-label" style={{ marginBottom:'12px' }}>Testimonials</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.5rem,5vw,4rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>What Clients Say</h2>
          </div>
          <Link href="/reviews" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.875rem', color:'var(--accent)', textDecoration:'none', whiteSpace:'nowrap' }}>
            All Reviews <ArrowRight size={16}/>
          </Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }} className="reviews-teaser-grid">
          {top.map(r => <MiniCard key={r.id} review={r}/>)}
        </div>
      </div>
      <style>{`@media (max-width:1024px){.reviews-teaser-grid{grid-template-columns:repeat(2,1fr)!important;}} @media (max-width:640px){.reviews-teaser-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
