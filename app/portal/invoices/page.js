'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink } from 'lucide-react';
import { portalFetch } from '@/lib/portal-client';

const STATUS = {
  'Unpaid':  { bg:'rgba(245,197,24,0.12)', color:'#f5c518', border:'rgba(245,197,24,0.3)' },
  'Paid':    { bg:'rgba(16,185,129,0.12)', color:'#34d399', border:'rgba(16,185,129,0.3)' },
  'Overdue': { bg:'rgba(255,69,0,0.1)',    color:'#ff6b35', border:'rgba(255,69,0,0.2)'   },
};
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS['Unpaid'];
  return <span style={{ padding:'3px 10px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.6rem', background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{status}</span>;
}

function generateInvoicePDF(invoice, sender, client) {
  const w = window.open('', '_blank');
  if (!w) return;
  const lines = invoice.lineItems?.length
    ? invoice.lineItems
    : [{ description: invoice.description || 'Services', amount: invoice.amount }];
  const total = lines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const esc = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${esc(invoice.number||invoice.id)}</title>
    <style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 30px;color:#222;}
    .h{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;}
    .h h1{margin:0;font-size:36px;color:#234DC2;letter-spacing:0.04em;}
    .h .meta{text-align:right;font-size:13px;line-height:1.6;}
    .from-to{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:30px 0;font-size:13px;line-height:1.6;}
    .from-to h3{margin:0 0 6px;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:0.1em;}
    table{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px;}
    th{text-align:left;padding:10px;background:#f5f5f5;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#666;}
    td{padding:12px 10px;border-bottom:1px solid #eee;}
    .total{text-align:right;font-size:18px;font-weight:700;margin-top:20px;}
    .footer{margin-top:50px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;}
    @media print{body{margin:0;padding:20px;}}</style></head><body>
    <div class="h"><div><h1>INVOICE</h1><div style="font-size:12px;color:#666;margin-top:4px;">${esc(invoice.number||invoice.id)}</div></div>
      <div class="meta"><div><strong>Date:</strong> ${invoice.createdAt?new Date(invoice.createdAt).toLocaleDateString():'—'}</div>
      ${invoice.dueDate?`<div><strong>Due:</strong> ${esc(invoice.dueDate)}</div>`:''}
      <div><strong>Status:</strong> ${esc(invoice.status||'Unpaid')}</div></div></div>
    <div class="from-to"><div><h3>From</h3>${esc(sender.name||'Shakil Ahmed')}<br/>${esc(sender.email||'')}<br/>${esc(sender.phone||'')}<br/>${esc(sender.address||'')}<br/>${esc(sender.website||'')}</div>
    <div><h3>Bill To</h3>${esc(client.name||'')}<br/>${esc(client.company||'')}<br/>${esc(client.email||'')}</div></div>
    <table><thead><tr><th>Description</th><th style="text-align:right;">Amount</th></tr></thead><tbody>
    ${lines.map(l=>`<tr><td>${esc(l.description||'—')}</td><td style="text-align:right;">${esc(invoice.currency||'USD')} ${Number(l.amount||0).toLocaleString()}</td></tr>`).join('')}
    </tbody></table>
    <div class="total">Total: ${esc(invoice.currency||'USD')} ${total.toLocaleString()}</div>
    <div class="footer">Thank you for your business.</div></body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [sender,   setSender]   = useState({});
  const [client,   setClient]   = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      portalFetch('/api/portal/invoices'),
      portalFetch('/api/portal/invoices/sender'),
      portalFetch('/api/portal/account'),
    ]).then(([i, s, c]) => {
      setInvoices(i.ok ? i.data : []);
      setSender(s.ok ? s.data : {});
      setClient(c.ok ? c.data : {});
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>{[0,1,2].map(i=><div key={i} className="skeleton" style={{ height:80, borderRadius:'var(--radius-lg)' }}/>)}</div>;
  }

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Billing</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1, marginTop:'4px' }}>Invoices ({invoices.length})</h1>
      </div>
      {invoices.length === 0
        ? <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
            <CreditCard size={40} style={{ margin:'0 auto 12px', color:'var(--border-2)' }} strokeWidth={1}/>
            <div>No invoices yet.</div>
          </div>
        : invoices.map(inv => (
            <div key={inv.id} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px 20px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px', flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--text-1)' }}>{inv.currency||'USD'} {Number(inv.amount||0).toLocaleString()}</span>
                  <StatusBadge status={inv.status}/>
                </div>
                {inv.number && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'2px' }}>#{inv.number}</div>}
                {inv.description && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)', marginTop:'4px' }}>{inv.description}</div>}
                {inv.dueDate && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'2px' }}>Due: {inv.dueDate}</div>}
              </div>
              <button onClick={()=>generateInvoicePDF(inv, sender, client)} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer' }}>
                <Download size={13}/> PDF
              </button>
              {inv.status !== 'Paid' && inv.payUrl && (
                <a href={inv.payUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', fontWeight:700, textDecoration:'none' }}>
                  Pay Now <ExternalLink size={13}/>
                </a>
              )}
            </div>
          ))}
    </div>
  );
}
