import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTABanner() {
  return (
    <section style={{ padding:'100px 0', position:'relative', zIndex:1, overflow:'hidden' }}>
      {/* Orb */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'300px', background:'rgba(35,77,194,0.08)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', textAlign:'center', position:'relative' }}>
        <div className="section-label" style={{ marginBottom:'16px', justifyContent:'center', display:'flex' }}>Let's Work Together</div>
        <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'20px' }}>
          Ready to Grow<br/>Your Business?
        </h2>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.1rem', color:'var(--text-2)', maxWidth:'500px', margin:'0 auto 40px', lineHeight:1.7 }}>
          6+ years · 5000+ projects · Global clients. Let's build something extraordinary together.
        </p>
        <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 32px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1rem', textDecoration:'none' }}>
            Request a Quote <ArrowRight size={18}/>
          </Link>
          <Link href="/projects" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 32px', background:'transparent', color:'var(--text-1)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-3)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'1rem', textDecoration:'none' }}>
            View My Work
          </Link>
        </div>
      </div>
    </section>
  );
}
