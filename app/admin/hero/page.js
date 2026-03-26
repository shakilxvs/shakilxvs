'use client';
import { useState, useEffect, useRef } from 'react';
import { getPortfolioDoc, setPortfolioDoc } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Upload, Loader } from 'lucide-react';

/* ─── Shared styles ──────────────────────────────────────────── */
const FIELD = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
const LABEL = { fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px', display:'block' };
const CARD  = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
const HEAD  = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };

/* ─── Layout visual previews ─────────────────────────────────── */
function PreviewClassic() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', height:'54px', alignItems:'center' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
        <div style={{ height:'7px', width:'65%', background:'var(--text-1)', borderRadius:2, opacity:0.75 }}/>
        <div style={{ height:'3px', width:'85%', background:'var(--accent)', borderRadius:2 }}/>
        <div style={{ height:'2px', width:'90%', background:'var(--text-3)', borderRadius:2, marginTop:'1px' }}/>
        <div style={{ display:'flex', gap:'3px', marginTop:'3px' }}>
          <div style={{ height:'9px', width:'34px', background:'var(--accent)', borderRadius:3 }}/>
          <div style={{ height:'9px', width:'26px', background:'var(--border-2)', borderRadius:3 }}/>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <div style={{ width:'30px', height:'30px', borderRadius:'50%', border:'2px solid rgba(35,77,194,0.5)', background:'var(--bg-elevated)' }}/>
      </div>
    </div>
  );
}
function PreviewAgency() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'54px', justifyContent:'center' }}>
      <div style={{ height:'13px', width:'75%', background:'var(--text-1)', borderRadius:2, opacity:0.75 }}/>
      <div style={{ height:'3px', width:'55%', background:'var(--accent)', borderRadius:2 }}/>
      <div style={{ height:'2px', width:'65%', background:'var(--text-3)', borderRadius:2 }}/>
      <div style={{ display:'flex', gap:'3px', marginTop:'2px' }}>
        {[0,1,2,3].map(i=><div key={i} style={{ height:'9px', width:'16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:3 }}/>)}
      </div>
    </div>
  );
}
function PreviewMinimal() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:'6px', height:'54px', alignItems:'center' }}>
      <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', height:'100%', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1rem', color:'var(--accent)', opacity:0.45 }}>S</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
        <div style={{ height:'6px', width:'55%', background:'var(--text-1)', borderRadius:2, opacity:0.75 }}/>
        <div style={{ height:'2px', width:'75%', background:'var(--accent)', borderRadius:2 }}/>
        <div style={{ height:'2px', width:'85%', background:'var(--text-3)', borderRadius:2 }}/>
        <div style={{ height:'9px', width:'46px', background:'var(--accent)', borderRadius:3, marginTop:'2px' }}/>
      </div>
    </div>
  );
}

