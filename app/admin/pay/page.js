'use client';
import { useState, useEffect } from 'react';
import {
  getPortfolioDoc, setPortfolioDoc,
  getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  getPaymentCrypto, addPaymentCrypto, updatePaymentCrypto, deletePaymentCrypto,
  getPaymentGateways, addPaymentGateway, deletePaymentGateway,
} from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

const EMPTY_BANK = { bankName:'', accountName:'', accountNumber:'', routingNumber:'', swiftCode:'', iban:'', address:'', city:'', district:'', country:'', notes:'' };

const fi = { width:'100%', padding:'9px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' };
const li = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };
const card = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };

// CRITICAL: BankForm defined OUTSIDE parent component to prevent re-mount on every keystroke
function BankForm({ title, subtitle, initialData, onSave, saving }) {
  const [local, setLocal] = useState({ ...EMPTY_BANK, ...initialData });
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  // Sync if parent data changes (e.g. on load)
  useEffect(() => { setLocal(p => ({ ...EMPTY_BANK, ...initialData })); }, [JSON.stringify(initialData)]);

  const rows = [
    [['bankName','Bank Name'],['accountName','Account Holder Name']],
    [['accountNumber','Account Number'],['routingNumber','Routing Number']],
    [['swiftCode','SWIFT / BIC Code'],['iban','IBAN']],
    [['address','Street Address']],
    [['city','City'],['district','District / State']],
    [['country','Country']],
    [['notes','Notes (optional — shown on pay page)']],
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
        {rows.map((row, ri) => (
          <div key={ri} style={{ display:'grid', gridTemplateColumns: row.length===1 ? '1fr' : '1fr 1fr', gap:'12px' }}>
            {row.map(([key, label]) => (
              <div key={key}>
                <label style={li}>{label}</label>
                {key==='notes' ? (
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

function GatewayChips({ group, gateways, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const chips = gateways.filter(g => String(g.group) === String(group));
  return (
    <div style={{ ...card, marginTop:'-10px', borderTop:'none', borderRadius:'0 0 var(--radius-lg) var(--radius-lg)', paddingTop:'16px' }}>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px' }}>Service Icons</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'10px' }}>
        {chips.map(g => (
          <div key={g.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-1)' }}>{g.name}</span>
            <button onClick={()=>onDelete(g.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:0, display:'flex' }}><Trash2 size={12}/></button>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <input style={{ ...fi, flex:1 }} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Western Union" onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'} onKeyDown={e=>{if(e.key==='Enter'){onAdd(group,name);setName('');}}}/>
        <button onClick={()=>{onAdd(group,name);setName('');}} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer', flexShrink:0 }}>
          <Plus size={13}/> Add
        </button>
      </div>
    </div>
  );
}

export default function AdminPayPage() {
  const [bdtData, setBdtData]     = useState({ ...EMPTY_BANK });
  const [usdData, setUsdData]     = useState({ ...EMPTY_BANK });
  const [wallets, setWallets]     = useState({ bkash:{ number:'' }, nagad:{ number:'' } });
  const [methods, setMethods]     = useState([]);
  const [crypto, setCrypto]       = useState([]);
  const [gateways, setGateways]   = useState([]);
  const [savingBdt, setSavingBdt] = useState(false);
  const [savingUsd, setSavingUsd] = useState(false);
  const [savingWallets, setSavingWallets] = useState(false);

  useEffect(() => {
    Promise.all([getPortfolioDoc('paymentBanks'), getPortfolioDoc('paymentWallets'), getPaymentMethods(), getPaymentCrypto(), getPaymentGateways()])
      .then(([b,w,m,c,g]) => {
        if (b?.bdt) setBdtData(x => ({ ...EMPTY_BANK, ...b.bdt }));
        if (b?.usd) setUsdData(x => ({ ...EMPTY_BANK, ...b.usd }));
        if (w) setWallets(x => ({ ...x, ...w }));
        if (m) setMethods(m);
        if (c) setCrypto(c);
        if (g) setGateways(g);
      });
  }, []);

  const saveBdt = async (data) => {
    setSavingBdt(true);
    try { await setPortfolioDoc('paymentBanks', { bdt: data, usd: usdData }); setBdtData(data); toast.success('Saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingBdt(false); }
  };

  const saveUsd = async (data) => {
    setSavingUsd(true);
    try { await setPortfolioDoc('paymentBanks', { bdt: bdtData, usd: data }); setUsdData(data); toast.success('Saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingUsd(false); }
  };

  const saveWallets = async () => {
    setSavingWallets(true);
    try { await setPortfolioDoc('paymentWallets', wallets); toast.success('Wallets saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingWallets(false); }
  };

  const addGw = async (group, name) => {
    if (!name.trim()) return;
    try { const id = await addPaymentGateway({ name: name.trim(), group, active:true, order: gateways.length }); setGateways(g=>[...g,{id,name:name.trim(),group,active:true}]); toast.success('Added!'); }
    catch { toast.error('Failed'); }
  };
  const delGw = async (id) => {
    if (!confirm('Delete?')) return;
    try { await deletePaymentGateway(id); setGateways(g=>g.filter(x=>x.id!==id)); } catch { toast.error('Failed'); }
  };

  const addMethod = async () => {
    try { const id = await addPaymentMethod({ name:'', logoUrl:'', payLink:'', visible:true, order:methods.length }); setMethods(m=>[...m,{id,name:'',logoUrl:'',payLink:'',visible:true}]); } catch { toast.error('Failed'); }
  };
  const updateMethod = async (id, data) => {
    try { await updatePaymentMethod(id, data); setMethods(m=>m.map(x=>x.id===id?{...x,...data}:x)); } catch { toast.error('Save failed'); }
  };
  const delMethod = async (id) => {
    if (!confirm('Delete?')) return;
    try { await deletePaymentMethod(id); setMethods(m=>m.filter(x=>x.id!==id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const addCrypto = async () => {
    try { const id = await addPaymentCrypto({ network:'', address:'', qrImageUrl:'', active:true, order:crypto.length }); setCrypto(c=>[...c,{id,network:'',address:'',qrImageUrl:'',active:true}]); } catch { toast.error('Failed'); }
  };
  const updateCrypto = async (id, data) => {
    try { await updatePaymentCrypto(id, data); setCrypto(c=>c.map(x=>x.id===id?{...x,...data}:x)); } catch { toast.error('Save failed'); }
  };
  const delCrypto = async (id) => {
    if (!confirm('Delete?')) return;
    try { await deletePaymentCrypto(id); setCrypto(c=>c.filter(x=>x.id!==id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth:800 }}>
      <BankForm title="Remittance Transfer" subtitle="BDT · Western Union · Ria · Remitly · TapTap & more" initialData={bdtData} onSave={saveBdt} saving={savingBdt}/>
      <GatewayChips group={1} gateways={gateways} onAdd={addGw} onDelete={delGw}/>

      <div style={{ marginTop:'24px' }}>
        <BankForm title="International Wire" subtitle="USD · SWIFT · ACH · Mercury · Business Payments" initialData={usdData} onSave={saveUsd} saving={savingUsd}/>
        <GatewayChips group={2} gateways={gateways} onAdd={addGw} onDelete={delGw}/>
      </div>

      {/* Wallets */}
      <div style={{ ...card, marginTop:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>Mobile Wallets</div>
          <button onClick={saveWallets} disabled={savingWallets} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingWallets ? 'var(--bg-elevated)' : 'var(--accent)', color: savingWallets ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor: savingWallets ? 'not-allowed' : 'pointer' }}>
            <Save size={13}/>{savingWallets ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[['bkash','bKash Number'],['nagad','Nagad Number']].map(([type,label]) => (
            <div key={type}>
              <label style={li}>{label}</label>
              <input style={fi} value={wallets[type]?.number||''} onChange={e=>setWallets(w=>({...w,[type]:{number:e.target.value}}))} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'} placeholder="01XXX-XXXXXX"/>
            </div>
          ))}
        </div>
      </div>

      {/* Online Platforms */}
      <div style={{ ...card, marginTop:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>Online Payment Platforms</div>
          <button onClick={addMethod} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
            <Plus size={13}/> Add Platform
          </button>
        </div>
        {methods.map(m => (
          <div key={m.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px', marginBottom:'10px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div><label style={li}>Platform Name</label><input style={fi} defaultValue={m.name} onBlur={e=>updateMethod(m.id,{...m,name:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} placeholder="PayPal"/></div>
              <div><label style={li}>Payment Link</label><input style={fi} defaultValue={m.payLink} onBlur={e=>updateMethod(m.id,{...m,payLink:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} placeholder="https://paypal.me/..."/></div>
              <div style={{ gridColumn:'1/-1' }}><label style={li}>Logo URL (optional)</label><input style={fi} defaultValue={m.logoUrl} onBlur={e=>updateMethod(m.id,{...m,logoUrl:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} placeholder="https://..."/></div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)' }}>
                <input type="checkbox" defaultChecked={m.visible!==false} onChange={e=>updateMethod(m.id,{...m,visible:e.target.checked})} style={{ accentColor:'var(--accent)' }}/> Visible on pay page
              </label>
              <button onClick={()=>delMethod(m.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}><Trash2 size={13}/> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Crypto */}
      <div style={{ ...card, marginTop:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>Cryptocurrency</div>
          <button onClick={addCrypto} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
            <Plus size={13}/> Add Network
          </button>
        </div>
        {crypto.map(c => (
          <div key={c.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px', marginBottom:'10px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div><label style={li}>Network (e.g. USDT TRC20)</label><input style={fi} defaultValue={c.network} onBlur={e=>updateCrypto(c.id,{...c,network:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--accent-border)'}/></div>
              <div><label style={li}>Wallet Address</label><input style={fi} defaultValue={c.address} onBlur={e=>updateCrypto(c.id,{...c,address:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--accent-border)'}/></div>
              <div style={{ gridColumn:'1/-1' }}><label style={li}>QR Code URL</label><input style={fi} defaultValue={c.qrImageUrl} onBlur={e=>updateCrypto(c.id,{...c,qrImageUrl:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} placeholder="https://res.cloudinary.com/..."/></div>
            </div>
            <button onClick={()=>delCrypto(c.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}><Trash2 size={13}/> Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
