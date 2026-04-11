'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTABanner() {
  return (
    <section className="section-pad" style={{ position:'relative', zIndex:1, overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'300px', background:'rgba(35,77,194,0.07)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', textAlign:'center', position:'relative' }}>
        <div className="section-label" style={{ marginBottom:'16px', justifyContent:'center', display:'flex' }}>Let&apos;s Work Together</div>
        <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'20px' }}>
          Ready to Grow<br/>Your Business?
        </h2>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.05rem', color:'var(--text-2)', maxWidth:'500px', margin:'0 auto 40px', lineHeight:1.7 }}>
          6+ years · 5000+ projects · Global clients. Let&apos;s build something extraordinary together.
        </p>
        {/* Equal-width buttons, responsive */}
        <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'13px 0', width:'220px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.95rem', textDecoration:'none', transition:'opacity 0.15s ease' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Request a Quote <ArrowRight size={16}/>
          </Link>
          <Link href="/projects" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'13px 0', width:'220px', background:'transparent', color:'var(--text-1)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-3)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.95rem', textDecoration:'none', transition:'border-color 0.15s ease' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-3)'}>
            View My Work
          </Link>
        </div>
      </div>
      <style>{`@media (max-width:480px){ .cta-btn { width: 100% !important; } }`}</style>
    </section>
  );
}
