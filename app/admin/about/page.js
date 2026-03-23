'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    bio: '', cvUrl: '',
    stat1Label: 'Projects', stat1Value: 5000,
    stat2Label: 'Clients',  stat2Value: 1200,
    stat3Label: 'Countries',stat3Value: 47,
    stat4Label: 'Years',    stat4Value: 6,
  });

  useEffect(() => {
    getPortfolioDoc('about').then(d => {
      if (d) setForm(f => ({ ...f, ...d }));
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

  const field = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none' };
  const lbl   = { fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px', display:'block' };
  const card  = { background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'20px' };

  if (loading) return <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ position:'sticky', top:60, zIndex:40, display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-base)', borderBottom:'1px solid var(--border-1)', padding:'12px 0', marginBottom:'28px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>About Section</div>
        <button onClick={save} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-2)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          <Save size={15} />{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div style={card}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' }}>Bio</div>
        <label style={lbl}>Bio Text (use double line break for paragraphs)</label>
        <textarea style={{ ...field, minHeight:200, resize:'vertical' }} value={form.bio} onChange={e => set('bio', e.target.value)} />
      </div>

      <div style={card}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' }}>CV Download</div>
        <label style={lbl}>CV / Resume URL (Google Drive link or direct URL)</label>
        <input style={field} value={form.cvUrl} onChange={e => set('cvUrl', e.target.value)} placeholder="https://drive.google.com/file/d/..." />
      </div>

      <div style={card}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', marginBottom:'16px', letterSpacing:'0.05em' }}>Stats</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {[1,2,3,4].map(n => (
            <div key={n} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px' }}>
              <label style={lbl}>Stat {n} Label</label>
              <input style={{ ...field, marginBottom:'10px' }} value={form[`stat${n}Label`]} onChange={e => set(`stat${n}Label`, e.target.value)} />
              <label style={lbl}>Stat {n} Number</label>
              <input type="number" style={field} value={form[`stat${n}Value`]} onChange={e => set(`stat${n}Value`, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
