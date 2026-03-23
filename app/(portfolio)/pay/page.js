'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, getPaymentCrypto } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, ExternalLink, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Copy button ──────────────────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await copyToClipboard(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} style={{
      display:'inline-flex', alignItems:'center', gap:'5px', padding:'7px 12px',
      background: copied ? 'rgba(35,77,194,0.1)' : 'var(--bg-void)',
      border: copied ? '1px solid var(--accent-border)' : '1px solid var(--border-2)',
      borderRadius:'var(--radius-sm)', color: copied ? 'var(--accent)' : 'var(--text-2)',
      fontFamily:'Space Mono,monospace', fontSize:'0.65rem', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
    }}>
      {copied ? <Check size={12}/> : <Copy size={12}/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ─── Section card ─────────────────────────────────────────────────────────── */
function PayCard({ title, subtitle, children }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'28px', marginBottom:'16px' }}>
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--text-1)', letterSpacing:'0.04em', lineHeight:1 }}>{title}</div>
        {subtitle && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:'5px' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

/* ─── Bank detail rows — responsive grid so Copy never wraps ───────────────── */
function BankDetails({ bank }) {
  if (!bank || !bank.bankName) return (
    <div style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-3)', fontSize:'0.85rem', padding:'8px 0 16px' }}>
      Bank details not configured yet — go to Admin → Pay to set them up.
    </div>
  );

  const rows = [
    ['Bank Name',        bank.bankName],
    ['Account Name',     bank.accountName],
    ['Account Number',   bank.accountNumber],
    ['Routing Number',   bank.routingNumber],
    ['SWIFT / BIC',      bank.swiftCode],
    ['IBAN',             bank.iban],
    ['Address',          [bank.address, bank.city, bank.district, bank.country].filter(Boolean).join(', ')],
  ].filter(([, v]) => v);

  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:'20px' }}>
      {rows.map(([label, value], i) => (
        <div key={label} style={{
          /* Grid: label+value in col 1, copy button in col 2 — never wraps */
          display:'grid',
          gridTemplateColumns:'1fr auto',
          alignItems:'center',
          gap:'12px',
          padding:'12px 16px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--border-1)' : 'none',
        }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.54rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'3px' }}>{label}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.9rem', wordBreak:'break-word', lineHeight:1.4 }}>{value}</div>
          </div>
          <CopyBtn text={value} />
        </div>
      ))}
      {bank.notes && (
        <div style={{ padding:'12px 16px', background:'rgba(35,77,194,0.06)', borderTop:'1px solid var(--accent-border)' }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)' }}>{bank.notes}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Logo icon — image only, no text ─────────────────────────────────────── */
function BrandLogo({ src, alt, size = 40, bg = 'var(--bg-elevated)', fallbackColor = '#234DC2' }) {
  const [err, setErr] = useState(false);
  const initial = alt?.[0]?.toUpperCase() || '?';

  return (
    <div style={{ width:size, height:size, borderRadius:'var(--radius-md)', background:bg, border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}
      title={alt}
    >
      {!err && src ? (
        <img src={src} alt={alt} width={size * 0.6} height={size * 0.6} style={{ objectFit:'contain' }} onError={() => setErr(true)} />
      ) : (
        <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:size * 0.4, color:fallbackColor }}>{initial}</span>
      )}
    </div>
  );
}

/* ─── Inline SVGs for Visa / Mastercard (always renders, no external) ─────── */
function VisaLogo({ size = 40 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'var(--radius-md)', background:'#1A1F71', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }} title="Visa">
      <svg width={size * 0.7} height={size * 0.28} viewBox="0 0 80 26" fill="white">
        <text x="0" y="22" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fontStyle="italic" fill="white">VISA</text>
      </svg>
    </div>
  );
}

function MastercardLogo({ size = 40 }) {
  const r = size * 0.3;
  return (
    <div style={{ width:size, height:size, borderRadius:'var(--radius-md)', background:'#252525', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }} title="Mastercard">
      <svg width={size * 0.65} height={r * 2} viewBox={`0 0 ${r*2+r} ${r*2}`}>
        <circle cx={r} cy={r} r={r} fill="#EB001B" opacity="0.95"/>
        <circle cx={r*2} cy={r} r={r} fill="#F79E1B" opacity="0.95"/>
        {/* Intersection — blend */}
        <path d={`M${r*1.5},${r*0.35} a${r},${r} 0 0,1 0,${r*1.3} a${r},${r} 0 0,1 0,-${r*1.3}z`} fill="#FF5F00" opacity="0.85"/>
      </svg>
    </div>
  );
}

