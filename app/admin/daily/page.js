'use client';
import { useState, useEffect } from 'react';
import {
  getAllDailyPosts, addDailyPost, updateDailyPost, deleteDailyPost,
} from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Eye, Image, Film, Type, Upload } from 'lucide-react';

// ── Shared admin styles ──────────────────────────────────────
const FI = { width:'100%', padding:'9px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' };
const LB = { fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'4px', display:'block' };
const foc = e => e.target.style.borderColor = 'var(--accent-border)';
const blr = e => e.target.style.borderColor = 'var(--border-2)';

// ── Video type detection ─────────────────────────────────────
function detectVideoType(url) {
  if (!url) return 'direct';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  return 'direct';
}

// ── Upload button wrapper ────────────────────────────────────
function UploadBtn({ accept, uploading, onUpload, label }) {
  return (
    <label style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor: uploading ? 'not-allowed' : 'pointer', flexShrink:0, whiteSpace:'nowrap', opacity: uploading ? 0.6 : 1 }}>
      {uploading ? 'Uploading…' : <><Upload size={12}/>{label}</>}
      <input type="file" accept={accept} style={{ display:'none' }} disabled={uploading} onChange={onUpload}/>
    </label>
  );
}

// ── Post editor ──────────────────────────────────────────────
function PostEditor({ post, onSave, onCancel }) {
  const [type,          setType]          = useState(post?.type       || 'photo');
  const [imageUrl,      setImageUrl]      = useState(post?.imageUrl   || '');
  const [videoUrl,      setVideoUrl]      = useState(post?.videoUrl   || '');
  const [thumbnailUrl,  setThumbnailUrl]  = useState(post?.thumbnailUrl || '');
  const [text,          setText]          = useState(post?.text       || '');
  const [caption,       setCaption]       = useState(post?.caption    || '');
  const [tagsStr,       setTagsStr]       = useState(post?.tags?.join(', ') || '');
  const [status,        setStatus]        = useState(post?.status     || 'draft');
  const [saving,        setSaving]        = useState(false);
  const [upImg,         setUpImg]         = useState(false);
  const [upThumb,       setUpThumb]       = useState(false);
  const [upVideo,       setUpVideo]       = useState(false);

  const handleSave = async (saveStatus) => {
    if (type === 'photo' && !imageUrl.trim())  { toast.error('Image URL required'); return; }
    if (type === 'video' && !videoUrl.trim())  { toast.error('Video URL required'); return; }
    if (type === 'text'  && !text.trim())      { toast.error('Text content required'); return; }
    setSaving(true);
    try {
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      const finalStatus = saveStatus || status;
      const data = {
        type, status: finalStatus, tags,
        caption: caption.trim(),
        ...(type === 'photo' ? { imageUrl: imageUrl.trim() } : {}),
        ...(type === 'video' ? {
          videoUrl: videoUrl.trim(),
          videoType: detectVideoType(videoUrl.trim()),
          thumbnailUrl: thumbnailUrl.trim(),
        } : {}),
        ...(type === 'text' ? { text: text.trim() } : {}),
        publishedAt: finalStatus === 'published' && post?.status !== 'published'
          ? new Date()
          : post?.publishedAt || null,
      };
      await onSave(data);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const uploadFile = async (file, setUrl, setLoading, folder) => {
    setLoading(true);
    try { const url = await uploadToCloudinary(file, folder); setUrl(url); toast.success('Uploaded'); }
    catch { toast.error('Upload failed'); }
    finally { setLoading(false); }
  };

  const TYPE_OPTIONS = [
    { value:'photo', label:'Photo', Icon:Image },
    { value:'video', label:'Video', Icon:Film  },
    { value:'text',  label:'Text',  Icon:Type  },
  ];

  return (
    <div>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, flexWrap:'wrap' }}>
        <button onClick={onCancel} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>
          ← All Posts
        </button>
        <div style={{ flex:1 }}/>
        <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color: status==='published'?'#34d399':'#f5c518', padding:'3px 10px', border:`1px solid ${status==='published'?'rgba(52,211,153,0.3)':'rgba(245,197,24,0.3)'}`, borderRadius:100 }}>
          {status}
        </span>
        <button onClick={()=>handleSave('draft')} disabled={saving} style={{ padding:'8px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>
          Save Draft
        </button>
        <button onClick={()=>handleSave('published')} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:saving?'not-allowed':'pointer' }}>
          <Eye size={13}/>{saving?'Saving…':'Publish'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24, alignItems:'start' }} className="daily-edit-grid">
        {/* ── Main content ── */}
        <div>
          {/* Type selector */}
          <div style={{ marginBottom:20 }}>
            <label style={LB}>Post Type</label>
            <div style={{ display:'flex', gap:8 }}>
              {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                <button key={value} onClick={()=>setType(value)} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', background: type===value?'var(--accent)':'var(--bg-elevated)', color: type===value?'#fff':'var(--text-2)', border: type===value?'none':'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight: type===value?700:400, fontSize:'0.875rem', cursor:'pointer', transition:'all 0.15s' }}>
                  <Icon size={14}/>{label}
                </button>
              ))}
            </div>
          </div>

          {/* ── PHOTO fields ── */}
          {type === 'photo' && (
            <div>
              <div style={{ marginBottom:12 }}>
                <label style={LB}>Photo URL or Upload *</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input style={{ ...FI, flex:1 }} value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://… or upload" onFocus={foc} onBlur={blr}/>
                  <UploadBtn accept="image/*" uploading={upImg} label=" Upload" onUpload={async e=>{
                    const f=e.target.files?.[0]; if(!f) return;
                    await uploadFile(f, setImageUrl, setUpImg, 'daily');
                    e.target.value='';
                  }}/>
                </div>
                {imageUrl && <img src={imageUrl} alt="" style={{ width:'100%', maxHeight:280, objectFit:'cover', borderRadius:'var(--radius-md)', marginTop:8, display:'block' }}/>}
              </div>
              <div>
                <label style={LB}>Caption (optional)</label>
                <textarea style={{ ...FI, minHeight:70, resize:'vertical' }} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="What's happening in this photo?" onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          )}

          {/* ── VIDEO fields ── */}
          {type === 'video' && (
            <div>
              <div style={{ marginBottom:12 }}>
                <label style={LB}>Video URL * (YouTube, Instagram, or direct)</label>
                <input style={FI} value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=… or https://instagram.com/reel/…" onFocus={foc} onBlur={blr}/>
                {videoUrl && (
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)', marginTop:4 }}>
                    Detected: {detectVideoType(videoUrl).toUpperCase()}
                  </div>
                )}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={LB}>Upload Video File to Cloudinary</label>
                <UploadBtn accept="video/*" uploading={upVideo} label=" Upload Video" onUpload={async e=>{
                  const f=e.target.files?.[0]; if(!f) return;
                  await uploadFile(f, setVideoUrl, setUpVideo, 'daily');
                  e.target.value='';
                }}/>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={LB}>Custom Thumbnail (optional — auto-fetched for YouTube)</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input style={{ ...FI, flex:1 }} value={thumbnailUrl} onChange={e=>setThumbnailUrl(e.target.value)} placeholder="Leave blank for YouTube auto-thumbnail" onFocus={foc} onBlur={blr}/>
                  <UploadBtn accept="image/*" uploading={upThumb} label=" Upload" onUpload={async e=>{
                    const f=e.target.files?.[0]; if(!f) return;
                    await uploadFile(f, setThumbnailUrl, setUpThumb, 'daily');
                    e.target.value='';
                  }}/>
                </div>
                {thumbnailUrl && <img src={thumbnailUrl} alt="" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', borderRadius:'var(--radius-md)', marginTop:8, display:'block' }}/>}
              </div>
              <div>
                <label style={LB}>Caption (optional)</label>
                <textarea style={{ ...FI, minHeight:70, resize:'vertical' }} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="What's this video about?" onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          )}

          {/* ── TEXT fields ── */}
          {type === 'text' && (
            <div>
              <label style={LB}>Content * (tweet-style thought, quote, or update)</label>
              <textarea
                style={{ ...FI, minHeight:150, resize:'vertical', fontSize:'1rem', lineHeight:1.7 }}
                value={text}
                onChange={e=>setText(e.target.value)}
                placeholder="Share a thought, quote, or update…"
                onFocus={foc}
                onBlur={blr}
              />
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:4 }}>
                {text.length} characters
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Tags */}
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:16 }}>
            <div style={{ marginBottom:10 }}>
              <label style={LB}>Tags (comma separated)</label>
              <input style={FI} value={tagsStr} onChange={e=>setTagsStr(e.target.value)} placeholder="life, work, travel, behind-scenes" onFocus={foc} onBlur={blr}/>
            </div>
            {tagsStr && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {tagsStr.split(',').map(t=>t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--accent)', padding:'2px 8px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:100 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:16 }}>
            <label style={{ ...LB, marginBottom:10 }}>Status</label>
            <div style={{ display:'flex', gap:8 }}>
              {['draft','published'].map(s => (
                <button key={s} onClick={()=>setStatus(s)} style={{ flex:1, padding:'8px', background: status===s?(s==='published'?'rgba(52,211,153,0.12)':'rgba(245,197,24,0.12)'):'var(--bg-elevated)', color: status===s?(s==='published'?'#34d399':'#f5c518'):'var(--text-3)', border:`1px solid ${status===s?(s==='published'?'rgba(52,211,153,0.3)':'rgba(245,197,24,0.3)'):'var(--border-2)'}`, borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ background:'rgba(35,77,194,0.05)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-lg)', padding:14 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Tips</div>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:7 }}>
              {[
                type==='photo'  && 'Upload via Cloudinary for best quality.',
                type==='photo'  && 'Portrait images look great in masonry.',
                type==='video'  && 'YouTube: thumbnail auto-fetched.',
                type==='video'  && 'Instagram: opens in their app on tap.',
                type==='video'  && 'Cloudinary uploads stream directly.',
                type==='text'   && 'Keep it short — tweet-style reads best.',
                type==='text'   && 'Emoji work great here.',
                'Tags help visitors filter by topic.',
              ].filter(Boolean).map((tip,i) => (
                <li key={i} style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', color:'var(--text-3)', display:'flex', alignItems:'flex-start', gap:6, lineHeight:1.5 }}>
                  <span style={{ color:'var(--accent)', flexShrink:0 }}>·</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:800px){.daily-edit-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

// ── Type icon for list view ──────────────────────────────────
function TypeBadge({ type }) {
  const map = {
    photo: { Icon:Image, color:'#234DC2' },
    video: { Icon:Film,  color:'#dc2743' },
    text:  { Icon:Type,  color:'#14b8a6' },
  };
  const { Icon, color } = map[type] || map.text;
  return (
    <div style={{ width:40, height:36, background:`${color}18`, border:`1px solid ${color}30`, borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={14} color={color}/>
    </div>
  );
}

// ── Main admin page ──────────────────────────────────────────
export default function AdminDailyPage() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null=list | 'new' | post object

  useEffect(() => {
    getAllDailyPosts().then(p => { setPosts(p); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const handleSave = async (data) => {
    if (editing === 'new') {
      const id = await addDailyPost(data);
      setPosts(p => [{ id, ...data }, ...p]);
      toast.success('Post created');
    } else {
      await updateDailyPost(editing.id, data);
      setPosts(p => p.map(x => x.id === editing.id ? { ...x, ...data } : x));
      toast.success('Post saved');
    }
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post permanently?')) return;
    await deleteDailyPost(id);
    setPosts(p => p.filter(x => x.id !== id));
    toast.success('Deleted');
  };

  const handleToggle = async (post) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    await updateDailyPost(post.id, { status:next, ...(next==='published'?{publishedAt:new Date()}:{}) });
    setPosts(p => p.map(x => x.id === post.id ? { ...x, status:next } : x));
    toast.success(next === 'published' ? 'Published!' : 'Moved to draft');
  };

  // ── Editor view ──
  if (editing) {
    return (
      <div style={{ maxWidth:1000 }}>
        <PostEditor
          post={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  // ── List view ──
  return (
    <div style={{ maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:6 }}>Content</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.5rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1 }}>Daily</h1>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-3)', marginTop:4 }}>
            {posts.filter(p=>p.status==='published').length} published · {posts.filter(p=>p.status==='draft').length} draft
          </div>
        </div>
        <button onClick={()=>setEditing('new')} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={15}/> New Post
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[0,1,2].map(i=><div key={i} style={{ height:72, borderRadius:'var(--radius-lg)' }} className="skeleton"/>)}
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:8 }}>No Daily Posts Yet</div>
          <div style={{ fontSize:'0.875rem', marginBottom:20 }}>Share your daily life — moments, thoughts & behind the scenes.</div>
          <button onClick={()=>setEditing('new')} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
            <Plus size={14}/> Create First Post
          </button>
        </div>
      )}

      {/* Post list */}
      {posts.map(post => {
        // Build thumbnail src for list thumbnail preview
        const thumbSrc = post.type==='photo' ? post.imageUrl :
          post.type==='video' ? (post.thumbnailUrl ||
            (detectVideoType(post.videoUrl)==='youtube' && getYouTubeId(post.videoUrl)
              ? `https://img.youtube.com/vi/${getYouTubeId(post.videoUrl)}/mqdefault.jpg`
              : null))
          : null;
        return (
          <div key={post.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:8, flexWrap:'wrap', transition:'border-color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}
          >
            {/* Thumbnail or type badge */}
            {thumbSrc
              ? <img src={thumbSrc} alt="" style={{ width:56, height:36, objectFit:'cover', borderRadius:'var(--radius-sm)', flexShrink:0 }}/>
              : <TypeBadge type={post.type}/>
            }
            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {post.type==='text'
                  ? (post.text?.slice(0,70) + (post.text?.length>70?'…':'') || 'Text post')
                  : (post.caption || `${post.type.charAt(0).toUpperCase()}${post.type.slice(1)} post`)}
              </div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:2, display:'flex', gap:8 }}>
                <span style={{ textTransform:'uppercase' }}>{post.type}</span>
                {post.tags?.length > 0 && <span>· {post.tags.slice(0,2).join(', ')}</span>}
              </div>
            </div>
            {/* Status toggle */}
            <button onClick={()=>handleToggle(post)} style={{ padding:'4px 10px', background: post.status==='published'?'rgba(52,211,153,0.12)':'rgba(245,197,24,0.12)', color: post.status==='published'?'#34d399':'#f5c518', border:`1px solid ${post.status==='published'?'rgba(52,211,153,0.3)':'rgba(245,197,24,0.3)'}`, borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', cursor:'pointer', flexShrink:0 }}>
              {post.status==='published'?'Published':'Draft'}
            </button>
            <button onClick={()=>setEditing(post)} style={{ padding:'6px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer', flexShrink:0 }}>
              Edit
            </button>
            <button onClick={()=>handleDelete(post.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:4, flexShrink:0 }}>
              <Trash2 size={14}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Helper needed in list view — defined outside component to avoid re-declaration
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
