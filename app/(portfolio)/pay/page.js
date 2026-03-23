'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, getPaymentMethods, getPaymentCrypto, getPaymentGateways } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await copyToClipboard(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'6px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:copied?'var(--accent)':'var(--text-2)', fontFamily:'Space Mono,monospace', fontSize:'0.65rem', cursor:'pointer', flexShrink:0 }}>
      {copied ? <Check size={12}/> : <Copy size={12}/>}{copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'32px', marginBottom:'20px' }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-1)', letterSpacing:'0.03em', marginBottom:'4px' }}>{title}</div>
        {subtitle && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-3)', letterSpacing:'0.1em' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function BankDetails({ bank }) {
  if (!bank) return <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem' }}>Bank details not set yet.</div>;
  const rows = [['Bank Name', bank.bankName],['Account Name', bank.accountName],['Account Number', bank.accountNumber],['Routing', bank.routingNumber],['SWIFT / BIC', bank.swiftCode],['IBAN', bank.iban],['Address', bank.address ? `${bank.address}, ${bank.city||''} ${bank.district||''}, ${bank.country||''}`.replace(/,\s*,/g,',').trim() : '']].filter(([,v])=>v);
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:'20px' }}>
      {rows.map(([label, value], i) => (
        <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom: i<rows.length-1?'1px solid var(--border-1)':'none', gap:'12px', flexWrap:'wrap' }}>
          <div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'2px' }}>{label}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.9rem' }}>{value}</div>
          </div>
          <CopyBtn text={value} />
        </div>
      ))}
      {bank.notes && <div style={{ padding:'12px 16px', background:'var(--accent-muted)', borderTop:'1px solid var(--accent-border)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-2)' }}>{bank.notes}</div>}
    </div>
  );
}

export default function PayPage() {
  const [banks, setBanks]     = useState(null);
  const [wallets, setWallets] = useState(null);
  const [methods, setMethods] = useState([]);
  const [crypto, setCrypto]   = useState([]);
  const [gateways, setGateways] = useState([]);

  useEffect(() => {
    Promise.all([getPortfolioDoc('paymentBanks'), getPortfolioDoc('paymentWallets'), getPaymentMethods(), getPaymentCrypto(), getPaymentGateways()])
      .then(([b,w,m,c,g]) => { setBanks(b); setWallets(w); setMethods(m); setCrypto(c); setGateways(g); });
  }, []);

  const g1 = gateways.filter(g => String(g.group) === '1');
  const g2 = gateways.filter(g => String(g.group) === '2');
  const visibleMethods = methods.filter(m => m.visible !== false);

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:800, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ marginBottom:'48px', textAlign:'center' }}>
          <div className="section-label" style={{ marginBottom:'12px', justifyContent:'center', display:'flex' }}>Payment</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>Pay Shakil</h1>
        </div>

        {/* Group 1 - BDT */}
        <Card title="Remittance Transfer" subtitle="WESTERN UNION · RIA · REMITLY · TAPTAP & MORE">
          <BankDetails bank={banks?.bdt} />
          {g1.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>{g1.map(g=><div key={g.id} style={{ padding:'6px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-2)' }}>{g.name}</div>)}</div>}
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'16px' }}>Use your preferred remittance service to send to this BDT account.</p>
        </Card>

        {/* Group 2 - USD */}
        <Card title="International Wire" subtitle="USD · BUSINESS PAYMENTS · SWIFT / WIRE">
          <BankDetails bank={banks?.usd} />
          {g2.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>{g2.map(g=><div key={g.id} style={{ padding:'6px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-2)' }}>{g.name}</div>)}</div>}
        </Card>

        {/* Group 3 - Mobile Wallets */}
        <Card title="Mobile Wallets" subtitle="BANGLADESH · INSTANT TRANSFER">
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[{name:'bKash', num:wallets?.bkash?.number, color:'#E2136E'}, {name:'Nagad', num:wallets?.nagad?.number, color:'#F7941D'}].filter(w=>w.num).map(w=>(
              <div key={w.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', gap:'12px', flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:w.color, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', color:'#fff', fontSize:'1rem', flexShrink:0 }}>{w.name[0]}</div>
                  <div>
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)' }}>{w.name}</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.75rem', color:'var(--text-2)' }}>{w.num}</div>
                  </div>
                </div>
                <CopyBtn text={w.num} />
              </div>
            ))}
            {!wallets?.bkash?.number && !wallets?.nagad?.number && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem' }}>Wallet numbers not set yet.</div>}
          </div>
        </Card>

        {/* Group 4 - Online Platforms */}
        {visibleMethods.length > 0 && (
          <Card title="Online Payment Platforms" subtitle="PAYPAL · WISE · STRIPE & MORE">
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {visibleMethods.map(m=>(
                <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', gap:'12px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    {m.logoUrl ? <img src={m.logoUrl} alt={m.name} style={{ width:36, height:36, objectFit:'contain', borderRadius:'var(--radius-sm)', flexShrink:0 }}/> : <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:'var(--bg-overlay)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', color:'var(--text-2)', flexShrink:0 }}>{m.name?.[0]}</div>}
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)' }}>{m.name}</div>
                  </div>
                  <a href={m.payLink} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', textDecoration:'none' }}>
                    Pay Now <ExternalLink size={13}/>
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Group 5 - Crypto */}
        {crypto.filter(c=>c.active!==false).map(c=>(
          <Card key={c.id} title="Cryptocurrency" subtitle={c.network?.toUpperCase()}>
            <div style={{ display:'grid', gridTemplateColumns: c.qrImageUrl ? '1fr auto' : '1fr', gap:'24px', alignItems:'start' }}>
              <div>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Wallet Address</div>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.75rem', color:'var(--text-1)', wordBreak:'break-all', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'12px 16px', marginBottom:'10px', lineHeight:1.6 }}>{c.address}</div>
                <CopyBtn text={c.address} />
              </div>
              {c.qrImageUrl && <div style={{ background:'#fff', padding:'12px', borderRadius:'var(--radius-lg)', flexShrink:0 }}><img src={c.qrImageUrl} alt="QR" style={{ width:120, height:120, display:'block' }}/></div>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
