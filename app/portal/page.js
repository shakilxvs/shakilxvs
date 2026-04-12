'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, CreditCard, MessageSquare, ArrowRight } from 'lucide-react';
import { portalFetch } from '@/lib/portal-client';

export default function PortalDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      portalFetch('/api/portal/projects'),
      portalFetch('/api/portal/invoices'),
      portalFetch('/api/portal/messages'),
    ]).then(([p, i, m]) => {
      const projects  = p.ok ? p.data : [];
      const invoices  = i.ok ? i.data : [];
      const messages  = m.ok ? m.data : [];
      const unpaid    = invoices.filter(x => x.status === 'Unpaid' || x.status === 'Overdue').length;
      const unread    = messages.filter(x => !x.read && x.from === 'admin').length;
      const active    = projects.filter(x => x.status !== 'Completed' && x.status !== 'Cancelled').length;
      setStats({ projects: projects.length, active, invoices: invoices.length, unpaid, unread });
      setLoading(false);
    });
  }, []);

  const card = (label, value, sub, Icon, href, color) => (
    <Link href={href} style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'22px', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:'10px' }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-border)'; e.currentTarget.style.transform='translateY(-2px)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.transform='translateY(0)'; }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:`${color}18`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={16} color={color} strokeWidth={1.75}/>
          </div>
          <ArrowRight size={14} color="var(--text-3)"/>
        </div>
        {loading
          ? <div className="skeleton" style={{ height:32, width:'60%', borderRadius:4 }}/>
          : <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', lineHeight:1 }}>{value}</div>}
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
          {sub && !loading && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color, marginTop:'2px' }}>{sub}</div>}
        </div>
      </div>
    </Link>
  );

  const s = stats || {};
  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Welcome back</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.5rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1 }}>Your Workspace</h1>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }} className="portal-dash-grid">
        {card('Active Projects', s.active ?? '—', s.projects!=null ? `${s.projects} total` : null, Briefcase,     '/portal/projects', '#5c8dff')}
        {card('Unpaid Invoices', s.unpaid ?? '—', s.invoices!=null ? `${s.invoices} total` : null, CreditCard,    '/portal/invoices', s.unpaid>0 ? '#f5c518' : '#34d399')}
        {card('Unread Messages', s.unread ?? '—', s.unread>0 ? 'new from Shakil' : null,           MessageSquare, '/portal/messages', s.unread>0 ? 'var(--accent)' : '#34d399')}
      </div>
      <style>{`@media(max-width:768px){.portal-dash-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
