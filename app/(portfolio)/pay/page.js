'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, getPaymentCrypto } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Mercury inline SVG symbol ───────────────────────────────────────────── */
function MercurySymbol({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
      <path d="M23.9473,15.9297c0-1.1956.8088-2.0044,2.0395-2.0044,1.1253,0,1.8989.8088,1.8989,2.0044,0,1.1604-.7736,1.934-1.8989,1.934-1.2307,0-2.0395-.7736-2.0395-1.934ZM20.9231,9.6703c.7033-1.0198,1.1604-2.2506,1.1604-3.9736,1.7231,1.0198,3.1648,2.4615,4.1846,4.1846-1.6879,0-2.9187.4571-3.9384,1.1956-.3869-.5275-.8791-1.0197-1.4066-1.4066ZM20.8527,22.2593c.5275-.3867.9847-.8791,1.4066-1.3714,1.0198.7737,2.2858,1.2308,4.0088,1.2308-1.0198,1.7582-2.4615,3.2-4.1846,4.1846,0-1.7582-.4571-3.0242-1.2308-4.044ZM19.7978,1.3714c6.5758,1.6527,11.2879,7.4901,11.2879,14.6286,0,2.989-2.2505,5.2044-5.1692,5.2044-1.1956,0-2.3209-.3868-3.1648-1.0198.4571-.7384.7736-1.5472.9846-2.4264.5626.633,1.3714,1.0198,2.2505,1.0198,1.5121,0,2.8132-1.301,2.8132-2.8483,0-4.8879-2.8132-9.178-6.9274-11.3231-.3165-1.2659-1.0902-2.4264-2.0748-3.2352ZM18.1451,20.1846c1.5121-.7736,2.567-2.356,2.567-4.1846,0-3.4462,3.0593-5.6967,6.0835-5.1341.3868.844.668,1.7934.8791,2.7429-.4923-.3868-1.0549-.5978-1.6879-.5978-1.6176,0-2.9539,1.3363-2.9539,2.9187,0,2.3912-1.0901,4.4307-2.7428,5.6967-.5978-.633-1.3363-1.1253-2.145-1.4418ZM14.0308,6.1187c0-1.1956.8088-2.0044,2.0395-2.0044,1.1253,0,1.8989.8088,1.8989,2.0044,0,1.1604-.7736,1.9341-1.8989,1.9341-1.2307,0-2.0395-.7737-2.0395-1.9341ZM14.0308,25.9517c0-1.1956.8088-2.0044,2.0395-2.0044,1.1253,0,1.8989.8088,1.8989,2.0044,0,1.1604-.7736,1.934-1.8989,1.934-1.2307,0-2.0395-.7736-2.0395-1.934ZM12.2022,16c0-2.1802,1.6176-3.7978,3.833-3.7978,2.1802,0,3.7626,1.6176,3.7626,3.7978,0,2.2154-1.5824,3.7978-3.7626,3.7978-2.2154,0-3.833-1.5824-3.833-3.7978ZM16.0352,11.2879c-3.3759,0-5.6264-2.8132-5.1341-6.0483.8791-.422,1.8637-.7385,2.8483-.9143-.3868.4923-.6329,1.1253-.6329,1.7934,0,1.5473,1.3362,2.8484,2.9538,2.8484,2.3561,0,4.3956.9846,5.6264,2.6373-.6681.633-1.1604,1.4066-1.5121,2.2505-.7736-1.5121-2.356-2.567-4.1494-2.567ZM10.8308,25.8813c0-1.1956.3868-2.2857,1.0198-3.1296.7032.4219,1.4769.7736,2.3208.9846-.633.5275-1.0549,1.3363-1.0549,2.2154,0,1.5472,1.3362,2.8483,2.9538,2.8483,4.9231,0,9.1429-2.778,11.2528-6.8572,1.3011-.3164,2.4615-1.0549,3.2703-2.0747-1.6527,6.5407-7.455,11.2176-14.5934,11.2176-2.9187,0-5.1692-2.2505-5.1692-5.2044ZM10.4088,20.3253c.5978-.633,1.0901-1.3715,1.4066-2.1802.7736,1.5121,2.3912,2.567,4.2198,2.567,3.3758,0,5.5912,2.989,5.0637,6.1187-.8791.3868-1.8286.7033-2.8132.8791.3517-.4923.5978-1.0901.5978-1.7582,0-1.5825-1.3011-2.9188-2.8132-2.9188-2.356,0-4.3956-1.0549-5.6615-2.7076ZM5.7671,22.1187c1.6879,0,2.9538-.4571,3.9736-1.2308.4219.4923.8791.9847,1.4066,1.3714-.7737,1.0198-1.2308,2.2858-1.2308,4.0088-1.7231-1.0198-3.1297-2.4263-4.1494-4.1494ZM5.7319,9.8813c1.0198-1.6879,2.4615-3.1297,4.1846-4.1494,0,1.7582.4571,3.0242,1.2659,4.0439-.5275.3868-1.0198.844-1.4066,1.3715-1.0198-.8089-2.2857-1.266-4.0439-1.266ZM4.2901,18.1451c.5275.3868,1.1604.6329,1.8637.6329,1.5121,0,2.8132-1.301,2.8132-2.8483,0-2.2858,1.0901-4.255,2.7428-5.5209.633.5978,1.3714,1.0901,2.1802,1.4066-1.5473.7736-2.6022,2.3912-2.6022,4.1846,0,3.4462-2.9187,5.6264-6.0483,5.1341-.422-.9495-.7385-1.9341-.9495-2.989ZM4.1143,15.9297c0-1.1956.8088-2.0044,2.0395-2.0044,1.1253,0,1.8989.8088,1.8989,2.0044,0,1.1604-.7736,1.934-1.8989,1.934-1.2308,0-2.0395-.7736-2.0395-1.934ZM1.3714,12.1671C3.0593,5.5912,8.8616.9143,15.9648.9143c2.9539,0,5.2044,2.2505,5.2044,5.1692,0,1.1956-.3516,2.2506-.9494,3.0945-.7033-.4219-1.477-.7384-2.3209-.9143.5978-.5274.9846-1.3011.9846-2.145,0-1.5824-1.301-2.9187-2.8132-2.9187-4.9582,0-9.2483,2.8132-11.3934,6.8572-1.3011.3164-2.4615,1.0901-3.3055,2.1099ZM.9143,16c0-2.9538,2.2505-5.2044,5.2044-5.2044,1.1956,0,2.2857.3868,3.1297,1.055-.422.6681-.7385,1.4066-.9495,2.2153-.5274-.633-1.301-1.0549-2.145-1.0549-1.6176,0-2.9538,1.3363-2.9538,2.9187,0,4.9934,2.778,9.2483,6.8923,11.4285.3165,1.3011,1.0901,2.4264,2.1099,3.2704C5.6264,29.011.9143,23.1736.9143,16ZM15.9648,32c8.5451,0,16.0352-6.822,16.0352-16C32,7.1384,24.8616,0,15.9648,0,7.1384,0,0,7.1384,0,16c0,8.8616,7.1384,16,15.9648,16Z"/>
    </svg>
  );
}

