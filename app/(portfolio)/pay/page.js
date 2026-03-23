'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, getPaymentCrypto } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, ExternalLink, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Logo pill ───────────────────────────────────────────── */
function LogoPill({ src, alt, invert, size = 'section' }) {
  const [err, setErr] = useState(false);
  const s = size === 'trust'
    ? { height:34, padding:'6px 12px', borderRadius:8 }
    : { height:24, padding:'3px 8px', borderRadius:6 };
  return (
    <div title={alt} style={{ ...s, background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.08)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, minWidth:32 }}>
      {!err && src
        ? <img src={src} alt={alt} style={{ height:16, width:'auto', maxWidth:48, objectFit:'contain', filter: invert ? 'brightness(0) invert(1)' : 'none' }} onError={()=>setErr(true)}/>
        : <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'0.6rem', color:'rgba(255,255,255,0.4)' }}>{alt?.[0]}</span>
      }
    </div>
  );
}

function LogoRow({ logos = [], size = 'section' }) {
  const active = logos.filter(l => l.active !== false);
  if (!active.length) return null;
  return (
    <div style={{ display:'flex', gap:'6px', alignItems:'center', overflowX:'auto', flexWrap:'nowrap', scrollbarWidth:'none' }} className="scrollbar-hide">
      {active.map((l,i) => <LogoPill key={i} src={l.logoUrl} alt={l.label} invert={l.invert} size={size}/>)}
    </div>
  );
}

/* ─── Copy button ──────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => { await copyToClipboard(text); setCopied(true); toast.success('Copied!'); setTimeout(()=>setCopied(false),2000); };
  return (
    <button onClick={handle} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 12px', background:copied?'rgba(35,77,194,0.1)':'var(--bg-void)', border:copied?'1px solid var(--accent-border)':'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:copied?'var(--accent)':'var(--text-2)', fontFamily:'Space Mono,monospace', fontSize:'0.62rem', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
      {copied?<Check size={11}/>:<Copy size={11}/>}{copied?'Copied':'Copy'}
    </button>
  );
}

/* ─── Bank details — each address field its own row ────────── */
function BankDetails({ bank }) {
  if (!bank?.bankName) return <div style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-3)', fontSize:'0.82rem', padding:'8px 0 16px' }}>Bank details not configured yet.</div>;
  const rows = [
    ['Bank Name',        bank.bankName],
    ['Account Name',     bank.accountName],
    ['Account Number',   bank.accountNumber],
    ['Routing Number',   bank.routingNumber],
    ['SWIFT / BIC',      bank.swiftCode],
    ['IBAN',             bank.iban],
    ['Street Address',   bank.address],
    ['City',             bank.city],
    ['District / State', bank.district],
    ['Country',          bank.country],
  ].filter(([,v]) => v);
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:'16px' }}>
      {rows.map(([label,value],i) => (
        <div key={label} style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:'10px', padding:'11px 16px', borderBottom:i<rows.length-1?'1px solid var(--border-1)':'none' }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'2px' }}>{label}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem', wordBreak:'break-word', lineHeight:1.4 }}>{value}</div>
          </div>
          <CopyBtn text={value}/>
        </div>
      ))}
      {bank.notes && <div style={{ padding:'10px 16px', background:'rgba(35,77,194,0.06)', borderTop:'1px solid var(--accent-border)' }}><div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-2)' }}>{bank.notes}</div></div>}
    </div>
  );
}