/* ─── Layout selector ────────────────────────────────────────── */
function LayoutSelector({ value, onChange }) {
  const LAYOUTS = [
    { id:'1', name:'Classic',      desc:'Photo circle · typewriter taglines · floating cards', Preview:PreviewClassic },
    { id:'2', name:'Agency Bold',  desc:'Centered headline · no photo · stat cards row',       Preview:PreviewAgency  },
    { id:'3', name:'Minimal Card', desc:'Portrait photo · name + role + bio · 2×2 stats',     Preview:PreviewMinimal },
  ];
  return (
    <div style={CARD}>
      <div style={HEAD}>Hero Layout</div>
      <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginBottom:'20px' }}>
        Choose which layout displays on your homepage. Save after switching.
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }} className="layout-sel-grid">
        {LAYOUTS.map(({ id, name, desc, Preview }) => (
          <button key={id} onClick={() => onChange(id)} style={{
            background:  value===id ? 'rgba(35,77,194,0.08)' : 'var(--bg-elevated)',
            border:      value===id ? '2px solid var(--accent)' : '1px solid var(--border-2)',
            borderRadius:'var(--radius-lg)', padding:'16px', cursor:'pointer',
            textAlign:'left', transition:'all 0.15s ease', outline:'none',
          }}>
            <div style={{ marginBottom:'10px', pointerEvents:'none' }}><Preview/></div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', color:value===id?'var(--accent)':'var(--text-1)', marginBottom:'4px' }}>{name}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.72rem', color:'var(--text-3)', lineHeight:1.4 }}>{desc}</div>
          </button>
        ))}
      </div>
      <style>{`@media(max-width:600px){.layout-sel-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

/* ─── Marquee logos section (identical to original) ──────────── */
const MQ_R1 = [
  { label:'Shopify',     src:'https://cdn.simpleicons.org/shopify',     invert:false },
  { label:'WordPress',   src:'https://cdn.simpleicons.org/wordpress',   invert:false },
  { label:'Wix',         src:'https://cdn.simpleicons.org/wix',         invert:true  },
  { label:'WooCommerce', src:'https://cdn.simpleicons.org/woocommerce', invert:false },
  { label:'Webflow',     src:'https://cdn.simpleicons.org/webflow',     invert:false },
  { label:'Squarespace', src:'https://cdn.simpleicons.org/squarespace', invert:true  },
  { label:'Meta',        src:'https://cdn.simpleicons.org/meta',        invert:false },
  { label:'Google',      src:'https://cdn.simpleicons.org/google',      invert:false },
  { label:'TikTok',      src:'https://cdn.simpleicons.org/tiktok',      invert:true  },
  { label:'Pinterest',   src:'https://cdn.simpleicons.org/pinterest',   invert:false },
];
const MQ_R2 = [
  { label:'Next.js',    src:'https://cdn.simpleicons.org/nextdotjs',    invert:true  },
  { label:'Firebase',   src:'https://cdn.simpleicons.org/firebase',     invert:false },
  { label:'React',      src:'https://cdn.simpleicons.org/react',        invert:false },
  { label:'Tailwind',   src:'https://cdn.simpleicons.org/tailwindcss',  invert:false },
  { label:'JavaScript', src:'https://cdn.simpleicons.org/javascript',   invert:false },
  { label:'PHP',        src:'https://cdn.simpleicons.org/php',          invert:false },
  { label:'Python',     src:'https://cdn.simpleicons.org/python',       invert:false },
  { label:'Figma',      src:'https://cdn.simpleicons.org/figma',        invert:false },
  { label:'GitHub',     src:'https://cdn.simpleicons.org/github',       invert:true  },
  { label:'Vercel',     src:'https://cdn.simpleicons.org/vercel',       invert:true  },
];

function MarqueeLogosSection() {
  const [row1, setRow1] = useState(MQ_R1);
  const [row2, setRow2] = useState(MQ_R2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPortfolioDoc('marqueeLogos').then(d => {
      if (d?.row1?.length) setRow1(d.row1);
      if (d?.row2?.length) setRow2(d.row2);
    }).catch(()=>{});
  }, []);

  const setField = (setter,i,key,val) => setter(arr=>arr.map((item,idx)=>idx===i?{...item,[key]:val}:item));
  const addItem  = (setter,arr) => setter([...arr,{label:'',src:'',invert:false}]);
  const delItem  = (setter,i)   => setter(arr=>arr.filter((_,idx)=>idx!==i));

  const save = async () => {
    setSaving(true);
    try { await setPortfolioDoc('marqueeLogos',{row1,row2}); toast.success('Marquee logos saved!'); }
    catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const fi2 = { padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', outline:'none', width:'100%', boxSizing:'border-box' };
  const lb2 = { fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'3px', display:'block' };

  const RowEditor = ({ title, items, setter }) => (
    <div style={{ marginBottom:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>{title}</div>
        <button onClick={()=>addItem(setter,items)} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', color:'var(--text-2)', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontSize:'0.72rem', cursor:'pointer' }}>
          <Plus size={11}/> Add
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
        {items.map((item,i)=>(
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:'8px', alignItems:'end', padding:'10px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)' }}>
            <div><label style={lb2}>Label</label><input style={fi2} value={item.label||''} onChange={e=>setField(setter,i,'label',e.target.value)} placeholder="Shopify"/></div>
            <div><label style={lb2}>Logo URL</label><input style={fi2} value={item.src||''} onChange={e=>setField(setter,i,'src',e.target.value)} placeholder="https://cdn.simpleicons.org/shopify"/></div>
            <label style={{ display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.72rem', color:'var(--text-3)', whiteSpace:'nowrap', paddingBottom:'2px' }}>
              <input type="checkbox" checked={item.invert||false} onChange={e=>setField(setter,i,'invert',e.target.checked)} style={{ accentColor:'var(--accent)' }}/> Invert
            </label>
            <button onClick={()=>delItem(setter,i)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'6px' }}><Trash2 size={13}/></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={CARD}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
        <div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em' }}>Marquee Logos</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'3px' }}>Two rows of logos in the scrolling strip. "Invert" makes dark SVGs white on dark background.</div>
        </div>
        <button onClick={save} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:saving?'not-allowed':'pointer', flexShrink:0 }}>
          <Save size={13}/>{saving?'Saving…':'Save Marquee'}
        </button>
      </div>
      <RowEditor title="Row 1 — scrolls left"  items={row1} setter={setRow1}/>
      <RowEditor title="Row 2 — scrolls right" items={row2} setter={setRow2}/>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>Tip: https://cdn.simpleicons.org/[brandname] works for most logos</div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function AdminHeroPage() {
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    layout: '1',
    name: 'Shakil',
    taglines: ['CMS & Custom Web Expert','Shopify Developer','Digital Marketing Strategist'],
    subtitle: '6+ years building premium stores, marketing systems, and custom web experiences for global brands.',
    stat1Label:'Projects Done', stat1Value:5000,
    stat2Label:'Happy Clients', stat2Value:1200,
    stat3Label:'Countries',     stat3Value:47,
    stat4Label:'Years XP',      stat4Value:6,
    cta1Text:'View My Work', cta1Url:'/projects',
    cta2Text:'Hire Me',      cta2Url:'/contact',
    profileImageUrl:'',
    responseTime:'< 2 hrs',
    l3Role:'Shopify Developer & Digital Marketer',
    l3AvailText:'Available for new projects',
  });

  useEffect(() => {
    getPortfolioDoc('hero').then(data => {
      if (data) setForm(f => ({ ...f, ...data }));
      setLoading(false);
    });
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const setTagline = (i, val) => {
    const next = [...form.taglines];
    next[i] = val;
    setForm(f => ({ ...f, taglines: next }));
  };
  const addTagline    = () => setForm(f => ({ ...f, taglines: [...f.taglines, ''] }));
  const removeTagline = i => {
    if (form.taglines.length <= 1) return;
    setForm(f => ({ ...f, taglines: f.taglines.filter((_,idx) => idx !== i) }));
  };

  const handleImageUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'portfolio/profile');
      set('profileImageUrl', url);
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setPortfolioDoc('hero', {
        ...form,
        stat1Value: Number(form.stat1Value),
        stat2Value: Number(form.stat2Value),
        stat3Value: Number(form.stat3Value),
        stat4Value: Number(form.stat4Value),
      });
      toast.success('Hero section saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--accent)' }}>Loading...</div>
  );

  const layout = String(form.layout || '1');
  const layoutName = layout==='1' ? 'Classic' : layout==='2' ? 'Agency Bold' : 'Minimal Card';

  return (
    <div style={{ maxWidth:800 }}>

      {/* Sticky save bar */}
      <div style={{ position:'sticky', top:60, zIndex:40, display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-base)', borderBottom:'1px solid var(--border-1)', padding:'12px 0', marginBottom:'28px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Hero Section</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'2px' }}>
            Layout: <strong style={{ color:'var(--text-1)', fontWeight:700 }}>{layoutName}</strong> · Changes appear on homepage after saving
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-2)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:saving?'not-allowed':'pointer', flexShrink:0 }}>
          <Save size={15}/>{saving?'Saving…':'Save Changes'}
        </button>
      </div>

      {/* Layout Selector */}
      <LayoutSelector value={layout} onChange={v => set('layout', v)}/>

      {/* ── Profile Photo (layouts 1 and 3) ──────────────────── */}
      {(layout === '1' || layout === '3') && (
        <div style={CARD}>
          <div style={HEAD}>Profile Photo</div>
          <div style={{ display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
            <div style={{ width:80, height:80, borderRadius:layout==='3'?'12px':'50%', border:'2px solid var(--border-2)', background:'var(--bg-elevated)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {form.profileImageUrl
                ? <img src={form.profileImageUrl} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <span style={{ color:'var(--text-3)', fontSize:'0.7rem' }}>No img</span>
              }
            </div>
            <div style={{ flex:1 }}>
              <input type="text" placeholder="Or paste image URL" value={form.profileImageUrl} onChange={e=>set('profileImageUrl',e.target.value)}
                style={{ ...FIELD, marginBottom:'10px' }}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <button onClick={()=>fileRef.current?.click()} disabled={uploading}
                style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', cursor:'pointer' }}>
                {uploading ? <Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Upload size={14}/>}
                {uploading ? 'Uploading…' : 'Upload Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload}/>
            </div>
          </div>
          {layout === '3' && (
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'10px' }}>
              Layout 3 displays photo as a portrait card (3:4 ratio). Upload a portrait-orientation photo for best results.
            </div>
          )}
        </div>
      )}

      {/* ── Name + Subtitle (all layouts) ────────────────────── */}
      <div style={CARD}>
        <div style={HEAD}>{layout==='2' ? 'Headline & Description' : 'Name & Subtitle'}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={LABEL}>{layout==='2' ? 'Headline (displayed very large)' : 'Display Name'}</label>
            <input style={FIELD} value={form.name} onChange={e=>set('name',e.target.value)}
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
          <div>
            <label style={LABEL}>{layout==='3' ? 'Bio Paragraph' : layout==='2' ? 'Description Paragraph' : 'Subtitle'}</label>
            <textarea style={{ ...FIELD, minHeight:90, resize:'vertical' }} value={form.subtitle} onChange={e=>set('subtitle',e.target.value)}
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
          {(layout === '1' || layout === '3') && (
            <div>
              <label style={LABEL}>Response Time</label>
              <input style={FIELD} value={form.responseTime} onChange={e=>set('responseTime',e.target.value)} placeholder="< 2 hrs"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          )}
        </div>
      </div>

      {/* ── Taglines (layout 1 only: animated list) ──────────── */}
      {layout === '1' && (
        <div style={CARD}>
          <div style={HEAD}>Animated Taglines</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
            {form.taglines.map((t, i) => (
              <div key={i} style={{ display:'flex', gap:'8px' }}>
                <input style={FIELD} value={t} onChange={e=>setTagline(i,e.target.value)} placeholder={`Tagline ${i+1}`}
                  onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
                <button onClick={()=>removeTagline(i)} disabled={form.taglines.length<=1}
                  style={{ padding:'10px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>
          <button onClick={addTagline}
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 16px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', cursor:'pointer' }}>
            <Plus size={14}/> Add Tagline
          </button>
        </div>
      )}

      {/* ── Subheadline (layout 2 only: single tagline field) ── */}
      {layout === '2' && (
        <div style={CARD}>
          <div style={HEAD}>Subheadline</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginBottom:'12px' }}>
            Displayed below the headline in accent colour. E.g. "CMS & Shopify Expert" or "5000+ Projects Delivered Worldwide".
          </div>
          <label style={LABEL}>Subheadline Text</label>
          <input style={FIELD} value={form.taglines?.[0]||''} onChange={e => {
            const next = [...(form.taglines||[''])];
            next[0] = e.target.value;
            setForm(f => ({ ...f, taglines: next }));
          }} placeholder="CMS & Custom Web Expert"
            onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
        </div>
      )}

      {/* ── Role + Availability (layout 3 only) ──────────────── */}
      {layout === '3' && (
        <div style={CARD}>
          <div style={HEAD}>Role & Availability</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={LABEL}>Role / Title</label>
              <input style={FIELD} value={form.l3Role||''} onChange={e=>set('l3Role',e.target.value)} placeholder="Shopify Developer & Digital Marketer"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'4px' }}>Shown below your name in accent colour.</div>
            </div>
            <div>
              <label style={LABEL}>Availability Text</label>
              <input style={FIELD} value={form.l3AvailText||''} onChange={e=>set('l3AvailText',e.target.value)} placeholder="Available for new projects"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'4px' }}>Shown with a pulsing green dot on your photo.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats (all layouts) ───────────────────────────────── */}
      <div style={CARD}>
        <div style={HEAD}>Stat Numbers</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[1,2,3,4].map(n => (
            <div key={n} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px' }}>
              <label style={LABEL}>Stat {n} Label</label>
              <input style={{ ...FIELD, marginBottom:'10px' }} value={form[`stat${n}Label`]} onChange={e=>set(`stat${n}Label`,e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <label style={LABEL}>Stat {n} Number</label>
              <input type="number" style={FIELD} value={form[`stat${n}Value`]} onChange={e=>set(`stat${n}Value`,e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Buttons ───────────────────────────────────────── */}
      <div style={CARD}>
        <div style={HEAD}>{layout==='3' ? 'CTA Button' : 'CTA Buttons'}</div>
        <div style={{ display:'grid', gridTemplateColumns:layout==='3'?'1fr':'1fr 1fr', gap:'16px' }}>
          {(layout==='3' ? [1] : [1,2]).map(n => (
            <div key={n}>
              <label style={LABEL}>Button {n} Label</label>
              <input style={{ ...FIELD, marginBottom:'10px' }} value={form[`cta${n}Text`]} onChange={e=>set(`cta${n}Text`,e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <label style={LABEL}>Button {n} URL</label>
              <input style={FIELD} value={form[`cta${n}Url`]} onChange={e=>set(`cta${n}Url`,e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          ))}
        </div>
      </div>

      <MarqueeLogosSection/>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
