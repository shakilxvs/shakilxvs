'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { getPortfolioDoc } from '@/lib/firestore';

const DEFAULT_NAV = [
  { href:'/',         label:'Home',     visible:true },
  { href:'/projects', label:'Projects', visible:true },
  { href:'/apps',     label:'Apps',     visible:true },
  { href:'/files',    label:'Files',    visible:true },
  { href:'/reviews',  label:'Reviews',  visible:true },
  { href:'/pay',      label:'Pay',      visible:true },
  { href:'/contact',  label:'Contact',  visible:true },
  { href:'/services', label:'Services', visible:true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [visible,  setVisible]  = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState(DEFAULT_NAV);
  const [logo,     setLogo]     = useState(undefined);
  const [isLight,  setIsLight]  = useState(false);
  const lastY = useRef(0);

  // Watch for theme changes from the Footer toggle
  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cfg = typeof window !== 'undefined' ? window.__SITE_CONFIG__ : null;
    if (cfg) {
      if (cfg.navItems?.length) setNavItems(cfg.navItems);
      setLogo(cfg.logo ?? null);
    } else {
      getPortfolioDoc('siteSettings').then(s => {
        if (s?.navItems?.length) setNavItems(s.navItems);
        setLogo(s?.logo ?? null);
      }).catch(() => { setLogo(null); });
    }
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y < 80)                       setVisible(true);
      else if (y > lastY.current + 6) { setVisible(false); setMenuOpen(false); }
      else if (y < lastY.current - 6)   setVisible(true);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visibleNav = navItems.filter(n => n.visible !== false);

  const LogoEl = () => {
    if (logo === undefined)
      return <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.85rem', color:'transparent', letterSpacing:'0.05em', userSelect:'none' }}>{'<shakil />'}</span>;
    if (logo?.type === 'image' && logo?.imageUrl)
      return <img src={logo.imageUrl} alt="Logo" style={{ height:32, width:'auto', maxWidth:160, objectFit:'contain', display:'block' }}/>;
    if (logo?.type === 'text' && logo?.text)
      return <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.85rem', color:'var(--accent)', letterSpacing:'0.05em' }}>{logo.text}</span>;
    return <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.85rem', color:'var(--accent)', letterSpacing:'0.05em' }}>{'<shakil />'}</span>;
  };

  // Glass values — theme-aware
  const navBg     = scrolled
    ? (isLight ? 'rgba(240,242,248,0.88)' : 'rgba(8,8,8,0.72)')
    : 'transparent';
  const navBorder = scrolled
    ? (isLight ? '1px solid rgba(35,77,194,0.18)' : '1px solid rgba(255,255,255,0.10)')
    : '1px solid transparent';
  const dropBg    = isLight ? 'rgba(244,246,252,0.97)' : 'rgba(8,8,8,0.97)';
  const dropBorder = isLight ? '1px solid rgba(35,77,194,0.18)' : '1px solid rgba(255,255,255,0.10)';
  const dropLink   = isLight ? 'rgba(35,77,194,0.08)'  : 'rgba(255,255,255,0.05)';

  return (
    <>
      <div style={{
        position: 'fixed', top:0, left:0, right:0, zIndex:1000,
        padding: scrolled ? '10px 20px' : '0',
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.28s ease, padding 0.28s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
        <nav style={{
          background:           navBg,
          backdropFilter:       scrolled ? 'blur(40px) saturate(220%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(40px) saturate(220%)' : 'none',
          border:               navBorder,
          borderRadius:         scrolled ? '14px' : '0',
          boxShadow:            scrolled ? (isLight ? '0 8px 40px rgba(35,77,194,0.12)' : '0 8px 40px rgba(0,0,0,0.55)') : 'none',
          maxWidth:             scrolled ? '1080px' : '100%',
          margin:               scrolled ? '0 auto' : '0',
          transition: 'background 0.28s ease, border 0.28s ease, border-radius 0.28s ease, box-shadow 0.28s ease',
        }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center' }}>
              <LogoEl />
            </Link>

            {/* Desktop links */}
            <div className="desktop-nav" style={{ display:'flex', alignItems:'center', gap:'2px' }}>
              {visibleNav.map(({ href, label }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} style={{
                    padding:'6px 13px', borderRadius:'var(--radius-md)',
                    fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', fontWeight:500,
                    textDecoration:'none',
                    color:      active ? 'var(--accent)' : 'var(--text-2)',
                    background: active ? 'var(--accent-muted)' : 'transparent',
                    border:     active ? '1px solid var(--accent-border)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}>{label}</Link>
                );
              })}
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <Link href="/contact" className="desktop-nav" style={{
                padding:'8px 18px', background:'var(--accent)', color:'#fff',
                borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif',
                fontSize:'0.85rem', fontWeight:600, textDecoration:'none', whiteSpace:'nowrap',
              }}>
                Hire Me
              </Link>
              <button onClick={() => setMenuOpen(o => !o)} className="mobile-nav-toggle" style={{
                background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)',
                color:'var(--text-1)', padding:'8px', cursor:'pointer',
                display:'none', alignItems:'center', justifyContent:'center',
              }}>
                {menuOpen ? <X size={18}/> : <Menu size={18}/>}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: dropBg,
            backdropFilter:'blur(24px)',
            borderRadius: '14px',
            border: dropBorder,
            marginTop: '8px',
            maxWidth: scrolled ? '1080px' : 'calc(100% - 24px)',
            margin: scrolled ? '8px auto 0' : '8px 12px 0',
            padding:'16px 24px 24px',
          }}>
            {visibleNav.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                display:'block', padding:'13px 0',
                borderBottom:`1px solid ${dropLink}`,
                fontFamily:'Outfit,sans-serif', fontSize:'1rem', fontWeight:500,
                color: pathname === href ? 'var(--accent)' : 'var(--text-1)', textDecoration:'none',
              }}>{label}</Link>
            ))}
            <Link href="/contact" onClick={() => setMenuOpen(false)} style={{
              display:'block', marginTop:'16px', padding:'13px',
              background:'var(--accent)', color:'#fff',
              borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif',
              fontWeight:700, textAlign:'center', textDecoration:'none',
            }}>Hire Me</Link>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
