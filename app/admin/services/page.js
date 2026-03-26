'use client';
import { useState, useEffect } from 'react';
import { getServices, setServices } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const FIELD = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
const LABEL = { fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px', display:'block' };
const CARD  = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
const HEAD  = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };

const EMPTY_TIER = {
  id: '',
  name: '',
  price: '',
  priceSuffix: '/project',
  highlight: false,
  badge: '',
  description: '',
  features: [''],
  ctaText: 'Get Started',
  ctaUrl: '/contact',
  active: true,
};

function newTier() {
  return { ...EMPTY_TIER, id: `t${Date.now()}`, features: [''] };
}

/* ─── Single tier editor ────────────────────────────────────── */
function TierEditor({ tier, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [open, setOpen] = useState(index === 0);

  const set = (key, val) => onUpdate({ ...tier, [key]: val });

  const setFeature = (i, val) => {
    const next = [...tier.features];
    next[i] = val;
    onUpdate({ ...tier, features: next });
  };
  const addFeature    = () => onUpdate({ ...tier, features: [...tier.features, ''] });
  const removeFeature = i  => onUpdate({ ...tier, features: tier.features.filter((_,idx)=>idx!==i) });

  const fi2 = { ...FIELD, padding:'8px 12px', fontSize:'0.85rem' };

  return (
    <div style={{ background:'var(--bg-elevated)', border:`1px solid ${tier.highlight?'var(--accent-border)':'var(--border-2)'}`, borderRadius:'var(--radius-lg)', marginBottom:'12px' }}>

      {/* Row header */}
      <div onClick={()=>setOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 16px', cursor:'pointer', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>
              {tier.name || `Service ${index+1}`}
            </span>
            {tier.highlight && (
              <span style={{ padding:'2px 8px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)' }}>Highlighted</span>
            )}
            {tier.active === false && (
              <span style={{ padding:'2px 8px', background:'rgba(255,69,0,0.1)', border:'1px solid rgba(255,69,0,0.2)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--fire)' }}>Hidden</span>
            )}
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'3px' }}>
            {tier.price ? (isNaN(Number(tier.price)) ? tier.price : `$${tier.price}${tier.priceSuffix||''}`) : 'No price set'} · {tier.features?.length||0} features
          </div>
        </div>
        {/* Reorder + controls */}
        <div style={{ display:'flex', gap:'4px', flexShrink:0 }} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>onMoveUp(index)} disabled={index===0} style={{ padding:'6px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-3)', cursor:index===0?'not-allowed':'pointer', opacity:index===0?0.3:1 }}><ChevronUp size={13}/></button>
          <button onClick={()=>onMoveDown(index)} disabled={index===total-1} style={{ padding:'6px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-3)', cursor:index===total-1?'not-allowed':'pointer', opacity:index===total-1?0.3:1 }}><ChevronDown size={13}/></button>
          <button onClick={()=>onDelete(index)} style={{ padding:'6px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-3)', cursor:'pointer' }}><Trash2 size={13}/></button>
        </div>
        <div style={{ color:'var(--text-3)', flexShrink:0 }}>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</div>
      </div>

      {/* Expanded form */}
      {open && (
        <div style={{ padding:'0 16px 20px', borderTop:'1px solid var(--border-1)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginTop:'16px', marginBottom:'14px' }}>
            <div>
              <label style={LABEL}>Tier Name</label>
              <input style={fi2} value={tier.name} onChange={e=>set('name',e.target.value)} placeholder="Starter"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div>
              <label style={LABEL}>Badge Label (optional)</label>
              <input style={fi2} value={tier.badge||''} onChange={e=>set('badge',e.target.value)} placeholder="Most Popular"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div>
              <label style={LABEL}>Price</label>
              <input style={fi2} value={tier.price} onChange={e=>set('price',e.target.value)} placeholder="299 or Custom"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', marginTop:'3px' }}>Numbers get a $ prefix. Type "Custom" to hide $.</div>
            </div>
            <div>
              <label style={LABEL}>Price Suffix</label>
              <input style={fi2} value={tier.priceSuffix||''} onChange={e=>set('priceSuffix',e.target.value)} placeholder="/project"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={LABEL}>Short Description</label>
              <textarea style={{ ...fi2, minHeight:70, resize:'vertical' }} value={tier.description} onChange={e=>set('description',e.target.value)} placeholder="Perfect for small businesses…"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div>
              <label style={LABEL}>CTA Button Text</label>
              <input style={fi2} value={tier.ctaText||'Get Started'} onChange={e=>set('ctaText',e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div>
              <label style={LABEL}>CTA Button URL</label>
              <input style={fi2} value={tier.ctaUrl||'/contact'} onChange={e=>set('ctaUrl',e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', marginBottom:'20px' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-2)' }}>
              <input type="checkbox" checked={!!tier.highlight} onChange={e=>set('highlight',e.target.checked)} style={{ accentColor:'var(--accent)', width:16, height:16 }}/>
              <span>Highlighted (accent border + shadow)</span>
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-2)' }}>
              <input type="checkbox" checked={tier.active !== false} onChange={e=>set('active',e.target.checked)} style={{ accentColor:'var(--accent)', width:16, height:16 }}/>
              <span>Visible on site</span>
            </label>
          </div>

          {/* Features */}
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'10px' }}>Features</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'10px' }}>
            {(tier.features||[]).map((feat, i) => (
              <div key={i} style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <input style={fi2} value={feat} onChange={e=>setFeature(i,e.target.value)} placeholder={`Feature ${i+1}`}
                  onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
                <button onClick={()=>removeFeature(i)} disabled={(tier.features||[]).length<=1}
                  style={{ padding:'8px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-3)', cursor:(tier.features||[]).length<=1?'not-allowed':'pointer', flexShrink:0, opacity:(tier.features||[]).length<=1?0.3:1 }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
          </div>
          <button onClick={addFeature} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>
            <Plus size={12}/> Add Feature
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main admin page ───────────────────────────────────────── */
export default function AdminServicesPage() {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const [pageHeading,     setPageHeading]     = useState('Services');
  const [pageSubheading,  setPageSubheading]  = useState('Everything you need to grow your business online.');
  const [pageDescription, setPageDescription] = useState('From Shopify stores to full-stack web apps and performance marketing — I build and scale digital businesses.');
  const [ctaHeading,      setCtaHeading]      = useState("Not sure which plan fits?");
  const [ctaText,         setCtaText]         = useState("Book a free 30-minute discovery call and I'll recommend the right approach for your goals.");
  const [ctaButtonText,   setCtaButtonText]   = useState('Book a Free Call');
  const [ctaButtonUrl,    setCtaButtonUrl]    = useState('/contact');
  const [tiers,           setTiers]           = useState([]);

  function addDefaultTiers() {
    setTiers([
      { id:'t1', name:'Starter', price:'299', priceSuffix:'/project', highlight:false, badge:'', description:'Perfect for small businesses launching online.', features:['Shopify or WordPress setup','Mobile responsive design','Basic SEO setup','7 days post-launch support'], ctaText:'Get Started', ctaUrl:'/contact', active:true },
      { id:'t2', name:'Growth',  price:'799', priceSuffix:'/project', highlight:true,  badge:'Most Popular', description:'For brands serious about growing online.', features:['Everything in Starter','Custom UI/UX design','Meta or Google Ads setup','30 days post-launch support'], ctaText:'Get Started', ctaUrl:'/contact', active:true },
      { id:'t3', name:'Scale',   price:'Custom', priceSuffix:'', highlight:false, badge:'Enterprise', description:'Full-service for fast-growing brands.', features:['Everything in Growth','Custom web app development','Ongoing ads management','Unlimited revisions'], ctaText:"Let's Talk", ctaUrl:'/contact', active:true },
    ]);
  }

  useEffect(() => {
    getServices().then(d => {
      if (d) {
        if (d.pageHeading)     setPageHeading(d.pageHeading);
        if (d.pageSubheading)  setPageSubheading(d.pageSubheading);
        if (d.pageDescription) setPageDescription(d.pageDescription);
        if (d.ctaHeading)      setCtaHeading(d.ctaHeading);
        if (d.ctaText)         setCtaText(d.ctaText);
        if (d.ctaButtonText)   setCtaButtonText(d.ctaButtonText);
        if (d.ctaButtonUrl)    setCtaButtonUrl(d.ctaButtonUrl);
        if (d.tiers?.length)   setTiers(d.tiers);
        else                   addDefaultTiers();
      } else {
        addDefaultTiers();
      }
      setLoading(false);
    }).catch(() => { addDefaultTiers(); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setServices({ pageHeading, pageSubheading, pageDescription, ctaHeading, ctaText, ctaButtonText, ctaButtonUrl, tiers });
      toast.success('Services page saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const updateTier  = (i, tier) => setTiers(ts => ts.map((t,idx) => idx===i ? tier : t));
  const deleteTier  = i          => setTiers(ts => ts.filter((_,idx) => idx!==i));
  const addTier     = ()         => setTiers(ts => [...ts, newTier()]);
  const moveTierUp  = i          => { if (i===0) return; setTiers(ts => { const n=[...ts]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; }); };
  const moveTierDown= i          => { setTiers(ts => { if (i===ts.length-1) return ts; const n=[...ts]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; }); };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--accent)' }}>Loading…</div>
  );

  return (
    <div style={{ maxWidth:800 }}>

      {/* Sticky save bar */}
      <div style={{ position:'sticky', top:60, zIndex:40, display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-base)', borderBottom:'1px solid var(--border-1)', padding:'12px 0', marginBottom:'28px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Services Page</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'2px' }}>{tiers.length} tier{tiers.length!==1?'s':''} · shakilxvs.com/services</div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-2)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:saving?'not-allowed':'pointer', flexShrink:0 }}>
          <Save size={15}/>{saving?'Saving…':'Save Changes'}
        </button>
      </div>

      {/* Page headings */}
      <div style={CARD}>
        <div style={HEAD}>Page Headings</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={LABEL}>Section Label (small text above heading)</label>
            <input style={FIELD} value={pageHeading} onChange={e=>setPageHeading(e.target.value)} placeholder="Services"
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
          <div>
            <label style={LABEL}>Main Heading (large)</label>
            <input style={FIELD} value={pageSubheading} onChange={e=>setPageSubheading(e.target.value)} placeholder="Everything you need to grow your business online."
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
          <div>
            <label style={LABEL}>Description Paragraph</label>
            <textarea style={{ ...FIELD, minHeight:80, resize:'vertical' }} value={pageDescription} onChange={e=>setPageDescription(e.target.value)}
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
        </div>
      </div>

      {/* Pricing tiers */}
      <div style={CARD}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <div style={HEAD}>Pricing Tiers</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'-10px' }}>
              Add, edit, or remove service tiers. Use the arrows to reorder.
            </div>
          </div>
          <button onClick={addTier} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', flexShrink:0 }}>
            <Plus size={14}/> Add Tier
          </button>
        </div>

        {tiers.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-lg)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>
            No tiers yet. Click "Add Tier" to create your first service package.
          </div>
        ) : (
          tiers.map((tier, i) => (
            <TierEditor
              key={tier.id || i}
              tier={tier}
              index={i}
              total={tiers.length}
              onUpdate={t  => updateTier(i,t)}
              onDelete={()  => deleteTier(i)}
              onMoveUp={()  => moveTierUp(i)}
              onMoveDown={()=> moveTierDown(i)}
            />
          ))
        )}
      </div>

      {/* Bottom CTA section */}
      <div style={CARD}>
        <div style={HEAD}>Bottom CTA Section</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={LABEL}>CTA Heading</label>
            <input style={FIELD} value={ctaHeading} onChange={e=>setCtaHeading(e.target.value)} placeholder="Not sure which plan fits?"
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
          <div>
            <label style={LABEL}>CTA Description</label>
            <textarea style={{ ...FIELD, minHeight:80, resize:'vertical' }} value={ctaText} onChange={e=>setCtaText(e.target.value)}
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div>
              <label style={LABEL}>Button Text</label>
              <input style={FIELD} value={ctaButtonText} onChange={e=>setCtaButtonText(e.target.value)} placeholder="Book a Free Call"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div>
              <label style={LABEL}>Button URL</label>
              <input style={FIELD} value={ctaButtonUrl} onChange={e=>setCtaButtonUrl(e.target.value)} placeholder="/contact"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