/* ─── Accordion wrapper ────────────────────────────────────── */
function Accordion({ title, teaserLogos = [], isOpen, onToggle, children }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', marginBottom:'12px', overflow:'hidden' }}>
      {/* Header — always visible */}
      <div
        onClick={onToggle}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', cursor:'pointer', gap:'12px', userSelect:'none' }}
      >
        <div style={{ minWidth:0 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.3rem', color:'var(--text-1)', letterSpacing:'0.04em', lineHeight:1, marginBottom: teaserLogos.length ? '8px' : '0' }}>
            {title}
          </div>
          {teaserLogos.length > 0 && <LogoRow logos={teaserLogos} size="section"/>}
        </div>
        <div style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.25s ease', color:'var(--text-3)', flexShrink:0 }}>
          <ChevronDown size={18}/>
        </div>
      </div>
      {/* Body */}
      <div style={{
        maxHeight: isOpen ? '2000px' : '0',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.25s ease',
      }}>
        <div style={{ padding:'0 24px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Crypto logo detection ────────────────────────────────── */
const CRYPTO_LOGOS = {
  btc:'https://cdn.simpleicons.org/bitcoin', bitcoin:'https://cdn.simpleicons.org/bitcoin',
  usdt:'https://cdn.simpleicons.org/tether', tether:'https://cdn.simpleicons.org/tether',
  trc20:'https://cdn.simpleicons.org/tether', erc20:'https://cdn.simpleicons.org/tether',
  eth:'https://cdn.simpleicons.org/ethereum', ethereum:'https://cdn.simpleicons.org/ethereum',
  bnb:'https://cdn.simpleicons.org/binance', binance:'https://cdn.simpleicons.org/binance', bsc:'https://cdn.simpleicons.org/binance',
  sol:'https://cdn.simpleicons.org/solana', solana:'https://cdn.simpleicons.org/solana',
  trx:'https://cdn.simpleicons.org/tron', tron:'https://cdn.simpleicons.org/tron',
  matic:'https://cdn.simpleicons.org/polygon', polygon:'https://cdn.simpleicons.org/polygon',
  ltc:'https://cdn.simpleicons.org/litecoin', litecoin:'https://cdn.simpleicons.org/litecoin',
  xrp:'https://cdn.simpleicons.org/xrp', ripple:'https://cdn.simpleicons.org/xrp',
  doge:'https://cdn.simpleicons.org/dogecoin', dogecoin:'https://cdn.simpleicons.org/dogecoin',
};
function getCryptoSrc(network, iconUrl) {
  if (iconUrl) return iconUrl;
  const words = (network||'').toLowerCase().split(/[\s/_\-]+/);
  for (const word of words) { if (CRYPTO_LOGOS[word]) return CRYPTO_LOGOS[word]; }
  return null;
}

/* ─── Default logo fallbacks ────────────────────────────────── */
const DEF = {
  trustLogos: [
    { label:'Visa',       logoUrl:'https://cdn.simpleicons.org/visa',            invert:false, active:true },
    { label:'Mastercard', logoUrl:'https://cdn.simpleicons.org/mastercard',      invert:false, active:true },
    { label:'PayPal',     logoUrl:'https://cdn.simpleicons.org/paypal',          invert:false, active:true },
    { label:'Apple Pay',  logoUrl:'https://cdn.simpleicons.org/applepay',        invert:true,  active:true },
    { label:'Google Pay', logoUrl:'https://cdn.simpleicons.org/googlepay',       invert:false, active:true },
    { label:'Stripe',     logoUrl:'https://cdn.simpleicons.org/stripe',          invert:true,  active:true },
    { label:'Amex',       logoUrl:'https://cdn.simpleicons.org/americanexpress', invert:false, active:true },
  ],
  remittanceLogos: [
    { label:'Western Union', logoUrl:'https://cdn.simpleicons.org/westernunion', invert:true,  active:true },
    { label:'Remitly',       logoUrl:'https://cdn.simpleicons.org/remitly',      invert:false, active:true },
    { label:'Wise',          logoUrl:'https://cdn.simpleicons.org/wise',         invert:false, active:true },
  ],
  wireLogos: [
    { label:'Stripe',   logoUrl:'https://cdn.simpleicons.org/stripe',   invert:true,  active:true },
    { label:'Payoneer', logoUrl:'https://cdn.simpleicons.org/payoneer', invert:false, active:true },
  ],
  walletLogos: [
    { label:'bKash', logoUrl:'https://cdn.simpleicons.org/bkash', invert:false, active:true },
    { label:'Nagad',  logoUrl:null, invert:false, active:true },
  ],
  globalLogos: [
    { label:'PayPal',   logoUrl:'https://cdn.simpleicons.org/paypal',   invert:false, active:true },
    { label:'Wise',     logoUrl:'https://cdn.simpleicons.org/wise',     invert:false, active:true },
    { label:'Stripe',   logoUrl:'https://cdn.simpleicons.org/stripe',   invert:true,  active:true },
    { label:'Payoneer', logoUrl:'https://cdn.simpleicons.org/payoneer', invert:false, active:true },
  ],
  cryptoLogos: [
    { label:'Bitcoin',  logoUrl:'https://cdn.simpleicons.org/bitcoin',  invert:false, active:true },
    { label:'Ethereum', logoUrl:'https://cdn.simpleicons.org/ethereum', invert:false, active:true },
    { label:'Tether',   logoUrl:'https://cdn.simpleicons.org/tether',   invert:false, active:true },
    { label:'BNB',      logoUrl:'https://cdn.simpleicons.org/binance',  invert:false, active:true },
    { label:'Solana',   logoUrl:'https://cdn.simpleicons.org/solana',   invert:false, active:true },
  ],
};

const PLATFORMS = [
  { key:'paypal',   name:'PayPal',   logoUrl:'https://cdn.simpleicons.org/paypal',   invert:false },
  { key:'payoneer', name:'Payoneer', logoUrl:'https://cdn.simpleicons.org/payoneer', invert:false },
  { key:'stripe',   name:'Stripe',   logoUrl:'https://cdn.simpleicons.org/stripe',   invert:true  },
  { key:'wise',     name:'Wise',     logoUrl:'https://cdn.simpleicons.org/wise',     invert:false },
];

function getPD(links, key) {
  const raw = links[key];
  if (!raw) return {};
  if (typeof raw === 'string') return { link:raw, paymentHandle:'', instructions:'' };
  return raw;
}

export default function PayPage() {
  const [banks,   setBanks]   = useState(null);
  const [wallets, setWallets] = useState(null);
  const [links,   setLinks]   = useState({});
  const [cryptos, setCryptos] = useState([]);
  const [texts,   setTexts]   = useState({});
  const [logos,   setLogos]   = useState(DEF);
  /* Remittance open by default, rest closed */
  const [open, setOpen] = useState({ remittance:true, wire:false, wallets:false, global:false, crypto:false });
  const toggle = (key) => setOpen(o => ({ ...o, [key]: !o[key] }));

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('paymentBanks'),
      getPortfolioDoc('paymentWallets'),
      getPortfolioDoc('paymentLinks'),
      getPaymentCrypto(),
      getPortfolioDoc('paymentTexts'),
      getPortfolioDoc('paymentLogos'),
    ]).then(([b,w,l,c,t,lg]) => {
      if (b) setBanks(b);
      if (w) setWallets(w);
      if (l) setLinks(l);
      if (c) setCryptos(c.filter(x=>x.active!==false));
      if (t) setTexts(t);
      if (lg) setLogos(prev => ({
        trustLogos:      lg.trustLogos?.length      ? lg.trustLogos      : prev.trustLogos,
        remittanceLogos: lg.remittanceLogos?.length ? lg.remittanceLogos : prev.remittanceLogos,
        wireLogos:       lg.wireLogos?.length       ? lg.wireLogos       : prev.wireLogos,
        walletLogos:     lg.walletLogos?.length     ? lg.walletLogos     : prev.walletLogos,
        globalLogos:     lg.globalLogos?.length     ? lg.globalLogos     : prev.globalLogos,
        cryptoLogos:     lg.cryptoLogos?.length     ? lg.cryptoLogos     : prev.cryptoLogos,
      }));
    });
  }, []);

  const tx = {
    remittanceTitle: texts.remittanceTitle||'Remittance Transfer',
    remittanceNote:  texts.remittanceNote ||'Use your preferred remittance service to send to the BDT account above.',
    wireTitle:       texts.wireTitle      ||'International Wire',
    walletTitle:     texts.walletTitle    ||'Mobile Wallets',
    walletSubtitle:  texts.walletSubtitle ||'Bangladesh · Instant Transfer',
    globalTitle:     texts.globalTitle    ||'Global Payment',
    globalSubtitle:  texts.globalSubtitle ||'PayPal · Wise · Stripe · Payoneer',
    cryptoTitle:     texts.cryptoTitle    ||'Cryptocurrency',
  };

  const hasAnyPlatform = PLATFORMS.some(p => { const d=getPD(links,p.key); return d.link||d.paymentHandle; });

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'700px', height:'400px', background:'radial-gradient(ellipse, rgba(35,77,194,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ maxWidth:780, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>

        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <div className="section-label" style={{ marginBottom:'10px', justifyContent:'center', display:'flex' }}>Payment</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3.5rem,7vw,5.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>Pay Shakil</h1>
          <p style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-2)', fontSize:'0.9rem', marginTop:'8px' }}>Multiple payment options worldwide.</p>
        </div>

        {/* Trust logos row */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'32px' }}>
          <LogoRow logos={logos.trustLogos} size="trust"/>
        </div>

        {/* ── Remittance ──────────────────────── */}
        <Accordion title={tx.remittanceTitle} teaserLogos={logos.remittanceLogos} isOpen={open.remittance} onToggle={()=>toggle('remittance')}>
          <BankDetails bank={banks?.bdt}/>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', color:'var(--text-3)', lineHeight:1.6 }}>{tx.remittanceNote}</p>
        </Accordion>

        {/* ── International Wire ──────────────── */}
        <Accordion title={tx.wireTitle} teaserLogos={logos.wireLogos} isOpen={open.wire} onToggle={()=>toggle('wire')}>
          <BankDetails bank={banks?.usd}/>
        </Accordion>

        {/* ── Mobile Wallets ──────────────────── */}
        {(wallets?.bkash?.number||wallets?.nagad?.number) && (
          <Accordion title={tx.walletTitle} teaserLogos={logos.walletLogos} isOpen={open.wallets} onToggle={()=>toggle('wallets')}>
            {tx.walletSubtitle && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px' }}>{tx.walletSubtitle}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[{key:'bkash',label:'bKash',color:'#E2136E'},{key:'nagad',label:'Nagad',color:'#F7941D'}].map(({key,label,color})=>{
                const num=wallets[key]?.number; if(!num) return null;
                return (
                  <div key={key} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'12px', padding:'14px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                    <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:`${color}22`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'0.6rem', color:'#fff', letterSpacing:'0.03em' }}>{label}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{label}</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.75rem', color:'var(--text-2)', marginTop:'2px' }}>{num}</div>
                    </div>
                    <CopyBtn text={num}/>
                  </div>
                );
              })}
            </div>
          </Accordion>
        )}

        {/* ── Global Payment ──────────────────── */}
        {hasAnyPlatform && (
          <Accordion title={tx.globalTitle} teaserLogos={logos.globalLogos} isOpen={open.global} onToggle={()=>toggle('global')}>
            {tx.globalSubtitle && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px' }}>{tx.globalSubtitle}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {PLATFORMS.map(p => {
                const d=getPD(links,p.key); if(!d.link&&!d.paymentHandle) return null;
                return (
                  <div key={p.key} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'12px', padding:'14px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                    <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <img src={p.logoUrl} alt={p.name} width="24" height="20" style={{ objectFit:'contain', filter:p.invert?'brightness(0) invert(1)':'none' }} onError={e=>e.target.style.display='none'}/>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{p.name}</div>
                      {d.paymentHandle && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-2)', marginTop:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.paymentHandle}</div>}
                      {d.instructions  && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.72rem', color:'var(--text-3)', marginTop:'2px', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.instructions}</div>}
                    </div>
                    {d.link ? (
                      <a href={d.link} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-3)', color:'var(--text-1)', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.78rem', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0, transition:'border-color 0.15s ease,color 0.15s ease' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent-border)';e.currentTarget.style.color='var(--accent)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-3)';e.currentTarget.style.color='var(--text-1)';}}
                      >Pay Now <ExternalLink size={11}/></a>
                    ) : d.paymentHandle ? <CopyBtn text={d.paymentHandle}/> : null}
                  </div>
                );
              })}
            </div>
          </Accordion>
        )}

        {/* ── Cryptocurrency ──────────────────── */}
        {cryptos.length > 0 && (
          <Accordion title={tx.cryptoTitle} teaserLogos={logos.cryptoLogos} isOpen={open.crypto} onToggle={()=>toggle('crypto')}>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {cryptos.map(c => {
                const src = getCryptoSrc(c.network, c.iconUrl);
                return (
                  <div key={c.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', padding:'18px', display:'grid', gridTemplateColumns:c.qrImageUrl?'1fr auto':'1fr', gap:'16px', alignItems:'start' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                        {src && <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <img src={src} alt={c.network} width="22" height="22" style={{ objectFit:'contain' }} onError={e=>e.target.style.display='none'}/>
                        </div>}
                        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{c.network}</div>
                      </div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>Wallet Address</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.7rem', color:'var(--text-1)', wordBreak:'break-all', background:'var(--bg-void)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'10px 12px', marginBottom:'8px', lineHeight:1.6 }}>{c.address}</div>
                      <CopyBtn text={c.address}/>
                    </div>
                    {c.qrImageUrl && <div style={{ background:'#fff', padding:'8px', borderRadius:'var(--radius-lg)', flexShrink:0 }}><img src={c.qrImageUrl} alt="QR" style={{ width:100, height:100, display:'block' }}/></div>}
                  </div>
                );
              })}
            </div>
          </Accordion>
        )}
      </div>
    </div>
  );
}
