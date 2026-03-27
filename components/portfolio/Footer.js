'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Github, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { getPortfolioDoc } from '@/lib/firestore';

const DEFAULT_LINKS = [
  { title:'Work',    links:[{ label:'Projects', href:'/projects' },{ label:'Apps', href:'/apps' },{ label:'Files', href:'/files' }] },
  { title:'Connect', links:[{ label:'Reviews', href:'/reviews' },{ label:'Contact', href:'/contact' },{ label:'Pay', href:'/pay' }] },
  { title:'Services',links:[{ label:'Shopify Development', href:'/projects' },{ label:'Digital Marketing', href:'/projects' },{ label:'Custom Web Apps', href:'/projects' }] },
];

const DEFAULT_SOCIALS = [
  { label:'Instagram', href:'https://instagram.com/shakilxvs',   show:true },
  { label:'LinkedIn',  href:'https://linkedin.com/in/shakilxvs', show:true },
  { label:'Twitter',   href:'https://twitter.com/shakilxvs',     show:true },
  { label:'Facebook',  href:'https://facebook.com/shakilxvs',    show:true },
  { label:'GitHub',    href:'https://github.com/shakilxvs',      show:true },
];

const SOCIAL_ICONS = { Instagram, LinkedIn: Linkedin, Twitter, Facebook, GitHub: Github };

export default function Footer() {
  const year = new Date().getFullYear();
  const [logo,          setLogo]          = useState(null);
  const [footerText,    setFooterText]    = useState('CMS & Custom Web Expert · Shopify Developer · Digital Marketer. 6+ years building premium experiences for global brands.');
  const [copyright,     setCopyright]     = useState('');
  const [footerLinks,   setFooterLinks]   = useState(DEFAULT_LINKS);
  const [footerSocials, setFooterSocials] = useState(DEFAULT_SOCIALS);

  useEffect(() => {
    getPortfolioDoc('siteSettings').then(s => {
      if (!s) return;
      if (s.logo)                   setLogo(s.logo);
      if (s.footerText)             setFooterText(s.footerText);
      if (s.footerCopyright)        setCopyright(s.footerCopyright);
      if (s.footerLinks?.length)    setFooterLinks(s.footerLinks);
      if (s.footerSocials?.length)  setFooterSocials(s.footerSocials);
    }).catch(() => {});
  }, []);

  const LogoEl = () => {
    if (logo?.type === 'image' && logo?.imageUrl)
      return <img src={logo.imageUrl} alt="Logo" style={{ height:28, width:'auto', maxWidth:160, objectFit:'contain', display:'block' }}/>;
    if (logo?.type === 'text' && logo?.text)
      return <span style={{ fontFamily:'Space Mono, monospace', fontSize:'1rem', color:'var(--accent)' }}>{logo.text}</span>;
    return <span style={{ fontFamily:'Space Mono, monospace', fontSize:'1rem', color:'var(--accent)' }}>{'<shakil />'}</span>;
  };

  const visibleSocials = footerSocials.filter(s => s.show !== false);
  const copyrightName  = copyright || 'Shakil';

  return (
    <footer style={{ background:'var(--bg-void)', borderTop:'1px solid var(--border-1)', paddingTop:'64px', paddingBottom:'32px', position:'relative', zIndex:1 }}>
      <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'400px', height:'200px', background:'var(--accent-glow)', borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' }}/>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'48px', marginBottom:'48px' }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ marginBottom:'12px' }}><LogoEl/></div>
            <p style={{ fontFamily:'Outfit, sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7, maxWidth:'280px', marginBottom:'24px' }}>
              {footerText}
            </p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {visibleSocials.map(({ label, href }) => {
                const Icon = SOCIAL_ICONS[label];
                if (!Icon) return null;
                return (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius-md)', border:'1px solid var(--border-2)', color:'var(--text-2)', background:'var(--bg-surface)', transition:'all 0.15s ease', textDecoration:'none' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-border)'; e.currentTarget.style.color='var(--accent)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-2)'; }}
                  >
                    <Icon size={15} strokeWidth={1.75}/>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.65rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'16px' }}>
                {title}
              </div>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'10px' }}>
                {(links||[]).map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href||'/'}
                      style={{ fontFamily:'Outfit, sans-serif', fontSize:'0.875rem', color:'var(--text-2)', textDecoration:'none', transition:'color 0.15s ease' }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--text-1)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text-2)'}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ height:'1px', background:'var(--border-1)', marginBottom:'24px' }}/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
          <p style={{ fontFamily:'Space Mono, monospace', fontSize:'0.65rem', color:'var(--text-3)', letterSpacing:'0.05em' }}>
            © {year} {copyrightName}. All rights reserved.
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:'16px', flexShrink:0, whiteSpace:'nowrap' }}>
            <Link href="/portal" style={{ fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:'var(--text-3)', textDecoration:'none', letterSpacing:'0.1em', opacity:0.5 }}>
              portal
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px)  { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
