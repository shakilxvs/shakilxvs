'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientInvoices, getPortfolioDoc } from '@/lib/firestore';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';

const STATUS_CONFIG = {
  'Unpaid':  { bg:'rgba(245,197,24,0.12)',  color:'#f5c518',  border:'rgba(245,197,24,0.3)',   Icon:Clock         },
  'Paid':    { bg:'rgba(16,185,129,0.12)',  color:'#34d399',  border:'rgba(16,185,129,0.3)',   Icon:CheckCircle   },
  'Overdue': { bg:'rgba(255,69,0,0.1)',     color:'#ff6b35',  border:'rgba(255,69,0,0.2)',     Icon:AlertTriangle },
};

function downloadInvoicePDF(invoice, client, siteConfig) {
  const win = window.open('', '_blank');
  if (!win) return;

  const accentColor = '#234DC2';
  const logoName = siteConfig?.logo?.text || '<shakil />';
  const clientName = client?.name || 'Client';
  const clientCompany = client?.company || '';
  const now = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const status = invoice.status || 'Unpaid';
  const statusColor = status === 'Paid' ? '#34d399' : status === 'Overdue' ? '#ff6b35' : '#f5c518';

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice ${invoice.number ? '#'+invoice.number : ''} — ${clientName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0d1117; background: #fff; padding: 48px; font-size: 14px; line-height: 1.6; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 2px solid ${accentColor}; }
  .logo { font-family: 'Courier New', monospace; font-size: 1.4rem; color: ${accentColor}; font-weight: 700; }
  .invoice-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #8896b3; font-family: 'Courier New', monospace; }
  .invoice-num { font-size: 1.8rem; font-weight: 700; color: #0d1117; margin-top: 2px; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em; color: ${accentColor}; font-family: 'Courier New', monospace; margin-bottom: 8px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
  .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #8896b3; font-family: 'Courier New', monospace; margin-bottom: 3px; }
  .value { font-size: 0.95rem; color: #0d1117; font-weight: 500; }
  .amount-box { background: #f4f6fc; border: 1px solid #dde2f0; border-radius: 12px; padding: 28px 32px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
  .amount-big { font-size: 3rem; font-weight: 700; color: ${accentColor}; font-family: 'Helvetica Neue', Arial, sans-serif; letter-spacing: -1px; }
  .status-badge { padding: 6px 16px; border-radius: 100px; font-family: 'Courier New', monospace; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}66; }
  .divider { height: 1px; background: #dde2f0; margin: 28px 0; }
  .footer-note { font-size: 0.75rem; color: #8896b3; text-align: center; margin-top: 48px; font-family: 'Courier New', monospace; }
  @media print {
    body { padding: 32px; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">${logoName}</div>
    <div style="text-align:right;">
      <div class="invoice-label">Invoice</div>
      <div class="invoice-num">${invoice.number ? '#'+invoice.number : 'INV'}</div>
      <div style="font-size:0.8rem;color:#8896b3;margin-top:4px;">Issued: ${now}</div>
    </div>
  </div>

  <div class="two-col">
    <div>
      <div class="section-title">From</div>
      <div class="value" style="font-weight:700;">Shakil</div>
      <div style="color:#4a5568;font-size:0.85rem;">shakilxvs@gmail.com</div>
      <div style="color:#4a5568;font-size:0.85rem;">shakilxvs.com</div>
    </div>
    <div>
      <div class="section-title">Billed To</div>
      <div class="value" style="font-weight:700;">${clientName}</div>
      ${clientCompany ? `<div style="color:#4a5568;font-size:0.85rem;">${clientCompany}</div>` : ''}
      ${client?.email ? `<div style="color:#4a5568;font-size:0.85rem;">${client.email}</div>` : ''}
    </div>
  </div>

  ${invoice.dueDate ? `
  <div style="margin-bottom:28px;">
    <div class="label">Due Date</div>
    <div class="value">${invoice.dueDate}</div>
  </div>` : ''}

  <div class="amount-box">
    <div>
      <div class="label" style="margin-bottom:6px;">Amount Due</div>
      <div class="amount-big">${invoice.currency || 'USD'} ${Number(invoice.amount||0).toLocaleString()}</div>
      ${invoice.description ? `<div style="color:#4a5568;font-size:0.85rem;margin-top:6px;">${invoice.description}</div>` : ''}
    </div>
    <div class="status-badge">${status}</div>
  </div>

  ${invoice.payUrl && status !== 'Paid' ? `
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-size:0.8rem;color:#4a5568;">Pay online at:</div>
    <div style="font-family:'Courier New',monospace;color:${accentColor};font-size:0.85rem;">${invoice.payUrl}</div>
  </div>` : ''}

  <div class="divider"></div>
  <div class="footer-note">Thank you for your business. Questions? shakilxvs@gmail.com</div>
</body>
</html>`);

  win.document.close();
  setTimeout(() => win.print(), 400);
}

function InvoiceRow({ invoice, client, siteConfig }) {
  const cfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG['Unpaid'];
  const Icon = cfg.Icon;
  const isActionable = invoice.status === 'Unpaid' || invoice.status === 'Overdue';

  return (
    <div style={{ background:'var(--bg-surface)', border:`1px solid ${isActionable?'var(--border-2)':'var(--border-1)'}`, borderRadius:'var(--radius-lg)', padding:'18px 20px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap', transition:'border-color 0.2s' }}
      onMouseEnter={e=>isActionable&&(e.currentTarget.style.borderColor='var(--accent-border)')}
      onMouseLeave={e=>isActionable&&(e.currentTarget.style.borderColor='var(--border-2)')}>

      <div style={{ width:38, height:38, borderRadius:'var(--radius-md)', background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={16} color={cfg.color} strokeWidth={1.75}/>
      </div>

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

      <span style={{ padding:'4px 12px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.58rem', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap', flexShrink:0 }}>
        {invoice.status}
      </span>

      {/* Download PDF */}
      <button onClick={() => downloadInvoicePDF(invoice, client, siteConfig)}
        style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 14px', background:'var(--bg-elevated)', color:'var(--text-2)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', flexShrink:0, transition:'all 0.15s' }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-border)'; e.currentTarget.style.color='var(--text-1)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-2)'; }}>
        <Download size={13}/> PDF
      </button>

      {/* Pay Now */}
      {isActionable && (
        <Link href={invoice.payUrl||'/pay'}
          style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', textDecoration:'none', flexShrink:0 }}
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
  const [invoices,   setInvoices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('All');
  const [client,     setClient]     = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      if (!raw) { router.replace('/portal/login'); return; }
      const session = JSON.parse(raw);
      setClient(session);
      Promise.all([
        getClientInvoices(session.clientId),
        getPortfolioDoc('siteSettings'),
      ]).then(([inv, sc]) => {
        setInvoices(inv);
        setSiteConfig(sc);
        setLoading(false);
      });
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
            {invoices.filter(i=>i.status!=='Paid').length} unpaid · Outstanding: <span style={{ color:'#f5c518', fontWeight:700 }}>${total.toLocaleString()}</span>
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
          <div style={{ fontSize:'0.875rem' }}>Invoices will appear here when they are created.</div>
        </div>
      )}

      {!loading && filtered.length === 0 && invoices.length > 0 && (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>No {filter.toLowerCase()} invoices.</div>
      )}

      {filtered.map(invoice => (
        <InvoiceRow key={invoice.id} invoice={invoice} client={client} siteConfig={siteConfig}/>
      ))}
    </div>
  );
}
