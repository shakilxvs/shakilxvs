'use client';
import { useState, useEffect } from 'react';
import {
  getPortfolioDoc, setPortfolioDoc,
  getPaymentCrypto, addPaymentCrypto, updatePaymentCrypto, deletePaymentCrypto,
} from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

/* Styles */
const fi = { width:'100%', padding:'9px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' };
const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };
const card = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };

/* ── BankForm — defined OUTSIDE parent to prevent re-mount focus loss ─────── */
const EMPTY_BANK = { bankName:'', accountName:'', accountNumber:'', routingNumber:'', swiftCode:'', iban:'', address:'', city:'', district:'', country:'', notes:'' };

function BankForm({ title, subtitle, initialData, onSave, saving }) {
  const [local, setLocal] = useState({ ...EMPTY_BANK, ...initialData });
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setLocal({ ...EMPTY_BANK, ...initialData });
  }, [JSON.stringify(initialData)]);

  const FIELDS = [
    [['bankName','Bank Name'], ['accountName','Account Holder Name']],
    [['accountNumber','Account Number'], ['routingNumber','Routing Number']],
    [['swiftCode','SWIFT / BIC Code'], ['iban','IBAN']],
    [['address','Street Address']],
    [['city','City'], ['district','District / State']],
    [['country','Country']],
    [['notes','Notes (shown on pay page)']],
  ];

  return (
    <div style={card}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', gap:'12px', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>{title}</div>
          {subtitle && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'4px', letterSpacing:'0.08em' }}>{subtitle}</div>}
        </div>
        <button onClick={() => onSave(local)} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: saving ? 'var(--bg-elevated)' : 'var(--accent)', color: saving ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: saving ? 'not-allowed' : 'pointer', flexShrink:0 }}>
          <Save size={13}/>{saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {FIELDS.map((row, ri) => (
          <div key={ri} style={{ display:'grid', gridTemplateColumns: row.length === 1 ? '1fr' : '1fr 1fr', gap:'12px' }}>
            {row.map(([key, label]) => (
              <div key={key}>
                <label style={lb}>{label}</label>
                {key === 'notes' ? (
                  <textarea style={{ ...fi, minHeight:65, resize:'vertical' }} value={local[key]||''} onChange={e=>set(key,e.target.value)} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
                ) : (
                  <input style={fi} value={local[key]||''} onChange={e=>set(key,e.target.value)} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Service Links Form ─────────────────────────────────────────────────────── */
function ServiceLinksForm({ title, fields, values, onChange, onSave, saving }) {
  return (
    <div style={card}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', gap:'12px', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>{title}</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'4px', letterSpacing:'0.08em' }}>Paste the link for each service — leave blank to disable</div>
        </div>
        <button onClick={onSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: saving ? 'var(--bg-elevated)' : 'var(--accent)', color: saving ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: saving ? 'not-allowed' : 'pointer', flexShrink:0 }}>
          <Save size={13}/>{saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={lb}>{label} Link</label>
            <input
              style={fi}
              value={values[key] || ''}
              onChange={e => onChange(key, e.target.value)}
              onFocus={e => e.target.style.borderColor='var(--accent-border)'}
              onBlur={e => e.target.style.borderColor='var(--border-2)'}
              placeholder={placeholder || `https://...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Admin Pay Page ─────────────────────────────────────────────────── */
export default function AdminPayPage() {
  const [bdtData,  setBdtData]  = useState({ ...EMPTY_BANK });
  const [usdData,  setUsdData]  = useState({ ...EMPTY_BANK });
  const [wallets,  setWallets]  = useState({ bkash:{ number:'' }, nagad:{ number:'' } });
  const [links,    setLinks]    = useState({});
  const [cryptos,  setCryptos]  = useState([]);

  const [savingBdt,     setSavingBdt]     = useState(false);
  const [savingUsd,     setSavingUsd]     = useState(false);
  const [savingWallets, setSavingWallets] = useState(false);
  const [savingLinks,   setSavingLinks]   = useState(false);

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('paymentBanks'),
      getPortfolioDoc('paymentWallets'),
      getPortfolioDoc('paymentLinks'),
      getPaymentCrypto(),
    ]).then(([b, w, l, c]) => {
      if (b?.bdt) setBdtData(x => ({ ...EMPTY_BANK, ...b.bdt }));
      if (b?.usd) setUsdData(x => ({ ...EMPTY_BANK, ...b.usd }));
      if (w) setWallets(x => ({ ...x, ...w }));
      if (l) setLinks(l);
      if (c) setCryptos(c);
    });
  }, []);

  const saveBdt = async (data) => {
    setSavingBdt(true);
    try { await setPortfolioDoc('paymentBanks', { bdt: data, usd: usdData }); setBdtData(data); toast.success('BDT bank saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingBdt(false); }
  };

  const saveUsd = async (data) => {
    setSavingUsd(true);
    try { await setPortfolioDoc('paymentBanks', { bdt: bdtData, usd: data }); setUsdData(data); toast.success('USD bank saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingUsd(false); }
  };

  const saveWallets = async () => {
    setSavingWallets(true);
    try { await setPortfolioDoc('paymentWallets', wallets); toast.success('Wallets saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingWallets(false); }
  };

  const setLink = (key, val) => setLinks(l => ({ ...l, [key]: val }));

  const saveLinks = async () => {
    setSavingLinks(true);
    try { await setPortfolioDoc('paymentLinks', links); toast.success('Service links saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingLinks(false); }
  };

  /* Crypto */
  const addCrypto = async () => {
    try {
      const id = await addPaymentCrypto({ network:'', address:'', iconUrl:'', qrImageUrl:'', active:true, order:cryptos.length });
      setCryptos(c => [...c, { id, network:'', address:'', iconUrl:'', qrImageUrl:'', active:true }]);
    } catch { toast.error('Failed'); }
  };

  const updateCrypto = async (id, data) => {
    try { await updatePaymentCrypto(id, data); setCryptos(c => c.map(x => x.id===id ? {...x,...data} : x)); }
    catch { toast.error('Save failed'); }
  };

  const delCrypto = async (id) => {
    if (!confirm('Delete this crypto entry?')) return;
    try { await deletePaymentCrypto(id); setCryptos(c => c.filter(x => x.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: 800 }}>

      {/* BDT Bank */}
      <BankForm
        title="Remittance Transfer"
        subtitle="BDT Account · Western Union · Ria · Remitly & more"
        initialData={bdtData}
        onSave={saveBdt}
        saving={savingBdt}
      />

      {/* Remittance service links */}
      <ServiceLinksForm
        title="Remittance Service Links"
        fields={[
          { key:'westernUnion', label:'Western Union', placeholder:'https://www.westernunion.com/send-money/...' },
          { key:'ria',          label:'Ria',           placeholder:'https://riamoneytransfer.com/...' },
          { key:'remitly',      label:'Remitly',       placeholder:'https://remitly.com/...' },
          { key:'taptap',       label:'TapTap Send',   placeholder:'https://taptapsend.com/...' },
          { key:'worldremit',   label:'WorldRemit',    placeholder:'https://worldremit.com/...' },
        ]}
        values={links}
        onChange={setLink}
        onSave={saveLinks}
        saving={savingLinks}
      />

      {/* USD Bank */}
      <div style={{ marginTop: '24px' }}>
        <BankForm
          title="International Wire"
          subtitle="USD Account · SWIFT · ACH · Mercury · Business Payments"
          initialData={usdData}
          onSave={saveUsd}
          saving={savingUsd}
        />
      </div>

      {/* Wire service links */}
      <ServiceLinksForm
        title="Wire & Business Service Links"
        fields={[
          { key:'mercury',  label:'Mercury',  placeholder:'https://mercury.com/...' },
          { key:'stripe',   label:'Stripe',   placeholder:'https://buy.stripe.com/...' },
          { key:'payoneer', label:'Payoneer', placeholder:'https://payoneer.com/...' },
          { key:'wise',     label:'Wise (wire)', placeholder:'https://wise.com/pay/...' },
        ]}
        values={links}
        onChange={setLink}
        onSave={saveLinks}
        saving={savingLinks}
      />

      {/* Online Platforms links */}
      <div style={{ marginTop: '24px' }}>
        <ServiceLinksForm
          title="Online Platforms"
          fields={[
            { key:'paypal',   label:'PayPal',   placeholder:'https://paypal.me/yourname' },
            { key:'wise',     label:'Wise',     placeholder:'https://wise.com/pay/...' },
            { key:'stripe',   label:'Stripe',   placeholder:'https://buy.stripe.com/...' },
            { key:'payoneer', label:'Payoneer', placeholder:'https://payoneer.com/...' },
          ]}
          values={links}
          onChange={setLink}
          onSave={saveLinks}
          saving={savingLinks}
        />
      </div>

      {/* Mobile Wallets */}
      <div style={{ ...card, marginTop: '24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>Mobile Wallets</div>
          <button onClick={saveWallets} disabled={savingWallets} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingWallets ? 'var(--bg-elevated)' : 'var(--accent)', color: savingWallets ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: savingWallets ? 'not-allowed' : 'pointer' }}>
            <Save size={13}/>{savingWallets ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[['bkash','bKash Number','#E2136E'],['nagad','Nagad Number','#F7941D']].map(([type,label,color]) => (
            <div key={type}>
              <label style={{ ...lb, color }}>● {label}</label>
              <input
                style={fi}
                value={wallets[type]?.number || ''}
                onChange={e => setWallets(w => ({ ...w, [type]: { number: e.target.value } }))}
                onFocus={e => e.target.style.borderColor = color}
                onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
                placeholder="01XXX-XXXXXX"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Cryptocurrency */}
      <div style={{ ...card, marginTop: '24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
          <div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>Cryptocurrency</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'3px' }}>Add each network/coin separately</div>
          </div>
          <button onClick={addCrypto} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
            <Plus size={13}/> Add Network
          </button>
        </div>

        {cryptos.map(c => (
          <div key={c.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px', marginTop:'12px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div>
                <label style={lb}>Network Name</label>
                <input style={fi} defaultValue={c.network}
                  onBlur={e => updateCrypto(c.id, { ...c, network: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                  placeholder="USDT TRC20"
                />
              </div>
              <div>
                <label style={lb}>Icon URL (leave blank = auto-detected)</label>
                <input style={fi} defaultValue={c.iconUrl}
                  onBlur={e => updateCrypto(c.id, { ...c, iconUrl: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                  placeholder="https://cdn.simpleicons.org/..."
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lb}>Wallet Address</label>
                <input style={fi} defaultValue={c.address}
                  onBlur={e => updateCrypto(c.id, { ...c, address: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lb}>QR Code Image URL (upload to Cloudinary, paste URL)</label>
                <input style={fi} defaultValue={c.qrImageUrl}
                  onBlur={e => updateCrypto(c.id, { ...c, qrImageUrl: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)' }}>
                <input type="checkbox" defaultChecked={c.active !== false} onChange={e => updateCrypto(c.id, { ...c, active: e.target.checked })} style={{ accentColor: 'var(--accent)' }} /> Active
              </label>
              <button onClick={() => delCrypto(c.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>
                <Trash2 size={13}/> Delete
              </button>
            </div>
          </div>
        ))}

        {cryptos.length === 0 && (
          <div style={{ textAlign:'center', padding:'32px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>
            No crypto entries yet. Click "Add Network" to add Bitcoin, USDT, etc.
          </div>
        )}
      </div>
    </div>
  );
}
