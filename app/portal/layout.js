'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutTemplate, Briefcase, CreditCard, MessageSquare, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

const PORTAL_NAV = [
  { href:'/portal',          label:'Dashboard', Icon:LayoutTemplate },
  { href:'/portal/projects', label:'Projects',  Icon:Briefcase      },
  { href:'/portal/invoices', label:'Invoices',  Icon:CreditCard     },
  { href:'/portal/messages', label:'Messages',  Icon:MessageSquare  },
  { href:'/portal/account',  label:'Account',   Icon:User           },
];

export default function PortalLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [client,     setClient]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [sidebarOpen,setSidebarOpen]= useState(false);
  const [theme,      setTheme]      = useState('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('portal_theme', next);
    const wrap = document.querySelector('.portal-theme-wrap');
    if (wrap) wrap.setAttribute('data-theme', next === 'light' ? 'light' : '');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('portal_theme') || 'dark';
    setTheme(savedTheme);
    const wrap = document.querySelector('.portal-theme-wrap');
    if (wrap && savedTheme === 'light') wrap.setAttribute('data-theme', 'light');
  }, []);

  useEffect(() => {
    if (pathname === '/portal/login') { setLoading(false); return; }
    try {
      const raw = localStorage.getItem('portal_session');
      if (!raw) { router.replace('/portal/login'); return; }
      const session = JSON.parse(raw);
      if (!session?.clientId || !session?.name) { router.replace('/portal/login'); return; }
      // Check if session has not expired (30 days)
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem('portal_session');
        router.replace('/portal/login');
        return;
      }
      setClient(session);
    } catch {
      router.replace('/portal/login');
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('portal_session');
    router.replace('/portal/login');
  };

  // Login page renders without layout
  if (pathname === '/portal/login') return <>{children}</>;

  if (loading || !client) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-void)' }}>
        <div style={{ fontFamily:'Space Mono,monospace', color:'var(--accent)', fontSize:'0.75rem', letterSpacing:'0.2em' }}>LOADING…</div>
      </div>
    );
  }

  const initial = (client.name||'?')[0].toUpperCase();

  return (
    <div className="portal-theme-wrap" data-theme={theme === 'light' ? 'light' : ''} style={{ minHeight:'100vh', background:'var(--bg-void)', display:'flex' }}>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:99 }}/>
      )}

      {/* Sidebar */}
      <aside className={`portal-sidebar${sidebarOpen ? ' open' : ''}`} style={{
        width:230, minHeight:'100vh', background:'var(--bg-base)', borderRight:'1px solid var(--border-1)',
        display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:100, overflowY:'auto',
      }}>
        {/* Logo */}
        <div style={{ padding:'22px 18px 14px', borderBottom:'1px solid var(--border-1)' }}>
          <Link href="/" style={{ fontFamily:'Space Mono,monospace', fontSize:'0.8rem', color:'var(--accent)', letterSpacing:'0.05em', textDecoration:'none' }}>{'<shakil />'}</Link>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'4px', letterSpacing:'0.1em' }}>CLIENT PORTAL</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px' }}>
          {PORTAL_NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/portal' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={()=>setSidebarOpen(false)} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'10px 12px', borderRadius:'var(--radius-md)', marginBottom:'2px',
                fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', fontWeight:500,
                textDecoration:'none', transition:'all 0.15s ease',
                background: active ? 'var(--accent-muted)' : 'transparent',
                color:      active ? 'var(--accent)' : 'var(--text-2)',
                border:     active ? '1px solid var(--accent-border)' : '1px solid transparent',
              }}>
                <Icon size={15} strokeWidth={1.75}/>{label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding:'14px 12px', borderTop:'1px solid var(--border-1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 12px', marginBottom:'6px' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'0.9rem', color:'var(--accent)' }}>{initial}</span>
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', fontWeight:600, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{client.name}</div>
              {client.company && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{client.company}</div>}
            </div>
          </div>
          <button onClick={toggleTheme} style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'8px 12px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer', marginBottom:'6px' }}>
            {theme === 'dark' ? <Sun size={13} strokeWidth={1.75}/> : <Moon size={13} strokeWidth={1.75}/>}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'8px 12px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer' }}>
            <LogOut size={13} strokeWidth={1.75}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft:230, flex:1, minHeight:'100vh', display:'flex', flexDirection:'column' }} className="portal-main">
        {/* Top header (mobile) */}
        <header style={{ height:56, borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', background:'var(--bg-base)', position:'sticky', top:0, zIndex:50 }}>
          <button onClick={()=>setSidebarOpen(o=>!o)} className="portal-menu-btn" style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', padding:'4px', display:'none' }}>
            {sidebarOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>
            {PORTAL_NAV.find(n=>n.href===pathname||( pathname.startsWith(n.href) && n.href!=='/portal'))?.label || 'Dashboard'}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'0.85rem', color:'var(--accent)' }}>{initial}</span>
            </div>
          </div>
        </header>

        <main style={{ flex:1, padding:'28px 24px' }} className="portal-content">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .portal-sidebar { transform: translateX(-100%); transition: transform 0.2s ease; }
          .portal-sidebar.open { transform: translateX(0) !important; }
          .portal-main { margin-left: 0 !important; }
          .portal-menu-btn { display: flex !important; }
          .portal-content { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
