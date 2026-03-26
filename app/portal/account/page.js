'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateClient } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Eye, EyeOff, CheckCircle, X } from 'lucide-react';

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export default function PortalAccount() {
  const router  = useRouter();
  const [client,   setClient]   = useState(null);
  const [newPw,    setNewPw]    = useState('');
  const [confirmPw,setConfirmPw]= useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      if (!raw) { router.replace('/portal/login'); return; }
      setClient(JSON.parse(raw));
    } catch { router.replace('/portal/login'); }
  }, [router]);

  const handleChangePassword = async () => {
    if (!newPw.trim())          { toast.error('Enter a new password'); return; }
    if (newPw.length < 6)       { toast.error('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw)    { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      const hash = await hashPassword(newPw.trim());
      await updateClient(client.clientId, { passwordHash: hash, passwordPlain: newPw.trim() });
      setNewPw(''); setConfirmPw('');
      toast.success('Password updated!');
    } catch { toast.error('Failed to update password'); }
    finally { setSaving(false); }
  };

  if (!client) return null;

  const fi = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'5px', display:'block' };

  const perms = client.permissions || {};
  const permList = [
    { key:'addTasks',    label:'Add tasks to projects' },
    { key:'editTasks',   label:'Edit & complete tasks'  },
    { key:'uploadFiles', label:'Upload files'           },
    { key:'comment',     label:'Leave comments'         },
  ];

  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Your Account</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,3rem)', color:'var(--text-1)', letterSpacing:'0.02em' }}>Account</h1>
      </div>

      {/* Profile */}
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'16px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em', marginBottom:'18px' }}>Profile</div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--accent-muted)', border:'2px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.6rem', color:'var(--accent)' }}>{(client.name||'?')[0].toUpperCase()}</span>
          </div>
          <div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--text-1)' }}>{client.name}</div>
            {client.company && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-2)' }}>{client.company}</div>}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          {[['Username', `@${client.username}`], ['Email', client.email], ...(client.company?[['Company',client.company]]:[])].map(([k,v])=>(
            <div key={k} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'12px 14px' }}>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px' }}>{k}</div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'16px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em', marginBottom:'16px' }}>Your Permissions</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {permList.map(({ key, label }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)' }}>
              {perms[key]
                ? <CheckCircle size={15} color="#34d399" strokeWidth={2}/>
                : <X size={15} color="var(--text-3)" strokeWidth={2}/>
              }
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color: perms[key]?'var(--text-1)':'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', color:'var(--text-3)', marginTop:'10px' }}>
          Permissions are managed by Shakil. <a href="/contact" style={{ color:'var(--accent)', textDecoration:'none' }}>Contact us</a> to request changes.
        </div>
      </div>

      {/* Change password */}
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'16px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em', marginBottom:'16px' }}>Change Password</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
          <div>
            <label style={lb}>New Password (min. 6 characters)</label>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} style={{ ...fi, paddingRight:'42px' }} value={newPw} onChange={e=>setNewPw(e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <button onClick={()=>setShowPw(x=>!x)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', padding:'4px' }}>
                {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
          </div>
          <div>
            <label style={lb}>Confirm New Password</label>
            <input type={showPw?'text':'password'} style={fi} value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
        </div>
        <button onClick={handleChangePassword} disabled={saving||!newPw||!confirmPw}
          style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'10px 22px', background:saving||!newPw||!confirmPw?'var(--bg-elevated)':'var(--accent)', color:saving||!newPw||!confirmPw?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:saving?'not-allowed':'pointer' }}>
          <Save size={14}/>{saving?'Updating…':'Update Password'}
        </button>
      </div>

      {/* Sign out */}
      <div style={{ textAlign:'center', paddingTop:'8px' }}>
        <button onClick={()=>{ localStorage.removeItem('portal_session'); router.replace('/portal/login'); }}
          style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', textUnderlineOffset:'3px' }}>
          Sign out of portal
        </button>
      </div>
    </div>
  );
}
