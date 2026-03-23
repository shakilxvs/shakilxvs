'use client';
import { useState, useEffect } from 'react';
import {
  getPortfolioDoc, setPortfolioDoc,
  getPaymentCrypto, addPaymentCrypto, updatePaymentCrypto, deletePaymentCrypto,
} from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

const fi = { width:'100%', padding:'9px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' };
const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };
const cd = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
const hd = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.15rem', color:'var(--text-1)', letterSpacing:'0.05em' };

const focus = e => e.target.style.borderColor = 'var(--accent-border)';
const blur  = e => e.target.style.borderColor = 'var(--border-2)';

/* ── BankForm OUTSIDE parent to prevent focus loss ─────────────────────────── */
const EMPTY_BANK = { bankName:'', accountName:'', accountNumber:'', routingNumber:'', swiftCode:'', iban:'', address:'', city:'', district:'', country:'', notes:'' };

function BankForm({ title, subtitle, initialData, onSave, saving }) {
  const [local, setLocal] = useState({ ...EMPTY_BANK, ...initialData });
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  useEffect(() => { setLocal({ ...EMPTY_BANK, ...initialData }); }, [JSON.stringify(initialData)]);

  const ROWS = [
    [['bankName','Bank Name'],['accountName','Account Holder Name']],
    [['accountNumber','Account Number'],['routingNumber','Routing Number']],
    [['swiftCode','SWIFT / BIC Code'],['iban','IBAN']],
    [['address','Street Address']],
    [['city','City'],['district','District / State']],
    [['country','Country']],
    [['notes','Notes (shown on pay page)']],
  ];

  return (
    <div style={cd}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'18px', gap:'12px', flexWrap:'wrap' }}>
        <div>
          <div style={hd}>{title}</div>
          {subtitle && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'4px', letterSpacing:'0.08em' }}>{subtitle}</div>}
        </div>
        <button onClick={() => onSave(local)} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: saving ? 'var(--bg-elevated)' : 'var(--accent)', color: saving ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: saving ? 'not-allowed' : 'pointer', flexShrink:0 }}>
          <Save size={13}/>{saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {ROWS.map((row, ri) => (
          <div key={ri} style={{ display:'grid', gridTemplateColumns: row.length===1 ? '1fr' : '1fr 1fr', gap:'10px' }}>
            {row.map(([key, label]) => (
              <div key={key}>
                <label style={lb}>{label}</label>
                {key === 'notes'
                  ? <textarea style={{ ...fi, minHeight:60, resize:'vertical' }} value={local[key]||''} onChange={e=>set(key,e.target.value)} onFocus={focus} onBlur={blur}/>
                  : <input style={fi} value={local[key]||''} onChange={e=>set(key,e.target.value)} onFocus={focus} onBlur={blur}/>
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main admin pay page ────────────────────────────────────────────────────── */
export default function AdminPayPage() {
  const [bdtData,   setBdtData]   = useState({ ...EMPTY_BANK });
  const [usdData,   setUsdData]   = useState({ ...EMPTY_BANK });
  const [wallets,   setWallets]   = useState({ bkash:{ number:'' }, nagad:{ number:'' } });
  const [links,     setLinks]     = useState({});
  const [texts,     setTexts]     = useState({});
  const [cryptos,   setCryptos]   = useState([]);

  const [savingBdt,     setSavingBdt]     = useState(false);
  const [savingUsd,     setSavingUsd]     = useState(false);
  const [savingWallets, setSavingWallets] = useState(false);
  const [savingLinks,   setSavingLinks]   = useState(false);
  const [savingTexts,   setSavingTexts]   = useState(false);

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('paymentBanks'),
      getPortfolioDoc('paymentWallets'),
      getPortfolioDoc('paymentLinks'),
      getPortfolioDoc('paymentTexts'),
      getPaymentCrypto(),
    ]).then(([b, w, l, t, c]) => {
      if (b?.bdt) setBdtData(x => ({ ...EMPTY_BANK, ...b.bdt }));
      if (b?.usd) setUsdData(x => ({ ...EMPTY_BANK, ...b.usd }));
      if (w) setWallets(x => ({ ...x, ...w }));
      if (l) setLinks(l);
      if (t) setTexts(t);
      if (c) setCryptos(c);
    });
  }, []);

  const saveBdt = async (data) => {
    setSavingBdt(true);
    try { await setPortfolioDoc('paymentBanks', { bdt:data, usd:usdData }); setBdtData(data); toast.success('BDT bank saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingBdt(false); }
  };
  const saveUsd = async (data) => {
    setSavingUsd(true);
    try { await setPortfolioDoc('paymentBanks', { bdt:bdtData, usd:data }); setUsdData(data); toast.success('USD bank saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingUsd(false); }
  };
  const saveWallets = async () => {
    setSavingWallets(true);
    try { await setPortfolioDoc('paymentWallets', wallets); toast.success('Wallets saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingWallets(false); }
  };
  const saveLinks = async () => {
    setSavingLinks(true);
    try { await setPortfolioDoc('paymentLinks', links); toast.success('Platform links saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingLinks(false); }
  };
  const saveTexts = async () => {
    setSavingTexts(true);
    try { await setPortfolioDoc('paymentTexts', texts); toast.success('Texts saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingTexts(false); }
  };

  const setLink = (k, v) => setLinks(l => ({ ...l, [k]: v }));
  const setText = (k, v) => setTexts(t => ({ ...t, [k]: v }));

  /* Crypto */
  const addCrypto = async () => {
    try { const id = await addPaymentCrypto({ network:'', address:'', iconUrl:'', qrImageUrl:'', active:true, order:cryptos.length }); setCryptos(c=>[...c,{id,network:'',address:'',iconUrl:'',qrImageUrl:'',active:true}]); }
    catch { toast.error('Failed'); }
  };
  const updateCrypto = async (id, data) => {
    try { await updatePaymentCrypto(id, data); setCryptos(c=>c.map(x=>x.id===id?{...x,...data}:x)); }
    catch { toast.error('Save failed'); }
  };
  const delCrypto = async (id) => {
    if (!confirm('Delete?')) return;
    try { await deletePaymentCrypto(id); setCryptos(c=>c.filter(x=>x.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth:800 }}>

      {/* ── 1. Editable Page Texts ──────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <div style={hd}>Page Texts &amp; Headings</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'4px' }}>Edit section titles and note texts shown on the pay page</div>
          </div>
          <button onClick={saveTexts} disabled={savingTexts} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingTexts ? 'var(--bg-elevated)' : 'var(--accent)', color: savingTexts ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: savingTexts ? 'not-allowed' : 'pointer', flexShrink:0 }}>
            <Save size={13}/>{savingTexts ? 'Saving…' : 'Save Texts'}
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[
            ['remittanceTitle',  'Remittance Transfer Heading', 'Remittance Transfer'],
            ['wireTitle',        'International Wire Heading',  'International Wire'],
            ['walletTitle',      'Mobile Wallets Heading',      'Mobile Wallets'],
            ['walletSubtitle',   'Mobile Wallets Subtitle',     'Bangladesh · Instant Transfer'],
            ['globalTitle',      'Global Payment Heading',      'Global Payment'],
            ['globalSubtitle',   'Global Payment Subtitle',     'PayPal · Wise · Stripe · Payoneer'],
            ['cryptoTitle',      'Cryptocurrency Heading',      'Cryptocurrency'],
            ['cryptoSubtitle',   'Cryptocurrency Subtitle',     'Secure · Borderless · Instant'],
          ].map(([key, label, placeholder]) => (
            <div key={key}>
              <label style={lb}>{label}</label>
              <input style={fi} value={texts[key]||''} onChange={e=>setText(key,e.target.value)} onFocus={focus} onBlur={blur} placeholder={placeholder}/>
            </div>
          ))}
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lb}>Remittance Note (text below remittance logos)</label>
            <textarea style={{ ...fi, minHeight:60, resize:'vertical' }} value={texts.remittanceNote||''} onChange={e=>setText('remittanceNote',e.target.value)} onFocus={focus} onBlur={blur} placeholder="Use your preferred remittance service to send to the BDT account above."/>
          </div>
        </div>
      </div>

      {/* ── 2. BDT Bank ─────────────────────────────────────────────────── */}
      <BankForm title="Remittance Transfer — BDT Account" subtitle="Western Union · Ria · Remitly · TapTap & more" initialData={bdtData} onSave={saveBdt} saving={savingBdt}/>

      {/* ── 3. USD Bank ─────────────────────────────────────────────────── */}
      <BankForm title="International Wire — USD Account" subtitle="SWIFT · ACH · Mercury · Payoneer" initialData={usdData} onSave={saveUsd} saving={savingUsd}/>

      {/* ── 4. Mobile Wallets ───────────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
          <div style={hd}>Mobile Wallets</div>
          <button onClick={saveWallets} disabled={savingWallets} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingWallets ? 'var(--bg-elevated)' : 'var(--accent)', color: savingWallets ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: savingWallets ? 'not-allowed' : 'pointer' }}>
            <Save size={13}/>{savingWallets ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginBottom:'14px' }}>Leave blank to hide that wallet on the public pay page.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[['bkash','bKash Number','#E2136E'],['nagad','Nagad Number','#F7941D']].map(([type,label,color])=>(
            <div key={type}>
              <label style={{ ...lb, color }}>{label}</label>
              <input style={fi} value={wallets[type]?.number||''} onChange={e=>setWallets(w=>({...w,[type]:{number:e.target.value}}))} onFocus={e=>e.target.style.borderColor=color} onBlur={blur} placeholder="01XXX-XXXXXX"/>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Online Platform Links ─────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <div style={hd}>Global Payment Links</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'4px' }}>Leave blank to hide that platform. The section hides if ALL are blank.</div>
          </div>
          <button onClick={saveLinks} disabled={savingLinks} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingLinks ? 'var(--bg-elevated)' : 'var(--accent)', color: savingLinks ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: savingLinks ? 'not-allowed' : 'pointer', flexShrink:0 }}>
            <Save size={13}/>{savingLinks ? 'Saving…' : 'Save Links'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'16px' }}>
          {[
            ['paypal',   'PayPal',   'https://paypal.me/yourname'],
            ['wise',     'Wise',     'https://wise.com/pay/...'],
            ['stripe',   'Stripe',   'https://buy.stripe.com/...'],
            ['payoneer', 'Payoneer', 'https://payoneer.com/...'],
          ].map(([key,label,placeholder])=>(
            <div key={key}>
              <label style={lb}>{label} Payment Link</label>
              <input style={fi} value={links[key]||''} onChange={e=>setLink(key,e.target.value)} onFocus={focus} onBlur={blur} placeholder={placeholder}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Cryptocurrency ────────────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
          <div>
            <div style={hd}>Cryptocurrency</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'4px' }}>Auto-detects icon for BTC, ETH, USDT, SOL, BNB, TRX, MATIC. Add custom icon URL for others.</div>
          </div>
          <button onClick={addCrypto} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', flexShrink:0 }}>
            <Plus size={13}/> Add Network
          </button>
        </div>
        {cryptos.map(c=>(
          <div key={c.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px', marginTop:'12px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div>
                <label style={lb}>Network Name</label>
                <input style={fi} defaultValue={c.network} onBlur={e=>updateCrypto(c.id,{...c,network:e.target.value})} onFocus={focus} placeholder="USDT TRC20"/>
              </div>
              <div>
                <label style={lb}>Custom Icon URL (optional)</label>
                <input style={fi} defaultValue={c.iconUrl} onBlur={e=>updateCrypto(c.id,{...c,iconUrl:e.target.value})} onFocus={focus} placeholder="Auto-detected if blank"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lb}>Wallet Address</label>
                <input style={fi} defaultValue={c.address} onBlur={e=>updateCrypto(c.id,{...c,address:e.target.value})} onFocus={focus}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lb}>QR Code URL (upload to Cloudinary first)</label>
                <input style={fi} defaultValue={c.qrImageUrl} onBlur={e=>updateCrypto(c.id,{...c,qrImageUrl:e.target.value})} onFocus={focus} placeholder="https://res.cloudinary.com/..."/>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)' }}>
                <input type="checkbox" defaultChecked={c.active!==false} onChange={e=>updateCrypto(c.id,{...c,active:e.target.checked})} style={{ accentColor:'var(--accent)' }}/> Active
              </label>
              <button onClick={()=>delCrypto(c.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>
                <Trash2 size={13}/> Delete
              </button>
            </div>
          </div>
        ))}
        {cryptos.length===0 && <div style={{ textAlign:'center', padding:'28px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', marginTop:'12px' }}>No crypto entries yet. Click &quot;Add Network&quot; to add USDT, Bitcoin, etc.</div>}
      </div>
    </div>
  );
}
