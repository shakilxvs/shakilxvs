'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ExternalLink } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/projects',  label: 'Projects' },
  { href: '/apps',      label: 'Apps' },
  { href: '/files',     label: 'Files' },
  { href: '/reviews',   label: 'Reviews' },
  { href: '/pay',       label: 'Pay' },
  { href: '/contact',   label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [visible, setVisible]   = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y < 80) { setVisible(true); }
      else if (y > lastY.current + 6) { setVisible(false); setMenuOpen(false); }
      else if (y < lastY.current - 6) { setVisible(true); }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
        background: scrolled ? 'rgba(8,8,8,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-1)' : '1px solid transparent',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.85rem',
              color: 'var(--accent)',
              letterSpacing: '0.05em',
            }}>
              {'<shakil />'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: active ? 'var(--accent)' : 'var(--text-2)',
                    background: active ? 'var(--accent-muted)' : 'transparent',
                    border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* CTA + Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/contact"
              className="desktop-nav"
              style={{
                padding: '8px 18px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
            >
              Hire Me
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="mobile-nav-toggle"
              style={{
                background: 'none',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-1)',
                padding: '8px',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(8,8,8,0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-1)',
            padding: '16px 24px 24px',
          }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-1)',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: pathname === href ? 'var(--accent)' : 'var(--text-1)',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                marginTop: '16px',
                padding: '12px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Hire Me
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
