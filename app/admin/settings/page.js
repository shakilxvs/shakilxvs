'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc, seedSampleData } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Database, ExternalLink, AlertTriangle, Phone, Mail, MessageCircle, Instagram, Linkedin, Twitter, Facebook, Music2, Clock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [site, setSite]       = useState({ siteName:'', metaDescription:'', ogImageUrl:'' });
  const [contact, setContact] = useState({ phone:'', email:'', whatsapp:'', instagram:'', linkedin:'', twitter:'', facebook:'', tiktok:'', workingHours:'', showPhone:true, showEmail:true, showWhatsapp:true, showInstagram:true, showLinkedin:true, showTwitter:true, showFacebook:true, showTiktok:true });
  const [seeding, setSeeding] = useState(false);
  const [savingSite, setSavingSite]       = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const f = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
  const l = { fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'5px', display:'block' };
  const card = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
  const head = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };

  useEffect(() => {
    Promise.all([getPortfolioDoc('siteSettings'), getPortfolioDoc('contact')]).then(([s, c]) => {
      if (s) setSite(x => ({ ...x, ...s }));
      if (c) setContact(x => ({ ...x, ...c }));
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

  const handleSeed = async () => {
    if (!confirm('This will populate all Firestore collections with sample data. Existing data will NOT be overwritten. Continue?')) return;
    setSeeding(true);
    try { await seedSampleData(); toast.success('Sample data seeded successfully!'); }
    catch { toast.error('Seed failed — check console'); } finally { setSeeding(false); }
  };

  const CONTACT_FIELDS = [
    { key:'phone',     label:'Phone',       icon: Phone },
    { key:'email',     label:'Email',       icon: Mail },
    { key:'whatsapp',  label:'WhatsApp',    icon: MessageCircle },
    { key:'instagram', label:'Instagram URL',icon: Instagram },
    { key:'linkedin',  label:'LinkedIn URL', icon: Linkedin },
    { key:'twitter',   label:'Twitter URL',  icon: Twitter },
    { key:'facebook',  label:'Facebook URL', icon: Facebook },
    { key:'tiktok',    label:'TikTok URL',   icon: Music2 },
  ];

  return (
    <div style={{ maxWidth:800 }}>

      {/* Site Info */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={head}>Site Information</div>
          <button onClick={saveSite} disabled={savingSite} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
            <Save size={14}/>{savingSite?'Saving…':'Save'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div><label style={l}>Site Name</label><input style={f} value={site.siteName} onChange={e=>setSite(s=>({...s,siteName:e.target.value}))} placeholder="Shakil — CMS & Web Expert"/></div>
          <div><label style={l}>Meta Description</label><textarea style={{ ...f, minHeight:80, resize:'vertical' }} value={site.metaDescription} onChange={e=>setSite(s=>({...s,metaDescription:e.target.value}))} placeholder="140-160 chars, keyword-rich"/></div>
          <div><label style={l}>OG Image URL</label><input style={f} value={site.ogImageUrl} onChange={e=>setSite(s=>({...s,ogImageUrl:e.target.value}))} placeholder="https://res.cloudinary.com/..."/></div>
        </div>
      </div>

      {/* Contact Details */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={head}>Contact Details</div>
          <button onClick={saveContact} disabled={savingContact} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
            <Save size={14}/>{savingContact?'Saving…':'Save'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {CONTACT_FIELDS.map(({ key, label }) => {
            const showKey = `show${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            return (
              <div key={key} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'10px', alignItems:'end' }}>
                <div>
                  <label style={l}>{label}</label>
                  <input style={f} value={contact[key]||''} onChange={e=>setContact(c=>({...c,[key]:e.target.value}))} placeholder={key.includes('http')||key==='instagram'||key==='linkedin'||key==='twitter'||key==='facebook'||key==='tiktok' ? 'https://...' : ''}/>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', paddingBottom:'2px', whiteSpace:'nowrap' }}>
                  <input type="checkbox" checked={contact[showKey]!==false} onChange={e=>setContact(c=>({...c,[showKey]:e.target.checked}))} style={{ accentColor:'var(--accent)' }}/>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>Show</span>
                </label>
              </div>
            );
          })}
          <div>
            <label style={l}>Working Hours</label>
            <input style={f} value={contact.workingHours||''} onChange={e=>setContact(c=>({...c,workingHours:e.target.value}))} placeholder="Mon–Fri, 9AM–11PM BST"/>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={card}>
        <div style={head}>Quick Links</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[
            { label:'Firebase Console', href:'https://console.firebase.google.com' },
            { label:'Vercel Dashboard', href:'https://vercel.com/dashboard' },
            { label:'Cloudinary Dashboard', href:'https://cloudinary.com/console' },
            { label:'GitHub Repository', href:'https://github.com/shakilxvs/shakilxvs' },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', textDecoration:'none', transition:'all 0.15s ease' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-border)'; e.currentTarget.style.color='var(--text-1)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-2)'; }}
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
          Populate all Firestore collections with realistic sample data — skills, projects, apps, files, and reviews. Safe to run once; won't overwrite existing documents.
        </p>
        <button onClick={handleSeed} disabled={seeding} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background: seeding ? 'var(--bg-elevated)' : 'var(--accent)', color: seeding ? 'var(--text-2)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor: seeding ? 'not-allowed' : 'pointer' }}>
          <Database size={15}/>{seeding ? 'Seeding…' : 'Seed Sample Data'}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ ...card, border:'1px solid rgba(255,69,0,0.3)', background:'rgba(255,69,0,0.03)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <AlertTriangle size={18} color="#ff4500"/>
          <div style={{ ...head, margin:0, color:'#ff4500' }}>Danger Zone</div>
        </div>
        <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'16px', lineHeight:1.6 }}>
          To clear all content, contact Anthropic or manually delete collections in the Firebase Console. There is no automated clear function to prevent accidental data loss.
        </p>
        <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:'transparent', color:'#ff4500', border:'1px solid rgba(255,69,0,0.3)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', textDecoration:'none' }}>
          <ExternalLink size={15}/> Open Firebase Console
        </a>
      </div>
    </div>
  );
}
