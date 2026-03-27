'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc } from '@/lib/firestore';
import { copyToClipboard } from '@/lib/utils';
import { Phone, Mail, MessageCircle, Instagram, Linkedin, Twitter, Facebook, Music2, Copy, Check, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from 'emailjs-com';

const CONTACT_ITEMS = [
  { key:'phone',     label:'Phone',       icon: Phone,         action:(v)=>`tel:${v}`,                             actionLabel:'Call' },
  { key:'email',     label:'Email',       icon: Mail,          action:(v)=>`mailto:${v}`,                          actionLabel:'Email', copyable:true },
  { key:'whatsapp',  label:'WhatsApp',    icon: MessageCircle, action:(v)=>`https://wa.me/${v.replace(/\D/g,'')}`, actionLabel:'Message' },
  { key:'instagram', label:'Instagram',   icon: Instagram,     action:(v)=>v,                                       actionLabel:'Follow' },
  { key:'linkedin',  label:'LinkedIn',    icon: Linkedin,      action:(v)=>v,                                       actionLabel:'Connect' },
  { key:'twitter',   label:'Twitter / X', icon: Twitter,       action:(v)=>v,                                       actionLabel:'Follow' },
  { key:'facebook',  label:'Facebook',    icon: Facebook,      action:(v)=>v,                                       actionLabel:'Visit' },
  { key:'tiktok',    label:'TikTok',      icon: Music2,        action:(v)=>v,                                       actionLabel:'Follow' },
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: `30px 1fr${copyable ? ' 28px' : ''} auto`,
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-lg)',
      transition: 'border-color 0.2s ease',
    }}
    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}
    >
      <div style={{ width:30, height:30, borderRadius:'var(--radius-sm)', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}>
        <Icon size={14} strokeWidth={1.75}/>
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'2px' }}>{label}</div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</div>
      </div>
      {copyable && (
        <button onClick={handleCopy} style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:copied?'var(--accent)':'var(--text-3)', cursor:'pointer', flexShrink:0 }}>
          {copied ? <Check size={11}/> : <Copy size={11}/>}
        </button>
      )}
      <a href={href} target={href.startsWith('http')?'_blank':'_self'} rel="noopener noreferrer"
        style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          padding:'6px 12px',
          background:'var(--accent)', color:'#fff',
          borderRadius:'var(--radius-sm)',
          fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.75rem',
          textDecoration:'none', whiteSpace:'nowrap', flexShrink:0,
          /* All buttons same minimum width so they align */
          minWidth:90,
          transition:'opacity 0.15s ease',
        }}
        onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}
      >
        {actionLabel}
      </a>
    </div>
  );
}

/* Form validation */
function validate(form) {
  const errors = {};
  if (!form.name.trim())  errors.name    = 'Name is required';
  if (!form.email.trim()) errors.email   = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.message.trim()) errors.message = 'Please describe your project';
  if (form.budget && isNaN(Number(form.budget))) errors.budget = 'Budget must be a number';
  return errors;
}
const ERR = { fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color:'var(--fire)', marginTop:'4px', display:'block' };

