'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',         label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/apps',     label: 'Apps' },
  { href: '/files',    label: 'Files' },
  { href: '/reviews',  label: 'Reviews' },
  { href: '/pay',      label: 'Pay' },
  { href: '/contact',  label: 'Contact' },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [visible,  setVisible]  = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

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

  /* Close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      {/* Outer wrapper — fixed, full-width, ONLY handles transform for show/hide */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
        {/* Inner pill — handles all visual styling transitions */}
        <nav
          className="nav-pill-inner"
          style={{
            maxWidth:            scrolled ? '860px'                             : '100%',
            margin:              scrolled ? '10px auto'                         : '0',
            background:          scrolled ? 'rgba(5,7,15,0.75)'                : 'transparent',
            backdropFilter:      scrolled ? 'blur(40px) saturate(200%)'        : 'none',
            WebkitBackdropFilter:scrolled ? 'blur(40px) saturate(200%)'        : 'none',
            border:              scrolled ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
            borderRadius:        scrolled ? '16px'                             : '0',
            boxShadow:           scrolled ? '0 8px 32px rgba(0,0,0,0.5)'      : 'none',
            transition: 'max-width 0.35s cubic-bezier(0.4,0,0.2,1), margin 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, border 0.3s ease, border-radius 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease',
          }}
        >
          {/* Content container — maxWidth is constant, avoids double reflow */}
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', color: 'var(--accent)', letterSpacing: '0.05em' }}>{'<shakil />'}</span>
            </Link>

            {/* Desktop nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-md)',
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 500,
                    textDecoration: 'none',
                    color:      active ? 'var(--accent)' : 'var(--text-2)',
                    background: active ? 'var(--accent-muted)' : 'transparent',
                    border:     active ? '1px solid var(--accent-border)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}>{label}</Link>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/contact" className="desktop-nav" style={{
                padding: '8px 18px', background: 'var(--accent)', color: '#fff',
                borderRadius: 'var(--radius-md)', fontFamily: 'Outfit, sans-serif',
                fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
              }}>
                Hire Me
              </Link>
              <button onClick={() => setMenuOpen(o => !o)} className="mobile-nav-toggle" style={{
                background: 'none', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)',
                color: 'var(--text-1)', padding: '8px', cursor: 'pointer',
                display: 'none', alignItems: 'center', justifyContent: 'center',
              }}>
                {menuOpen ? <X size={18}/> : <Menu size={18}/>}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="nav-pill-inner nav-mobile-dropdown" style={{
            background: 'rgba(5,7,15,0.97)', backdropFilter: 'blur(40px)',
            padding: '16px 24px 24px',
            maxWidth: scrolled ? '860px' : '100%',
            margin: scrolled ? '0 auto' : '0',
            borderRadius: scrolled ? '0 0 16px 16px' : '0',
            border: scrolled ? '1px solid rgba(255,255,255,0.10)' : 'none',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '13px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 500,
                color: pathname === href ? 'var(--accent)' : 'var(--text-1)', textDecoration: 'none',
              }}>{label}</Link>
            ))}
            <Link href="/contact" onClick={() => setMenuOpen(false)} style={{
              display: 'block', marginTop: '16px', padding: '13px',
              background: 'var(--accent)', color: '#fff',
              borderRadius: 'var(--radius-md)', fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, textAlign: 'center', textDecoration: 'none',
            }}>Hire Me</Link>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
          /* On mobile: full-width bar, no pill effect */
          .nav-pill-inner {
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            background: rgba(5,7,15,0.95) !important;
          }
          .nav-mobile-dropdown {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
