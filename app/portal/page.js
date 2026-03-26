'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClientProjects, getClientInvoices, getPortalMessages } from '@/lib/firestore';
import { Briefcase, CreditCard, MessageSquare, ChevronRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

function StatCard({ label, value, sub, color, href, Icon }) {
  return (
    <Link href={href} style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px', transition:'all 0.2s', cursor:'pointer' }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-border)'; e.currentTarget.style.transform='translateY(-2px)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.transform='translateY(0)'; }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:color+'18', border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={16} color={color} strokeWidth={1.75}/>
          </div>
          <ChevronRight size={14} color="var(--text-3)"/>
        </div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', lineHeight:1, marginBottom:'4px' }}>{value}</div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
        {sub && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color, marginTop:'4px' }}>{sub}</div>}
      </div>
    </Link>
  );
}

export default function PortalDashboard() {
  const router = useRouter();
  const [client,   setClient]   = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      if (!raw) { router.replace('/portal/login'); return; }
      const session = JSON.parse(raw);
      setClient(session);
      Promise.all([
        getClientProjects(session.clientId),
        getClientInvoices(session.clientId),
        getPortalMessages(session.clientId),
      ]).then(([p, inv, msg]) => {
        setProjects(p);
        setInvoices(inv);
        setMessages(msg);
        setLoading(false);
      });
    } catch { router.replace('/portal/login'); }
  }, [router]);

  if (loading || !client) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
      <div style={{ fontFamily:'Space Mono,monospace', color:'var(--text-3)', fontSize:'0.75rem' }}>Loading…</div>
    </div>
  );

  const activeProjects  = projects.filter(p => p.status !== 'Completed' && p.status !== 'Cancelled');
  const unpaidInvoices  = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue');
  const unreadMessages  = messages.filter(m => m.from === 'admin' && !m.read);

  const recentActivity = [
    ...projects.slice(0,2).map(p => ({ type:'project', label:`Project: ${p.title}`, status:p.status, href:'/portal/projects' })),
    ...invoices.slice(0,2).map(i => ({ type:'invoice', label:`Invoice: ${i.currency} ${i.amount}`, status:i.status, href:'/portal/invoices' })),
    ...messages.slice(-2).map(m => ({ type:'message', label: m.from==='admin'?`Message from Shakil`:`You sent a message`, status:'', href:'/portal/messages' })),
  ].slice(0, 5);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom:'32px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Welcome back</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>
          {client.name}
        </h1>
        {client.company && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-2)', marginTop:'4px' }}>{client.company}</div>}
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' }} className="portal-stats">
        <StatCard label="Active Projects" value={activeProjects.length} sub={activeProjects.length>0?`${projects.filter(p=>p.status==='In Progress').length} in progress`:null} color="var(--accent)" href="/portal/projects" Icon={Briefcase}/>
        <StatCard label="Pending Invoices" value={unpaidInvoices.length} sub={unpaidInvoices.length>0?`${invoices.filter(i=>i.status==='Overdue').length} overdue`:null} color={unpaidInvoices.length>0?"#f5c518":"#34d399"} href="/portal/invoices" Icon={CreditCard}/>
        <StatCard label="Messages" value={unreadMessages.length} sub={unreadMessages.length>0?`${unreadMessages.length} unread`:messages.length>0?'All read':null} color={unreadMessages.length>0?"#5c8dff":"var(--text-3)"} href="/portal/messages" Icon={MessageSquare}/>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px' }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'14px' }}>Recent Activity</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {recentActivity.map((item, i) => (
              <Link key={i} href={item.href} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', textDecoration:'none', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-overlay)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg-elevated)'}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', flexShrink:0 }}/>
                <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', flex:1 }}>{item.label}</span>
                {item.status && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>{item.status}</span>}
                <ChevronRight size={13} color="var(--text-3)"/>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentActivity.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:'8px' }}>Your portal is ready</div>
          <div style={{ fontSize:'0.875rem' }}>Projects, invoices and messages will appear here.</div>
        </div>
      )}

      <style>{`@media(max-width:640px){.portal-stats{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
