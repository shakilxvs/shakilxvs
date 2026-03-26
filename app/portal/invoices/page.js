'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientInvoices } from '@/lib/firestore';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
  'Unpaid':  { bg:'rgba(245,197,24,0.12)',  color:'#f5c518',  border:'rgba(245,197,24,0.3)',   Icon:Clock        },
  'Paid':    { bg:'rgba(16,185,129,0.12)',  color:'#34d399',  border:'rgba(16,185,129,0.3)',   Icon:CheckCircle  },
  'Overdue': { bg:'rgba(255,69,0,0.1)',     color:'#ff6b35',  border:'rgba(255,69,0,0.2)',     Icon:AlertTriangle},
};

function InvoiceRow({ invoice }) {
  const cfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG['Unpaid'];
  const Icon = cfg.Icon;
  const isActionable = invoice.status === 'Unpaid' || invoice.status === 'Overdue';

  return (
    <div style={{ background:'var(--bg-surface)', border:`1px solid ${isActionable?'var(--border-2)':'var(--border-1)'}`, borderRadius:'var(--radius-lg)', padding:'18px 20px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap', transition:'border-color 0.2s' }}
      onMouseEnter={e=>isActionable&&(e.currentTarget.style.borderColor='var(--accent-border)')}
      onMouseLeave={e=>isActionable&&(e.currentTarget.style.borderColor='var(--border-2)')}>

      {/* Status icon */}
      <div style={{ width:38, height:38, borderRadius:'var(--radius-md)', background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={16} color={cfg.color} strokeWidth={1.75}/>
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'3px' }}>
          <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--text-1)', lineHeight:1 }}>
            {invoice.currency} {Number(invoice.amount).toLocaleString()}
          </span>
          {invoice.number && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', padding:'2px 8px', border:'1px solid var(--border-2)', borderRadius:100 }}>#{invoice.number}</span>
          )}
        </div>
        {invoice.description && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)' }}>{invoice.description}</div>}
        {invoice.dueDate && (
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color: invoice.status==='Overdue'?'#ff6b35':'var(--text-3)', marginTop:'3px' }}>
            {invoice.status==='Paid'?'Paid':'Due'} {invoice.dueDate}
          </div>
        )}
      </div>

      {/* Status badge */}
      <span style={{ padding:'4px 12px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.58rem', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap', flexShrink:0 }}>
        {invoice.status}
      </span>

      {/* Pay button */}
      {isActionable && (
        <Link href={invoice.payUrl||'/pay'}
          style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', textDecoration:'none', flexShrink:0, transition:'opacity 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          Pay Now <ArrowRight size={14}/>
        </Link>
      )}
    </div>
  );
}

export default function PortalInvoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('All');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      if (!raw) { router.replace('/portal/login'); return; }
      const session = JSON.parse(raw);
      getClientInvoices(session.clientId).then(i => { setInvoices(i); setLoading(false); });
    } catch { router.replace('/portal/login'); }
  }, [router]);

  const FILTERS = ['All','Unpaid','Overdue','Paid'];
  const filtered = filter === 'All' ? invoices : invoices.filter(i => i.status === filter);
  const total    = invoices.reduce((sum,i) => i.status!=='Paid' ? sum+Number(i.amount||0) : sum, 0);

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Billing</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,3rem)', color:'var(--text-1)', letterSpacing:'0.02em' }}>Invoices</h1>
        {total > 0 && (
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-3)', marginTop:'4px' }}>
            {invoices.filter(i=>i.status!=='Paid').length} unpaid · Total outstanding: <span style={{ color:'#f5c518', fontWeight:700 }}>${total.toLocaleString()}</span>
          </div>
        )}
      </div>

      {invoices.length > 0 && (
        <div className="pill-bar" style={{ marginBottom:'20px' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={()=>setFilter(f)} className={`pill${filter===f?' active':''}`}>{f}</button>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[0,1,2].map(i=><div key={i} style={{ height:80, background:'var(--bg-surface)', borderRadius:'var(--radius-lg)' }} className="skeleton"/>)}
        </div>
      )}

      {!loading && invoices.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:'8px' }}>No Invoices Yet</div>
          <div style={{ fontSize:'0.875rem' }}>Invoices will appear here when they're created.</div>
        </div>
      )}

      {!loading && filtered.length === 0 && invoices.length > 0 && (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>No {filter.toLowerCase()} invoices.</div>
      )}

      {filtered.map(invoice => <InvoiceRow key={invoice.id} invoice={invoice}/>)}
    </div>
  );
}
