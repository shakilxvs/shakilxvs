'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, getPaymentCrypto } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Copy Button ─────────────────────────────────────────── */
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
      padding: '7px 14px',
      background: copied ? 'rgba(35,77,194,0.1)' : 'var(--bg-elevated)',
      border: copied ? '1px solid var(--accent-border)' : '1px solid var(--border-2)',
      borderRadius: 'var(--radius-sm)',
      color: copied ? 'var(--accent)' : 'var(--text-2)',
      fontFamily: 'Space Mono, monospace', fontSize: '0.65rem',
      cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
      whiteSpace: 'nowrap',
    }}>
      {copied ? <Check size={12}/> : <Copy size={12}/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ─── Card wrapper ────────────────────────────────────────── */
function PayCard({ title, subtitle, icon, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-xl)',
      padding: '32px',
      marginBottom: '20px',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          {icon && <span style={{ fontSize: '1.4rem' }}>{icon}</span>}
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem', color: 'var(--text-1)', letterSpacing: '0.04em' }}>{title}</div>
        </div>
        {subtitle && <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

/* ─── Bank detail rows ───────────────────────────────────── */
function BankDetails({ bank }) {
  if (!bank) return (
    <div style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--text-3)', fontSize: '0.85rem', padding: '12px 0' }}>
      Bank details not configured yet.
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
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '20px' }}>
      {rows.map(([label, value], i) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 18px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--border-1)' : 'none',
          gap: '12px', flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.56rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, color: 'var(--text-1)', fontSize: '0.92rem', wordBreak: 'break-all' }}>{value}</div>
          </div>
          <CopyBtn text={value} />
        </div>
      ))}
      {bank.notes && (
        <div style={{ padding: '12px 18px', background: 'rgba(35,77,194,0.06)', borderTop: '1px solid var(--accent-border)' }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.82rem', color: 'var(--text-2)' }}>{bank.notes}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Service icon badge ─────────────────────────────────── */
function ServiceBadge({ name, logoUrl, color, link, showLink }) {
  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 14px',
      background: link && showLink ? `${color}18` : 'var(--bg-elevated)',
      border: `1px solid ${link && showLink ? color + '35' : 'var(--border-2)'}`,
      borderRadius: 'var(--radius-md)',
      color: link && showLink ? color : 'var(--text-2)',
      fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem',
      whiteSpace: 'nowrap',
      transition: 'all 0.15s ease',
    }}>
      {logoUrl && (
        <img
          src={logoUrl}
          alt={name}
          width="18"
          height="18"
          style={{ objectFit: 'contain', borderRadius: '3px', flexShrink: 0 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      {name}
      {link && showLink && <ExternalLink size={11} />}
    </div>
  );

  if (link && showLink) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.firstChild.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.firstChild.style.opacity = '1'}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

/* ─── Remittance services (hardcoded with links from Firestore) ── */
const REMITTANCE_SERVICES = [
  { key: 'westernUnion', name: 'Western Union', color: '#FFCD00', logo: 'https://logo.clearbit.com/westernunion.com' },
  { key: 'ria',          name: 'Ria',           color: '#FF6B00', logo: 'https://logo.clearbit.com/riamoneytransfer.com' },
  { key: 'remitly',      name: 'Remitly',       color: '#4C84FF', logo: 'https://logo.clearbit.com/remitly.com' },
  { key: 'taptap',       name: 'TapTap Send',   color: '#8B5CF6', logo: 'https://logo.clearbit.com/taptapsend.com' },
  { key: 'worldremit',   name: 'WorldRemit',    color: '#1B8EF2', logo: 'https://logo.clearbit.com/worldremit.com' },
];

/* ─── Wire / business services ───────────────────────────── */
const WIRE_SERVICES = [
  { key: 'mercury',   name: 'Mercury',   color: '#2563EB', logo: 'https://logo.clearbit.com/mercury.com' },
  { key: 'stripe',    name: 'Stripe',    color: '#635BFF', logo: 'https://logo.clearbit.com/stripe.com' },
  { key: 'payoneer',  name: 'Payoneer',  color: '#FF4800', logo: 'https://logo.clearbit.com/payoneer.com' },
  { key: 'wise',      name: 'Wise',      color: '#9FE870', logo: 'https://logo.clearbit.com/wise.com' },
];

/* ─── Online platforms (hardcoded, links from Firestore) ─── */
const ONLINE_PLATFORMS = [
  { key: 'paypal',   name: 'PayPal',   color: '#003087', accent: '#009CDE', logo: 'https://logo.clearbit.com/paypal.com' },
  { key: 'wise',     name: 'Wise',     color: '#9FE870', accent: '#9FE870', logo: 'https://logo.clearbit.com/wise.com',    darkText: true },
  { key: 'stripe',   name: 'Stripe',   color: '#635BFF', accent: '#7C74FF', logo: 'https://logo.clearbit.com/stripe.com' },
  { key: 'payoneer', name: 'Payoneer', color: '#FF4800', accent: '#FF6B35', logo: 'https://logo.clearbit.com/payoneer.com' },
];

/* ─── Crypto icons ───────────────────────────────────────── */
const CRYPTO_ICONS = {
  btc:    { color: '#F7931A', icon: 'https://cdn.simpleicons.org/bitcoin/F7931A' },
  eth:    { color: '#627EEA', icon: 'https://cdn.simpleicons.org/ethereum/627EEA' },
  usdt:   { color: '#26A17B', icon: 'https://cdn.simpleicons.org/tether/26A17B' },
  usdc:   { color: '#2775CA', icon: 'https://cdn.simpleicons.org/usdcoin/2775CA' },
  bnb:    { color: '#F3BA2F', icon: 'https://cdn.simpleicons.org/binance/F3BA2F' },
  sol:    { color: '#9945FF', icon: 'https://cdn.simpleicons.org/solana/9945FF' },
  trx:    { color: '#EF0027', icon: 'https://cdn.simpleicons.org/tron/EF0027' },
  matic:  { color: '#8247E5', icon: 'https://cdn.simpleicons.org/polygon/8247E5' },
};

function getCryptoIcon(network) {
  const lower = (network || '').toLowerCase();
  if (lower.includes('bitcoin') || lower.includes('btc'))  return CRYPTO_ICONS.btc;
  if (lower.includes('ethereum') || lower.includes('eth')) return CRYPTO_ICONS.eth;
  if (lower.includes('usdt') || lower.includes('tether'))  return CRYPTO_ICONS.usdt;
  if (lower.includes('usdc'))                              return CRYPTO_ICONS.usdc;
  if (lower.includes('bnb') || lower.includes('binance'))  return CRYPTO_ICONS.bnb;
  if (lower.includes('sol') || lower.includes('solana'))   return CRYPTO_ICONS.sol;
  if (lower.includes('trx') || lower.includes('tron'))     return CRYPTO_ICONS.trx;
  if (lower.includes('matic') || lower.includes('polygon')) return CRYPTO_ICONS.matic;
  return null;
}

/* ─── Trust icon row ─────────────────────────────────────── */
function TrustIcons() {
  const TRUST = [
    { label: 'Visa',       color: '#1A1F71', logo: 'https://logo.clearbit.com/visa.com' },
    { label: 'Mastercard', color: '#EB001B', logo: 'https://logo.clearbit.com/mastercard.com' },
    { label: 'PayPal',     color: '#009CDE', logo: 'https://logo.clearbit.com/paypal.com' },
    { label: 'Stripe',     color: '#635BFF', logo: 'https://logo.clearbit.com/stripe.com' },
    { label: 'Wire',       color: '#2563EB', logo: null },
    { label: 'Crypto',     color: '#F7931A', logo: 'https://cdn.simpleicons.org/bitcoin/F7931A' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
      {TRUST.map(({ label, color, logo }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 14px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-2)', fontFamily: 'Outfit,sans-serif', fontSize: '0.78rem', fontWeight: 600,
        }}>
          {logo ? (
            <img src={logo} alt={label} width="16" height="16" style={{ objectFit: 'contain', borderRadius: '2px' }} onError={e => e.target.style.display = 'none'} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          )}
          {label}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Pay Page ──────────────────────────────────────── */
export default function PayPage() {
  const [banks, setBanks]       = useState(null);
  const [wallets, setWallets]   = useState(null);
  const [links, setLinks]       = useState({});
  const [cryptos, setCryptos]   = useState([]);

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('paymentBanks'),
      getPortfolioDoc('paymentWallets'),
      getPortfolioDoc('paymentLinks'),
      getPaymentCrypto(),
    ]).then(([b, w, l, c]) => {
      if (b) setBanks(b);
      if (w) setWallets(w);
      if (l) setLinks(l);
      if (c) setCryptos(c.filter(x => x.active !== false));
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(35,77,194,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div className="section-label" style={{ marginBottom: '12px', justifyContent: 'center', display: 'flex' }}>Payment</div>
          <h1 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(3.5rem,7vw,5.5rem)', color: 'var(--text-1)', letterSpacing: '0.02em', lineHeight: 1 }}>
            Pay Shakil
          </h1>
          <p style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--text-2)', fontSize: '0.95rem', marginTop: '12px', lineHeight: 1.6 }}>
            Multiple payment options available worldwide. Choose what works for you.
          </p>
        </div>

        {/* Trust icons row */}
        <TrustIcons />

        {/* ── Group 1: Remittance ───────────────────────────── */}
        <PayCard title="Remittance Transfer" subtitle="Western Union · Ria · Remitly · TapTap & more">
          <BankDetails bank={banks?.bdt} />

          {/* Remittance service badges — single line, nowrap */}
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Send via any of these services:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {REMITTANCE_SERVICES.map(svc => (
                <ServiceBadge
                  key={svc.key}
                  name={svc.name}
                  logoUrl={svc.logo}
                  color={svc.color}
                  link={links[svc.key]}
                  showLink={!!links[svc.key]}
                />
              ))}
            </div>
          </div>
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '16px' }}>
            Use your preferred remittance service to send to the BDT account above.
          </p>
        </PayCard>

        {/* ── Group 2: International Wire ───────────────────── */}
        <PayCard title="International Wire" subtitle="USD · SWIFT · ACH · Mercury · Business Payments">
          <BankDetails bank={banks?.usd} />

          <div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Compatible with:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {WIRE_SERVICES.map(svc => (
                <ServiceBadge
                  key={svc.key}
                  name={svc.name}
                  logoUrl={svc.logo}
                  color={svc.color}
                  link={links[svc.key]}
                  showLink={!!links[svc.key]}
                />
              ))}
            </div>
          </div>
        </PayCard>

        {/* ── Group 3: Mobile Wallets ───────────────────────── */}
        <PayCard title="Mobile Wallets" subtitle="Bangladesh · Instant Transfer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* bKash */}
            {wallets?.bkash?.number && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#E2136E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Bebas Neue,sans-serif', color: '#fff', fontSize: '0.75rem', letterSpacing: '0.05em' }}>bKash</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.95rem' }}>bKash</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '2px' }}>{wallets.bkash.number}</div>
                  </div>
                </div>
                <CopyBtn text={wallets.bkash.number} />
              </div>
            )}

            {/* Nagad */}
            {wallets?.nagad?.number && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #F7941D, #E5621A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Bebas Neue,sans-serif', color: '#fff', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Nagad</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.95rem' }}>Nagad</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '2px' }}>{wallets.nagad.number}</div>
                  </div>
                </div>
                <CopyBtn text={wallets.nagad.number} />
              </div>
            )}

            {!wallets?.bkash?.number && !wallets?.nagad?.number && (
              <div style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--text-3)', fontSize: '0.85rem' }}>Wallet numbers not configured yet.</div>
            )}
          </div>
        </PayCard>

        {/* ── Group 4: Online Platforms ─────────────────────── */}
        <PayCard title="Online Platforms" subtitle="PayPal · Wise · Stripe · Payoneer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ONLINE_PLATFORMS.map(platform => {
              const link = links[platform.key];
              if (!link && links[platform.key] === '') return null;
              return (
                <div key={platform.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-1)',
                  borderRadius: 'var(--radius-lg)', gap: '12px', flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${platform.color}20`, border: `1px solid ${platform.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={platform.logo} alt={platform.name} width="26" height="26" style={{ objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.95rem' }}>{platform.name}</div>
                      {link && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '2px' }}>Tap to pay securely</div>}
                    </div>
                  </div>
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '9px 20px',
                      background: platform.color, color: platform.darkText ? '#000' : '#fff',
                      borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif',
                      fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                      whiteSpace: 'nowrap', transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      Pay Now <ExternalLink size={13}/>
                    </a>
                  ) : (
                    <span style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', padding: '9px 16px', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)' }}>
                      Link not set
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </PayCard>

        {/* ── Group 5: Cryptocurrency ───────────────────────── */}
        {cryptos.length > 0 && (
          <PayCard title="Cryptocurrency" subtitle="Secure · Borderless · Instant">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cryptos.map(c => {
                const detected = getCryptoIcon(c.network);
                const iconSrc  = c.iconUrl || detected?.icon;
                const iconColor = detected?.color || '#234DC2';

                return (
                  <div key={c.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'grid', gridTemplateColumns: c.qrImageUrl ? '1fr auto' : '1fr', gap: '20px', alignItems: 'start' }}>
                    <div>
                      {/* Network header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        {iconSrc && (
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${iconColor}20`, border: `1px solid ${iconColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={iconSrc} alt={c.network} width="22" height="22" style={{ objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                          </div>
                        )}
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-1)', fontSize: '0.95rem' }}>{c.network}</div>
                      </div>

                      {/* Address */}
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Wallet Address</div>
                      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.75rem', color: 'var(--text-1)', wordBreak: 'break-all', background: 'var(--bg-void)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '10px', lineHeight: 1.6 }}>
                        {c.address}
                      </div>
                      <CopyBtn text={c.address} />
                    </div>

                    {c.qrImageUrl && (
                      <div style={{ background: '#fff', padding: '10px', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
                        <img src={c.qrImageUrl} alt="QR" style={{ width: 110, height: 110, display: 'block' }} />
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
