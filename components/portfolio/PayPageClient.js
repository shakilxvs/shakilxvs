'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, getPaymentCrypto, trackPageView } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, ExternalLink, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Verified working icon URLs ───────────────────────────── */
const VERIFIED_ICONS = {
  visa:           'https://cdn.simpleicons.org/visa',
  mastercard:     'https://cdn.simpleicons.org/mastercard',
  paypal:         'https://cdn.simpleicons.org/paypal',
  stripe:         'https://cdn.simpleicons.org/stripe',
  americanexpress:'https://cdn.simpleicons.org/americanexpress',
  applepay:       'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
  googlepay:      'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
  westernunion:   'https://upload.wikimedia.org/wikipedia/commons/8/8a/Western_Union_logo.svg',
  payoneer:       'https://upload.wikimedia.org/wikipedia/commons/4/44/Payoneer_logo.svg',
  wise:           'https://cdn.simpleicons.org/wise',
  bitcoin:        'https://cdn.simpleicons.org/bitcoin',
  ethereum:       'https://cdn.simpleicons.org/ethereum',
  tether:         'https://cdn.simpleicons.org/tether',
  binance:        'https://cdn.simpleicons.org/binance',
  solana:         'https://cdn.simpleicons.org/solana',
};

/* ── Logo pill ────────────────────────────────────────────── */
function LogoPill({ src, alt, invert, size = 'section' }) {
  const [err, setErr] = useState(false);
  const h = size === 'trust' ? 32 : 26;
  const p = size === 'trust' ? '5px 12px' : '4px 10px';

  // FIX: Reset error state whenever the src URL changes.
  // Without this, a previously broken logo keeps err=true even when
  // admin saves a new working URL — React reuses the same component
  // instance and never retries the new URL.
  useEffect(() => { setErr(false); }, [src]);

  return (
    <div title={alt} style={{
      height: h, padding: p,
      background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, minWidth: 36,
    }}>
      {!err && src
        ? <img
            src={src}
            alt={alt}
            crossOrigin="anonymous"
            style={{
              height: h - 12, width: 'auto', maxWidth: 80,
              objectFit: 'contain', display: 'block',
              filter: invert ? 'brightness(0) invert(1)' : 'none',
            }}
            onError={() => setErr(true)}
          />
        : <span style={{
            fontFamily: 'Space Mono,monospace', fontSize: '0.55rem',
            color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>{alt}</span>
      }
    </div>
  );
}

function LogoRow({ logos = [], size = 'section' }) {
  const active = logos.filter(l => l.active !== false);
  if (!active.length) return null;
  return (
    <div className="logo-row-scroll" style={{
      display: 'flex', gap: '6px', alignItems: 'center',
      overflowX: 'auto', flexWrap: 'nowrap',
      scrollbarWidth: 'none', msOverflowStyle: 'none',
    }}>
      {/* FIX: Stable key using url+label instead of array index.
          Index keys cause React to reuse the same component when logos change,
          carrying over the stale err=true state from a previously broken image. */}
      {active.map(l => (
        <LogoPill
          key={`${l.logoUrl || ''}__${l.label}`}
          src={l.logoUrl}
          alt={l.label}
          invert={l.invert}
          size={size}
        />
      ))}
    </div>
  );
}

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
      display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 11px',
      background: copied ? 'rgba(35,77,194,0.12)' : 'var(--bg-void)',
      border: copied ? '1px solid var(--accent-border)' : '1px solid var(--border-2)',
      borderRadius: 'var(--radius-sm)',
      color: copied ? 'var(--accent)' : 'var(--text-2)',
      fontFamily: 'Space Mono,monospace', fontSize: '0.6rem',
      cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ── Single copyable info row ─────────────────────────────── */
function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto',
      alignItems: 'center', gap: '10px', padding: '10px 16px',
      borderBottom: last ? 'none' : '1px solid var(--border-1)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'Space Mono,monospace', fontSize: '0.5rem',
          color: 'var(--text-3)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginBottom: '2px',
        }}>{label}</div>
        <div style={{
          fontFamily: 'Outfit,sans-serif', fontWeight: 600,
          color: 'var(--text-1)', fontSize: '0.875rem',
          wordBreak: 'break-word', lineHeight: 1.4,
        }}>{value}</div>
      </div>
      <CopyBtn text={value} />
    </div>
  );
}

