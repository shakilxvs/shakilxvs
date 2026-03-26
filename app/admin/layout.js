'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getPortfolioDoc } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import SiteConfig from '@/components/SiteConfig';
import {
  LayoutTemplate, User, Zap, Briefcase, AppWindow,
  FolderOpen, Star, CreditCard, Inbox, Settings,
  ExternalLink, LogOut, Menu, ImagePlus, Users, BarChart2, Layers,
} from 'lucide-react';

// roles: owner = all, admin = all except Team, staff = Messages + Reviews only
const ALL_NAV = [
  { href:'/admin/hero',      label:'Hero',      Icon:LayoutTemplate, roles:['owner','admin'] },
  { href:'/admin/about',     label:'About',     Icon:User,           roles:['owner','admin'] },
  { href:'/admin/skills',    label:'Skills',    Icon:Zap,            roles:['owner','admin'] },
  { href:'/admin/projects',  label:'Projects',  Icon:Briefcase,      roles:['owner','admin'] },
  { href:'/admin/apps',      label:'Apps',      Icon:AppWindow,      roles:['owner','admin'] },
  { href:'/admin/files',     label:'Files',     Icon:FolderOpen,     roles:['owner','admin'] },
  { href:'/admin/media',     label:'Media',     Icon:ImagePlus,      roles:['owner','admin'] },
  { href:'/admin/analytics', label:'Analytics', Icon:BarChart2,      roles:['owner','admin'] },
  { href:'/admin/reviews',   label:'Reviews',   Icon:Star,           roles:['owner','admin','staff'] },
  { href:'/admin/pay',       label:'Pay',       Icon:CreditCard,     roles:['owner','admin'] },
  { href:'/admin/messages',  label:'Messages',  Icon:Inbox,          roles:['owner','admin','staff'] },
  { href:'/admin/settings',  label:'Settings',  Icon:Settings,       roles:['owner','admin'] },
  { href:'/admin/services',  label:'Services',  Icon:Layers,         roles:['owner','admin'] },
  { href:'/admin/team',      label:'Team',      Icon:Users,          roles:['owner'] },
];

function Sidebar({ user, userRole, pathname, sidebarOpen, setSidebarOpen }) {
  const navItems = ALL_NAV.filter(n => n.roles.includes(userRole));
  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:99, display:'none' }}
          className="mobile-overlay"/>
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid var(--border-1)' }}>
          <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.7rem', color:'var(--accent)', letterSpacing:'0.15em' }}>@shakilxvs</div>
          <div style={{ fontFamily:'Space Mono, monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'2px', letterSpacing:'0.1em' }}>[{userRole}]</div>
        </div>
        <nav style={{ flex:1, padding:'12px', overflowY:'auto' }}>
          {navItems.map(({ href, label, Icon }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 12px', borderRadius:'var(--radius-md)', marginBottom:'2px',
              fontFamily:'Outfit, sans-serif', fontSize:'0.875rem', fontWeight:500,
              textDecoration:'none', transition:'all 0.15s ease',
              background: pathname===href ? 'var(--accent-muted)' : 'transparent',
              color:      pathname===href ? 'var(--accent)' : 'var(--text-2)',
              border:     pathname===href ? '1px solid var(--accent-border)' : '1px solid transparent',
            }}>
              <Icon size={16} strokeWidth={1.75}/>{label}
            </Link>
          ))}
        </nav>
        <div style={{ padding:'16px 12px', borderTop:'1px solid var(--border-1)', display:'flex', flexDirection:'column', gap:'8px' }}>
          <Link href="/" target="_blank" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'var(--radius-md)', fontFamily:'Outfit, sans-serif', fontSize:'0.8rem', color:'var(--text-2)', textDecoration:'none', border:'1px solid var(--border-2)' }}>
            <ExternalLink size={14} strokeWidth={1.75}/> View Site
          </Link>
          {user && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px' }}>
              {user.photoURL && <img src={user.photoURL} alt="avatar" style={{ width:28, height:28, borderRadius:'50%' }}/>}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'0.75rem', color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.displayName || user.email}
                </div>
              </div>
            </div>
          )}
          <button onClick={() => signOut(auth)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'var(--radius-md)', fontFamily:'Outfit, sans-serif', fontSize:'0.8rem', color:'var(--text-2)', background:'transparent', border:'1px solid var(--border-2)', cursor:'pointer', width:'100%', textAlign:'left' }}>
            <LogOut size={14} strokeWidth={1.75}/> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole,    setUserRole]    = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setUserRole(null);
        setLoading(false);
        if (pathname !== '/admin/login') router.push('/admin/login');
        return;
      }

      const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'shakilxvs@gmail.com').toLowerCase();
      if (u.email?.toLowerCase() === adminEmail) {
        setUserRole('owner');
        setLoading(false);
        return;
      }

      // Check team membership
      try {
        const team = await getPortfolioDoc('teamMembers');
        const member = (team?.members || []).find(
          m => m.email?.toLowerCase() === u.email?.toLowerCase() && m.active !== false
        );
        if (member) {
          setUserRole(member.role);
        } else {
          await signOut(auth);
          setUserRole('none');
          router.push('/admin/login');
        }
      } catch {
        await signOut(auth);
        setUserRole('none');
        router.push('/admin/login');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [pathname, router]);

  // Login page — no sidebar
  if (pathname === '/admin/login') {
    return <div style={{ position:'relative', zIndex:1 }}>{children}</div>;
  }

  if (loading || userRole === null) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-void)', position:'relative', zIndex:1 }}>
        <div style={{ fontFamily:'Space Mono, monospace', color:'var(--accent)', fontSize:'0.75rem', letterSpacing:'0.2em' }}>LOADING...</div>
      </div>
    );
  }

  if (!user || userRole === 'none') return null;

  const currentNav = ALL_NAV.find(n => n.href === pathname);

  return (
    <>
      <SiteConfig/>
      <div className="admin-layout" style={{ position:'relative', zIndex:1 }}>
        <Sidebar user={user} userRole={userRole} pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <div className="admin-main">
          <header style={{ height:'60px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'var(--bg-base)', position:'sticky', top:0, zIndex:50 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', padding:'4px', display:'none' }} className="mobile-menu-btn">
                <Menu size={20} strokeWidth={1.75}/>
              </button>
              <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'1.4rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>
                {currentNav ? currentNav.label.toUpperCase() : 'ADMIN'}
              </div>
            </div>
            {user?.photoURL && <img src={user.photoURL} alt="avatar" style={{ width:32, height:32, borderRadius:'50%' }}/>}
          </header>
          <main style={{ padding:'32px 24px', minHeight:'calc(100vh - 60px)' }}>
            {children}
          </main>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .mobile-menu-btn { display: flex !important; }
            .mobile-overlay  { display: block !important; }
            .admin-main main { padding: 20px 16px !important; }
          }
        `}</style>
      </div>
    </>
  );
}
