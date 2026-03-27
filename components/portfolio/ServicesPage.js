'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, getPortfolioDoc } from '@/lib/firestore';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';

/* ─── Defaults (shown when Firestore is empty) ─────────────── */
const DEFAULT_DATA = {
  pageHeading:     'Services',
  pageSubheading:  'Everything you need to grow your business online.',
  pageDescription: 'From Shopify stores to full-stack web apps and performance marketing — I build and scale digital businesses.',
  tiers: [
    {
      id: 't1',
      name: 'Starter',
      price: '299',
      priceSuffix: '/project',
      highlight: false,
      badge: '',
      description: 'Perfect for small businesses launching online or refreshing their existing presence.',
      features: [
        'Shopify or WordPress setup',
        'Custom theme configuration',
        'Mobile responsive design',
        'Basic SEO setup',
        'Contact form & social links',
        '7 days post-launch support',
      ],
      ctaText: 'Get Started',
      ctaUrl: '/contact',
    },
    {
      id: 't2',
      name: 'Growth',
      price: '799',
      priceSuffix: '/project',
      highlight: true,
      badge: 'Most Popular',
      description: 'For brands serious about growing. Custom design, marketing setup, and conversion optimization.',
      features: [
        'Everything in Starter',
        'Custom UI/UX design (Figma)',
        'Conversion rate optimization',
        'Meta or Google Ads setup',
        'Email marketing integration',
        'Analytics & tracking setup',
        '30 days post-launch support',
      ],
      ctaText: 'Get Started',
      ctaUrl: '/contact',
    },
    {
      id: 't3',
      name: 'Scale',
      price: 'Custom',
      priceSuffix: '',
      highlight: false,
      badge: 'Enterprise',
      description: 'Full-service engagement for fast-growing brands. Ongoing development, ads management, and strategy.',
      features: [
        'Everything in Growth',
        'Custom web app development',
        'Ongoing ads management',
        'Monthly strategy calls',
        'Dedicated Slack channel',
        'Priority turnaround',
        'Unlimited revisions',
      ],
      ctaText: 'Let\'s Talk',
      ctaUrl: '/contact',
    },
  ],
  ctaHeading: 'Not sure which plan fits?',
  ctaText:    'Book a free 30-minute discovery call and I\'ll recommend the right approach for your goals.',
  ctaButtonText: 'Book a Free Call',
  ctaButtonUrl:  '/contact',
};