/* ── Section label inside a bank card ────────────────────── */
function SectionLabel({ label }) {
  return (
    <div style={{
      padding: '8px 16px',
      background: 'var(--bg-overlay)',
      borderBottom: '1px solid var(--border-1)',
    }}>
      <span style={{
        fontFamily: 'Space Mono,monospace', fontSize: '0.58rem',
        color: 'var(--accent)', textTransform: 'uppercase',
        letterSpacing: '0.15em', fontWeight: 600,
      }}>{label}</span>
    </div>
  );
}

/* ── Bank details — split into Receiver's Info & Bank Info ── */
function BankDetails({ bank }) {
  if (!bank) return null;

  // ── RECEIVER'S INFO ──
  // All existing field keys preserved exactly. New fields added alongside.
  const receiverRows = [
    ["Receiver's Full Name", bank.accountName],       // existing key: accountName
    ['Email',                bank.receiverEmail],
    ['Phone',                bank.receiverPhone],
    ['Date of Birth',        bank.receiverDob],
    ['Nationality',          bank.receiverNationality],
    ['ID Type',              bank.receiverIdType],
    ['ID Number',            bank.receiverIdNumber],
    ['Street Address',       bank.address],           // existing key: address
    ['City',                 bank.city],              // existing key: city
    ['District',             bank.district],          // existing key: district
    ['State / Province',     bank.state],             // existing key: state
    ['Postal / ZIP',         bank.postalCode],        // existing key: postalCode
    ['Country',              bank.country],           // existing key: country
  ].filter(([, v]) => v);

  // Option B: separate custom fields for receiver
  const receiverCustom = (bank.receiverCustomFields || []).filter(f => f.label && f.value);
  const hasReceiver = receiverRows.length > 0 || receiverCustom.length > 0;

  // ── BANK INFO ──
  const bankRows = [
    ['Bank Name',       bank.bankName],               // existing key: bankName
    ['Branch Name',     bank.branchName],             // existing key: branchName
    ['Branch Address',  bank.branchAddress],
    ['City',            bank.bankCity],
    ['District',        bank.bankDistrict],
    ['State / Province',bank.bankState],
    ['Postal / ZIP',    bank.bankPostalCode],
    ['Country',         bank.bankCountry],
    ['Account Number',  bank.accountNumber],          // existing key: accountNumber
    ['Account Type',    bank.accountType],
    ['IBAN',            bank.iban],                   // existing key: iban
    ['Routing Number',  bank.routingNumber],          // existing key: routingNumber
    ['SWIFT / BIC',     bank.swiftCode],              // existing key: swiftCode
    ['Currency',        bank.currency],
  ].filter(([, v]) => v);

  // Option B: existing customFields key kept as bank custom fields (backward compatible)
  const bankCustom = (bank.customFields || []).filter(f => f.label && f.value);
  const hasNotes = !!bank.notes;
  const hasBank = bankRows.length > 0 || bankCustom.length > 0 || hasNotes;

  // If both sections are empty, show placeholder
  if (!hasReceiver && !hasBank) {
    return (
      <div style={{
        fontFamily: 'Outfit,sans-serif', color: 'var(--text-3)',
        fontSize: '0.82rem', padding: '8px 0 12px',
      }}>
        Bank details not configured yet.
      </div>
    );
  }

  const cardStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-1)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '12px',
  };

  return (
    <>
      {/* ── RECEIVER'S INFO — only shown if any receiver field is filled ── */}
      {hasReceiver && (
        <div style={cardStyle}>
          <SectionLabel label="Receiver's Info" />
          {receiverRows.map(([label, value], i) => (
            <InfoRow
              key={label}
              label={label}
              value={value}
              last={i === receiverRows.length - 1 && receiverCustom.length === 0}
            />
          ))}
          {receiverCustom.map((field, i) => (
            <InfoRow
              key={`rc-${i}`}
              label={field.label}
              value={field.value}
              last={i === receiverCustom.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── BANK INFO — only shown if any bank field is filled ── */}
      {hasBank && (
        <div style={cardStyle}>
          <SectionLabel label="Bank Info" />
          {bankRows.map(([label, value], i) => (
            <InfoRow
              key={label}
              label={label}
              value={value}
              last={i === bankRows.length - 1 && bankCustom.length === 0 && !hasNotes}
            />
          ))}
          {bankCustom.map((field, i) => (
            <InfoRow
              key={`bc-${i}`}
              label={field.label}
              value={field.value}
              last={i === bankCustom.length - 1 && !hasNotes}
            />
          ))}
          {hasNotes && (
            <div style={{
              padding: '10px 16px',
              background: 'rgba(35,77,194,0.06)',
              borderTop: '1px solid var(--accent-border)',
            }}>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.8rem', color: 'var(--text-2)' }}>{bank.notes}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ── Accordion ────────────────────────────────────────────── */
function Accordion({ title, teaserLogos = [], isOpen, onToggle, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-xl)', marginBottom: '10px', overflow: 'hidden',
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', cursor: 'pointer', gap: '12px', userSelect: 'none',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.3rem',
            color: 'var(--text-1)', letterSpacing: '0.04em', lineHeight: 1,
            marginBottom: teaserLogos.length ? '8px' : '0',
          }}>{title}</div>
          {teaserLogos.filter(l => l.active !== false).length > 0 && (
            <LogoRow logos={teaserLogos} size="section" />
          )}
        </div>
        <div style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease', color: 'var(--text-3)', flexShrink: 0,
        }}>
          <ChevronDown size={18} />
        </div>
      </div>
      <div style={{
        maxHeight: isOpen ? '3000px' : '0', opacity: isOpen ? 1 : 0,
        overflow: 'hidden', transition: 'max-height 0.32s ease, opacity 0.25s ease',
      }}>
        <div style={{ padding: '0 22px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Crypto logo detection ────────────────────────────────── */
const CRYPTO_MAP = {
  btc: 'https://cdn.simpleicons.org/bitcoin',   bitcoin: 'https://cdn.simpleicons.org/bitcoin',
  usdt: 'https://cdn.simpleicons.org/tether',   tether: 'https://cdn.simpleicons.org/tether',
  trc20: 'https://cdn.simpleicons.org/tether',  erc20: 'https://cdn.simpleicons.org/tether',
  eth: 'https://cdn.simpleicons.org/ethereum',  ethereum: 'https://cdn.simpleicons.org/ethereum',
  bnb: 'https://cdn.simpleicons.org/binance',   binance: 'https://cdn.simpleicons.org/binance', bsc: 'https://cdn.simpleicons.org/binance',
  sol: 'https://cdn.simpleicons.org/solana',    solana: 'https://cdn.simpleicons.org/solana',
  trx: 'https://cdn.simpleicons.org/tron',      tron: 'https://cdn.simpleicons.org/tron',
  matic: 'https://cdn.simpleicons.org/polygon', polygon: 'https://cdn.simpleicons.org/polygon',
  ltc: 'https://cdn.simpleicons.org/litecoin',  litecoin: 'https://cdn.simpleicons.org/litecoin',
  xrp: 'https://cdn.simpleicons.org/xrp',       ripple: 'https://cdn.simpleicons.org/xrp',
  doge: 'https://cdn.simpleicons.org/dogecoin', dogecoin: 'https://cdn.simpleicons.org/dogecoin',
};
function getCryptoSrc(network, iconUrl) {
  if (iconUrl) return iconUrl;
  const words = (network || '').toLowerCase().split(/[\s/_\-]+/);
  for (const w of words) if (CRYPTO_MAP[w]) return CRYPTO_MAP[w];
  return null;
}

/* ── Default logos (fallback if Firestore empty) ─────────── */
const DEF = {
  trustLogos: [
    { label: 'Visa',       logoUrl: VERIFIED_ICONS.visa,            invert: false, active: true },
    { label: 'Mastercard', logoUrl: VERIFIED_ICONS.mastercard,      invert: false, active: true },
    { label: 'PayPal',     logoUrl: VERIFIED_ICONS.paypal,          invert: false, active: true },
    { label: 'Apple Pay',  logoUrl: VERIFIED_ICONS.applepay,        invert: false, active: true },
    { label: 'Google Pay', logoUrl: VERIFIED_ICONS.googlepay,       invert: false, active: true },
    { label: 'Stripe',     logoUrl: VERIFIED_ICONS.stripe,          invert: true,  active: true },
    { label: 'Amex',       logoUrl: VERIFIED_ICONS.americanexpress, invert: false, active: true },
  ],
  remittanceLogos: [
    { label: 'Western Union', logoUrl: VERIFIED_ICONS.westernunion, invert: false, active: true },
    { label: 'Wise',          logoUrl: VERIFIED_ICONS.wise,         invert: false, active: true },
    { label: 'Remitly',       logoUrl: null,                        invert: false, active: true },
  ],
  wireLogos: [
    { label: 'Stripe',   logoUrl: VERIFIED_ICONS.stripe,   invert: true,  active: true },
    { label: 'Payoneer', logoUrl: VERIFIED_ICONS.payoneer, invert: false, active: true },
    { label: 'Wise',     logoUrl: VERIFIED_ICONS.wise,     invert: false, active: true },
  ],
  walletLogos: [
    { label: 'bKash', logoUrl: null, invert: false, active: true },
    { label: 'Nagad',  logoUrl: null, invert: false, active: true },
  ],
  globalLogos: [
    { label: 'PayPal',   logoUrl: VERIFIED_ICONS.paypal,   invert: false, active: true },
    { label: 'Wise',     logoUrl: VERIFIED_ICONS.wise,     invert: false, active: true },
    { label: 'Stripe',   logoUrl: VERIFIED_ICONS.stripe,   invert: true,  active: true },
    { label: 'Payoneer', logoUrl: VERIFIED_ICONS.payoneer, invert: false, active: true },
  ],
  cryptoLogos: [
    { label: 'Bitcoin',  logoUrl: VERIFIED_ICONS.bitcoin,  invert: false, active: true },
    { label: 'Ethereum', logoUrl: VERIFIED_ICONS.ethereum, invert: false, active: true },
    { label: 'USDT',     logoUrl: VERIFIED_ICONS.tether,   invert: false, active: true },
    { label: 'BNB',      logoUrl: VERIFIED_ICONS.binance,  invert: false, active: true },
    { label: 'Solana',   logoUrl: VERIFIED_ICONS.solana,   invert: false, active: true },
  ],
};

const PLATFORMS = [
  { key: 'paypal',   name: 'PayPal',   logoUrl: VERIFIED_ICONS.paypal,   invert: false },
  { key: 'payoneer', name: 'Payoneer', logoUrl: VERIFIED_ICONS.payoneer, invert: false },
  { key: 'stripe',   name: 'Stripe',   logoUrl: VERIFIED_ICONS.stripe,   invert: true  },
  { key: 'wise',     name: 'Wise',     logoUrl: VERIFIED_ICONS.wise,     invert: false },
];
function getPD(links, key) {
  const r = links[key];
  if (!r) return {};
  if (typeof r === 'string') return { link: r, paymentHandle: '', instructions: '' };
  return r;
}

export default function PayPageClient() {
  const [banks,   setBanks]   = useState(null);
  const [wallets, setWallets] = useState(null);
  const [links,   setLinks]   = useState({});
  const [cryptos, setCryptos] = useState([]);
  const [texts,   setTexts]   = useState({});
  const [logos,   setLogos]   = useState(DEF);
  const [open,    setOpen]    = useState({ remittance: true, wire: false, wallets: false, global: false, crypto: false });
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  // FIX: trackPageView once here in main component, NOT inside LogoPill.
  // LogoPill previously fired this once per logo pill = 7–15 events per page load.
  useEffect(() => { trackPageView('pay'); }, []);

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('paymentBanks'),
      getPortfolioDoc('paymentWallets'),
      getPortfolioDoc('paymentLinks'),
      getPaymentCrypto(),
      getPortfolioDoc('paymentTexts'),
      getPortfolioDoc('paymentLogos'),
    ]).then(([b, w, l, c, t, lg]) => {
      if (b) setBanks(b);
      if (w) setWallets(w);
      if (l) setLinks(l);
      if (c) setCryptos(c.filter(x => x.active !== false));
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
    remittanceTitle: texts.remittanceTitle || 'Remittance Transfer',
    remittanceNote:  texts.remittanceNote  || 'Use your preferred remittance service to send to the BDT account.',
    wireTitle:       texts.wireTitle       || 'International Wire',
    walletTitle:     texts.walletTitle     || 'Mobile Wallets',
    walletSubtitle:  texts.walletSubtitle  || 'Bangladesh · Instant Transfer',
    globalTitle:     texts.globalTitle     || 'Global Payment',
    globalSubtitle:  texts.globalSubtitle  || 'PayPal · Wise · Stripe · Payoneer',
    cryptoTitle:     texts.cryptoTitle     || 'Cryptocurrency',
  };

  const hasAnyPlatform = PLATFORMS.some(p => { const d = getPD(links, p.key); return d.link || d.paymentHandle; });

  return (
    <>
    <style>{`.logo-row-scroll::-webkit-scrollbar{display:none}`}</style>
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse,rgba(35,77,194,0.07) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="section-label" style={{ marginBottom: '10px', justifyContent: 'center', display: 'flex' }}>Payment</div>
          <h1 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(3.5rem,7vw,5.5rem)', color: 'var(--text-1)', letterSpacing: '0.02em', lineHeight: 1 }}>Pay Shakil</h1>
          <p style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--text-2)', fontSize: '0.9rem', marginTop: '8px' }}>Multiple payment options worldwide.</p>
        </div>

        {/* Trust logos */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px', overflowX: 'auto' }}>
          <LogoRow logos={logos.trustLogos} size="trust" />
        </div>

        {/* Remittance */}
        <Accordion title={tx.remittanceTitle} teaserLogos={logos.remittanceLogos} isOpen={open.remittance} onToggle={() => toggle('remittance')}>
          <BankDetails bank={banks?.bdt} />
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.7 }}>{tx.remittanceNote}</p>
        </Accordion>

        {/* Wire */}
        <Accordion title={tx.wireTitle} teaserLogos={logos.wireLogos} isOpen={open.wire} onToggle={() => toggle('wire')}>
          <BankDetails bank={banks?.usd} />
        </Accordion>

        {/* Mobile Wallets */}
        {(wallets?.bkash?.number || wallets?.nagad?.number) && (
          <Accordion title={tx.walletTitle} teaserLogos={logos.walletLogos} isOpen={open.wallets} onToggle={() => toggle('wallets')}>
            {tx.walletSubtitle && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.55rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>{tx.walletSubtitle}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[{ key: 'bkash', label: 'bKash', color: '#E2136E' }, { key: 'nagad', label: 'Nagad', color: '#F7941D' }].map(({ key, label, color }) => {
                const num = wallets[key]?.number; if (!num) return null;
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '0.6rem', color: '#fff', letterSpacing: '0.03em' }}>{label}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9rem' }}>{label}</div>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '2px' }}>{num}</div>
                    </div>
                    <CopyBtn text={num} />
                  </div>
                );
              })}
            </div>
          </Accordion>
        )}

        {/* Global Payment */}
        {hasAnyPlatform && (
          <Accordion title={tx.globalTitle} teaserLogos={logos.globalLogos} isOpen={open.global} onToggle={() => toggle('global')}>
            {tx.globalSubtitle && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.55rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>{tx.globalSubtitle}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PLATFORMS.map(p => {
                const d = getPD(links, p.key); if (!d.link && !d.paymentHandle) return null;
                return (
                  <div key={p.key} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.logoUrl
                        ? <img src={p.logoUrl} alt={p.name} style={{ height: 22, width: 'auto', maxWidth: 60, objectFit: 'contain', filter: p.invert ? 'brightness(0) invert(1)' : 'none' }} onError={e => e.target.style.display = 'none'} />
                        : <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{p.name[0]}</span>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9rem' }}>{p.name}</div>
                      {d.paymentHandle && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.62rem', color: 'var(--text-2)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.paymentHandle}</div>}
                      {d.instructions && <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '2px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.instructions}</div>}
                    </div>
                    {d.link
                      ? <a href={d.link} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-3)', color: 'var(--text-1)', borderRadius: 'var(--radius-sm)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'border-color 0.15s,color 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                        >Pay Now <ExternalLink size={11} /></a>
                      : d.paymentHandle ? <CopyBtn text={d.paymentHandle} /> : null
                    }
                  </div>
                );
              })}
            </div>
          </Accordion>
        )}

        {/* Crypto */}
        {cryptos.length > 0 && (
          <Accordion title={tx.cryptoTitle} teaserLogos={logos.cryptoLogos} isOpen={open.crypto} onToggle={() => toggle('crypto')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cryptos.map(c => {
                const src = getCryptoSrc(c.network, c.iconUrl);
                return (
                  <div key={c.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)', padding: '18px', display: 'grid', gridTemplateColumns: c.qrImageUrl ? '1fr auto' : '1fr', gap: '16px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        {src && <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={src} alt={c.network} width="22" height="22" style={{ objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                        </div>}
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9rem' }}>{c.network}</div>
                      </div>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.5rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Wallet Address</div>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.7rem', color: 'var(--text-1)', wordBreak: 'break-all', background: 'var(--bg-void)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: '8px', lineHeight: 1.6 }}>{c.address}</div>
                      <CopyBtn text={c.address} />
                    </div>
                    {c.qrImageUrl && <div style={{ background: '#fff', padding: '8px', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}><img src={c.qrImageUrl} alt="QR" style={{ width: 96, height: 96, display: 'block' }} /></div>}
                  </div>
                );
              })}
            </div>
          </Accordion>
        )}

      </div>
    </div>
    </>
  );
}
