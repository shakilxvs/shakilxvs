'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPortalMessages, sendPortalMessage, markPortalMessageRead } from '@/lib/firestore';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PortalMessages() {
  const router    = useRouter();
  const bottomRef = useRef(null);
  const [client,   setClient]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      if (!raw) { router.replace('/portal/login'); return; }
      const session = JSON.parse(raw);
      setClient(session);
      getPortalMessages(session.clientId).then(msgs => {
        setMessages(msgs);
        setLoading(false);
        // Mark admin messages as read
        msgs.filter(m=>m.from==='admin'&&!m.read).forEach(m=>markPortalMessageRead(m.id));
      });
    } catch { router.replace('/portal/login'); }
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !client) return;
    setSending(true);
    try {
      const id = await sendPortalMessage({ clientId: client.clientId, text: text.trim(), from:'client' });
      setMessages(m => [...m, { id, clientId: client.clientId, text: text.trim(), from:'client', sentAt: new Date(), read: false }]);
      setText('');
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  };

  if (!client) return null;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 120px)' }}>
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Direct</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,3rem)', color:'var(--text-1)', letterSpacing:'0.02em' }}>Messages</h1>
      </div>

      {/* Message thread */}
      <div style={{ flex:1, overflowY:'auto', padding:'4px 0', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', padding:'10px 0' }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: i%2===0?'flex-start':'flex-end' }}>
                <div style={{ width:'55%', height:48, borderRadius:'var(--radius-lg)' }} className="skeleton"/>
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:'8px' }}>No Messages Yet</div>
            <div style={{ fontSize:'0.875rem' }}>Send a message below to start the conversation.</div>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.from === 'client';
          return (
            <div key={msg.id} style={{ display:'flex', flexDirection:'column', alignItems: isMe?'flex-end':'flex-start' }}>
              {!isMe && (
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', marginBottom:'3px', paddingLeft:'4px' }}>Shakil</div>
              )}
              <div style={{ maxWidth:'75%', padding:'11px 15px', borderRadius: isMe?'18px 18px 4px 18px':'18px 18px 18px 4px', background: isMe?'var(--accent)':'var(--bg-elevated)', color: isMe?'#fff':'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', lineHeight:1.55, border: isMe?'none':'1px solid var(--border-2)' }}>
                {msg.text}
              </div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.5rem', color:'var(--text-3)', marginTop:'3px', paddingLeft:'4px', paddingRight:'4px' }}>
                {formatTime(msg.sentAt)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ display:'flex', gap:'10px', padding:'14px 16px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)' }}>
        <textarea
          value={text} onChange={e=>setText(e.target.value)}
          placeholder="Write a message…"
          rows={1}
          style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', resize:'none', lineHeight:1.5 }}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSend(); } }}
        />
        <button onClick={handleSend} disabled={sending||!text.trim()}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38, background:sending||!text.trim()?'var(--bg-elevated)':'var(--accent)', color:sending||!text.trim()?'var(--text-3)':'#fff', border:'none', borderRadius:'50%', cursor:sending||!text.trim()?'not-allowed':'pointer', transition:'all 0.15s', flexShrink:0 }}>
          <Send size={15}/>
        </button>
      </div>
    </div>
  );
}
