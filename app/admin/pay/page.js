'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc, getPaymentCrypto, addPaymentCrypto, updatePaymentCrypto, deletePaymentCrypto } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

/* ─── Shared styles ─────────────────────────────────────────── */
const fi    = { width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)', color: 'var(--text-1)', fontFamily: 'Outfit,sans-serif', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const lb    = { fontFamily: 'Space Mono,monospace', fontSize: '0.6rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', display: 'block' };
const cd    = { background: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px' };
const hd    = { fontFamily: 'Bebas Neue,sans-serif', fontSize: '1.15rem', color: 'var(--text-1)', letterSpacing: '0.05em' };
const focus = e => e.target.style.borderColor = 'var(--accent-border)';
const blur  = e => e.target.style.borderColor = 'var(--border-2)';

/* ─── Default logo arrays ───────────────────────────────────── */
const DEFAULTS = {
  trustLogos: [
    { label: 'Visa',       logoUrl: 'https://cdn.simpleicons.org/visa',            invert: false, active: true },
    { label: 'Mastercard', logoUrl: 'https://cdn.simpleicons.org/mastercard',      invert: false, active: true },
    { label: 'PayPal',     logoUrl: 'https://cdn.simpleicons.org/paypal',          invert: false, active: true },
    { label: 'Apple Pay',  logoUrl: 'https://cdn.simpleicons.org/applepay',        invert: true,  active: true },
    { label: 'Google Pay', logoUrl: 'https://cdn.simpleicons.org/googlepay',       invert: false, active: true },
    { label: 'Stripe',     logoUrl: 'https://cdn.simpleicons.org/stripe',          invert: true,  active: true },
    { label: 'Amex',       logoUrl: 'https://cdn.simpleicons.org/americanexpress', invert: false, active: true },
  ],
  remittanceLogos: [
    { label: 'Western Union', logoUrl: 'https://cdn.simpleicons.org/westernunion', invert: true,  active: true },
    { label: 'Remitly',       logoUrl: 'https://cdn.simpleicons.org/remitly',      invert: false, active: true },
    { label: 'Ria',           logoUrl: 'https://cdn.simpleicons.org/ria',          invert: false, active: true },
    { label: 'WorldRemit',    logoUrl: 'https://cdn.simpleicons.org/worldremit',   invert: false, active: true },
  ],
  wireLogos: [
    { label: 'Stripe',   logoUrl: 'https://cdn.simpleicons.org/stripe',   invert: true,  active: true },
    { label: 'Payoneer', logoUrl: 'https://cdn.simpleicons.org/payoneer', invert: false, active: true },
  ],
  walletLogos: [
    { label: 'bKash', logoUrl: 'https://cdn.simpleicons.org/bkash', invert: false, active: true },
  ],
  globalLogos: [
    { label: 'PayPal',   logoUrl: 'https://cdn.simpleicons.org/paypal',   invert: false, active: true },
    { label: 'Wise',     logoUrl: 'https://cdn.simpleicons.org/wise',     invert: false, active: true },
    { label: 'Stripe',   logoUrl: 'https://cdn.simpleicons.org/stripe',   invert: true,  active: true },
    { label: 'Payoneer', logoUrl: 'https://cdn.simpleicons.org/payoneer', invert: false, active: true },
  ],
  cryptoLogos: [
    { label: 'Bitcoin',  logoUrl: 'https://cdn.simpleicons.org/bitcoin',  invert: false, active: true },
    { label: 'Ethereum', logoUrl: 'https://cdn.simpleicons.org/ethereum', invert: false, active: true },
    { label: 'Tether',   logoUrl: 'https://cdn.simpleicons.org/tether',   invert: false, active: true },
    { label: 'BNB',      logoUrl: 'https://cdn.simpleicons.org/binance',  invert: false, active: true },
    { label: 'Solana',   logoUrl: 'https://cdn.simpleicons.org/solana',   invert: false, active: true },
  ],
};

/* ─── Logo List Manager ────────────────────────────────────── */
function LogoListManager({ title, description, items, onChange }) {
  const addItem  = () => onChange([...items, { label: '', logoUrl: '', invert: false, active: true }]);
  const delItem  = (i) => onChange(items.filter((_, idx) => idx !== i));
  const setField = (i, k, v) => onChange(items.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.62rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{title}</div>
          {description && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.55rem', color: 'var(--text-3)', marginTop: '2px' }}>{description}</div>}
        </div>
        <button onClick={addItem} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-2)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', fontFamily: 'Outfit,sans-serif', fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0 }}>
          <Plus size={11} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '8px', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <label style={{ ...lb, marginBottom: '2px' }}>Label</label>
              <input style={fi} value={item.label || ''} onChange={e => setField(i, 'label', e.target.value)} onFocus={focus} onBlur={blur} placeholder="Visa" />
            </div>
            <div>
              <label style={{ ...lb, marginBottom: '2px' }}>Logo URL</label>
              <input style={fi} value={item.logoUrl || ''} onChange={e => setField(i, 'logoUrl', e.target.value)} onFocus={focus} onBlur={blur} placeholder="https://..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.72rem', color: 'var(--text-3)', whiteSpace: 'nowrap', paddingTop: '16px' }}>
              <input type="checkbox" checked={item.invert || false} onChange={e => setField(i, 'invert', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Invert
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.72rem', color: 'var(--text-3)', whiteSpace: 'nowrap', paddingTop: '16px' }}>
              <input type="checkbox" checked={item.active !== false} onChange={e => setField(i, 'active', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Active
            </label>
            <button onClick={() => delItem(i)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', paddingTop: '22px' }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {items.length === 0 && <div style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--text-3)', fontSize: '0.82rem', textAlign: 'center', padding: '12px' }}>No logos yet — click Add.</div>}
      </div>
      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.54rem', color: 'var(--text-3)', marginTop: '6px' }}>
        Paste any image URL — Cloudinary, Wikipedia, or direct logo URLs all work
      </div>
    </div>
  );
}

/* ─── Custom fields sub-editor ─────────────────────────────── */
function CustomFieldsEditor({ label, fields, onAdd, onDel, onSet }) {
  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
        <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-2)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', fontFamily: 'Outfit,sans-serif', fontSize: '0.72rem', cursor: 'pointer' }}>
          <Plus size={11} /> Add Field
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(fields || []).map((field, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
            <div><label style={lb}>Field Label</label><input style={fi} value={field.label || ''} onChange={e => onSet(i, 'label', e.target.value)} onFocus={focus} onBlur={blur} placeholder="Reference Number" /></div>
            <div><label style={lb}>Value</label><input style={fi} value={field.value || ''} onChange={e => onSet(i, 'value', e.target.value)} onFocus={focus} onBlur={blur} placeholder="ABC123" /></div>
            <button onClick={() => onDel(i)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '10px 6px' }}><Trash2 size={13} /></button>
          </div>
        ))}
        {(fields || []).length === 0 && (
          <div style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--text-3)', fontSize: '0.78rem' }}>No custom fields. Click &quot;Add Field&quot; to add extras.</div>
        )}
      </div>
    </div>
  );
}