/* ─── "+" more badge ───────────────────────────────────────────────────────── */
function MoreBadge({ size = 40 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'var(--radius-md)', background:'var(--bg-elevated)', border:'1px dashed var(--border-3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.1rem', color:'var(--text-3)' }}>+</span>
    </div>
  );
}

/* ─── Logo row — icons only, wraps nicely ──────────────────────────────────── */
function LogoRow({ logos }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', alignItems:'center' }}>
      {logos.map((logo, i) => {
        if (logo.type === 'visa')       return <VisaLogo key={i} size={44} />;
        if (logo.type === 'mastercard') return <MastercardLogo key={i} size={44} />;
        if (logo.type === 'more')       return <MoreBadge key={i} size={44} />;
        if (logo.type === 'building')   return (
          <div key={i} style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }} title="Bank Wire">
            <Building2 size={22} color="var(--text-2)" strokeWidth={1.5}/>
          </div>
        );
        return <BrandLogo key={i} src={logo.src} alt={logo.alt} size={44} fallbackColor={logo.color} />;
      })}
    </div>
  );
}

/* ─── Crypto icon auto-detection ───────────────────────────────────────────── */
const CRYPTO_MAP = {
  btc:     { src:'https://cdn.simpleicons.org/bitcoin/F7931A',    color:'#F7931A' },
  bitcoin: { src:'https://cdn.simpleicons.org/bitcoin/F7931A',    color:'#F7931A' },
  eth:     { src:'https://cdn.simpleicons.org/ethereum/627EEA',   color:'#627EEA' },
  ethereum:{ src:'https://cdn.simpleicons.org/ethereum/627EEA',   color:'#627EEA' },
  usdt:    { src:'https://cdn.simpleicons.org/tether/26A17B',     color:'#26A17B' },
  tether:  { src:'https://cdn.simpleicons.org/tether/26A17B',     color:'#26A17B' },
  usdc:    { src:'https://cdn.simpleicons.org/usdcoin/2775CA',    color:'#2775CA' },
  bnb:     { src:'https://cdn.simpleicons.org/binance/F3BA2F',    color:'#F3BA2F' },
  binance: { src:'https://cdn.simpleicons.org/binance/F3BA2F',    color:'#F3BA2F' },
  sol:     { src:'https://cdn.simpleicons.org/solana/9945FF',     color:'#9945FF' },
  solana:  { src:'https://cdn.simpleicons.org/solana/9945FF',     color:'#9945FF' },
  trx:     { src:'https://cdn.simpleicons.org/tron/EF0027',       color:'#EF0027' },
  tron:    { src:'https://cdn.simpleicons.org/tron/EF0027',       color:'#EF0027' },
  matic:   { src:'https://cdn.simpleicons.org/polygon/8247E5',    color:'#8247E5' },
  polygon: { src:'https://cdn.simpleicons.org/polygon/8247E5',    color:'#8247E5' },
  ltc:     { src:'https://cdn.simpleicons.org/litecoin/345D9D',   color:'#345D9D' },
};
function getCryptoIcon(network, iconUrl) {
  if (iconUrl) return { src: iconUrl, color: '#234DC2' };
  const key = (network || '').toLowerCase().split(/[\s-_/]/)[0];
  return CRYPTO_MAP[key] || null;
}

