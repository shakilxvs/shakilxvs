'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientInvoices, getPortfolioDoc, getClientById } from '@/lib/firestore';
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

  // ── Sender (your) details ───────────────────────────────────
  const sender      = siteConfig?.invoiceSender || {};
  const fromName    = sender.name    || 'Shakil Ahmed';
  const fromEmail   = sender.email   || 'shakilxvs@gmail.com';
  const fromPhone   = sender.phone   || '+880 1234 567890';
  const fromAddress = sender.address || 'Dhaka, Bangladesh';
  const fromWebsite = sender.website || 'shakilxvs.com';

  // ── Client details (from portal session) ───────────────────
  const accent       = '#234DC2';
  const clientName   = client?.name    || 'Client';
  const clientCo     = client?.company || '';
  const clientEmail  = client?.email   || '';
  const clientPhone  = client?.phone   || '';
  const clientAddr   = client?.address || '';
  const clientCity   = client?.city    || '';
  const clientState  = client?.state   || '';
  const clientZip    = client?.zip     || '';
  const clientCountry= client?.country || '';

  // Build the client address lines for the PDF
  const clientCityLine = [clientCity, clientState, clientZip].filter(Boolean).join(', ');

  const now        = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const status     = invoice.status  || 'Unpaid';
  const statusColor= status === 'Paid' ? '#16a34a' : status === 'Overdue' ? '#dc2626' : '#b45309';
  const statusBg   = status === 'Paid' ? '#f0fdf4' : status === 'Overdue' ? '#fef2f2' : '#fffbeb';
  const invoiceNum = invoice.number  ? `INV-${invoice.number}` : 'INVOICE';
  const currency   = invoice.currency || 'USD';
  const payUrl     = invoice.payUrl  || '/pay';
  const showPayBtn = status !== 'Paid' && payUrl;

  // Line items — fall back to single row from invoice amount/description
  const lineItems = invoice.lineItems?.length
    ? invoice.lineItems
    : [{ description: invoice.description || 'Services Rendered', qty: 1, unitPrice: Number(invoice.amount || 0) }];
  const subtotal = lineItems.reduce((s, it) => s + Number(it.qty || 1) * Number(it.unitPrice || 0), 0);

  const itemRows = lineItems.map(it => {
    const qty   = Number(it.qty || 1);
    const price = Number(it.unitPrice || 0);
    const line  = qty * price;
    return `<tr>
      <td style="padding:13px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${it.description || 'Service'}</td>
      <td style="padding:13px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;text-align:center;">${qty}</td>
      <td style="padding:13px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;text-align:right;">${currency} ${price.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td style="padding:13px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:700;color:#111827;text-align:right;">${currency} ${line.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
    </tr>`;
  }).join('');

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${invoiceNum} — ${clientName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#111827;background:#f9fafb;font-size:14px;line-height:1.6;}
  @page{size:A4;margin:0;}
  @media print{
    body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .no-print{display:none!important;}
    .page{box-shadow:none!important;border-radius:0!important;margin:0!important;max-width:100%!important;}
  }
  .page{max-width:760px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .top-accent{height:5px;background:${accent};}
  .inner{padding:44px 52px;}
  /* Header */
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;}
  .sender-name{font-size:20px;font-weight:800;color:${accent};letter-spacing:-0.3px;}
  .sender-detail{font-size:12.5px;color:#6b7280;margin-top:2px;line-height:1.8;}
  .inv-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;text-align:right;font-weight:600;}
  .inv-num{font-size:24px;font-weight:800;color:#111827;text-align:right;margin-top:3px;letter-spacing:-0.5px;}
  .inv-date{font-size:12px;color:#9ca3af;text-align:right;margin-top:4px;}
  /* Divider */
  .divider{height:1px;background:#f3f4f6;margin:0 0 32px;}
  /* From/To */
  .bill-row{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px;}
  .bill-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;font-weight:600;margin-bottom:8px;}
  .bill-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:3px;}
  .bill-detail{font-size:13px;color:#6b7280;line-height:1.7;}
  /* Meta */
  .meta{display:flex;gap:32px;margin-bottom:32px;padding:16px 20px;background:#f9fafb;border-radius:8px;border:1px solid #f3f4f6;}
  .meta-item{}
  .meta-lbl{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;font-weight:600;margin-bottom:4px;}
  .meta-val{font-size:14px;font-weight:700;color:#111827;}
  .status-pill{display:inline-block;padding:4px 14px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;background:${statusBg};color:${statusColor};border:1.5px solid ${statusColor}55;}
  /* Table */
  table{width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #f3f4f6;margin-bottom:0;}
  thead th{padding:11px 16px;background:#f9fafb;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;font-weight:600;text-align:left;border-bottom:1px solid #f3f4f6;}
  thead th.r{text-align:right;}
  thead th.c{text-align:center;}
  /* Totals */
  .totals{display:flex;justify-content:flex-end;border-top:1px solid #f3f4f6;}
  .totals-inner{width:260px;padding:16px;}
  .tot-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px;color:#374151;}
  .tot-row.grand{border-top:2px solid #f3f4f6;margin-top:8px;padding-top:12px;font-size:16px;font-weight:800;color:#111827;}
  .tot-row.grand .v{color:${accent};}
  /* Pay button */
  .pay-section{margin-top:28px;text-align:center;}
  .pay-btn{display:inline-block;padding:14px 36px;background:${accent};color:#fff;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.2px;}
  .pay-sub{font-size:11.5px;color:#9ca3af;margin-top:8px;}
  .pay-url{font-size:12px;color:${accent};font-family:'Courier New',monospace;}
  /* Footer */
  .foot{margin-top:40px;padding-top:20px;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;}
  .foot-note{font-size:12px;color:#9ca3af;}
  /* Print button */
  .save-btn{position:fixed;bottom:24px;right:24px;padding:12px 24px;background:${accent};color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(35,77,194,0.35);letter-spacing:0.2px;}
</style>
</head>
<body>
<div class="page">
  <div class="top-accent"></div>
  <div class="inner">
    <!-- Header: Sender info + Invoice number -->
    <div class="header">
      <div>
        <div class="sender-name">${fromName}</div>
        <div class="sender-detail">
          ${fromEmail   ? fromEmail   + '<br/>' : ''}
          ${fromPhone   ? fromPhone   + '<br/>' : ''}
          ${fromAddress ? fromAddress + '<br/>' : ''}
          ${fromWebsite ? fromWebsite : ''}
        </div>
      </div>
      <div>
        <div class="inv-label">Invoice</div>
        <div class="inv-num">#${invoiceNum}</div>
        <div class="inv-date">Issued ${now}</div>
      </div>
    </div>
    <div class="divider"></div>
    <!-- Billed to -->
    <div class="bill-row">
      <div>
        <div class="bill-label">Billed To</div>
        <div class="bill-name">${clientName}</div>
        <div class="bill-detail">
          ${clientCo      ? clientCo      + '<br/>' : ''}
          ${clientPhone   ? clientPhone   + '<br/>' : ''}
          ${clientAddr    ? clientAddr    + '<br/>' : ''}
          ${clientCityLine? clientCityLine + '<br/>': ''}
          ${clientCountry ? clientCountry + '<br/>' : ''}
          ${clientEmail   ? clientEmail               : ''}
        </div>
      </div>
      <div>
        <div class="bill-label">Details</div>
        <div class="bill-detail">
          ${invoice.dueDate ? '<strong>Due: </strong>' + invoice.dueDate + '<br/>' : ''}
        </div>
        <span class="status-pill">${status}</span>
      </div>
    </div>
    <!-- Meta row -->
    <div class="meta">
      <div class="meta-item">
        <div class="meta-lbl">Invoice #</div>
        <div class="meta-val">${invoiceNum}</div>
      </div>
      <div class="meta-item">
        <div class="meta-lbl">Amount Due</div>
        <div class="meta-val">${currency} ${subtotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
      </div>
      ${invoice.dueDate ? `<div class="meta-item"><div class="meta-lbl">Due Date</div><div class="meta-val">${invoice.dueDate}</div></div>` : ''}
      <div class="meta-item">
        <div class="meta-lbl">Status</div>
        <div class="meta-val">${status}</div>
      </div>
    </div>
    <!-- Line items -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="c">Qty</th>
          <th class="r">Unit Price</th>
          <th class="r">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <!-- Totals -->
    <div class="totals">
      <div class="totals-inner">
        <div class="tot-row"><span>Subtotal</span><span class="v">${currency} ${subtotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
        <div class="tot-row grand"><span>Total Due</span><span class="v">${currency} ${subtotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
      </div>
    </div>
    <!-- Pay Now button -->
    ${showPayBtn ? `
    <div class="pay-section">
      <a class="pay-btn" href="${payUrl}">Pay Now — ${currency} ${subtotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</a>
      <div class="pay-sub">Click the button above or visit:</div>
      <div class="pay-url">${payUrl}</div>
    </div>` : ''}
    <!-- Footer -->
    <div class="foot">
      <div class="foot-note">Thank you for your business!</div>
      <div class="foot-note">${fromEmail}</div>
    </div>
  </div>
</div>
<button class="save-btn no-print" onclick="window.print()">⬇ Save as PDF</button>
</body>
</html>`);
  win.document.close();
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
        getClientById(session.clientId),
      ]).then(([inv, sc, freshClient]) => {
        setInvoices(inv);
        setSiteConfig(sc);
        // Always use fresh Firestore data so address/phone/company are current
        if (freshClient) setClient(freshClient);
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
