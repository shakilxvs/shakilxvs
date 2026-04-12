'use client';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { portalFetch } from '@/lib/portal-client';

export default function PortalAccountPage() {
  const [client,  setClient]  = useState(null);
  const [form,    setForm]    = useState({ name:'', phone:'', country:'' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    portalFetch('/api/portal/account').then(res => {
      if (res.ok) {
        setClient(res.data);
        setForm({ name: res.data.name || '', phone: res.data.phone || '', country: res.data.country || '' });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await portalFetch('/api/portal/account', { method:'PATCH', body: JSON.stringify(form) });
    if (res.ok) {
      setClient(res.data);
      toast.success('Account updated');
    } else {
      toast.error(res.error || 'Failed');
    }
    setSaving(false);
  };

  if (loading) return <div className="skeleton" style={{ height:300, borderRadius:'var(--radius-lg)' }}/>;
  if (!client) return null;

  const fi = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'5px', display:'block' };
  const ro = { ...fi, background:'var(--bg-void)', color:'var(--text-3)', cursor:'not-allowed' };

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Profile</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1, marginTop:'4px' }}>Account</h1>
      </div>
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div><label style={lb}>Username (read-only)</label><input style={ro} value={`@${client.username||''}`} readOnly/></div>
          <div><label style={lb}>Email (read-only)</label><input style={ro} value={client.email||''} readOnly/></div>
          <div><label style={lb}>Full Name</label><input style={fi} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><label style={lb}>Phone</label><input style={fi} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
          <div style={{ gridColumn:'1/-1' }}><label style={lb}>Country</label><input style={fi} value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))}/></div>
          {client.company && <div style={{ gridColumn:'1/-1' }}><label style={lb}>Company (read-only)</label><input style={ro} value={client.company} readOnly/></div>}
        </div>
        <div style={{ marginTop:'20px', display:'flex', justifyContent:'flex-end' }}>
          <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 22px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:saving?'not-allowed':'pointer' }}>
            <Save size={13}/>{saving?'Saving…':'Save Changes'}
          </button>
        </div>
        <div style={{ marginTop:'16px', fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>
          To change your email, username, or password, contact Shakil.
        </div>
      </div>
    </div>
  );
}