/* ─── Main Pay Page ─────────────────────────────────────────────────────────── */
export default function PayPage() {
  const [banks,   setBanks]   = useState(null);
  const [wallets, setWallets] = useState(null);
  const [links,   setLinks]   = useState({});
  const [cryptos, setCryptos] = useState([]);
  const [texts,   setTexts]   = useState({});

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('paymentBanks'),
      getPortfolioDoc('paymentWallets'),
      getPortfolioDoc('paymentLinks'),
      getPaymentCrypto(),
      getPortfolioDoc('paymentTexts'),
    ]).then(([b, w, l, c, t]) => {
      if (b) setBanks(b);
      if (w) setWallets(w);
      if (l) setLinks(l);
      if (c) setCryptos(c.filter(x => x.active !== false));
      if (t) setTexts(t);
    });
  }, []);

  /* Editable texts with defaults */
  const t = {
    remittanceNote:    texts.remittanceNote    || 'Use your preferred remittance service to send to the BDT account above.',
    walletSubtitle:    texts.walletSubtitle    || 'Bangladesh · Instant Transfer',
    globalTitle:       texts.globalTitle       || 'Global Payment',
    globalSubtitle:    texts.globalSubtitle    || 'PayPal · Wise · Stripe · Payoneer',
    cryptoSubtitle:    texts.cryptoSubtitle    || 'Secure · Borderless · Instant',
    remittanceTitle:   texts.remittanceTitle   || 'Remittance Transfer',
    wireTitle:         texts.wireTitle         || 'International Wire',
    walletTitle:       texts.walletTitle       || 'Mobile Wallets',
    cryptoTitle:       texts.cryptoTitle       || 'Cryptocurrency',
  };

  /* Online platforms — only show if at least one link is set */
  const onlinePlatforms = [
    { key:'paypal',   name:'PayPal',   src:'https://logo.clearbit.com/paypal.com',   color:'#003087' },
    { key:'wise',     name:'Wise',     src:'https://logo.clearbit.com/wise.com',     color:'#9FE870', textDark:true },
    { key:'stripe',   name:'Stripe',   src:'https://logo.clearbit.com/stripe.com',   color:'#635BFF' },
    { key:'payoneer', name:'Payoneer', src:'https://logo.clearbit.com/payoneer.com', color:'#FF4800' },
  ];
  const hasAnyPlatformLink = onlinePlatforms.some(p => links[p.key]);

  /* Remittance logo row — icons only */
  const remittanceLogos = [
    { alt:'Western Union', src:'https://logo.clearbit.com/westernunion.com',     color:'#FFCD00' },
    { alt:'Ria',           src:'https://logo.clearbit.com/riamoneytransfer.com', color:'#FF6B00' },
    { alt:'Remitly',       src:'https://logo.clearbit.com/remitly.com',          color:'#4C84FF' },
    { alt:'TapTap Send',   src:'https://logo.clearbit.com/taptapsend.com',       color:'#8B5CF6' },
    { alt:'WorldRemit',    src:'https://logo.clearbit.com/worldremit.com',       color:'#1B8EF2' },
    { type:'more' },
  ];

  /* International wire logo row */
  const wireLogos = [
    { type:'building' },
    { type:'visa' },
    { type:'mastercard' },
    { alt:'Payoneer', src:'https://logo.clearbit.com/payoneer.com', color:'#FF4800' },
    { alt:'Mercury',  src:'https://logo.clearbit.com/mercury.com',  color:'#2563EB' },
    { alt:'Stripe',   src:'https://logo.clearbit.com/stripe.com',   color:'#635BFF' },
    { type:'more' },
  ];

  /* Trust icons under heading — logos only, NO text */
  const trustLogos = [
    { type:'visa' },
    { type:'mastercard' },
    { alt:'PayPal',  src:'https://logo.clearbit.com/paypal.com',  color:'#003087' },
    { alt:'Stripe',  src:'https://logo.clearbit.com/stripe.com',  color:'#635BFF' },
    { type:'building' },
    { alt:'Bitcoin', src:'https://cdn.simpleicons.org/bitcoin/F7931A', color:'#F7931A' },
  ];

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'800px', height:'400px', background:'radial-gradient(ellipse, rgba(35,77,194,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>

        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div className="section-label" style={{ marginBottom:'12px', justifyContent:'center', display:'flex' }}>Payment</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3.5rem,7vw,5.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>
            Pay Shakil
          </h1>
          <p style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-2)', fontSize:'0.95rem', marginTop:'10px' }}>
            Multiple payment options available worldwide.
          </p>
        </div>

        {/* Trust logos row — ICONS ONLY, no text */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', flexWrap:'wrap', marginBottom:'40px' }}>
          <LogoRow logos={trustLogos} />
        </div>

        {/* ── Remittance Transfer ──────────────────────────────────────── */}
        <PayCard title={t.remittanceTitle} subtitle="BDT Account">
          <BankDetails bank={banks?.bdt} />

          {/* Service logos — icons only, no text labels */}
          <div style={{ marginBottom:'12px' }}>
            <LogoRow logos={remittanceLogos} />
          </div>

          {/* Editable note */}
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', lineHeight:1.6 }}>
            {t.remittanceNote}
          </p>
        </PayCard>

        {/* ── International Wire ───────────────────────────────────────── */}
        <PayCard title={t.wireTitle} subtitle="USD · SWIFT · ACH">
          <BankDetails bank={banks?.usd} />

          {/* Compatible logos — icons only */}
          <div style={{ marginBottom:'8px' }}>
            <LogoRow logos={wireLogos} />
          </div>
        </PayCard>

        {/* ── Mobile Wallets — hidden if no numbers set ─────────────────── */}
        {(wallets?.bkash?.number || wallets?.nagad?.number) && (
          <PayCard title={t.walletTitle} subtitle={t.walletSubtitle}>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {wallets?.bkash?.number && (
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'14px', padding:'16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                  {/* bKash logo */}
                  <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'#E2136E', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    <BrandLogo src="https://logo.clearbit.com/bkash.com" alt="bKash" size={44} bg="#E2136E" fallbackColor="#fff" />
                  </div>
                  <div>
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.95rem' }}>bKash</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.8rem', color:'var(--text-2)', marginTop:'2px' }}>{wallets.bkash.number}</div>
                  </div>
                  <CopyBtn text={wallets.bkash.number} />
                </div>
              )}
              {wallets?.nagad?.number && (
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'14px', padding:'16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                  {/* Nagad logo */}
                  <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'linear-gradient(135deg,#F7941D,#E5621A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    <BrandLogo src="https://logo.clearbit.com/nagad.com.bd" alt="Nagad" size={44} bg="transparent" fallbackColor="#fff" />
                  </div>
                  <div>
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.95rem' }}>Nagad</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.8rem', color:'var(--text-2)', marginTop:'2px' }}>{wallets.nagad.number}</div>
                  </div>
                  <CopyBtn text={wallets.nagad.number} />
                </div>
              )}
            </div>
          </PayCard>
        )}

        {/* ── Global Payment — hidden if no links set ───────────────────── */}
        {hasAnyPlatformLink && (
          <PayCard title={t.globalTitle} subtitle={t.globalSubtitle}>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {onlinePlatforms.map(platform => {
                const link = links[platform.key];
                if (!link) return null;
                return (
                  <div key={platform.key} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'14px', padding:'16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                    {/* Logo */}
                    <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:`${platform.color}18`, border:`1px solid ${platform.color}35`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <img src={platform.src} alt={platform.name} width="28" height="28" style={{ objectFit:'contain' }} onError={e => e.target.style.display='none'} />
                    </div>
                    <div>
                      <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.95rem' }}>{platform.name}</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'2px' }}>Tap to pay securely</div>
                    </div>
                    <a href={link} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:platform.color, color: platform.textDark ? '#000' : '#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                      Pay Now <ExternalLink size={12}/>
                    </a>
                  </div>
                );
              })}
            </div>
          </PayCard>
        )}

        {/* ── Cryptocurrency ────────────────────────────────────────────── */}
        {cryptos.length > 0 && (
          <PayCard title={t.cryptoTitle} subtitle={t.cryptoSubtitle}>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {cryptos.map(c => {
                const icon = getCryptoIcon(c.network, c.iconUrl);
                return (
                  <div key={c.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', padding:'20px', display:'grid', gridTemplateColumns: c.qrImageUrl ? '1fr auto' : '1fr', gap:'20px', alignItems:'start' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
                        {icon && (
                          <div style={{ width:38, height:38, borderRadius:'50%', background:`${icon.color}18`, border:`1px solid ${icon.color}35`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <img src={icon.src} alt={c.network} width="22" height="22" style={{ objectFit:'contain' }} onError={e=>e.target.style.display='none'}/>
                          </div>
                        )}
                        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.95rem' }}>{c.network}</div>
                      </div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Wallet Address</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.72rem', color:'var(--text-1)', wordBreak:'break-all', background:'var(--bg-void)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'12px 14px', marginBottom:'10px', lineHeight:1.6 }}>
                        {c.address}
                      </div>
                      <CopyBtn text={c.address} />
                    </div>
                    {c.qrImageUrl && (
                      <div style={{ background:'#fff', padding:'10px', borderRadius:'var(--radius-lg)', flexShrink:0 }}>
                        <img src={c.qrImageUrl} alt="QR" style={{ width:110, height:110, display:'block' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PayCard>
        )}
      </div>
    </div>
  );
}
