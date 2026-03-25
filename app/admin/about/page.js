'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    sectionTitle:   'About Me',
    sectionHeading: 'Who I Am',
    bio: '',
    cvUrl: '',
    showCV: true,
    stat1Label: 'Projects', stat1Value: 5000,
    stat2Label: 'Clients',  stat2Value: 1200,
    stat3Label: 'Countries',stat3Value: 47,
    stat4Label: 'Years',    stat4Value: 6,
  });

  useEffect(() => {
    getPortfolioDoc('about').then(d => {
      if (d) setForm(f => ({
        ...f,
        ...d,
        showCV:         d.showCV !== false,
        sectionTitle:   d.sectionTitle   || 'About Me',
        sectionHeading: d.sectionHeading || 'Who I Am',
      }));
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await setPortfolioDoc('about', {
        ...form,
        stat1Value: Number(form.stat1Value),
        stat2Value: Number(form.stat2Value),
        stat3Value: Number(form.stat3Value),
        stat4Value: Number(form.stat4Value),
      });
      toast.success('About section saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const fi = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px', display:'block' };
  const cd = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };
  const hd = { fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' };

  if (loading) return <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Sticky save bar */}
      <div style={{ position:'sticky', top:60, zIndex:40, display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-base)', borderBottom:'1px solid var(--border-1)', padding:'12px 0', marginBottom:'28px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>About Section</div>
        <button onClick={save} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background: saving ? 'var(--bg-elevated)' : 'var(--accent)', color: saving ? 'var(--text-2)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
          <Save size={15}/>{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Section headings */}
      <div style={cd}>
        <div style={hd}>Section Headings</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <div>
            <label style={lb}>Section Label (small text above)</label>
            <input style={fi} value={form.sectionTitle} onChange={e=>set('sectionTitle',e.target.value)} placeholder="About Me"
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
              onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'4px' }}>Shown as small label — e.g. "ABOUT ME"</div>
          </div>
          <div>
            <label style={lb}>Main Heading</label>
            <input style={fi} value={form.sectionHeading} onChange={e=>set('sectionHeading',e.target.value)} placeholder="Who I Am"
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
              onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'4px' }}>Large heading — e.g. "WHO I AM"</div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={cd}>
        <div style={hd}>Bio</div>
        <label style={lb}>Bio Text (use double line break for new paragraphs)</label>
        <textarea
          style={{ ...fi, minHeight: 200, resize: 'vertical' }}
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
          placeholder="I'm Shakil — a CMS specialist, Shopify developer..."
        />
      </div>

      {/* CV */}
      <div style={cd}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
          <div style={hd}>CV / Resume</div>
          <button
            onClick={() => set('showCV', !form.showCV)}
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'7px 14px', background: form.showCV ? 'rgba(35,77,194,0.1)' : 'var(--bg-elevated)', border: form.showCV ? '1px solid var(--accent-border)' : '1px solid var(--border-2)', borderRadius:'var(--radius-md)', color: form.showCV ? 'var(--accent)' : 'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s ease' }}
          >
            {form.showCV ? <Eye size={14}/> : <EyeOff size={14}/>}
            {form.showCV ? 'Visible on site' : 'Hidden from site'}
          </button>
        </div>
        <label style={lb}>CV / Resume URL</label>
        <input style={fi} value={form.cvUrl} onChange={e=>set('cvUrl',e.target.value)}
          onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
          onBlur={e=>e.target.style.borderColor='var(--border-2)'}
          placeholder="https://drive.google.com/file/d/..."/>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'8px' }}>
          Toggle visibility to show or hide the &quot;Download CV&quot; button on the public about section.
        </div>
      </div>

      {/* Stats */}
      <div style={cd}>
        <div style={hd}>Stat Numbers</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px' }}>
              <label style={lb}>Stat {n} Label</label>
              <input style={{ ...fi, marginBottom:'10px' }} value={form[`stat${n}Label`]} onChange={e=>set(`stat${n}Label`,e.target.value)} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <label style={lb}>Stat {n} Number</label>
              <input type="number" style={fi} value={form[`stat${n}Value`]} onChange={e=>set(`stat${n}Value`,e.target.value)} onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
