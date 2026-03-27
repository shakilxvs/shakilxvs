'use client';
import { useState, useEffect } from 'react';
import { getPortfolioDoc, setPortfolioDoc } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

const FI = { width:'100%', padding:'9px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' };
const LB = { fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'4px', display:'block' };
const foc = e => e.target.style.borderColor = 'var(--accent-border)';
const blr = e => e.target.style.borderColor = 'var(--border-2)';

function FAQItem({ item, index, total, onChange, onDelete, onMove }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'8px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px' }}>
        {/* Reorder buttons */}
        <div style={{ display:'flex', flexDirection:'column', gap:'2px', flexShrink:0 }}>
          <button onClick={()=>onMove(index,-1)} disabled={index===0}
            style={{ background:'none', border:'none', color:index===0?'var(--border-2)':'var(--text-3)', cursor:index===0?'default':'pointer', padding:'2px', display:'flex' }}>
            <ChevronUp size={12}/>
          </button>
          <button onClick={()=>onMove(index,1)} disabled={index===total-1}
            style={{ background:'none', border:'none', color:index===total-1?'var(--border-2)':'var(--text-3)', cursor:index===total-1?'default':'pointer', padding:'2px', display:'flex' }}>
            <ChevronDown size={12}/>
          </button>
        </div>

        {/* Number */}
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', width:20, flexShrink:0 }}>
          {String(index+1).padStart(2,'0')}
        </div>

        {/* Question preview */}
        <div onClick={()=>setOpen(o=>!o)} style={{ flex:1, fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {item.question || <span style={{ color:'var(--text-3)' }}>Untitled question…</span>}
        </div>

        <button onClick={()=>setOpen(o=>!o)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'4px', flexShrink:0 }}>
          {open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </button>
        <button onClick={onDelete} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'4px', flexShrink:0 }}>
          <Trash2 size={13}/>
        </button>
      </div>

      {/* Expanded editor */}
      {open && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid var(--border-1)' }}>
          <div style={{ marginTop:'12px', marginBottom:'10px' }}>
            <label style={LB}>Question</label>
            <input style={FI} value={item.question} onChange={e=>onChange('question', e.target.value)} placeholder="e.g. How long does a project take?" onFocus={foc} onBlur={blr}/>
          </div>
          <div>
            <label style={LB}>Answer</label>
            <textarea style={{ ...FI, minHeight:90, resize:'vertical' }} value={item.answer} onChange={e=>onChange('answer', e.target.value)} placeholder="Write a clear, helpful answer…" onFocus={foc} onBlur={blr}/>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFAQPage() {
  const [items,  setItems]  = useState([]);
  const [loading,setLoading]= useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPortfolioDoc('faq').then(doc => {
      setItems(doc?.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), question:'', answer:'' }]);
  };

  const handleChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleDelete = (index) => {
    if (!confirm('Delete this FAQ item?')) return;
    setItems(prev => prev.filter((_,i) => i !== index));
  };

  const handleMove = (index, direction) => {
    setItems(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    const valid = items.filter(i => i.question.trim() && i.answer.trim());
    if (valid.length < items.length) {
      toast.error('Remove or complete empty FAQ items before saving');
      return;
    }
    setSaving(true);
    try {
      await setPortfolioDoc('faq', { items: valid });
      toast.success('FAQ saved — updates Services and Contact pages');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth:800 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>SEO & Content</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.5rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1 }}>FAQ</h1>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-3)', marginTop:'6px' }}>
            Appears on <strong style={{ color:'var(--text-2)' }}>Services</strong> and <strong style={{ color:'var(--text-2)' }}>Contact</strong> pages. Edit here once — updates both. Also generates FAQPage schema for Google rich results.
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={handleAdd} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:'var(--bg-surface)', color:'var(--text-1)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.875rem', cursor:'pointer' }}>
            <Plus size={14}/> Add Question
          </button>
          <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:saving?'not-allowed':'pointer' }}>
            <Save size={14}/>{saving?'Saving…':'Save FAQ'}
          </button>
        </div>
      </div>

      {/* Info box */}
      <div style={{ background:'rgba(35,77,194,0.06)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', padding:'12px 16px', marginBottom:'20px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px' }}>Google Rich Results</div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-2)' }}>
          FAQ items with clear questions and answers are eligible to appear directly in Google search results as expandable dropdowns under your page. Aim for 5–10 questions covering common client concerns.
        </div>
      </div>

      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {[0,1,2].map(i=><div key={i} style={{ height:50, borderRadius:'var(--radius-lg)' }} className="skeleton"/>)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:'8px' }}>No FAQ Items Yet</div>
          <div style={{ fontSize:'0.875rem', marginBottom:'20px' }}>Add questions clients commonly ask. Good FAQ = better SEO + fewer repetitive enquiries.</div>
          <button onClick={handleAdd} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 20px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
            <Plus size={14}/> Add First Question
          </button>
        </div>
      )}

      {!loading && items.map((item, i) => (
        <FAQItem
          key={item.id || i}
          item={item}
          index={i}
          total={items.length}
          onChange={(field, value) => handleChange(i, field, value)}
          onDelete={() => handleDelete(i)}
          onMove={handleMove}
        />
      ))}

      {items.length > 0 && (
        <div style={{ marginTop:'16px', display:'flex', justifyContent:'flex-end' }}>
          <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 20px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:saving?'not-allowed':'pointer' }}>
            <Save size={14}/>{saving?'Saving…':'Save FAQ'}
          </button>
        </div>
      )}
    </div>
  );
}
