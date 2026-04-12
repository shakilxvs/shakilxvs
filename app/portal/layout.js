'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutTemplate, Briefcase, CreditCard, MessageSquare, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { portalFetch, clearPortalToken, getPortalToken } from '@/lib/portal-client';

const NAV = [
  { href:'/portal',          label:'Dashboard', Icon:LayoutTemplate },
  { href:'/portal/projects', label:'Projects',  Icon:Briefcase      },
  { href:'/portal/invoices', label:'Invoices',  Icon:CreditCard     },
  { href:'/portal/messages', label:'Messages',  Icon:MessageSquare  },
  { href:'/portal/account',  label:'Account',   Icon:User           },
];

export default function PortalLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [client,      setClient]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme,       setTheme]       = useState('dark');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('portal_theme')) || 'dark';
    setTheme(saved);
    const wrap = document.querySelector('.portal-theme-wrap');
    if (wrap && saved === 'light') wrap.setAttribute('data-theme', 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('portal_theme', next); } catch {}
    const wrap = document.querySelector('.portal-theme-wrap');
    if (wrap) wrap.setAttribute('data-theme', next === 'light' ? 'light' : '');
  };

  useEffect(() => {
    if (pathname === '/portal/login') {
      setLoading(false);
      return;
    }
    if (!getPortalToken()) {
      router.replace('/portal/login');
      return;
    }
    portalFetch('/api/portal/auth/me').then(res => {
      if (!res.ok) {
        if (res.error !== 'unauthorized') router.replace('/portal/login');
        return;
      }
      setClient(res.data);
      setLoading(false);
    });
  }, [pathname, router]);

  const handleLogout = () => {
    clearPortalToken();
    router.replace('/portal/login');
  };

  if (pathname === '/portal/login') {
    return <div style={{ position:'relative', zIndex:1 }}>{children}</div>;
  }

  if (loading || !client) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-void)', position:'relative', zIndex:1 }}>
        <div style={{ fontFamily:'Space Mono,monospace', color:'var(--accent)', fontSize:'0.75rem', letterSpacing:'0.2em' }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div className="portal-theme-wrap" style={{ position:'relative', zIndex:1 }}>
      <div className="portal-sidebar-wrap" style={{ display:'flex', minHeight:'100vh', background:'var(--bg-base)' }}>
        {sidebarOpen && (
          <div onClick={()=>setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:99, display:'none' }} className="portal-overlay"/>
        )}
        <aside className={`portal-sidebar ${sidebarOpen?'open':''}`} style={{ width:240, background:'var(--bg-surface)', borderRight:'1px solid var(--border-1)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
          <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid var(--border-1)' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.7rem', color:'var(--accent)', letterSpacing:'0.15em' }}>{'<shakil />'}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-1)', fontWeight:600, marginTop:'12px' }}>{client.name}</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'2px' }}>@{client.username}</div>
          </div>
          <nav style={{ flex:1, padding:'12px', overflowY:'auto' }}>
            {NAV.map(({ href, label, Icon }) => {
              const active = href === '/portal' ? pathname === '/portal' : pathname.startsWith(href);
              return (
                <Link key={href} href={href} onClick={()=>setSidebarOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'10px 12px', borderRadius:'var(--radius-md)', marginBottom:'2px',
                  fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', fontWeight:500, textDecoration:'none',
                  background: active ? 'var(--accent-muted)' : 'transparent',
                  color:      active ? 'var(--accent)' : 'var(--text-2)',
                  border:     active ? '1px solid var(--accent-border)' : '1px solid transparent',
                  transition:'all 0.15s ease',
                }}><Icon size={16} strokeWidth={1.75}/>{label}</Link>
              );
            })}
          </nav>
          <div style={{ padding:'16px 12px', borderTop:'1px solid var(--border-1)', display:'flex', flexDirection:'column', gap:'8px' }}>
            <button onClick={toggleTheme} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-2)', background:'transparent', border:'1px solid var(--border-2)', cursor:'pointer', width:'100%', textAlign:'left' }}>
              {theme === 'dark' ? <Sun size={14} strokeWidth={1.75}/> : <Moon size={14} strokeWidth={1.75}/>}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-2)', background:'transparent', border:'1px solid var(--border-2)', cursor:'pointer', width:'100%', textAlign:'left' }}>
              <LogOut size={14} strokeWidth={1.75}/> Sign Out
            </button>
          </div>
        </aside>
        <div style={{ flex:1, minWidth:0 }}>
          <header style={{ height:60, borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'var(--bg-base)', position:'sticky', top:0, zIndex:50 }}>
            <button onClick={()=>setSidebarOpen(o=>!o)} className="portal-menu-btn" style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', padding:'4px', display:'none' }}>
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>
              {NAV.find(n => n.href === pathname || (n.href !== '/portal' && pathname.startsWith(n.href)))?.label.toUpperCase() || 'PORTAL'}
            </div>
            <div style={{ width:32 }}/>
          </header>
          <main style={{ padding:'32px 24px', minHeight:'calc(100vh - 60px)' }}>{children}</main>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .portal-sidebar { position: fixed !important; left: 0; top: 0; transform: translateX(-100%); transition: transform 0.25s ease; z-index: 100; }
            .portal-sidebar.open { transform: translateX(0); }
            .portal-menu-btn { display: flex !important; }
            .portal-overlay  { display: block !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
