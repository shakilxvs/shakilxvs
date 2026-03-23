'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc, getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, getPaymentCrypto, addPaymentCrypto, updatePaymentCrypto, deletePaymentCrypto, getPaymentGateways, addPaymentGateway, deletePaymentGateway } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Upload } from 'lucide-react';

export default function AdminPayPage() {
  const [banks, setBanks]     = useState({ bdt:{bankName:'',accountName:'',accountNumber:'',routing:'',notes:''}, usd:{bankName:'',accountName:'',accountNumber:'',routing:'',notes:''} });
  const [wallets, setWallets] = useState({ bkash:{number:''}, nagad:{number:''} });
  const [methods, setMethods] = useState([]);
  const [crypto, setCrypto]   = useState([]);
  const [gateways, setGateways] = useState([]);
  const [saving, setSaving]   = useState('');

  const f = { width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none' };
  const l = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };
  const card = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
  const head = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };

  useEffect(() => {
    Promise.all([getPortfolioDoc('paymentBanks'), getPortfolioDoc('paymentWallets'), getPaymentMethods(), getPaymentCrypto(), getPaymentGateways()])
      .then(([b,w,m,c,g]) => {
        if (b) setBanks(b);
        if (w) setWallets(w);
        setMethods(m); setCrypto(c); setGateways(g);
      });
  }, []);

  const setBank = (type, key, val) => setBanks(b => ({ ...b, [type]: { ...b[type], [key]: val } }));
  const setWallet = (type, val) => setWallets(w => ({ ...w, [type]: { number: val } }));

  const saveBanks = async () => {
    setSaving('banks');
    try { await setPortfolioDoc('paymentBanks', banks); toast.success('Bank details saved!'); }
    catch { toast.error('Save failed'); } finally { setSaving(''); }
  };

  const saveWallets = async () => {
    setSaving('wallets');
    try { await setPortfolioDoc('paymentWallets', wallets); toast.success('Wallets saved!'); }
    catch { toast.error('Save failed'); } finally { setSaving(''); }
  };

  const addMethod = async () => {
    try { const id = await addPaymentMethod({ name:'', logoUrl:'', payLink:'', visible:true, order:methods.length }); setMethods(m=>[...m,{id,name:'',logoUrl:'',payLink:'',visible:true,order:m.length}]); } catch { toast.error('Failed'); }
  };

  const updateMethod = async (id, data) => {
    try { await updatePaymentMethod(id, data); setMethods(m=>m.map(x=>x.id===id?{...x,...data}:x)); toast.success('Saved!'); } catch { toast.error('Failed'); }
  };

  const deleteMethod = async (id) => {
    if (!confirm('Delete?')) return;
    try { await deletePaymentMethod(id); setMethods(m=>m.filter(x=>x.id!==id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const addCrypto = async () => {
    try { const id = await addPaymentCrypto({ network:'', address:'', qrImageUrl:'', active:true, order:crypto.length }); setCrypto(c=>[...c,{id,network:'',address:'',qrImageUrl:'',active:true}]); } catch { toast.error('Failed'); }
  };

  const updateCrypto = async (id, data) => {
    try { await updatePaymentCrypto(id, data); setCrypto(c=>c.map(x=>x.id===id?{...x,...data}:x)); toast.success('Saved!'); } catch { toast.error('Failed'); }
  };

  const deleteCrypto = async (id) => {
    if (!confirm('Delete?')) return;
    try { await deletePaymentCrypto(id); setCrypto(c=>c.filter(x=>x.id!==id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const addGateway = async (group) => {
    try { const id = await addPaymentGateway({ name:'', logoUrl:'', group, active:true, order:gateways.length }); setGateways(g=>[...g,{id,name:'',group,active:true}]); } catch { toast.error('Failed'); }
  };

  const deleteGateway = async (id) => {
    if (!confirm('Delete?')) return;
    try { await deletePaymentGateway(id); setGateways(g=>g.filter(x=>x.id!==id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const BankSection = ({ type, title }) => (
    <div style={card}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div style={head}>{title}</div>
        <button onClick={saveBanks} disabled={saving==='banks'} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
          <Save size={13}/>{saving==='banks'?'Saving…':'Save'}
        </button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        {[['bankName','Bank Name'],['accountName','Account Name'],['accountNumber','Account Number'],['routing','Routing / IBAN / SWIFT']].map(([key,label])=>(
          <div key={key} style={{ gridColumn: key==='routing'||key==='accountName'?'1/-1':'auto' }}>
            <label style={l}>{label}</label>
            <input style={f} value={banks[type]?.[key]||''} onChange={e=>setBank(type,key,e.target.value)}/>
          </div>
        ))}
        <div style={{ gridColumn:'1/-1' }}>
          <label style={l}>Notes</label>
          <input style={f} value={banks[type]?.notes||''} onChange={e=>setBank(type,'notes',e.target.value)} placeholder="Optional note shown below bank details"/>
        </div>
      </div>
      {/* Gateway icons for this group */}
      <div style={{ marginTop:'20px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px' }}>Service Icons</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'10px' }}>
          {gateways.filter(g=>String(g.group)===String(type==='bdt'?1:2)).map(g=>(
            <div key={g.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)' }}>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-1)' }}>{g.name||'Unnamed'}</span>
              <button onClick={()=>deleteGateway(g.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:0 }}><Trash2 size={12}/></button>
            </div>
          ))}
        </div>
        <button onClick={()=>addGateway(type==='bdt'?1:2)} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 14px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer' }}>
          <Plus size={13}/> Add Icon
        </button>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'6px' }}>Tip: add names only (e.g. Western Union, Ria, Remitly). They appear as text badges.</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:800 }}>
      <BankSection type="bdt" title="BDT Remittance Account" />
      <BankSection type="usd" title="International / USD Account" />

      {/* Wallets */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={head}>Mobile Wallets</div>
          <button onClick={saveWallets} disabled={saving==='wallets'} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
            <Save size={13}/>{saving==='wallets'?'Saving…':'Save'}
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[['bkash','bKash Number'],['nagad','Nagad Number']].map(([type,label])=>(
            <div key={type}><label style={l}>{label}</label><input style={f} value={wallets[type]?.number||''} onChange={e=>setWallet(type,e.target.value)} placeholder="01XXX-XXXXXX"/></div>
          ))}
        </div>
      </div>

      {/* Online Platforms */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={head}>Online Payment Platforms</div>
          <button onClick={addMethod} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
            <Plus size={13}/> Add Platform
          </button>
        </div>
        {methods.map(m=>(
          <div key={m.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px', marginBottom:'10px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div><label style={l}>Platform Name</label><input style={f} defaultValue={m.name} onBlur={e=>updateMethod(m.id,{...m,name:e.target.value})} placeholder="PayPal"/></div>
              <div><label style={l}>Payment Link</label><input style={f} defaultValue={m.payLink} onBlur={e=>updateMethod(m.id,{...m,payLink:e.target.value})} placeholder="https://paypal.me/..."/></div>
              <div style={{ gridColumn:'1/-1' }}><label style={l}>Logo URL (optional)</label><input style={f} defaultValue={m.logoUrl} onBlur={e=>updateMethod(m.id,{...m,logoUrl:e.target.value})} placeholder="https://..."/></div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)' }}>
                <input type="checkbox" defaultChecked={m.visible!==false} onChange={e=>updateMethod(m.id,{...m,visible:e.target.checked})} style={{ accentColor:'var(--accent)' }}/> Visible on pay page
              </label>
              <button onClick={()=>deleteMethod(m.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}><Trash2 size={13}/> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Crypto */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={head}>Cryptocurrency</div>
          <button onClick={addCrypto} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
            <Plus size={13}/> Add Network
          </button>
        </div>
        {crypto.map(c=>(
          <div key={c.id} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px', marginBottom:'10px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div><label style={l}>Network (e.g. USDT TRC20)</label><input style={f} defaultValue={c.network} onBlur={e=>updateCrypto(c.id,{...c,network:e.target.value})}/></div>
              <div><label style={l}>Wallet Address</label><input style={f} defaultValue={c.address} onBlur={e=>updateCrypto(c.id,{...c,address:e.target.value})}/></div>
              <div style={{ gridColumn:'1/-1' }}><label style={l}>QR Code URL (upload to Cloudinary, paste URL)</label><input style={f} defaultValue={c.qrImageUrl} onBlur={e=>updateCrypto(c.id,{...c,qrImageUrl:e.target.value})} placeholder="https://res.cloudinary.com/..."/></div>
            </div>
            <button onClick={()=>deleteCrypto(c.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}><Trash2 size={13}/> Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
