'use client';
import { useState, useEffect } from 'react';
import { getPendingReviews, getApprovedReviews, getRejectedReviews, approveReview, rejectReview, restoreReview, deleteDocument, updateDocument } from '@/lib/firestore';
import { formatMonthYear } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CheckCircle, X, RotateCcw, Trash2, Star, Video, ShieldCheck } from 'lucide-react';

const TABS = ['Pending', 'Published', 'Rejected'];

function Stars({ rating }) {
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {Array.from({length:5},(_,i)=>(
        <Star key={i} size={12} fill={i<rating?'#f5c518':'transparent'} color={i<rating?'#f5c518':'var(--border-3)'} strokeWidth={1.5}/>
      ))}
    </div>
  );
}

function ReviewRow({ review, actions }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px' }}>
      <div onClick={()=>setExpanded(e=>!e)} style={{ padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{review.name}</span>
            {review.verified && <ShieldCheck size={14} color="var(--accent)"/>}
            {review.videoUrl && <Video size={13} color="var(--text-3)"/>}
            {review.service && <span style={{ padding:'2px 8px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'inline-block' }}>{review.service}</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'4px' }}>
            <Stars rating={review.rating}/>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{formatMonthYear(review.submittedAt||review.approvedAt)}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }} onClick={e=>e.stopPropagation()}>
          {actions.map(({label, icon:Icon, onClick, color}) => (
            <button key={label} onClick={onClick} title={label} className="review-action-btn" style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color: color||'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer', transition:'all 0.15s ease' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=color||'var(--accent-border)'; e.currentTarget.style.color=color||'var(--accent)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color=color||'var(--text-2)'; }}
            >
              <Icon size={13}/><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      {expanded && (
        <div style={{ padding:'0 14px 14px', borderTop:'1px solid var(--border-1)' }}>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7, marginTop:'12px' }}>{review.text}</p>
          {review.videoUrl && <div style={{ marginTop:'8px', fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--text-3)' }}>Video: {review.videoUrl}</div>}
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'8px' }}>Email: {review.email}</div>
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [tab, setTab]           = useState('Pending');
  const [pending, setPending]   = useState([]);
  const [published, setPublished] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, pub, r] = await Promise.all([getPendingReviews(), getApprovedReviews(), getRejectedReviews()]);
    setPending(p); setPublished(pub); setRejected(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (review, verified=false) => {
    try {
      await approveReview(review.id, review, verified);
      setPending(p => p.filter(x => x.id !== review.id));
      toast.success(verified ? 'Approved & Verified!' : 'Approved!');
      load();
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (review) => {
    try {
      await rejectReview(review.id, review);
      setPending(p => p.filter(x => x.id !== review.id));
      toast.success('Rejected');
    } catch { toast.error('Failed'); }
  };

  const handleRestore = async (review) => {
    try {
      await restoreReview(review.id, review);
      toast.success('Restored to pending');
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (collectionName, id) => {
    if (!confirm('Permanently delete this review?')) return;
    try {
      await deleteDocument(collectionName, id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  const handleToggleVerify = async (review) => {
    try {
      await updateDocument('reviews', review.id, { verified: !review.verified });
      toast.success(review.verified ? 'Verification removed' : 'Marked as verified!');
      load();
    } catch { toast.error('Failed'); }
  };

  const tabData = { Pending: pending, Published: published, Rejected: rejected };
  const current = tabData[tab] || [];

  const getActions = (review) => {
    if (tab === 'Pending') return [
      { label:'Approve',          icon: CheckCircle, onClick:()=>handleApprove(review,false), color:'#2dd4bf' },
      { label:'Approve + Verify', icon: ShieldCheck,  onClick:()=>handleApprove(review,true),  color:'var(--accent)' },
      { label:'Reject',           icon: X,            onClick:()=>handleReject(review),         color:'#ff4500' },
    ];
    if (tab === 'Published') return [
      { label: review.verified?'Remove Verify':'Verify', icon:ShieldCheck, onClick:()=>handleToggleVerify(review), color:'var(--accent)' },
      { label:'Unpublish', icon:RotateCcw, onClick:()=>handleReject(review), color:'var(--text-2)' },
      { label:'Delete',    icon:Trash2,    onClick:()=>handleDelete('reviews', review.id), color:'#ff4500' },
    ];
    if (tab === 'Rejected') return [
      { label:'Restore', icon:RotateCcw, onClick:()=>handleRestore(review), color:'var(--accent)' },
      { label:'Delete',  icon:Trash2,    onClick:()=>handleDelete('reviews_rejected', review.id), color:'#ff4500' },
    ];
  };

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ display:'flex', gap:'4px', marginBottom:'28px', background:'var(--bg-surface)', padding:'4px', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-2)', flexWrap:'wrap', maxWidth:'100%' }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'8px 20px', borderRadius:'var(--radius-md)', border:'none',
            background: tab===t ? 'var(--accent)' : 'transparent',
            color: tab===t ? '#fff' : 'var(--text-2)',
            fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.875rem',
            cursor:'pointer', transition:'all 0.15s ease',
            display:'flex', alignItems:'center', gap:'6px',
          }}>
            {t}
            <span style={{ padding:'1px 7px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.6rem', background: tab===t ? 'rgba(0,0,0,0.2)' : 'var(--bg-elevated)', color: tab===t ? '#fff' : 'var(--text-3)' }}>
              {tabData[t]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading...</div>
      ) : current.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          No {tab.toLowerCase()} reviews.
        </div>
      ) : (
        current.map(review => (
          <ReviewRow key={review.id} review={review} actions={getActions(review)} />
        ))
      )}

      <style>{`
        @media (max-width: 640px) {
          .review-action-btn span { display: none !important; }
          .review-action-btn { padding: 6px !important; }
        }
      `}</style>
    </div>
  );
}
