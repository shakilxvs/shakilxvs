'use client';
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { portalFetch } from '@/lib/portal-client';

export default function PortalMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const endRef = useRef(null);

  const load = async () => {
    const res = await portalFetch('/api/portal/messages');
    if (res.ok) {
      setMessages(res.data);
      const unread = res.data.filter(m => !m.read && m.from === 'admin');
      for (const m of unread) {
        portalFetch('/api/portal/messages', { method:'PATCH', body: JSON.stringify({ messageId: m.id }) });
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    const res = await portalFetch('/api/portal/messages', { method:'POST', body: JSON.stringify({ text: t }) });
    if (res.ok) {
      setMessages(m => [...m, res.data]);
      setText('');
    }
    setSending(false);
  };

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Direct Line</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1, marginTop:'4px' }}>Messages</h1>
      </div>
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'20px', minHeight:400, maxHeight:'60vh', overflowY:'auto', marginBottom:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
        {loading
          ? [0,1,2].map(i=><div key={i} className="skeleton" style={{ height:40, width:'70%', borderRadius:'var(--radius-md)' }}/>)
          : messages.length === 0
            ? <div style={{ textAlign:'center', padding:'40px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No messages yet. Send the first one below.</div>
            : messages.map(msg => (
                <div key={msg.id} style={{ display:'flex', flexDirection:'column', alignItems: msg.from==='client'?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius:'var(--radius-lg)', background: msg.from==='client'?'var(--accent)':'var(--bg-elevated)', color: msg.from==='client'?'#fff':'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', lineHeight:1.5, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{msg.text}</div>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', marginTop:'3px', padding:'0 4px' }}>
                    {msg.from==='client'?'You':'Shakil'} · {msg.sentAt ? new Date(msg.sentAt).toLocaleString() : 'just now'}
                  </div>
                </div>
              ))}
        <div ref={endRef}/>
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <input style={{ flex:1, padding:'12px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none' }}
          value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…"
          onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); } }}/>
        <button onClick={handleSend} disabled={sending||!text.trim()} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 18px', background:sending||!text.trim()?'var(--bg-elevated)':'var(--accent)', color:sending||!text.trim()?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:sending?'not-allowed':'pointer' }}>
          <Send size={13}/>{sending?'…':'Send'}
        </button>
      </div>
    </div>
  );
}
