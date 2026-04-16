'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats, getMessages } from '@/lib/firestore';
import {
  Users, Briefcase, MessageSquare, Star, ArrowRight, TrendingUp,
} from 'lucide-react';

function StatCard({ label, value, sub, color, href, Icon, loading }) {
  const inner = (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px 22px', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:'10px' }}
      onMouseEnter={e=>{ if(href){e.currentTarget.style.borderColor='var(--accent-border)';e.currentTarget.style.transform='translateY(-2px)';}}}
      onMouseLeave={e=>{ if(href){e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.transform='translateY(0)';}}}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:`${color}18`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={16} color={color} strokeWidth={1.75}/>
        </div>
        {href && <ArrowRight size={14} color="var(--text-3)"/>}
      </div>
      {loading
        ? <div style={{ height:32, width:'60%', borderRadius:4 }} className="skeleton"/>
        : <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', lineHeight:1 }}>{value ?? '—'}</div>}
      <div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
        {sub && !loading && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color, marginTop:'2px' }}>{sub}</div>}
      </div>
    </div>
  );
  return href
    ? <Link href={href} style={{ textDecoration:'none', display:'block' }}>{inner}</Link>
    : inner;
}

const STATUS_COLORS = {
  'Planning':    '#f5c518',
  'In Progress': '#5c8dff',
  'Review':      '#a78bfa',
  'Completed':   '#34d399',
};

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [msgs,    setMsgs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getMessages()]).then(([s, m]) => {
      setStats(s);
      setMsgs((m||[]).slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const s = stats || {};

  return (
    <div style={{ maxWidth:960 }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Overview</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.5rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1 }}>Dashboard</h1>
      </div>

      {/* 4-col stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }} className="dash-4">
        <StatCard label="Clients"          value={s.totalClients}    color="var(--accent)" href="/admin/crm"        Icon={Users}          loading={loading}/>
        <StatCard label="Active Projects"  value={s.activeProjects}  sub={s.totalProjects!=null?`${s.totalProjects} total`:null} color="#5c8dff" href="/admin/crm" Icon={Briefcase} loading={loading}/>
        <StatCard label="Unread Messages"  value={s.unreadMessages}  sub={s.unreadMessages>0?'needs attention':null} color={s.unreadMessages>0?'#f5c518':'#34d399'} href="/admin/messages" Icon={MessageSquare} loading={loading}/>
        <StatCard label="Reviews"          value={s.totalReviews}    color="#34d399"        href="/admin/reviews"   Icon={Star}           loading={loading}/>
      </div>

      {/* Revenue row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'24px' }} className="dash-3">
        {[
          { label:'Total Invoiced', val: s.totalInvoiced,    color:'var(--text-1)' },
          { label:'Collected',      val: s.totalPaid,        color:'#34d399'       },
          { label:'Outstanding',    val: s.totalOutstanding, color: s.totalOutstanding>0?'#f5c518':'var(--text-3)' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px 22px' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{label}</div>
            {loading
              ? <div style={{ height:28, width:'70%', borderRadius:4 }} className="skeleton"/>
              : <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.8rem', color }}>${(val||0).toLocaleString()}</div>}
            {!loading && label==='Outstanding' && s.unpaidInvoices>0 && (
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'#f5c518', marginTop:'4px' }}>{s.unpaidInvoices} unpaid</div>
            )}
          </div>
        ))}
      </div>

      {/* 2-col: project status + messages */}
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'20px', marginBottom:'24px' }} className="dash-2">
        {/* Projects by status */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px 22px', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.15em' }}>Projects by Status</div>
            <Link href="/admin/crm" style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textDecoration:'none', display:'flex', alignItems:'center', gap:'3px' }}>View all <ArrowRight size={10}/></Link>
          </div>
          {loading
            ? <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>{[0,1,2,3].map(i=><div key={i} style={{ height:24, borderRadius:4 }} className="skeleton"/>)}</div>
            : Object.entries(s.projectsByStatus||{}).length === 0
              ? <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', textAlign:'center', padding:'20px 0' }}>No projects yet</div>
              : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {Object.entries(s.projectsByStatus||{}).map(([status, count]) => (
                    <div key={status} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)', width:95, flexShrink:0 }}>{status}</div>
                      <div style={{ flex:1, height:5, background:'var(--border-2)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${s.totalProjects>0?(count/s.totalProjects)*100:0}%`, background:STATUS_COLORS[status]||'var(--accent)', borderRadius:3, transition:'width 0.8s ease' }}/>
                      </div>
                      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1rem', color:'var(--text-1)', width:20, textAlign:'right', flexShrink:0 }}>{count}</div>
                    </div>
                  ))}
                </div>
          }
        </div>

        {/* Recent messages */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px 22px', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.15em' }}>Recent Messages</div>
            <Link href="/admin/messages" style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textDecoration:'none', display:'flex', alignItems:'center', gap:'3px' }}>View all <ArrowRight size={10}/></Link>
          </div>
          {loading
            ? <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>{[0,1,2].map(i=><div key={i} style={{ height:40, borderRadius:4 }} className="skeleton"/>)}</div>
            : msgs.length === 0
              ? <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', textAlign:'center', padding:'20px 0' }}>No messages yet</div>
              : <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {msgs.map(msg => (
                    <Link key={msg.id} href="/admin/messages" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', textDecoration:'none', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-overlay)'}
                      onMouseLeave={e=>e.currentTarget.style.background='var(--bg-elevated)'}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:msg.read?'var(--border-2)':'var(--accent)', flexShrink:0 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', fontWeight:msg.read?400:600, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.name||'Unknown'}</div>
                        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.72rem', color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.message||msg.service||''}</div>
                      </div>
                    </Link>
                  ))}
                </div>
          }
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        {[
          { label:'Add Client',      href:'/admin/crm',      accent:true  },
          { label:'View Messages',   href:'/admin/messages', accent:false },
          { label:'Manage Projects', href:'/admin/projects', accent:false },
          { label:'Reviews',         href:'/admin/reviews',  accent:false },
        ].map(({ label, href, accent }) => (
          <Link key={label} href={href} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:accent?'var(--accent)':'var(--bg-surface)', color:accent?'#fff':'var(--text-2)', border:`1px solid ${accent?'var(--accent)':'var(--border-2)'}`, borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.82rem', textDecoration:'none', transition:'all 0.15s' }}
            onMouseEnter={e=>{ if(!accent){e.currentTarget.style.borderColor='var(--accent-border)';e.currentTarget.style.color='var(--text-1)';}}}
            onMouseLeave={e=>{ if(!accent){e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)';}}}
          >{label} <ArrowRight size={13}/></Link>
        ))}
      </div>

      <style>{`
        @media(max-width:900px){.dash-4{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:640px){.dash-4,.dash-3,.dash-2{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
}
