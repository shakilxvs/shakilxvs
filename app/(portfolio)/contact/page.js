'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Phone, Mail, MessageCircle, Instagram, Linkedin, Twitter, Facebook, Music2, ArrowRight, Copy, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CONTACT_ITEMS = [
  { key:'phone',     label:'Phone',      icon: Phone,        action:(v)=>`tel:${v}`,               actionLabel:'Call' },
  { key:'email',     label:'Email',      icon: Mail,         action:(v)=>`mailto:${v}`,             actionLabel:'Email', copyable:true },
  { key:'whatsapp',  label:'WhatsApp',   icon: MessageCircle,action:(v)=>`https://wa.me/${v.replace(/\D/g,'')}`, actionLabel:'Message' },
  { key:'instagram', label:'Instagram',  icon: Instagram,    action:(v)=>v,                         actionLabel:'Follow' },
  { key:'linkedin',  label:'LinkedIn',   icon: Linkedin,     action:(v)=>v,                         actionLabel:'Connect' },
  { key:'twitter',   label:'Twitter / X',icon: Twitter,      action:(v)=>v,                         actionLabel:'Follow' },
  { key:'facebook',  label:'Facebook',   icon: Facebook,     action:(v)=>v,                         actionLabel:'Visit' },
  { key:'tiktok',    label:'TikTok',     icon: Music2,       action:(v)=>v,                         actionLabel:'Follow' },
];

function ContactRow({ item, value }) {
  const [copied, setCopied] = useState(false);
  const { icon: Icon, label, action, actionLabel, copyable } = item;
  const href = action(value);

  const handleCopy = async () => {
    await copyToClipboard(value);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', transition:'border-color 0.2s ease', flexWrap:'wrap' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}
    >
      <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}>
        <Icon size={18} strokeWidth={1.75}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'3px' }}>{label}</div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.95rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</div>
      </div>
      <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
        {copyable && (
          <button onClick={handleCopy} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'8px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:copied?'var(--accent)':'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer' }}>
            {copied?<Check size={13}/>:<Copy size={13}/>}
          </button>
        )}
        <a href={href} target={href.startsWith('http')?'_blank':'_self'} rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', textDecoration:'none' }}>
          {actionLabel} <ArrowRight size={13}/>
        </a>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [contact, setContact] = useState(null);

  useEffect(() => { getPortfolioDoc('contact').then(setContact); }, []);

  const visibleItems = CONTACT_ITEMS.filter(item => {
    const showKey = `show${item.key.charAt(0).toUpperCase()}${item.key.slice(1)}`;
    return contact?.[showKey] !== false && contact?.[item.key];
  });

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:800, margin:'0 auto', padding:'0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:'48px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Get In Touch</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'24px' }}>Contact</h1>
          <Link href="/pay" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 32px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1rem', textDecoration:'none' }}>
            Request a Quote <ArrowRight size={16}/>
          </Link>
        </div>

        {/* Contact items */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'40px' }}>
          {visibleItems.length === 0 ? (
            Array.from({length:4}).map((_,i) => <div key={i} style={{ height:84, borderRadius:'var(--radius-lg)' }} className="skeleton"/>)
          ) : (
            visibleItems.map(item => <ContactRow key={item.key} item={item} value={contact[item.key]} />)
          )}
        </div>

        {/* Working hours */}
        {contact?.workingHours && (
          <div style={{ display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)' }}>
            <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-2)', flexShrink:0 }}>
              <Clock size={18} strokeWidth={1.75}/>
            </div>
            <div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'3px' }}>Working Hours</div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.95rem' }}>{contact.workingHours}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