/* ─── EMPTY_BANK — all existing keys preserved, new keys added ── */
const EMPTY_BANK = {
  // ── Existing keys — DO NOT rename, Firestore data depends on these ──
  bankName: '', branchName: '', accountName: '', accountNumber: '',
  routingNumber: '', swiftCode: '', iban: '', address: '', city: '',
  district: '', state: '', postalCode: '', country: '', notes: '',
  customFields: [],          // existing — kept as Bank custom fields (Option B)
  // ── New receiver fields ──
  receiverEmail: '', receiverPhone: '', receiverDob: '',
  receiverNationality: '', receiverIdType: '', receiverIdNumber: '',
  receiverCustomFields: [],  // new — Receiver custom fields (Option B)
  // ── New bank fields ──
  branchAddress: '', bankCity: '', bankDistrict: '', bankState: '', bankPostalCode: '', bankCountry: '',
  accountType: '', currency: '',
};

/* ─── Section card header inside BankForm ──────────────────── */
function FormSectionHeader({ label, subtitle }) {
  return (
    <div style={{
      padding: '10px 16px', margin: '0 -24px 16px',
      background: 'var(--bg-overlay)', borderTop: '1px solid var(--border-1)',
      borderBottom: '1px solid var(--border-1)',
    }}>
      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.62rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>{label}</div>
      {subtitle && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.54rem', color: 'var(--text-3)', marginTop: '3px' }}>{subtitle}</div>}
    </div>
  );
}

/* ─── BankForm — two sections: Receiver's Info + Bank Info ─── */
function BankForm({ title, subtitle, initialData, onSave, saving }) {
  const [local, setLocal] = useState({ ...EMPTY_BANK, ...initialData });
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setLocal({ ...EMPTY_BANK, ...initialData });
  }, [JSON.stringify(initialData)]);

  // ── Receiver custom fields handlers ──
  const addReceiverField = () => set('receiverCustomFields', [...(local.receiverCustomFields || []), { label: '', value: '' }]);
  const delReceiverField = (i) => set('receiverCustomFields', (local.receiverCustomFields || []).filter((_, idx) => idx !== i));
  const setReceiverField = (i, k, v) => set('receiverCustomFields', (local.receiverCustomFields || []).map((f, idx) => idx === i ? { ...f, [k]: v } : f));

  // ── Bank custom fields handlers (existing customFields key — Option B) ──
  const addBankField = () => set('customFields', [...(local.customFields || []), { label: '', value: '' }]);
  const delBankField = (i) => set('customFields', (local.customFields || []).filter((_, idx) => idx !== i));
  const setBankField = (i, k, v) => set('customFields', (local.customFields || []).map((f, idx) => idx === i ? { ...f, [k]: v } : f));

  const inputRow = (fields) => (
    <div style={{ display: 'grid', gridTemplateColumns: fields.length === 1 ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
      {fields.map(([key, label, ph, isTextarea]) => (
        <div key={key}>
          <label style={lb}>{label}</label>
          {isTextarea
            ? <textarea style={{ ...fi, minHeight: 60, resize: 'vertical' }} value={local[key] || ''} onChange={e => set(key, e.target.value)} onFocus={focus} onBlur={blur} placeholder={ph || ''} />
            : <input style={fi} value={local[key] || ''} onChange={e => set(key, e.target.value)} onFocus={focus} onBlur={blur} placeholder={ph || ''} />
          }
        </div>
      ))}
    </div>
  );

  return (
    <div style={cd}>
      {/* Header + Save button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={hd}>{title}</div>
          {subtitle && <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '4px', letterSpacing: '0.08em' }}>{subtitle}</div>}
        </div>
        <button
          onClick={() => onSave(local)}
          disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: saving ? 'var(--bg-elevated)' : 'var(--accent)', color: saving ? 'var(--text-3)' : '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: saving ? 'not-allowed' : 'pointer', flexShrink: 0 }}
        >
          <Save size={13} />{saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* ══ RECEIVER'S INFO ══════════════════════════════════════ */}
      <FormSectionHeader
        label="Receiver's Info"
        subtitle="Personal details of the person receiving the funds — required by most remittance & wire services"
      />

      {inputRow([["accountName", "Receiver's Full Name", "Shakil Ahmed"], ["receiverEmail", "Email", "shakil@example.com"]])}
      {inputRow([["receiverPhone", "Phone Number", "+880 1234 567890"], ["receiverDob", "Date of Birth", "01 January 1990"]])}
      {inputRow([["receiverNationality", "Nationality", "Bangladeshi"], ["receiverIdType", "ID Type", "Passport / National ID / Driver's License"]])}
      {inputRow([["receiverIdNumber", "ID Number", "AB1234567"]])}
      {inputRow([["address", "Street Address", "123 Main Street"]])}                {/* existing key */}
      {inputRow([["city", "City", "Dhaka"], ["district", "District", "Dhaka"]])}    {/* existing keys */}
      {inputRow([["state", "State / Province", "Dhaka Division"], ["postalCode", "Postal / ZIP Code", "1207"]])} {/* existing keys */}
      {inputRow([["country", "Country", "Bangladesh"]])}                             {/* existing key */}

      {/* Receiver custom fields */}
      <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: '14px', marginTop: '4px' }}>
        <CustomFieldsEditor
          label="Receiver — Additional Fields"
          fields={local.receiverCustomFields}
          onAdd={addReceiverField}
          onDel={delReceiverField}
          onSet={setReceiverField}
        />
      </div>

      {/* ══ BANK INFO ════════════════════════════════════════════ */}
      <FormSectionHeader
        label="Bank Info"
        subtitle="Bank details needed to complete the transfer — fill only what applies to your bank"
      />

      {inputRow([["bankName", "Bank Name", "Dutch-Bangla Bank Limited"], ["branchName", "Branch Name", "Mirpur Branch"]])} {/* existing keys */}
      {inputRow([["branchAddress", "Branch Address", "House 12, Road 4"]])}
      {inputRow([["bankCity", "City", "Dhaka"], ["bankDistrict", "District", "Dhaka"]])}
      {inputRow([["bankState", "State / Province", "Dhaka Division"], ["bankPostalCode", "Postal / ZIP Code", "1207"]])}
      {inputRow([["bankCountry", "Country", "Bangladesh"]])}
      {inputRow([["accountNumber", "Account Number", "1234567890"], ["accountType", "Account Type", "Savings / Checking / Current"]])} {/* existing key */}
      {inputRow([["iban", "IBAN", "BD12DBBL1234567890"]])}                           {/* existing key */}
      {inputRow([["routingNumber", "Routing Number / ABA", "026073150"], ["swiftCode", "SWIFT / BIC Code", "DBBLDDDH"]])} {/* existing keys */}
      {inputRow([["currency", "Currency", "BDT / USD / EUR"]])}
      {/* Notes is handled as textarea below */}
      <div style={{ marginBottom: '10px' }}>
        <label style={lb}>Notes (visible on pay page)</label>
        <textarea style={{ ...fi, minHeight: 60, resize: 'vertical' }} value={local.notes || ''} onChange={e => set('notes', e.target.value)} onFocus={focus} onBlur={blur} placeholder="e.g. Please include your name in the transfer note" />
      </div>

      {/* Bank custom fields */}
      <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: '14px', marginTop: '4px' }}>
        <CustomFieldsEditor
          label="Bank — Additional Fields"
          fields={local.customFields}    /* existing key — backward compatible */
          onAdd={addBankField}
          onDel={delBankField}
          onSet={setBankField}
        />
      </div>
    </div>
  );
}

