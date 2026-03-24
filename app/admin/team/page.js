'use client';
import { useState, useEffect } from 'react';
import { getTeamMembers, setTeamMembers } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Shield, User, Crown } from 'lucide-react';

const ROLES = [
  { value: 'admin',  label: 'Admin',  icon: Shield, desc: 'Full access except team management' },
  { value: 'staff',  label: 'Staff',  icon: User,   desc: 'Messages & reviews only' },
];

const ROLE_COLORS = {
  owner: '#f5a623',
  admin: '#234DC2',
  staff: '#10b981',
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole,  setNewRole]  = useState('admin');
  const [newName,  setNewName]  = useState('');

  useEffect(() => {
    getTeamMembers()
      .then(m => { setMembers(m); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async (updatedMembers) => {
    setSaving(true);
    try {
      await setTeamMembers(updatedMembers);
      setMembers(updatedMembers);
      toast.success('Team saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const addMember = () => {
    if (!newEmail.trim()) { toast.error('Enter an email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) { toast.error('Enter a valid email'); return; }
    if (members.some(m => m.email === newEmail.trim())) { toast.error('That email is already added'); return; }
    const updated = [...members, {
      email: newEmail.trim().toLowerCase(),
      name:  newName.trim() || newEmail.split('@')[0],
      role:  newRole,
      active: true,
      addedAt: new Date().toISOString(),
    }];
    save(updated);
    setNewEmail(''); setNewName(''); setNewRole('admin');
  };

  const toggleActive = (i) => {
    const updated = members.map((m, idx) => idx === i ? { ...m, active: !m.active } : m);
    save(updated);
  };

  const changeRole = (i, role) => {
    const updated = members.map((m, idx) => idx === i ? { ...m, role } : m);
    save(updated);
  };

  const removeMember = (i) => {
    if (!confirm(`Remove ${members[i].email} from the team?`)) return;
    save(members.filter((_, idx) => idx !== i));
  };

  const fi = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'5px', display:'block' };
  const foc = e => e.target.style.borderColor = 'var(--accent-border)';
  const blr = e => e.target.style.borderColor = 'var(--border-2)';

  return (
    <div style={{ maxWidth: 720 }}>

      {/* How it works */}
      <div style={{ background:'rgba(35,77,194,0.06)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-lg)', padding:'16px 20px', marginBottom:'24px' }}>
        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--accent)', marginBottom:'8px' }}>How Team Access Works</div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7 }}>
          Add a person&apos;s email below. When they visit the login page and sign in with that exact email (Google or email+password), they&apos;ll be granted access based on their role.<br/>
          <strong style={{ color:'var(--text-1)' }}>Admin</strong> — full access to everything except Team Management.<br/>
          <strong style={{ color:'var(--text-1)' }}>Staff</strong> — can only view and reply to Messages and Reviews.
        </div>
      </div>

      {/* Owner card */}
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'16px 20px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'14px' }}>
        <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Crown size={16} color="#f5a623"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>
            {process.env.NEXT_PUBLIC_ADMIN_EMAIL}
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'#f5a623', marginTop:'2px', letterSpacing:'0.08em' }}>OWNER · Full access</div>
        </div>
        <div style={{ padding:'4px 12px', background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.3)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'#f5a623', fontWeight:700 }}>OWNER</div>
      </div>

      {/* Team members */}
      {loading ? (
        <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', padding:'20px 0' }}>Loading team…</div>
      ) : (
        <>
          {members.map((member, i) => {
            const RoleIcon = ROLES.find(r => r.value === member.role)?.icon || User;
            const color = ROLE_COLORS[member.role] || '#10b981';
            return (
              <div key={i} style={{ background:'var(--bg-surface)', border:`1px solid ${member.active ? 'var(--border-2)' : 'var(--border-1)'}`, borderRadius:'var(--radius-lg)', padding:'14px 20px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', opacity: member.active ? 1 : 0.55, transition:'all 0.2s' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:`${color}18`, border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <RoleIcon size={16} color={color}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {member.name || member.email}
                  </div>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{member.email}</div>
                </div>
                {/* Role selector */}
                <select
                  value={member.role}
                  onChange={e => changeRole(i, e.target.value)}
                  style={{ padding:'5px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer', outline:'none' }}
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {/* Active toggle */}
                <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', flexShrink:0 }}>
                  <input type="checkbox" checked={member.active} onChange={() => toggleActive(i)} style={{ accentColor:'var(--accent)', width:15, height:15 }}/>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', whiteSpace:'nowrap' }}>Active</span>
                </label>
                {/* Delete */}
                <button onClick={() => removeMember(i)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', padding:'6px', flexShrink:0, transition:'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--fire)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}
                >
                  <Trash2 size={15}/>
                </button>
              </div>
            );
          })}
          {members.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-lg)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', marginBottom:'12px' }}>
              No team members yet. Add the first one below.
            </div>
          )}
        </>
      )}

      {/* Add member form */}
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px', marginTop:'16px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em', marginBottom:'16px' }}>Add Team Member</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }} className="team-form-grid">
          <div>
            <label style={lb}>Email Address *</label>
            <input style={fi} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="teammate@gmail.com" onFocus={foc} onBlur={blr} onKeyDown={e => e.key === 'Enter' && addMember()}/>
          </div>
          <div>
            <label style={lb}>Display Name (optional)</label>
            <input style={fi} value={newName} onChange={e => setNewName(e.target.value)} placeholder="James" onFocus={foc} onBlur={blr}/>
          </div>
        </div>
        <div style={{ marginBottom:'16px' }}>
          <label style={lb}>Role</label>
          <div style={{ display:'flex', gap:'10px' }}>
            {ROLES.map(r => {
              const RIcon = r.icon;
              const selected = newRole === r.value;
              return (
                <div key={r.value} onClick={() => setNewRole(r.value)}
                  style={{ flex:1, padding:'12px 16px', borderRadius:'var(--radius-md)', border:`1px solid ${selected ? 'var(--accent-border)' : 'var(--border-2)'}`, background: selected ? 'var(--accent-muted)' : 'var(--bg-elevated)', cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    <RIcon size={14} color={selected ? 'var(--accent)' : 'var(--text-3)'}/>
                    <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', color: selected ? 'var(--accent)' : 'var(--text-1)' }}>{r.label}</span>
                  </div>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', lineHeight:1.5 }}>{r.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={addMember} disabled={saving || !newEmail.trim()}
          style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 22px', background: saving || !newEmail.trim() ? 'var(--bg-elevated)' : 'var(--accent)', color: saving || !newEmail.trim() ? 'var(--text-3)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor: saving ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
          <Plus size={15}/>{saving ? 'Saving…' : 'Add Member'}
        </button>
      </div>
    <style>{`@media(max-width:640px){.team-form-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
