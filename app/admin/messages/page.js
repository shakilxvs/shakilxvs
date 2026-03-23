'use client';
import { useState, useEffect } from 'react';
import { getMessages, getArchivedMessages, updateMessage, archiveMessage, deleteMessage } from '@/lib/firestore';
import { formatMonthYear } from '@/lib/utils';
import { Star, Archive, Trash2, Mail, MailOpen, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['All', 'Unread', 'Starred', 'Archived'];

function MessageRow({ msg, onUpdate, onArchive, onDelete, archived }) {
  const [expanded, setExpanded] = useState(false);

  const markRead = async () => {
    if (!msg.read && !archived) {
      try { await updateMessage(msg.id, { read: true }); onUpdate(msg.id, { read: true }); } catch {}
    }
  };

  const toggle = () => { setExpanded(e => !e); if (!msg.read && !archived) markRead(); };

  const handleStar = async (e) => {
    e.stopPropagation();
    if (archived) return;
    try { await updateMessage(msg.id, { starred: !msg.starred }); onUpdate(msg.id, { starred: !msg.starred }); }
    catch { toast.error('Failed'); }
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    try { await onArchive(msg); toast.success('Archived'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete permanently?')) return;
    try { await onDelete(msg.id); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ background:'var(--bg-surface)', border:`1px solid ${!msg.read && !archived ? 'var(--accent-border)' : 'var(--border-2)'}`, borderRadius:'var(--radius-lg)', marginBottom:'8px', overflow:'hidden', transition:'border-color 0.2s ease' }}>
      <div onClick={toggle} style={{ padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
        <div style={{ color: !msg.read && !archived ? 'var(--accent)' : 'var(--text-3)', flexShrink:0 }}>
          {!msg.read && !archived ? <Mail size={16}/> : <MailOpen size={16}/>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight: !msg.read && !archived ? 700 : 600, color:'var(--text-1)', fontSize:'0.9rem' }}>{msg.name}</span>
            {msg.service && <span style={{ padding:'2px 8px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{msg.service}</span>}
            {msg.budget && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)' }}>{msg.budget}</span>}
          </div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.message?.slice(0,80)}...</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }} onClick={e=>e.stopPropagation()}>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{formatMonthYear(msg.createdAt)}</span>
          {!archived && (
            <>
              <button onClick={handleStar} style={{ background:'none', border:'none', cursor:'pointer', color: msg.starred ? 'var(--gold)' : 'var(--text-3)', padding:'4px' }}>
                <Star size={15} fill={msg.starred ? 'var(--gold)' : 'transparent'}/>
              </button>
              <button onClick={handleArchive} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'4px' }}><Archive size={15}/></button>
            </>
          )}
          <button onClick={handleDelete} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'4px' }}><Trash2 size={15}/></button>
        </div>
      </div>
      {expanded && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border-1)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'16px', marginBottom:'16px' }}>
            <div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Email</div><div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-1)' }}>{msg.email}</div></div>
            {msg.service && <div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Service</div><div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-1)' }}>{msg.service}</div></div>}
            {msg.budget && <div><div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Budget</div><div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--accent)' }}>{msg.budget}</div></div>}
          </div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-1)', lineHeight:1.8, background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', padding:'16px', whiteSpace:'pre-wrap' }}>{msg.message}</div>
          <a href={`mailto:${msg.email}`} style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'16px', padding:'8px 18px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', textDecoration:'none' }}>
            Reply via Email
          </a>
        </div>
      )}
    </div>
  );
}

export default function AdminMessagesPage() {
  const [tab, setTab]         = useState('All');
  const [messages, setMessages]   = useState([]);
  const [archived, setArchived]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getMessages(), getArchivedMessages()]).then(([m, a]) => {
      setMessages(m); setArchived(a); setLoading(false);
    });
  }, []);

  const handleUpdate = (id, data) => setMessages(m => m.map(x => x.id===id ? {...x,...data} : x));

  const handleArchive = async (msg) => {
    await archiveMessage(msg.id, msg);
    setMessages(m => m.filter(x => x.id !== msg.id));
    setArchived(a => [{ ...msg, archivedAt: new Date() }, ...a]);
  };

  const handleDelete = async (id) => {
    if (tab === 'Archived') {
      await deleteMessage(id); // would need deleteDocument from firestore
      setArchived(a => a.filter(x => x.id !== id));
    } else {
      await deleteMessage(id);
      setMessages(m => m.filter(x => x.id !== id));
    }
  };

  const unread  = messages.filter(m => !m.read).length;
  const starred = messages.filter(m => m.starred).length;

  const filtered = tab === 'All'      ? messages
    : tab === 'Unread'   ? messages.filter(m => !m.read)
    : tab === 'Starred'  ? messages.filter(m => m.starred)
    : archived;

  const isArchived = tab === 'Archived';

  return (
    <div style={{ maxWidth:800 }}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'28px', background:'var(--bg-surface)', padding:'4px', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-2)', width:'fit-content', flexWrap:'wrap' }}>
        {TABS.map(t => {
          const count = t==='All'?messages.length : t==='Unread'?unread : t==='Starred'?starred : archived.length;
          return (
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', borderRadius:'var(--radius-md)', border:'none', background:tab===t?'var(--accent)':'transparent', color:tab===t?'#fff':'var(--text-2)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              {t}
              <span style={{ padding:'1px 7px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.6rem', background: tab===t?'rgba(0,0,0,0.2)':'var(--bg-elevated)', color:tab===t?'#fff':'var(--text-3)' }}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading messages...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          No {tab.toLowerCase()} messages.
        </div>
      ) : (
        filtered.map(msg => (
          <MessageRow key={msg.id} msg={msg} onUpdate={handleUpdate} onArchive={handleArchive} onDelete={handleDelete} archived={isArchived} />
        ))
      )}
    </div>
  );
}