/* ─── Main admin pay page ───────────────────────────────────── */
export default function AdminPayPage() {
  const [bdtData,      setBdtData]      = useState({ ...EMPTY_BANK });
  const [usdData,      setUsdData]      = useState({ ...EMPTY_BANK });
  const [wallets,      setWallets]      = useState({ bkash: { number: '' }, nagad: { number: '' } });
  const [links,        setLinks]        = useState({});
  const [texts,        setTexts]        = useState({});
  const [logos,        setLogos]        = useState({ ...DEFAULTS });
  const [cryptos,      setCryptos]      = useState([]);
  const [savingBdt,    setSavingBdt]    = useState(false);
  const [savingUsd,    setSavingUsd]    = useState(false);
  const [savingWallets,setSavingWallets]= useState(false);
  const [savingLinks,  setSavingLinks]  = useState(false);
  const [savingTexts,  setSavingTexts]  = useState(false);
  const [savingLogos,  setSavingLogos]  = useState(false);

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('paymentBanks'),
      getPortfolioDoc('paymentWallets'),
      getPortfolioDoc('paymentLinks'),
      getPortfolioDoc('paymentTexts'),
      getPortfolioDoc('paymentLogos'),
      getPaymentCrypto(),
    ]).then(([b, w, l, t, lg, c]) => {
      if (b?.bdt) setBdtData({ ...EMPTY_BANK, ...b.bdt });
      if (b?.usd) setUsdData({ ...EMPTY_BANK, ...b.usd });
      if (w) setWallets(x => ({ ...x, ...w }));
      if (l) setLinks(l);
      if (t) setTexts(t);
      if (lg) setLogos(prev => ({
        trustLogos:      lg.trustLogos?.length      ? lg.trustLogos      : prev.trustLogos,
        remittanceLogos: lg.remittanceLogos?.length ? lg.remittanceLogos : prev.remittanceLogos,
        wireLogos:       lg.wireLogos?.length       ? lg.wireLogos       : prev.wireLogos,
        walletLogos:     lg.walletLogos?.length     ? lg.walletLogos     : prev.walletLogos,
        globalLogos:     lg.globalLogos?.length     ? lg.globalLogos     : prev.globalLogos,
        cryptoLogos:     lg.cryptoLogos?.length     ? lg.cryptoLogos     : prev.cryptoLogos,
      }));
      if (c) setCryptos(c);
    });
  }, []);

  /* Save helpers */
  const saveBdt  = async (d) => { setSavingBdt(true);  try { await setPortfolioDoc('paymentBanks', { bdt: d, usd: usdData }); setBdtData(d); toast.success('BDT bank saved!'); } catch { toast.error('Save failed'); } finally { setSavingBdt(false); } };
  const saveUsd  = async (d) => { setSavingUsd(true);  try { await setPortfolioDoc('paymentBanks', { bdt: bdtData, usd: d }); setUsdData(d); toast.success('USD bank saved!'); } catch { toast.error('Save failed'); } finally { setSavingUsd(false); } };
  const saveWallets = async () => { setSavingWallets(true); try { await setPortfolioDoc('paymentWallets', wallets); toast.success('Wallets saved!'); } catch { toast.error('Save failed'); } finally { setSavingWallets(false); } };
  const saveLinks   = async () => { setSavingLinks(true);   try { await setPortfolioDoc('paymentLinks', links);   toast.success('Links saved!');   } catch { toast.error('Save failed'); } finally { setSavingLinks(false); } };
  const saveTexts   = async () => { setSavingTexts(true);   try { await setPortfolioDoc('paymentTexts', texts);   toast.success('Texts saved!');   } catch { toast.error('Save failed'); } finally { setSavingTexts(false); } };
  const saveLogos   = async () => { setSavingLogos(true);   try { await setPortfolioDoc('paymentLogos', logos);   toast.success('Logos saved!');   } catch { toast.error('Save failed'); } finally { setSavingLogos(false); } };

  /* Platform link helpers */
  const getPlatObj = (key) => {
    const raw = links[key];
    if (!raw) return { link: '', paymentHandle: '', instructions: '' };
    if (typeof raw === 'string') return { link: raw, paymentHandle: '', instructions: '' };
    return { link: '', paymentHandle: '', instructions: '', ...raw };
  };
  const setPlatField = (key, field, val) => setLinks(l => ({ ...l, [key]: { ...getPlatObj(key), [field]: val } }));

  /* Crypto CRUD */
  const addCrypto    = async () => { try { const id = await addPaymentCrypto({ network: '', address: '', iconUrl: '', qrImageUrl: '', active: true, order: cryptos.length }); setCryptos(c => [...c, { id, network: '', address: '', iconUrl: '', qrImageUrl: '', active: true }]); } catch { toast.error('Failed'); } };
  const updateCrypto = async (id, data) => { try { await updatePaymentCrypto(id, data); setCryptos(c => c.map(x => x.id === id ? { ...x, ...data } : x)); } catch { toast.error('Save failed'); } };
  const delCrypto    = async (id) => { if (!confirm('Delete?')) return; try { await deletePaymentCrypto(id); setCryptos(c => c.filter(x => x.id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); } };
  const setLogo = (key, arr) => setLogos(l => ({ ...l, [key]: arr }));

  return (
    <div style={{ maxWidth: 820 }}>

      {/* ── 1. Page Texts ──────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={hd}>Page Texts &amp; Headings</div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '3px' }}>Section titles and note text on the pay page</div>
          </div>
          <button onClick={saveTexts} disabled={savingTexts} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: savingTexts ? 'var(--bg-elevated)' : 'var(--accent)', color: savingTexts ? 'var(--text-3)' : '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: savingTexts ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
            <Save size={13} />{savingTexts ? 'Saving…' : 'Save Texts'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            ['remittanceTitle', 'Remittance Title', 'Remittance Transfer'],
            ['wireTitle', 'International Wire Title', 'International Wire'],
            ['walletTitle', 'Mobile Wallets Title', 'Mobile Wallets'],
            ['walletSubtitle', 'Mobile Wallets Subtitle', 'Bangladesh · Instant Transfer'],
            ['globalTitle', 'Global Payment Title', 'Global Payment'],
            ['globalSubtitle', 'Global Payment Subtitle', 'PayPal · Wise · Stripe · Payoneer'],
            ['cryptoTitle', 'Cryptocurrency Title', 'Cryptocurrency'],
          ].map(([key, label, ph]) => (
            <div key={key}><label style={lb}>{label}</label><input style={fi} value={texts[key] || ''} onChange={e => setTexts(t => ({ ...t, [key]: e.target.value }))} onFocus={focus} onBlur={blur} placeholder={ph} /></div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lb}>Remittance Note (below bank details)</label>
            <textarea style={{ ...fi, minHeight: 55, resize: 'vertical' }} value={texts.remittanceNote || ''} onChange={e => setTexts(t => ({ ...t, remittanceNote: e.target.value }))} onFocus={focus} onBlur={blur} placeholder="Use your preferred remittance service..." />
          </div>
        </div>
      </div>

      {/* ── 2. Logo Managers ───────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={hd}>Payment Logos</div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '3px' }}>All logos shown on the public pay page — edit labels, URLs, invert flag, and active state</div>
          </div>
          <button onClick={saveLogos} disabled={savingLogos} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: savingLogos ? 'var(--bg-elevated)' : 'var(--accent)', color: savingLogos ? 'var(--text-3)' : '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: savingLogos ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
            <Save size={13} />{savingLogos ? 'Saving…' : 'Save All Logos'}
          </button>
        </div>
        <LogoListManager title="Trust Logos (under PAY SHAKIL heading)"   description="Visa, Mastercard, PayPal, Apple Pay, etc."           items={logos.trustLogos}      onChange={arr => setLogo('trustLogos', arr)} />
        <LogoListManager title="Remittance Logos (in Remittance section)"  description="Western Union, Remitly, Ria, etc."                  items={logos.remittanceLogos} onChange={arr => setLogo('remittanceLogos', arr)} />
        <LogoListManager title="International Wire Logos (in Wire section)" description="Stripe, Payoneer, Mercury, etc."                   items={logos.wireLogos}       onChange={arr => setLogo('wireLogos', arr)} />
        <LogoListManager title="Mobile Wallet Logos (in Wallets section)"  description="bKash, Nagad"                                       items={logos.walletLogos}     onChange={arr => setLogo('walletLogos', arr)} />
        <LogoListManager title="Global Payment Logos (in Global section)"  description="PayPal, Wise, Stripe, Payoneer"                     items={logos.globalLogos}     onChange={arr => setLogo('globalLogos', arr)} />
        <LogoListManager title="Crypto Logos (in Cryptocurrency section)"  description="Bitcoin, Ethereum, USDT, BNB, Solana"               items={logos.cryptoLogos}     onChange={arr => setLogo('cryptoLogos', arr)} />
      </div>

      {/* ── 3. BDT Bank ────────────────────────────────────────── */}
      <BankForm
        title="Remittance Transfer — BDT Account"
        subtitle="Western Union · Ria · Remitly · TapTap & more"
        initialData={bdtData}
        onSave={saveBdt}
        saving={savingBdt}
      />

      {/* ── 4. USD Bank ────────────────────────────────────────── */}
      <BankForm
        title="International Wire — USD Account"
        subtitle="SWIFT · ACH · Mercury · Payoneer"
        initialData={usdData}
        onSave={saveUsd}
        saving={savingUsd}
      />

      {/* ── 5. Mobile Wallets ──────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={hd}>Mobile Wallets</div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '3px' }}>Leave blank to hide wallet from public page</div>
          </div>
          <button onClick={saveWallets} disabled={savingWallets} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: savingWallets ? 'var(--bg-elevated)' : 'var(--accent)', color: savingWallets ? 'var(--text-3)' : '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: savingWallets ? 'not-allowed' : 'pointer' }}>
            <Save size={13} />{savingWallets ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[['bkash', 'bKash Number', '#E2136E'], ['nagad', 'Nagad Number', '#F7941D']].map(([type, label, color]) => (
            <div key={type}>
              <label style={{ ...lb, color }}>{label}</label>
              <input style={fi} value={wallets[type]?.number || ''} onChange={e => setWallets(w => ({ ...w, [type]: { number: e.target.value } }))} onFocus={e => e.target.style.borderColor = color} onBlur={blur} placeholder="01XXX-XXXXXX" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Global Platform Links ───────────────────────────── */}
      <div style={cd}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={hd}>Global Payment Platforms</div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '3px' }}>Leave all 3 fields blank per platform to hide it. Section hides if all platforms blank.</div>
          </div>
          <button onClick={saveLinks} disabled={savingLinks} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: savingLinks ? 'var(--bg-elevated)' : 'var(--accent)', color: savingLinks ? 'var(--text-3)' : '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: savingLinks ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
            <Save size={13} />{savingLinks ? 'Saving…' : 'Save Links'}
          </button>
        </div>
        {[['paypal', 'PayPal'], ['payoneer', 'Payoneer'], ['stripe', 'Stripe'], ['wise', 'Wise']].map(([key, name]) => {
          const d = getPlatObj(key);
          return (
            <div key={key} style={{ padding: '14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: '10px' }}>{name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lb}>Payment URL (opens Pay Now button)</label><input style={fi} value={d.link || ''} onChange={e => setPlatField(key, 'link', e.target.value)} onFocus={focus} onBlur={blur} placeholder="https://paypal.me/yourname" /></div>
                <div><label style={lb}>Payment Handle / Email</label><input style={fi} value={d.paymentHandle || ''} onChange={e => setPlatField(key, 'paymentHandle', e.target.value)} onFocus={focus} onBlur={blur} placeholder="you@paypal.com or @username" /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lb}>Instructions for client (shown in italic below handle)</label><input style={fi} value={d.instructions || ''} onChange={e => setPlatField(key, 'instructions', e.target.value)} onFocus={focus} onBlur={blur} placeholder="Send as Friends & Family, no note needed" /></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 7. Cryptocurrency ──────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={hd}>Cryptocurrency</div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.58rem', color: 'var(--text-3)', marginTop: '3px' }}>Auto-detects logo for BTC, ETH, USDT, BNB, SOL, TRX, MATIC and more.</div>
          </div>
          <button onClick={addCrypto} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0 }}>
            <Plus size={13} /> Add Network
          </button>
        </div>
        {cryptos.map(c => (
          <div key={c.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div><label style={lb}>Network Name</label><input style={fi} defaultValue={c.network} onBlur={e => updateCrypto(c.id, { ...c, network: e.target.value })} onFocus={focus} placeholder="USDT TRC20" /></div>
              <div><label style={lb}>Logo URL (leave blank for auto-detection)</label><input style={fi} defaultValue={c.iconUrl} onBlur={e => updateCrypto(c.id, { ...c, iconUrl: e.target.value })} onFocus={focus} placeholder="Auto-detected for BTC, ETH, USDT, BNB, SOL..." /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={lb}>Wallet Address</label><input style={fi} defaultValue={c.address} onBlur={e => updateCrypto(c.id, { ...c, address: e.target.value })} onFocus={focus} /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={lb}>QR Code URL (upload to Cloudinary Media, paste URL)</label><input style={fi} defaultValue={c.qrImageUrl} onBlur={e => updateCrypto(c.id, { ...c, qrImageUrl: e.target.value })} onFocus={focus} placeholder="https://res.cloudinary.com/..." /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.82rem', color: 'var(--text-2)' }}>
                <input type="checkbox" defaultChecked={c.active !== false} onChange={e => updateCrypto(c.id, { ...c, active: e.target.checked })} style={{ accentColor: 'var(--accent)' }} /> Active
              </label>
              <button onClick={() => delCrypto(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Outfit,sans-serif', fontSize: '0.8rem' }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
        {cryptos.length === 0 && <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-3)', fontFamily: 'Outfit,sans-serif', fontSize: '0.875rem', marginTop: '10px' }}>No crypto entries yet. Click &quot;Add Network&quot; to add USDT, Bitcoin, etc.</div>}
      </div>

    </div>
  );
}
