'use client';
import { useState, useEffect, useRef } from 'react';
import { getPortfolioDoc, setPortfolioDoc } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Upload, Image, Loader } from 'lucide-react';

export default function AdminHeroPage() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: 'Shakil',
    taglines: ['CMS & Custom Web Expert', 'Shopify Developer', 'Digital Marketing Strategist'],
    subtitle: '6+ years building premium stores, marketing systems, and custom web experiences for global brands.',
    stat1Label: 'Projects Done', stat1Value: 5000,
    stat2Label: 'Happy Clients', stat2Value: 1200,
    stat3Label: 'Countries',     stat3Value: 47,
    stat4Label: 'Years XP',      stat4Value: 6,
    cta1Text: 'View My Work', cta1Url: '/projects',
    cta2Text: 'Hire Me',      cta2Url: '/contact',
    profileImageUrl: '',
    responseTime: '< 2 hrs',
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
  const removeTagline = (i) => {
    if (form.taglines.length <= 1) return;
    setForm(f => ({ ...f, taglines: f.taglines.filter((_, idx) => idx !== i) }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'portfolio/profile');
      set('profileImageUrl', url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
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
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const field  = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none' };
  const label  = { fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px', display:'block' };
  const card   = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
  const head   = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px',color:'var(--accent)'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Save bar */}
      <div style={{ position:'sticky', top:60, zIndex:40, display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-base)', borderBottom:'1px solid var(--border-1)', padding:'12px 0', marginBottom:'28px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Hero Section</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'2px' }}>Changes appear on homepage after saving</div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background: saving ? 'var(--bg-elevated)' : 'var(--accent)', color: saving ? 'var(--text-2)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor: saving ? 'not-allowed':'pointer' }}>
          <Save size={15} />{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Profile Image */}
      <div style={card}>
        <div style={head}>Profile Photo</div>
        <div style={{ display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', border:'2px solid var(--border-2)', background:'var(--bg-elevated)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {form.profileImageUrl ? <img src={form.profileImageUrl} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{color:'var(--text-3)',fontSize:'0.7rem'}}>No img</span>}
          </div>
          <div style={{ flex:1 }}>
            <input type="text" placeholder="Or paste image URL" value={form.profileImageUrl} onChange={e => set('profileImageUrl', e.target.value)} style={{ ...field, marginBottom:'10px' }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', cursor:'pointer' }}>
              <Upload size={14} />{uploading ? 'Uploading…' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
          </div>
        </div>
      </div>

      {/* Name + Subtitle */}
      <div style={card}>
        <div style={head}>Name & Subtitle</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div><label style={label}>Display Name</label><input style={field} value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div><label style={label}>Subtitle</label><textarea style={{ ...field, minHeight:90, resize:'vertical' }} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></div>
          <div><label style={label}>Response Time</label><input style={field} value={form.responseTime} onChange={e => set('responseTime', e.target.value)} /></div>
        </div>
      </div>

      {/* Taglines */}
      <div style={card}>
        <div style={head}>Animated Taglines</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
          {form.taglines.map((t, i) => (
            <div key={i} style={{ display:'flex', gap:'8px' }}>
              <input style={field} value={t} onChange={e => setTagline(i, e.target.value)} placeholder={`Tagline ${i+1}`} />
              <button onClick={() => removeTagline(i)} disabled={form.taglines.length <= 1} style={{ padding:'10px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addTagline} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 16px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', cursor:'pointer' }}>
          <Plus size={14} /> Add Tagline
        </button>
      </div>

      {/* Stats */}
      <div style={card}>
        <div style={head}>Stat Numbers</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[1,2,3,4].map(n => (
            <div key={n} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px' }}>
              <label style={label}>Stat {n} Label</label>
              <input style={{ ...field, marginBottom:'10px' }} value={form[`stat${n}Label`]} onChange={e => set(`stat${n}Label`, e.target.value)} />
              <label style={label}>Stat {n} Number</label>
              <input type="number" style={field} value={form[`stat${n}Value`]} onChange={e => set(`stat${n}Value`, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div style={card}>
        <div style={head}>CTA Buttons</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[1,2].map(n => (
            <div key={n}>
              <label style={label}>Button {n} Label</label>
              <input style={{ ...field, marginBottom:'10px' }} value={form[`cta${n}Text`]} onChange={e => set(`cta${n}Text`, e.target.value)} />
              <label style={label}>Button {n} URL</label>
              <input style={field} value={form[`cta${n}Url`]} onChange={e => set(`cta${n}Url`, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
