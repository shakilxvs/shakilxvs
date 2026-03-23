'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc, seedSampleData } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Save, Database, ExternalLink, AlertTriangle, Phone, Mail, MessageCircle, Instagram, Linkedin, Twitter, Facebook, Music2, Lock, Eye, EyeOff } from 'lucide-react';

const DEFAULT_SECTIONS = { hero:true, marquee:true, about:true, skills:true, projects:true, reviews:true, cta:true };

export default function AdminSettingsPage() {
  const [site,        setSite]        = useState({ siteName:'', metaDescription:'', ogImageUrl:'' });
  const [contact,     setContact]     = useState({ phone:'', email:'', whatsapp:'', instagram:'', linkedin:'', twitter:'', facebook:'', tiktok:'', workingHours:'', showPhone:true, showEmail:true, showWhatsapp:true, showInstagram:true, showLinkedin:true, showTwitter:true, showFacebook:true, showTiktok:true });
  const [sections,    setSections]    = useState(DEFAULT_SECTIONS);
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [seeding,     setSeeding]     = useState(false);
  const [savingSite,      setSavingSite]      = useState(false);
  const [savingContact,   setSavingContact]   = useState(false);
  const [savingSections,  setSavingSections]  = useState(false);
  const [changingPassword,setChangingPassword]= useState(false);

  const fi = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s ease' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'5px', display:'block' };
  const card = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
  const head = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };
  const focus = e => e.target.style.borderColor = 'var(--accent-border)';
  const blur  = e => e.target.style.borderColor = 'var(--border-2)';

  useEffect(() => {
    Promise.all([
      getPortfolioDoc('siteSettings'),
      getPortfolioDoc('contact'),
    ]).then(([s, c]) => {
      if (s) { setSite(x=>({...x,...s})); if (s.sections) setSections(x=>({...x,...s.sections})); }
      if (c) setContact(x=>({...x,...c}));
    });
  }, []);

  const saveSite = async () => {
    setSavingSite(true);
    try { await setPortfolioDoc('siteSettings', site); toast.success('Site settings saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingSite(false); }
  };
  const saveContact = async () => {
    setSavingContact(true);
    try { await setPortfolioDoc('contact', contact); toast.success('Contact details saved!'); }
    catch { toast.error('Save failed'); } finally { setSavingContact(false); }
  };
  const saveSections = async () => {
    setSavingSections(true);
    try {
      await setPortfolioDoc('siteSettings', { ...site, sections });
      setSite(s => ({ ...s, sections }));
      toast.success('Section visibility saved!');
    } catch { toast.error('Save failed'); } finally { setSavingSections(false); }
  };
  const handleSeed = async () => {
    if (!confirm('Populate Firestore with sample data? Existing data will NOT be overwritten.')) return;
    setSeeding(true);
    try { await seedSampleData(); toast.success('Sample data seeded!'); }
    catch { toast.error('Seed failed'); } finally { setSeeding(false); }
  };
  const handleChangePassword = async () => {
    if (newPw !== confirmPw)    { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8)      { toast.error('Password must be at least 8 characters'); return; }
    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPw);
      toast.success('Password updated!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') toast.error('Current password is incorrect');
      else toast.error('Failed. Try signing out and back in first.');
    } finally { setChangingPassword(false); }
  };

  const CONTACT_FIELDS = [
    { key:'phone',     label:'Phone',        icon: Phone },
    { key:'email',     label:'Email',         icon: Mail },
    { key:'whatsapp',  label:'WhatsApp',      icon: MessageCircle },
    { key:'instagram', label:'Instagram URL', icon: Instagram },
    { key:'linkedin',  label:'LinkedIn URL',  icon: Linkedin },
    { key:'twitter',   label:'Twitter URL',   icon: Twitter },
    { key:'facebook',  label:'Facebook URL',  icon: Facebook },
    { key:'tiktok',    label:'TikTok URL',    icon: Music2 },
  ];

  const SECTION_LABELS = [
    { key:'hero',     label:'Hero section' },
    { key:'marquee',  label:'Marquee strip' },
    { key:'about',    label:'About section' },
    { key:'skills',   label:'Skills section' },
    { key:'projects', label:'Featured Projects' },
    { key:'reviews',  label:'Reviews teaser' },
    { key:'cta',      label:'CTA Banner' },
  ];

  const PwField = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div>
      <label style={lb}>{label}</label>
      <div style={{ position:'relative' }}>
        <input type={show?'text':'password'} style={{ ...fi, paddingRight:'42px' }} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={focus} onBlur={blur}/>
        <button onClick={onToggle} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'4px' }}>
          {show ? <EyeOff size={15}/> : <Eye size={15}/>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:800 }}>

      {/* Site Info */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={head}>Site Information</div>
          <button onClick={saveSite} disabled={savingSite} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingSite?'var(--bg-elevated)':'var(--accent)', color: savingSite?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor: savingSite?'not-allowed':'pointer' }}>
            <Save size={14}/>{savingSite?'Saving…':'Save'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div><label style={lb}>Site Name</label><input style={fi} value={site.siteName} onChange={e=>setSite(s=>({...s,siteName:e.target.value}))} placeholder="Shakil — CMS & Web Expert" onFocus={focus} onBlur={blur}/></div>
          <div><label style={lb}>Meta Description</label><textarea style={{ ...fi, minHeight:80, resize:'vertical' }} value={site.metaDescription} onChange={e=>setSite(s=>({...s,metaDescription:e.target.value}))} placeholder="140-160 chars" onFocus={focus} onBlur={blur}/></div>
          <div><label style={lb}>OG Image URL</label><input style={fi} value={site.ogImageUrl} onChange={e=>setSite(s=>({...s,ogImageUrl:e.target.value}))} placeholder="https://..." onFocus={focus} onBlur={blur}/></div>
        </div>
      </div>

      {/* Contact Details */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={head}>Contact Details</div>
          <button onClick={saveContact} disabled={savingContact} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingContact?'var(--bg-elevated)':'var(--accent)', color: savingContact?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor: savingContact?'not-allowed':'pointer' }}>
            <Save size={14}/>{savingContact?'Saving…':'Save'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {CONTACT_FIELDS.map(({ key, label }) => {
            const showKey = `show${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            return (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'10px', alignItems:'end' }}>
                <div>
                  <label style={lb}>{label}</label>
                  <input style={fi} value={contact[key]||''} onChange={e=>setContact(c=>({...c,[key]:e.target.value}))} onFocus={focus} onBlur={blur}/>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', paddingBottom:'2px', whiteSpace:'nowrap' }}>
                  <input type="checkbox" checked={contact[showKey]!==false} onChange={e=>setContact(c=>({...c,[showKey]:e.target.checked}))} style={{ accentColor:'var(--accent)' }}/>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>Show</span>
                </label>
              </div>
            );
          })}
          <div>
            <label style={lb}>Working Hours</label>
            <input style={fi} value={contact.workingHours||''} onChange={e=>setContact(c=>({...c,workingHours:e.target.value}))} placeholder="Mon–Fri, 9AM–11PM BST" onFocus={focus} onBlur={blur}/>
          </div>
        </div>
      </div>

      {/* Page Section Visibility */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div>
            <div style={head}>Page Sections</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'-10px' }}>Toggle homepage sections on/off</div>
          </div>
          <button onClick={saveSections} disabled={savingSections} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background: savingSections?'var(--bg-elevated)':'var(--accent)', color: savingSections?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor: savingSections?'not-allowed':'pointer', flexShrink:0 }}>
            <Save size={14}/>{savingSections?'Saving…':'Save'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {SECTION_LABELS.map(({ key, label }) => (
            <label key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', cursor:'pointer' }}>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-1)', fontWeight:500 }}>{label}</span>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color: sections[key]!==false?'var(--accent)':'var(--text-3)' }}>
                  {sections[key]!==false ? 'Visible' : 'Hidden'}
                </span>
                <input type="checkbox" checked={sections[key]!==false} onChange={e=>setSections(s=>({...s,[key]:e.target.checked}))} style={{ accentColor:'var(--accent)', width:16, height:16 }}/>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <Lock size={16} color="var(--accent)"/>
          <div style={head}>Change Password</div>
        </div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-3)', marginBottom:'16px' }}>
          Only works if you signed in with email/password. If you signed in with Google, sign out and sign in with email+password first.
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
          <PwField label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={()=>setShowCurrent(x=>!x)} placeholder="Enter current password"/>
          <PwField label="New Password" value={newPw} onChange={setNewPw} show={showNew} onToggle={()=>setShowNew(x=>!x)} placeholder="Minimum 8 characters"/>
          <PwField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} show={showNew} onToggle={()=>setShowNew(x=>!x)} placeholder="Repeat new password"/>
        </div>
        <button
          onClick={handleChangePassword}
          disabled={changingPassword || !currentPw || !newPw || !confirmPw}
          style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background: changingPassword||!currentPw||!newPw||!confirmPw?'var(--bg-elevated)':'var(--accent)', color: changingPassword||!currentPw||!newPw||!confirmPw?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor: changingPassword?'not-allowed':'pointer' }}
        >
          <Lock size={14}/>{changingPassword?'Updating…':'Update Password'}
        </button>
      </div>

      {/* Quick Links */}
      <div style={card}>
        <div style={head}>Quick Links</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[
            { label:'Firebase Console',    href:'https://console.firebase.google.com' },
            { label:'Vercel Dashboard',    href:'https://vercel.com/dashboard' },
            { label:'Cloudinary Dashboard',href:'https://cloudinary.com/console' },
            { label:'GitHub Repository',   href:'https://github.com/shakilxvs/shakilxvs' },
            { label:'EmailJS Dashboard',   href:'https://dashboard.emailjs.com' },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', textDecoration:'none', transition:'all 0.15s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent-border)';e.currentTarget.style.color='var(--text-1)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)';}}
            >
              <ExternalLink size={14}/> {label}
            </a>
          ))}
        </div>
      </div>

      {/* Seed Data */}
      <div style={{ ...card, border:'1px solid rgba(35,77,194,0.3)', background:'rgba(35,77,194,0.04)' }}>
        <div style={head}>Seed Sample Data</div>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'16px', lineHeight:1.6 }}>
          Populate all Firestore collections with realistic sample data. Safe to run once — won&apos;t overwrite existing documents.
        </p>
        <button onClick={handleSeed} disabled={seeding} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:seeding?'var(--bg-elevated)':'var(--accent)', color:seeding?'var(--text-2)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:seeding?'not-allowed':'pointer' }}>
          <Database size={15}/>{seeding?'Seeding…':'Seed Sample Data'}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ ...card, border:'1px solid rgba(255,69,0,0.3)', background:'rgba(255,69,0,0.03)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <AlertTriangle size={18} color="#ff4500"/>
          <div style={{ ...head, margin:0, color:'#ff4500' }}>Danger Zone</div>
        </div>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'16px', lineHeight:1.6 }}>
          To clear all content, manually delete collections in the Firebase Console.
        </p>
        <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:'transparent', color:'#ff4500', border:'1px solid rgba(255,69,0,0.3)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', textDecoration:'none' }}>
          <ExternalLink size={15}/> Open Firebase Console
        </a>
      </div>
    </div>
  );
}