/* ─── Logo pill — uniform size, light-grey tinted background ──────────────── */
/* All logos share the same pill container so they look consistent in a row   */
function LogoPill({ src, alt, special }) {
  const [err, setErr] = useState(false);
  return (
    <div
      title={alt}
      style={{
        height: 32,
        padding: '5px 10px',
        background: 'rgba(255,255,255,0.07)',  /* subtle light-grey tint on dark bg */
        borderRadius: 7,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        minWidth: 44,
      }}
    >
      {special === 'mercury' ? (
        <MercurySymbol size={18} />
      ) : !err && src ? (
        <img
          src={src}
          alt={alt}
          style={{ height: 18, width: 'auto', maxWidth: 56, objectFit: 'contain', display: 'block' }}
          onError={() => setErr(true)}
        />
      ) : (
        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
          {alt?.[0]}
        </span>
      )}
    </div>
  );
}

/* ─── Single horizontal logo row — never wraps, scrolls on overflow ─────── */
function LogoRow({ logos }) {
  return (
    <div style={{
      display: 'flex',
      gap: '7px',
      alignItems: 'center',
      overflowX: 'auto',
      flexWrap: 'nowrap',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
    className="scrollbar-hide"
    >
      {logos.map((l, i) => (
        <LogoPill key={i} src={l.src} alt={l.alt} special={l.special} />
      ))}
    </div>
  );
}

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
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '6px 12px',
      background: copied ? 'rgba(35,77,194,0.1)' : 'var(--bg-void)',
      border: copied ? '1px solid var(--accent-border)' : '1px solid var(--border-2)',
      borderRadius: 'var(--radius-sm)',
      color: copied ? 'var(--accent)' : 'var(--text-2)',
      fontFamily: 'Space Mono,monospace', fontSize: '0.62rem',
      cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {copied ? <Check size={11}/> : <Copy size={11}/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ─── Bank detail table — grid so Copy never pushes to next line ─────────── */
function BankDetails({ bank }) {
  if (!bank || !bank.bankName) return (
    <div style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-3)', fontSize:'0.82rem', padding:'8px 0 16px' }}>
      Bank details not configured yet.
    </div>
  );

  const rows = [
    ['Bank Name',      bank.bankName],
    ['Account Name',   bank.accountName],
    ['Account Number', bank.accountNumber],
    ['Routing Number', bank.routingNumber],
    ['SWIFT / BIC',    bank.swiftCode],
    ['IBAN',           bank.iban],
    ['Address',        [bank.address, bank.city, bank.district, bank.country].filter(Boolean).join(', ')],
  ].filter(([,v]) => v);

  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:'18px' }}>
      {rows.map(([label, value], i) => (
        <div key={label} style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: '10px',
          padding: '11px 16px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--border-1)' : 'none',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'2px' }}>{label}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem', wordBreak:'break-word', lineHeight:1.4 }}>{value}</div>
          </div>
          <CopyBtn text={value} />
        </div>
      ))}
      {bank.notes && (
        <div style={{ padding:'10px 16px', background:'rgba(35,77,194,0.06)', borderTop:'1px solid var(--accent-border)' }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-2)' }}>{bank.notes}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Section card ─────────────────────────────────────────────────────────── */
function PayCard({ title, children }) {
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'26px', marginBottom:'14px' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--text-1)', letterSpacing:'0.04em', lineHeight:1, marginBottom:'18px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ─── Crypto icon map — exact URLs from user ─────────────────────────────── */
const CRYPTO_LOGOS = {
  btc:      'https://cdn.worldvectorlogo.com/logos/bitcoin-1.svg',
  bitcoin:  'https://cdn.worldvectorlogo.com/logos/bitcoin-1.svg',
  usdt:     'https://cdn.worldvectorlogo.com/logos/tether-usdt.svg',
  tether:   'https://cdn.worldvectorlogo.com/logos/tether-usdt.svg',
  eth:      'https://cdn.worldvectorlogo.com/logos/ethereum-1.svg',
  ethereum: 'https://cdn.worldvectorlogo.com/logos/ethereum-1.svg',
  bnb:      'https://cdn.worldvectorlogo.com/logos/binance-coin-bnb-logo.svg',
  binance:  'https://cdn.worldvectorlogo.com/logos/binance-coin-bnb-logo.svg',
  sol:      'https://cdn.worldvectorlogo.com/logos/solana-sol-logo.svg',
  solana:   'https://cdn.worldvectorlogo.com/logos/solana-sol-logo.svg',
};
function getCryptoSrc(network, iconUrl) {
  if (iconUrl) return iconUrl;
  const key = (network || '').toLowerCase().split(/[\s/_-]/)[0];
  return CRYPTO_LOGOS[key] || null;
}

/* ─── Main page ─────────────────────────────────────────────────────────────── */
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

  const t = {
    remittanceTitle: texts.remittanceTitle || 'Remittance Transfer',
    remittanceNote:  texts.remittanceNote  || 'Use your preferred remittance service to send to the BDT account above.',
    wireTitle:       texts.wireTitle       || 'International Wire',
    walletTitle:     texts.walletTitle     || 'Mobile Wallets',
    walletSubtitle:  texts.walletSubtitle  || 'Bangladesh · Instant Transfer',
    globalTitle:     texts.globalTitle     || 'Global Payment',
    globalSubtitle:  texts.globalSubtitle  || 'PayPal · Wise · Stripe · Payoneer',
    cryptoTitle:     texts.cryptoTitle     || 'Cryptocurrency',
  };

  /* ── Trust icons under heading — 8 logos, exact URLs ─────────────────── */
  const trustLogos = [
    { src: 'https://cdn.worldvectorlogo.com/logos/visa-10.svg',             alt: 'Visa' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', alt: 'Mastercard' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', alt: 'PayPal' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg', alt: 'Apple Pay' },
    { src: 'https://cdn.worldvectorlogo.com/logos/google-pay-2.svg',        alt: 'Google Pay' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', alt: 'Stripe' },
    { src: 'https://cdn.worldvectorlogo.com/logos/american-express-1.svg',  alt: 'Amex' },
    { src: 'https://cdn.worldvectorlogo.com/logos/bank-of-america-1.svg',   alt: 'Bank' },
  ];

  /* ── Remittance logos under title ────────────────────────────────────── */
  const remittanceLogos = [
    { src: 'https://cdn.worldvectorlogo.com/logos/western-union-2.svg', alt: 'Western Union' },
    { src: 'https://cdn.worldvectorlogo.com/logos/remitly.svg',         alt: 'Remitly' },
    { src: 'https://cdn.worldvectorlogo.com/logos/ria-money-transfer.svg', alt: 'Ria' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/WorldRemit_logo.svg', alt: 'WorldRemit' },
  ];

  /* ── International wire logos ────────────────────────────────────────── */
  const wireLogos = [
    { src: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', alt: 'Stripe' },
    { src: 'https://cdn.worldvectorlogo.com/logos/payoneer-1.svg',      alt: 'Payoneer' },
    { src: 'https://cdn.worldvectorlogo.com/logos/bank-of-america-1.svg', alt: 'Bank' },
    { alt: 'Mercury', special: 'mercury' },
  ];

  /* ── Online platforms ─────────────────────────────────────────────────── */
  const platforms = [
    { key: 'paypal',   name: 'PayPal',   src: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', color: '#003087' },
    { key: 'payoneer', name: 'Payoneer', src: 'https://cdn.worldvectorlogo.com/logos/payoneer-2.svg',           color: '#FF4800' },
    { key: 'stripe',   name: 'Stripe',   src: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', color: '#635BFF' },
    { key: 'wise',     name: 'Wise',     src: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/New_Wise_%28formerly_TransferWise%29_logo.svg', color: '#9FE870', textDark: true },
  ];
  const hasAnyLink = platforms.some(p => links[p.key]);

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'700px', height:'400px', background:'radial-gradient(ellipse, rgba(35,77,194,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>

        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <div className="section-label" style={{ marginBottom:'10px', justifyContent:'center', display:'flex' }}>Payment</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3.5rem,7vw,5.5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>Pay Shakil</h1>
          <p style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-2)', fontSize:'0.9rem', marginTop:'8px' }}>
            Multiple payment options available worldwide.
          </p>
        </div>

        {/* Trust logos row — exact URLs, same pill size, single horizontal line */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'32px' }}>
          <div style={{ display:'flex', gap:'7px', alignItems:'center', overflowX:'auto', flexWrap:'nowrap', scrollbarWidth:'none' }} className="scrollbar-hide">
            {trustLogos.map((l, i) => <LogoPill key={i} src={l.src} alt={l.alt} />)}
          </div>
        </div>

        {/* ── Remittance Transfer ──────────────────────────────────────── */}
        <PayCard title={t.remittanceTitle}>
          {/* Service logos immediately under title, before bank details */}
          <div style={{ marginBottom:'18px' }}>
            <LogoRow logos={remittanceLogos} />
          </div>
          <BankDetails bank={banks?.bdt} />
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', color:'var(--text-3)', lineHeight:1.6, marginTop:'4px' }}>
            {t.remittanceNote}
          </p>
        </PayCard>

        {/* ── International Wire ───────────────────────────────────────── */}
        <PayCard title={t.wireTitle}>
          {/* Service logos immediately under title */}
          <div style={{ marginBottom:'18px' }}>
            <LogoRow logos={wireLogos} />
          </div>
          <BankDetails bank={banks?.usd} />
        </PayCard>

        {/* ── Mobile Wallets — hidden if no numbers ─────────────────────── */}
        {(wallets?.bkash?.number || wallets?.nagad?.number) && (
          <PayCard title={t.walletTitle}>
            {t.walletSubtitle && (
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'16px', marginTop:'-10px' }}>
                {t.walletSubtitle}
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {wallets?.bkash?.number && (
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'12px', padding:'14px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                  <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:'#E2136E', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <img src="https://logo.clearbit.com/bkash.com" alt="bKash" width="26" height="26" style={{ objectFit:'contain' }} onError={e=>{e.target.style.display='none';e.target.parentNode.insertAdjacentHTML('beforeend','<span style="font-family:Bebas Neue,sans-serif;color:#fff;font-size:0.65rem">bKash</span>');}} />
                  </div>
                  <div>
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>bKash</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.75rem', color:'var(--text-2)', marginTop:'2px' }}>{wallets.bkash.number}</div>
                  </div>
                  <CopyBtn text={wallets.bkash.number} />
                </div>
              )}
              {wallets?.nagad?.number && (
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'12px', padding:'14px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                  <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:'linear-gradient(135deg,#F7941D,#E5621A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <img src="https://logo.clearbit.com/nagad.com.bd" alt="Nagad" width="26" height="26" style={{ objectFit:'contain' }} onError={e=>{e.target.style.display='none';e.target.parentNode.insertAdjacentHTML('beforeend','<span style="font-family:Bebas Neue,sans-serif;color:#fff;font-size:0.65rem">Nagad</span>');}} />
                  </div>
                  <div>
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>Nagad</div>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.75rem', color:'var(--text-2)', marginTop:'2px' }}>{wallets.nagad.number}</div>
                  </div>
                  <CopyBtn text={wallets.nagad.number} />
                </div>
              )}
            </div>
          </PayCard>
        )}

        {/* ── Global Payment — hidden if no links ───────────────────────── */}
        {hasAnyLink && (
          <PayCard title={t.globalTitle}>
            {t.globalSubtitle && (
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'16px', marginTop:'-10px' }}>
                {t.globalSubtitle}
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {platforms.map(p => {
                const link = links[p.key];
                if (!link) return null;
                return (
                  <div key={p.key} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'12px', padding:'14px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)' }}>
                    <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:`${p.color}18`, border:`1px solid ${p.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <img src={p.src} alt={p.name} width="26" height="20" style={{ objectFit:'contain' }} onError={e=>e.target.style.display='none'}/>
                    </div>
                    <div>
                      <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{p.name}</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'2px' }}>Tap to pay securely</div>
                    </div>
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 16px', background:p.color, color: p.textDark ? '#000' : '#fff', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.78rem', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                    >
                      Pay Now <ExternalLink size={11}/>
                    </a>
                  </div>
                );
              })}
            </div>
          </PayCard>
        )}

        {/* ── Cryptocurrency ─────────────────────────────────────────────── */}
        {cryptos.length > 0 && (
          <PayCard title={t.cryptoTitle}>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {cryptos.map(c => {
                const iconSrc = getCryptoSrc(c.network, c.iconUrl);
                return (
                  <div key={c.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', padding:'18px', display:'grid', gridTemplateColumns: c.qrImageUrl ? '1fr auto' : '1fr', gap:'16px', alignItems:'start' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                        {iconSrc && (
                          <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <img src={iconSrc} alt={c.network} width="20" height="20" style={{ objectFit:'contain' }} onError={e=>e.target.style.display='none'}/>
                          </div>
                        )}
                        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{c.network}</div>
                      </div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>Wallet Address</div>
                      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.7rem', color:'var(--text-1)', wordBreak:'break-all', background:'var(--bg-void)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'10px 12px', marginBottom:'8px', lineHeight:1.6 }}>
                        {c.address}
                      </div>
                      <CopyBtn text={c.address} />
                    </div>
                    {c.qrImageUrl && (
                      <div style={{ background:'#fff', padding:'8px', borderRadius:'var(--radius-lg)', flexShrink:0 }}>
                        <img src={c.qrImageUrl} alt="QR" style={{ width:100, height:100, display:'block' }}/>
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
