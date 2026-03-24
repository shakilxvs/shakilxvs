'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc, seedSampleData, getCustomPages, setCustomPages } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Save, Database, ExternalLink, AlertTriangle, Phone, Mail, MessageCircle, Instagram, Linkedin, Twitter, Facebook, Music2, Lock, Eye, EyeOff, Plus, Trash2, GripVertical, Image, Type, Code } from 'lucide-react';

const DEFAULT_SECTIONS = { hero:true,marquee:true,about:true,skills:true,projects:true,reviews:true,cta:true };
const DEFAULT_NAV = [
  { href:'/',         label:'Home',     visible:true  },
  { href:'/projects', label:'Projects', visible:true  },
  { href:'/apps',     label:'Apps',     visible:true  },
  { href:'/files',    label:'Files',    visible:true  },
  { href:'/reviews',  label:'Reviews',  visible:true  },
  { href:'/pay',      label:'Pay',      visible:true  },
  { href:'/contact',  label:'Contact',  visible:true  },
];


/* ─── Tracking card component ─────────────────────────────── */
function TrackingCard({ name, color, active, warning, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:'var(--bg-elevated)', border:`1px solid ${active?'var(--accent-border)':'var(--border-1)'}`, borderRadius:'var(--radius-md)', overflow:'hidden', transition:'border-color 0.2s' }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', cursor:'pointer', userSelect:'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0 }}/>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.875rem', color:'var(--text-1)' }}>{name}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:active?'var(--accent)':'var(--text-3)', letterSpacing:'0.08em' }}>{active?'Active':'Not configured'}</span>
          <span style={{ color:'var(--text-3)', fontSize:'0.7rem', transition:'transform 0.2s', display:'inline-block', transform:open?'rotate(180deg)':'rotate(0deg)' }}>▼</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid var(--border-1)' }}>
          <div style={{ paddingTop:'14px' }}>
            {warning && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', color:'#f5a623', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.25)', borderRadius:'var(--radius-md)', padding:'8px 12px', marginBottom:'12px' }}>{warning}</div>}
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const fi  = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' };
  const lb  = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'5px', display:'block' };
  const cd  = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
  const hd  = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };
  const foc = e => e.target.style.borderColor = 'var(--accent-border)';
  const blr = e => e.target.style.borderColor = 'var(--border-2)';

  const [site,         setSite]         = useState({ siteName:'', metaDescription:'', ogImageUrl:'' });
  const [contact,      setContact]      = useState({ phone:'',email:'',whatsapp:'',instagram:'',linkedin:'',twitter:'',facebook:'',tiktok:'',workingHours:'',showPhone:true,showEmail:true,showWhatsapp:true,showInstagram:true,showLinkedin:true,showTwitter:true,showFacebook:true,showTiktok:true });
  const [sections,     setSections]     = useState(DEFAULT_SECTIONS);
  const [navItems,     setNavItems]     = useState(DEFAULT_NAV);
  const [customPages,  setCustomPagesS] = useState([]);
  const [logo,         setLogo]         = useState({ type:'default', imageUrl:'', text:'<shakil />' });
  const [badge,        setBadge]        = useState({ show:false, text:'Available for work', color:'#00cc66' });
  const [accentColor,  setAccentColor]  = useState('#234DC2');
  const [tracking,     setTracking]     = useState({ gaId:'', gtmId:'', metaPixelId:'', tiktokPixelId:'', pinterestTagId:'', pinterestDomainVerify:'' });
  const [seo,          setSeo]          = useState({ home:{title:'',description:''}, projects:{title:'',description:''}, reviews:{title:'',description:''}, contact:{title:'',description:''}, apps:{title:'',description:''}, files:{title:'',description:''}, pay:{title:'',description:''} });
  const [currentPw,    setCurrentPw]    = useState('');
  const [newPw,        setNewPw]        = useState('');
  const [confirmPw,    setConfirmPw]    = useState('');
  const [showNewPw,    setShowNewPw]    = useState(false);
  const [showCurPw,    setShowCurPw]    = useState(false);

  const [savingSite,     setSavingSite]     = useState(false);
  const [savingContact,  setSavingContact]  = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [savingNav,      setSavingNav]      = useState(false);
  const [savingLogo,     setSavingLogo]     = useState(false);
  const [savingBadge,    setSavingBadge]    = useState(false);
  const [savingAccent,   setSavingAccent]   = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingSeo,      setSavingSeo]      = useState(false);
  const [changingPw,     setChangingPw]     = useState(false);
  const [seeding,        setSeeding]        = useState(false);

  useEffect(() => {
    Promise.all([getPortfolioDoc('siteSettings'), getPortfolioDoc('contact'), getCustomPages()]).then(([s,c,cp]) => {
      if (s) {
        setSite(x=>({...x,...s}));
        if (s.sections)     setSections(x=>({...x,...s.sections}));
        if (s.navItems)     setNavItems(s.navItems);
        if (s.logo)         setLogo(x=>({...x,...s.logo}));
        if (s.badge)        setBadge(x=>({...x,...s.badge}));
        if (s.accentColor)  setAccentColor(s.accentColor);
        if (s.tracking)     setTracking(x=>({...x,...s.tracking}));
        if (s.seo)          setSeo(x=>({...x,...s.seo}));
      }
      if (c) setContact(x=>({...x,...c}));
      if (cp) setCustomPagesS(cp);
    });
  }, []);

  const saveAll = async (key, data, setter, label) => {
    setter(true);
    try { await setPortfolioDoc('siteSettings', { ...site, sections, navItems, logo, badge, accentColor, tracking, seo, [key]: data }); toast.success(`${label} saved!`); }
    catch { toast.error('Save failed'); } finally { setter(false); }
  };
  const saveSite     = () => { setSavingSite(true);     setPortfolioDoc('siteSettings', {...site,sections,navItems,logo,badge,accentColor,tracking,seo}).then(()=>toast.success('Site settings saved!')).catch(()=>toast.error('Save failed')).finally(()=>setSavingSite(false)); };
  const saveContact  = () => { setSavingContact(true);  setPortfolioDoc('contact', contact).then(()=>toast.success('Contact saved!')).catch(()=>toast.error('Save failed')).finally(()=>setSavingContact(false)); };
  const saveSections = () => { setSavingSections(true); setPortfolioDoc('siteSettings',{sections}).then(()=>toast.success('Sections saved!')).catch(()=>toast.error('Save failed')).finally(()=>setSavingSections(false)); };
  const saveNav      = async () => {
    setSavingNav(true);
    try {
      await setPortfolioDoc('siteSettings', { navItems });
      await setCustomPages(customPages);
      toast.success('Navigation saved!');
    } catch { toast.error('Save failed'); } finally { setSavingNav(false); }
  };
  const saveLogo     = () => { setSavingLogo(true);     setPortfolioDoc('siteSettings',{logo}).then(()=>toast.success('Logo saved!')).catch(()=>toast.error('Save failed')).finally(()=>setSavingLogo(false)); };
  const saveBadge    = () => { setSavingBadge(true);    setPortfolioDoc('siteSettings',{badge}).then(()=>toast.success('Badge saved!')).catch(()=>toast.error('Save failed')).finally(()=>setSavingBadge(false)); };
  const saveAccent   = () => { setSavingAccent(true);   setPortfolioDoc('siteSettings',{accentColor}).then(()=>toast.success('Accent color saved! Redeploy to apply.')).catch(()=>toast.error('Save failed')).finally(()=>setSavingAccent(false)); };
  const saveTracking = () => { setSavingTracking(true); setPortfolioDoc('siteSettings',{tracking}).then(()=>toast.success('Tracking IDs saved!')).catch(()=>toast.error('Save failed')).finally(()=>setSavingTracking(false)); };
  const saveSeo      = () => { setSavingSeo(true);      setPortfolioDoc('siteSettings',{seo}).then(()=>toast.success('SEO saved!')).catch(()=>toast.error('Save failed')).finally(()=>setSavingSeo(false)); };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8)   { toast.error('Password must be at least 8 characters'); return; }
    setChangingPw(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPw);
      toast.success('Password updated!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      if (err.code==='auth/wrong-password'||err.code==='auth/invalid-credential') toast.error('Current password is incorrect');
      else toast.error('Failed. Try signing out and back in first.');
    } finally { setChangingPw(false); }
  };

  const SaveBtn = ({ onClick, saving, label='Save' }) => (
    <button onClick={onClick} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:saving?'not-allowed':'pointer', flexShrink:0 }}>
      <Save size={13}/>{saving?'Saving…':label}
    </button>
  );

  const CONTACT_FIELDS = [
    {key:'phone',label:'Phone',icon:Phone},{key:'email',label:'Email',icon:Mail},{key:'whatsapp',label:'WhatsApp',icon:MessageCircle},
    {key:'instagram',label:'Instagram URL',icon:Instagram},{key:'linkedin',label:'LinkedIn URL',icon:Linkedin},
    {key:'twitter',label:'Twitter / X URL',icon:Twitter},{key:'facebook',label:'Facebook URL',icon:Facebook},{key:'tiktok',label:'TikTok URL',icon:Music2},
  ];
  const SECTION_KEYS = [
    {key:'hero',label:'Hero section'},{key:'marquee',label:'Marquee strip'},
    {key:'about',label:'About section'},{key:'skills',label:'Skills section'},
    {key:'projects',label:'Featured Projects'},{key:'reviews',label:'Reviews teaser'},{key:'cta',label:'CTA Banner'},
  ];
  const SEO_PAGES = ['home','projects','reviews','contact','apps','files','pay'];

  return (
    <div style={{ maxWidth:820 }}>

      {/* ── Site Logo ───────────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div><div style={hd}>Site Logo</div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Shown in navbar and admin sidebar</div></div>
          <SaveBtn onClick={saveLogo} saving={savingLogo}/>
        </div>
        {/* Logo type tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
          {[['default','Default <shakil />'],['image','Image URL'],['text','Custom Text']].map(([t,l])=>(
            <button key={t} onClick={()=>setLogo(x=>({...x,type:t}))} style={{ padding:'6px 14px', borderRadius:'var(--radius-md)', border:`1px solid ${logo.type===t?'var(--accent-border)':'var(--border-2)'}`, background:logo.type===t?'var(--accent-muted)':'transparent', color:logo.type===t?'var(--accent)':'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer', transition:'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>
        {logo.type==='image'&&(
          <div>
            <label style={lb}>Image URL (paste from Media Library)</label>
            <input style={fi} value={logo.imageUrl||''} onChange={e=>setLogo(x=>({...x,imageUrl:e.target.value}))} placeholder="https://res.cloudinary.com/..." onFocus={foc} onBlur={blr}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'6px' }}>Logo will display at max height 32px. Wide logos (like "Western Union text") display naturally — not cropped.</div>
            {logo.imageUrl&&<div style={{ marginTop:'12px', padding:'12px', background:'var(--bg-void)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)' }}>
              <img src={logo.imageUrl} alt="Logo preview" style={{ height:32, width:'auto', maxWidth:'100%', objectFit:'contain' }}/>
            </div>}
          </div>
        )}
        {logo.type==='text'&&(
          <div>
            <label style={lb}>Custom Text</label>
            <input style={fi} value={logo.text||''} onChange={e=>setLogo(x=>({...x,text:e.target.value}))} placeholder="<shakil />" onFocus={foc} onBlur={blr}/>
          </div>
        )}
        {logo.type==='default'&&<div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.75rem', color:'var(--accent)', padding:'10px 0' }}>{'<shakil />'} — default logo</div>}
      </div>

      {/* ── Available for Work Badge ─────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div><div style={hd}>Available for Work Badge</div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Shown on hero section</div></div>
          <SaveBtn onClick={saveBadge} saving={savingBadge}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr auto', gap:'12px', alignItems:'end', flexWrap:'wrap' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', paddingBottom:'2px' }}>
            <input type="checkbox" checked={badge.show} onChange={e=>setBadge(x=>({...x,show:e.target.checked}))} style={{ accentColor:'var(--accent)', width:16, height:16 }}/>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', fontWeight:500 }}>Show</span>
          </label>
          <div>
            <label style={lb}>Badge Text</label>
            <input style={fi} value={badge.text||''} onChange={e=>setBadge(x=>({...x,text:e.target.value}))} placeholder="Available for work" onFocus={foc} onBlur={blr}/>
          </div>
          <div>
            <label style={lb}>Badge Color</label>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <input type="color" value={badge.color||'#00cc66'} onChange={e=>setBadge(x=>({...x,color:e.target.value}))} style={{ width:44, height:38, padding:'2px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-2)', background:'none', cursor:'pointer' }}/>
              <input style={{ ...fi, flex:1 }} value={badge.color||''} onChange={e=>setBadge(x=>({...x,color:e.target.value}))} placeholder="#00cc66" onFocus={foc} onBlur={blr}/>
            </div>
          </div>
          {badge.show&&<div style={{ padding:'6px 14px', borderRadius:100, background:`${badge.color||'#00cc66'}22`, border:`1px solid ${badge.color||'#00cc66'}`, color:badge.color||'#00cc66', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', whiteSpace:'nowrap', fontWeight:700, letterSpacing:'0.08em', marginBottom:'2px' }}>
            {badge.text||'Available'}
          </div>}
        </div>
      </div>

      {/* ── Accent Color ─────────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div><div style={hd}>Accent Color</div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Changes site-wide highlight color. Requires redeploy to apply.</div></div>
          <SaveBtn onClick={saveAccent} saving={savingAccent}/>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
          <input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)} style={{ width:60, height:44, padding:'2px', borderRadius:'var(--radius-md)', border:'1px solid var(--border-2)', background:'none', cursor:'pointer' }}/>
          <input style={{ ...fi, maxWidth:160 }} value={accentColor} onChange={e=>setAccentColor(e.target.value)} placeholder="#234DC2" onFocus={foc} onBlur={blr}/>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {['#234DC2','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777'].map(c=>(
              <button key={c} onClick={()=>setAccentColor(c)} style={{ width:30, height:30, borderRadius:'50%', background:c, border:accentColor===c?`3px solid #fff`:'2px solid transparent', cursor:'pointer', outline:'none', boxShadow:accentColor===c?`0 0 0 2px ${c}`:'none' }}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navigation Editor ─────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div><div style={hd}>Navigation Menu</div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Show/hide, rename, reorder items. Add custom pages with your own code.</div></div>
          <SaveBtn onClick={saveNav} saving={savingNav} label="Save Nav"/>
        </div>
        {/* Built-in nav items */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>Built-in Pages</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {navItems.map((item,i)=>(
              <div key={item.href} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'10px', alignItems:'center', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}>
                  <input type="checkbox" checked={item.visible!==false} onChange={e=>setNavItems(n=>n.map((x,idx)=>idx===i?{...x,visible:e.target.checked}:x))} style={{ accentColor:'var(--accent)' }}/>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>Show</span>
                </label>
                <input style={{ ...fi, padding:'7px 10px', fontSize:'0.82rem' }} value={item.label} onChange={e=>setNavItems(n=>n.map((x,idx)=>idx===i?{...x,label:e.target.value}:x))} onFocus={foc} onBlur={blr}/>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{item.href}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Custom pages */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Custom Pages</div>
            <button onClick={()=>setCustomPagesS(p=>[...p,{slug:'',label:'',code:'',active:true}])} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', color:'var(--text-2)', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontSize:'0.72rem', cursor:'pointer' }}>
              <Plus size={11}/> Add Page
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {customPages.map((page,i)=>(
              <div key={i} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'14px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'10px', marginBottom:'10px' }}>
                  <div><label style={lb}>Page Label (shown in nav)</label><input style={fi} value={page.label||''} onChange={e=>setCustomPagesS(p=>p.map((x,idx)=>idx===i?{...x,label:e.target.value}:x))} placeholder="My Page" onFocus={foc} onBlur={blr}/></div>
                  <div><label style={lb}>URL slug (e.g. /my-page)</label><input style={fi} value={page.slug||''} onChange={e=>setCustomPagesS(p=>p.map((x,idx)=>idx===i?{...x,slug:e.target.value}:x))} placeholder="/services" onFocus={foc} onBlur={blr}/></div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', paddingBottom:'2px' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:'5px', cursor:'pointer' }}>
                      <input type="checkbox" checked={page.active!==false} onChange={e=>setCustomPagesS(p=>p.map((x,idx)=>idx===i?{...x,active:e.target.checked}:x))} style={{ accentColor:'var(--accent)' }}/>
                      <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>Active</span>
                    </label>
                    <button onClick={()=>setCustomPagesS(p=>p.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'6px' }}><Trash2 size={13}/></button>
                  </div>
                </div>
                <div>
                  <label style={lb}>Page Code (paste any HTML, embed code, React-style JSX, or iframe)</label>
                  <textarea value={page.code||''} onChange={e=>setCustomPagesS(p=>p.map((x,idx)=>idx===i?{...x,code:e.target.value}:x))} placeholder="Paste your page content, iframe embed, Notion page embed, Typeform, Calendly, or any HTML..." style={{ ...fi, minHeight:120, resize:'vertical', fontFamily:'Space Mono,monospace', fontSize:'0.75rem' }} onFocus={foc} onBlur={blr}/>
                </div>
              </div>
            ))}
            {customPages.length===0&&<div style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-3)', fontSize:'0.82rem', textAlign:'center', padding:'16px' }}>No custom pages yet. Click "Add Page" to create one.</div>}
          </div>
        </div>
      </div>

      {/* ── Page Section Visibility ────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div><div style={hd}>Homepage Sections</div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Toggle which sections show on homepage</div></div>
          <SaveBtn onClick={saveSections} saving={savingSections}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {SECTION_KEYS.map(({key,label})=>(
            <label key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', cursor:'pointer' }}>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', fontWeight:500 }}>{label}</span>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:sections[key]!==false?'var(--accent)':'var(--text-3)' }}>{sections[key]!==false?'Visible':'Hidden'}</span>
                <input type="checkbox" checked={sections[key]!==false} onChange={e=>setSections(s=>({...s,[key]:e.target.checked}))} style={{ accentColor:'var(--accent)', width:16, height:16 }}/>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── SEO Per-Page ─────────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div><div style={hd}>SEO — Per Page Metadata</div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Title and description for each page</div></div>
          <SaveBtn onClick={saveSeo} saving={savingSeo} label="Save SEO"/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {SEO_PAGES.map(page=>(
            <div key={page} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'14px' }}>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)', marginBottom:'10px', textTransform:'capitalize' }}>{page==='home'?'Homepage':page.charAt(0).toUpperCase()+page.slice(1)} Page</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'8px' }}>
                <div><label style={lb}>Title (50-60 chars)</label><input style={fi} value={seo[page]?.title||''} onChange={e=>setSeo(s=>({...s,[page]:{...s[page],title:e.target.value}}))} placeholder={`Shakil — ${page.charAt(0).toUpperCase()+page.slice(1)}`} onFocus={foc} onBlur={blr}/></div>
                <div><label style={lb}>Description (140-160 chars)</label><textarea style={{ ...fi, minHeight:56, resize:'vertical' }} value={seo[page]?.description||''} onChange={e=>setSeo(s=>({...s,[page]:{...s[page],description:e.target.value}}))} onFocus={foc} onBlur={blr}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tracking & Analytics ──────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <div><div style={hd}>Tracking &amp; Analytics</div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Paste only the ID for each platform — script injected automatically</div></div>
          <SaveBtn onClick={saveTracking} saving={savingTracking} label="Save Tracking"/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {/* GA4 */}
          <TrackingCard
            name="Google Analytics 4"
            color="#F4B400"
            active={!!tracking.gaId}
            warning={tracking.gaId && tracking.gtmId ? '⚠️ You have GTM configured. Add GA4 inside GTM instead to avoid double-counting.' : ''}
          >
            <label style={lb}>Measurement ID</label>
            <input style={fi} value={tracking.gaId||''} onChange={e=>setTracking(t=>({...t,gaId:e.target.value}))} placeholder="G-XXXXXXXXXX" onFocus={foc} onBlur={blr}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.54rem', color:'var(--text-3)', marginTop:'6px', lineHeight:1.7 }}>Get this from Google Analytics → Admin → Data Streams → your stream → Measurement ID</div>
          </TrackingCard>
          {/* GTM */}
          <TrackingCard name="Google Tag Manager" color="#2196F3" active={!!tracking.gtmId}>
            <label style={lb}>Container ID</label>
            <input style={fi} value={tracking.gtmId||''} onChange={e=>setTracking(t=>({...t,gtmId:e.target.value}))} placeholder="GTM-XXXXXXX" onFocus={foc} onBlur={blr}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.54rem', color:'var(--text-3)', marginTop:'6px', lineHeight:1.7 }}>Get from tagmanager.google.com. GTM can manage GA4 and other tags from one place.</div>
          </TrackingCard>
          {/* Meta Pixel */}
          <TrackingCard name="Meta (Facebook) Pixel" color="#1877F2" active={!!tracking.metaPixelId}>
            <label style={lb}>Pixel ID</label>
            <input style={fi} value={tracking.metaPixelId||''} onChange={e=>setTracking(t=>({...t,metaPixelId:e.target.value}))} placeholder="1234567890123456" onFocus={foc} onBlur={blr}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.54rem', color:'var(--text-3)', marginTop:'6px', lineHeight:1.7 }}>Paste only your Pixel ID from Meta Events Manager → your Pixel → Settings tab. The tracking code is injected automatically — you do not need to paste the full script.</div>
          </TrackingCard>
          {/* TikTok */}
          <TrackingCard name="TikTok Pixel" color="#000000" active={!!tracking.tiktokPixelId}>
            <label style={lb}>Pixel ID</label>
            <input style={fi} value={tracking.tiktokPixelId||''} onChange={e=>setTracking(t=>({...t,tiktokPixelId:e.target.value}))} placeholder="Alphanumeric Pixel ID" onFocus={foc} onBlur={blr}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.54rem', color:'var(--text-3)', marginTop:'6px', lineHeight:1.7 }}>Get from TikTok Ads Manager → Tools → Events Manager → your pixel → Settings.</div>
          </TrackingCard>
          {/* Pinterest */}
          <TrackingCard name="Pinterest Tag" color="#E60023" active={!!tracking.pinterestTagId}>
            <label style={lb}>Tag ID</label>
            <input style={fi} value={tracking.pinterestTagId||''} onChange={e=>setTracking(t=>({...t,pinterestTagId:e.target.value}))} placeholder="1234567890123" onFocus={foc} onBlur={blr}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.54rem', color:'var(--text-3)', marginTop:'6px', marginBottom:'12px', lineHeight:1.7 }}>Get your Tag ID from Pinterest Ads Manager → Conversions → Pinterest Tag.</div>
            <label style={lb}>Domain Verification Code</label>
            <input style={fi} value={tracking.pinterestDomainVerify||''} onChange={e=>setTracking(t=>({...t,pinterestDomainVerify:e.target.value}))} placeholder="paste only the content= value (no quotes)" onFocus={foc} onBlur={blr}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.54rem', color:'var(--text-3)', marginTop:'6px', lineHeight:1.7 }}>From Pinterest Settings → Claim → Website → HTML tag. Copy ONLY the value after content= (without quotes).</div>
          </TrackingCard>
        </div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'12px' }}>
          All IDs are injected as scripts automatically. Leave blank to disable. Changes apply after next redeploy.
        </div>
      </div>

      {/* ── Site Info ─────────────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={hd}>Site Information</div>
          <SaveBtn onClick={saveSite} saving={savingSite}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div><label style={lb}>Site Name</label><input style={fi} value={site.siteName||''} onChange={e=>setSite(s=>({...s,siteName:e.target.value}))} onFocus={foc} onBlur={blr}/></div>
          <div><label style={lb}>Meta Description</label><textarea style={{ ...fi, minHeight:72, resize:'vertical' }} value={site.metaDescription||''} onChange={e=>setSite(s=>({...s,metaDescription:e.target.value}))} onFocus={foc} onBlur={blr}/></div>
          <div><label style={lb}>OG Image URL</label><input style={fi} value={site.ogImageUrl||''} onChange={e=>setSite(s=>({...s,ogImageUrl:e.target.value}))} placeholder="https://..." onFocus={foc} onBlur={blr}/></div>
        </div>
      </div>

      {/* ── Contact Details ───────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={hd}>Contact Details</div>
          <SaveBtn onClick={saveContact} saving={savingContact}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {CONTACT_FIELDS.map(({key,label})=>{
            const showKey=`show${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            return (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'10px', alignItems:'end' }}>
                <div><label style={lb}>{label}</label><input style={fi} value={contact[key]||''} onChange={e=>setContact(c=>({...c,[key]:e.target.value}))} onFocus={foc} onBlur={blr}/></div>
                <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', paddingBottom:'2px', whiteSpace:'nowrap' }}>
                  <input type="checkbox" checked={contact[showKey]!==false} onChange={e=>setContact(c=>({...c,[showKey]:e.target.checked}))} style={{ accentColor:'var(--accent)' }}/>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>Show</span>
                </label>
              </div>
            );
          })}
          <div><label style={lb}>Working Hours</label><input style={fi} value={contact.workingHours||''} onChange={e=>setContact(c=>({...c,workingHours:e.target.value}))} placeholder="Mon–Fri, 9AM–11PM BST" onFocus={foc} onBlur={blr}/></div>
        </div>
      </div>

      {/* ── Change Password ───────────────────────────────────────── */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <Lock size={16} color="var(--accent)"/>
          <div style={hd}>Change Password</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
          {[['Current Password',currentPw,setCurrentPw,showCurPw,()=>setShowCurPw(x=>!x)],['New Password (min 8 chars)',newPw,setNewPw,showNewPw,()=>setShowNewPw(x=>!x)],['Confirm New Password',confirmPw,setConfirmPw,showNewPw,()=>setShowNewPw(x=>!x)]].map(([label,val,setter,show,toggle],i)=>(
            <div key={i}>
              <label style={lb}>{label}</label>
              <div style={{ position:'relative' }}>
                <input type={show?'text':'password'} style={{ ...fi, paddingRight:'42px' }} value={val} onChange={e=>setter(e.target.value)} onFocus={foc} onBlur={blr}/>
                <button onClick={toggle} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'4px' }}>
                  {show?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleChangePassword} disabled={changingPw||!currentPw||!newPw||!confirmPw} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:changingPw||!currentPw||!newPw||!confirmPw?'var(--bg-elevated)':'var(--accent)', color:changingPw||!currentPw||!newPw||!confirmPw?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:changingPw?'not-allowed':'pointer' }}>
          <Lock size={13}/>{changingPw?'Updating…':'Update Password'}
        </button>
      </div>

      {/* ── Quick Links ───────────────────────────────────────────── */}
      <div style={cd}>
        <div style={hd}>Quick Links</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {[['Firebase Console','https://console.firebase.google.com'],['Vercel Dashboard','https://vercel.com/dashboard'],['Cloudinary Dashboard','https://cloudinary.com/console'],['GitHub Repo','https://github.com/shakilxvs/shakilxvs'],['EmailJS Dashboard','https://dashboard.emailjs.com']].map(([l,h])=>(
            <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', textDecoration:'none', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent-border)';e.currentTarget.style.color='var(--text-1)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)';}}
            ><ExternalLink size={13}/> {l}</a>
          ))}
        </div>
      </div>

      {/* ── Seed Data ─────────────────────────────────────────────── */}
      <div style={{ ...cd, border:'1px solid rgba(35,77,194,0.3)', background:'rgba(35,77,194,0.03)' }}>
        <div style={hd}>Seed Sample Data</div>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'16px', lineHeight:1.6 }}>Populate Firestore with sample data. Won&apos;t overwrite existing documents.</p>
        <button onClick={async()=>{ if(!confirm('Seed sample data?'))return; setSeeding(true); try{await seedSampleData();toast.success('Seeded!');}catch{toast.error('Failed');} finally{setSeeding(false); }}} disabled={seeding} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:seeding?'var(--bg-elevated)':'var(--accent)', color:seeding?'var(--text-2)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:seeding?'not-allowed':'pointer' }}>
          <Database size={14}/>{seeding?'Seeding…':'Seed Sample Data'}
        </button>
      </div>

      {/* ── Danger Zone ────────────────────────────────────────────── */}
      <div style={{ ...cd, border:'1px solid rgba(255,69,0,0.3)', background:'rgba(255,69,0,0.03)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
          <AlertTriangle size={18} color="#ff4500"/>
          <div style={{ ...hd, margin:0, color:'#ff4500' }}>Danger Zone</div>
        </div>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'14px', lineHeight:1.6 }}>Delete collections directly in Firebase Console. No automated clear to prevent accidents.</p>
        <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:'transparent', color:'#ff4500', border:'1px solid rgba(255,69,0,0.3)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', textDecoration:'none' }}>
          <ExternalLink size={14}/> Open Firebase Console
        </a>
      </div>
    </div>
  );
}