function ContactForm() {
  const [form, setForm]       = useState({ name:'', email:'', phone:'', service:'', budget:'', message:'' });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async () => {
    setTouched(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        toast.success('Message sent!');
        /* EmailJS notification — silent fail */
        try {
          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            {
              subject:`New Message from ${form.name}`,
              from_name:form.name,
              from_email:form.email,
              to_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'shakilxvs@gmail.com',
              email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'shakilxvs@gmail.com',
              message:`Phone: ${form.phone||'N/A'}\nBudget: $${form.budget||'N/A'}\nService: ${form.service||'N/A'}\n\n${form.message}`,
              to_name:'Shakil',
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
          );
        } catch {}
      } else toast.error('Failed to send — try again');
    } catch { toast.error('Network error — try again'); }
    finally { setSending(false); }
  };

  const fi = { width:'100%', padding:'10px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'6px', display:'block' };
  const focused = (e) => e.target.style.borderColor = 'var(--accent-border)';
  const blurred = (k) => (e) => e.target.style.borderColor = touched&&errors[k] ? 'var(--fire)' : 'var(--border-2)';

  if (sent) return (
    <div style={{ textAlign:'center', padding:'60px 24px', background:'var(--bg-surface)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-xl)' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-muted)', border:'2px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
        <Check size={28} color="var(--accent)" strokeWidth={2.5}/>
      </div>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', marginBottom:'8px' }}>Message Sent!</div>
      <p style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-2)', fontSize:'0.9rem' }}>I&apos;ll get back to you within 2 hours.</p>
    </div>
  );

  const disabled = sending || !form.name || !form.email || !form.message;

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'36px' }}>
      <div className="section-label" style={{ marginBottom:'8px' }}>Send a Message</div>
      <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', marginBottom:'28px', letterSpacing:'0.03em' }}>Request a Quote</h2>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }} className="contact-form-grid">
        {/* Name */}
        <div>
          <label style={lb}>Your Name *</label>
          <input style={{ ...fi, borderColor:touched&&errors.name?'var(--fire)':'var(--border-2)' }} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="James Mitchell" onFocus={focused} onBlur={blurred('name')}/>
          {touched && errors.name && <span style={ERR}>{errors.name}</span>}
        </div>
        {/* Email */}
        <div>
          <label style={lb}>Email *</label>
          <input type="email" style={{ ...fi, borderColor:touched&&errors.email?'var(--fire)':'var(--border-2)' }} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" onFocus={focused} onBlur={blurred('email')}/>
          {touched && errors.email && <span style={ERR}>{errors.email}</span>}
        </div>
        {/* Phone — new field */}
        <div>
          <label style={lb}>Phone (optional)</label>
          <input type="tel" style={fi} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+880 1XXX XXXXXX" onFocus={focused} onBlur={blurred('phone')}/>
        </div>
        {/* Service */}
        <div>
          <label style={lb}>Service Needed</label>
          <input style={fi} value={form.service} onChange={e=>set('service',e.target.value)} placeholder="Shopify Development" onFocus={focused} onBlur={blurred('service')}/>
        </div>
        {/* Budget — number with $ prefix */}
        <div>
          <label style={lb}>Budget (USD)</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-3)', pointerEvents:'none' }}>$</span>
            <input
              type="number" min={0} step={1}
              style={{ ...fi, paddingLeft:'28px', borderColor:touched&&errors.budget?'var(--fire)':'var(--border-2)' }}
              value={form.budget} onChange={e=>set('budget',e.target.value)}
              placeholder="500" onFocus={focused} onBlur={blurred('budget')}
            />
          </div>
          {touched && errors.budget && <span style={ERR}>{errors.budget}</span>}
        </div>
        {/* Message */}
        <div style={{ gridColumn:'1/-1' }}>
          <label style={lb}>Message *</label>
          <textarea style={{ ...fi, minHeight:130, resize:'vertical', borderColor:touched&&errors.message?'var(--fire)':'var(--border-2)' }} value={form.message} onChange={e=>set('message',e.target.value)} placeholder="Describe your project, goals, and timeline..." onFocus={focused} onBlur={blurred('message')}/>
          {touched && errors.message && <span style={ERR}>{errors.message}</span>}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={disabled} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', background:disabled?'var(--bg-elevated)':'var(--accent)', color:disabled?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', cursor:disabled?'not-allowed':'pointer', transition:'all 0.15s ease' }}>
        <Send size={14}/>{sending?'Sending…':'Send Message'}
      </button>
      <style>{`@media(max-width:580px){.contact-form-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

export default function ContactClient() {
  const [contact,  setContact]  = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [faqOpen,  setFaqOpen]  = useState(null);

  useEffect(() => {
    getPortfolioDoc('contact').then(setContact).catch(()=>{});
    getPortfolioDoc('faq').then(doc => {
      setFaqItems(doc?.items || []);
    }).catch(() => {});
  }, []);

  const visibleItems = CONTACT_ITEMS.filter(item => {
    const showKey = `show${item.key.charAt(0).toUpperCase()}${item.key.slice(1)}`;
    return contact?.[showKey] !== false && contact?.[item.key];
  });

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ marginBottom:'40px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Get In Touch</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>Contact</h1>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'32px' }}>
          {visibleItems.length === 0
            ? Array.from({length:4}).map((_,i)=><div key={i} style={{ height:54, borderRadius:'var(--radius-lg)' }} className="skeleton"/>)
            : visibleItems.map(item=><ContactRow key={item.key} item={item} value={contact[item.key]}/>)
          }
        </div>
        {contact?.workingHours && (
          <div style={{ display:'grid', gridTemplateColumns:'30px 1fr', alignItems:'center', gap:'10px', padding:'12px 16px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'32px' }}>
            <div style={{ width:30, height:30, borderRadius:'var(--radius-sm)', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-2)', flexShrink:0 }}>
              <Clock size={14} strokeWidth={1.75}/>
            </div>
            <div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'2px' }}>Working Hours</div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem' }}>{contact.workingHours}</div>
            </div>
          </div>
        )}
        <ContactForm/>

        {/* FAQ Section */}
        {faqItems.length > 0 && (
          <div style={{ marginTop:'64px' }}>
            <div style={{ textAlign:'center', marginBottom:'40px' }}>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'10px' }}>Common Questions</div>
              <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,4vw,3rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1 }}>FAQ</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {faqItems.map((item, i) => (
                <div key={i} style={{ background:'var(--bg-surface)', border:`1px solid ${faqOpen===i?'var(--accent-border)':'var(--border-2)'}`, borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'border-color 0.2s' }}>
                  <button
                    onClick={() => setFaqOpen(faqOpen===i ? null : i)}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', padding:'16px 20px', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.9rem', color:'var(--text-1)', lineHeight:1.4 }}>{item.question}</span>
                    <span style={{ flexShrink:0, fontFamily:'monospace', fontSize:'1.3rem', color:'var(--accent)', lineHeight:1, transform: faqOpen===i?'rotate(45deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>+</span>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding:'0 20px 16px', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.75, borderTop:'1px solid var(--border-1)' }}>
                      <div style={{ paddingTop:'12px' }}>{item.answer}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQPage Schema */}
        {faqItems.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqItems.map(item => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            }) }}
          />
        )}
      </div>
    </div>
  );
}