/* ─── Tier card ─────────────────────────────────────────────── */
function TierCard({ tier, index }) {
  const isHighlight = !!tier.highlight;
  const isCustom    = !tier.price || isNaN(Number(tier.price));

  return (
    <div style={{
      position: 'relative',
      background:    isHighlight ? 'var(--bg-elevated)' : 'var(--bg-surface)',
      border:        isHighlight ? '2px solid var(--accent)' : '1px solid var(--border-2)',
      borderRadius:  'var(--radius-xl)',
      padding:       '32px 28px',
      display:       'flex',
      flexDirection: 'column',
      gap:           '20px',
      transition:    'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow:     isHighlight ? '0 0 40px rgba(35,77,194,0.15)' : 'none',
      animation:     `fadeUp 0.5s ease ${index * 0.1}s both`,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isHighlight ? '0 12px 48px rgba(35,77,194,0.25)' : '0 12px 40px rgba(0,0,0,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = isHighlight ? '0 0 40px rgba(35,77,194,0.15)' : 'none'; }}
    >
      {/* Badge */}
      {tier.badge && (
        <div style={{ position:'absolute', top:'-13px', left:'50%', transform:'translateX(-50%)', background: isHighlight ? 'var(--accent)' : 'var(--bg-overlay)', border:`1px solid ${isHighlight ? 'var(--accent)' : 'var(--border-2)'}`, borderRadius:100, padding:'4px 14px', fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color: isHighlight ? '#fff' : 'var(--text-2)', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
          {tier.badge}
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color: isHighlight ? 'var(--accent)' : 'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'8px' }}>
          {tier.name}
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'10px' }}>
          {!isCustom && <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'0.9rem', color:'var(--text-3)' }}>$</span>}
          <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'3rem', color: isHighlight ? 'var(--accent)' : 'var(--text-1)', lineHeight:1 }}>
            {tier.price}
          </span>
          {tier.priceSuffix && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)' }}>{tier.priceSuffix}</span>
          )}
        </div>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.6 }}>
          {tier.description}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height:'1px', background: isHighlight ? 'rgba(35,77,194,0.3)' : 'var(--border-1)' }}/>

      {/* Features */}
      <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'10px', flex:1 }}>
        {(tier.features || []).map((feat, i) => (
          <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.5 }}>
            <CheckCircle size={15} color={isHighlight ? 'var(--accent)' : '#3d4a72'} strokeWidth={2} style={{ flexShrink:0, marginTop:'2px' }}/>
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={tier.ctaUrl || '/contact'} style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        padding:'13px', borderRadius:'var(--radius-md)',
        background:     isHighlight ? 'var(--accent)' : 'transparent',
        color:          isHighlight ? '#fff' : 'var(--text-1)',
        border:         isHighlight ? 'none' : '1px solid var(--border-3)',
        fontFamily:     'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem',
        textDecoration: 'none', transition:'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; if (!isHighlight) e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1';    if (!isHighlight) e.currentTarget.style.borderColor = 'var(--border-3)'; }}
      >
        {tier.ctaText || 'Get Started'} <ArrowRight size={15}/>
      </Link>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px' }} className="services-grid">
      {[0,1,2].map(i => (
        <div key={i} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'32px 28px', display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ height:10, width:'40%', borderRadius:4 }} className="skeleton"/>
          <div style={{ height:44, width:'60%', borderRadius:4 }} className="skeleton"/>
          <div style={{ height:14, width:'90%', borderRadius:4 }} className="skeleton"/>
          <div style={{ height:14, width:'80%', borderRadius:4 }} className="skeleton"/>
          <div style={{ height:'1px', background:'var(--border-1)' }}/>
          {[0,1,2,3,4].map(j => (
            <div key={j} style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              <div style={{ width:15, height:15, borderRadius:'50%', flexShrink:0 }} className="skeleton"/>
              <div style={{ height:12, flex:1, borderRadius:4 }} className="skeleton"/>
            </div>
          ))}
          <div style={{ height:44, borderRadius:'var(--radius-md)', marginTop:'auto' }} className="skeleton"/>
        </div>
      ))}
      <style>{`@media(max-width:1024px){.services-grid{grid-template-columns:1fr 1fr!important;}}@media(max-width:640px){.services-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export default function ServicesPageClient() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [faqItems,setFaqItems]= useState([]);
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    getServices().then(d => {
      setData(d || DEFAULT_DATA);
      setLoading(false);
    }).catch(() => {
      setData(DEFAULT_DATA);
      setLoading(false);
    });
    getPortfolioDoc('faq').then(doc => {
      setFaqItems(doc?.items || []);
    }).catch(() => {});
  }, []);

  const d = data || DEFAULT_DATA;

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      {/* Background orbs */}
      <div style={{ position:'absolute', top:'10%', right:'-5%', width:'500px', height:'500px', background:'rgba(35,77,194,0.06)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'20%', left:'-5%', width:'400px', height:'400px', background:'rgba(35,77,194,0.04)', borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none' }}/>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>

        {/* Page heading */}
        <div style={{ textAlign:'center', marginBottom:'72px' }}>
          <div className="section-label" style={{ marginBottom:'12px', justifyContent:'center', display:'flex' }}>
            {d.pageHeading || 'Services'}
          </div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,7vw,6rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'20px' }}>
            {d.pageSubheading || 'Everything you need to grow'}
          </h1>
          {d.pageDescription && (
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'clamp(0.95rem,1.5vw,1.1rem)', color:'var(--text-2)', maxWidth:'560px', margin:'0 auto', lineHeight:1.75 }}>
              {d.pageDescription}
            </p>
          )}
        </div>

        {/* Tiers grid */}
        {loading ? <Skeleton/> : (
          d.tiers?.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px', alignItems:'stretch' }} className="services-grid">
              {d.tiers.filter(t => t.active !== false).map((tier, i) => (
                <TierCard key={tier.id || i} tier={tier} index={i}/>
              ))}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'80px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
              No services listed yet — check back soon.
            </div>
          )
        )}

        {/* CTA banner */}
        {!loading && (
          <div style={{ marginTop:'80px', textAlign:'center', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'56px 40px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'500px', height:'250px', background:'rgba(35,77,194,0.06)', borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' }}/>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', gap:'2px', justifyContent:'center', marginBottom:'16px' }}>
                {Array.from({length:5}).map((_,i) => <Star key={i} size={16} fill="#f5c518" color="#f5c518"/>)}
              </div>
              <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,4vw,3.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'16px' }}>
                {d.ctaHeading || 'Not sure which plan fits?'}
              </h2>
              <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1rem', color:'var(--text-2)', maxWidth:'480px', margin:'0 auto 32px', lineHeight:1.7 }}>
                {d.ctaText || 'Book a free discovery call and I\'ll recommend the right approach for your goals.'}
              </p>
              <Link href={d.ctaButtonUrl || '/contact'} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 32px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.95rem', textDecoration:'none', transition:'opacity 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}
              >
                {d.ctaButtonText || 'Book a Free Call'} <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        )}
      </div>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <div style={{ marginTop:'80px' }}>
            <div style={{ textAlign:'center', marginBottom:'48px' }}>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'12px' }}>Common Questions</div>
              <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,4vw,3.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>Frequently Asked Questions</h2>
            </div>
            <div style={{ maxWidth:720, margin:'0 auto', padding:'0 24px', display:'flex', flexDirection:'column', gap:'8px' }}>
              {faqItems.map((item, i) => (
                <div key={i} style={{ background:'var(--bg-surface)', border:`1px solid ${faqOpen===i?'var(--accent-border)':'var(--border-2)'}`, borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'border-color 0.2s' }}>
                  <button
                    onClick={() => setFaqOpen(faqOpen===i ? null : i)}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', padding:'18px 20px', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--text-1)', lineHeight:1.4 }}>{item.question}</span>
                    <span style={{ flexShrink:0, fontFamily:'monospace', fontSize:'1.3rem', color:'var(--accent)', lineHeight:1, transform: faqOpen===i?'rotate(45deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>+</span>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding:'0 20px 18px', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-2)', lineHeight:1.75, borderTop:'1px solid var(--border-1)' }}>
                      <div style={{ paddingTop:'14px' }}>{item.answer}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQPage Schema */}
        {faqItems.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqItems.map(item => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            }) }}
          />
        )}

      <style>{`
        @media (max-width: 1024px) { .services-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px)  { .services-grid { grid-template-columns: 1fr !important; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
