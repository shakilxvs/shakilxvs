'use client';
import { useState, useEffect } from 'react';
import {
  getAllBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
} from '@/lib/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp, Eye, EyeOff,
  FileText, Type, Code, Image, ArrowRight,
} from 'lucide-react';

const FI = { width:'100%', padding:'9px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' };
const LB = { fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'4px', display:'block' };
const foc = e => e.target.style.borderColor = 'var(--accent-border)';
const blr = e => e.target.style.borderColor = 'var(--border-2)';

function slugify(text) {
  return (text||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function calcReadTime(blocks) {
  const words = (blocks||[]).map(b => {
    if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote') return b.content||'';
    if (b.type === 'bulletList') return (b.items||[]).join(' ');
    return '';
  }).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Block types ──────────────────────────────────────────
const BLOCK_TYPES = [
  { type:'paragraph', label:'Paragraph', Icon:Type  },
  { type:'heading',   label:'Heading',   Icon:Type  },
  { type:'quote',     label:'Quote',     Icon:Type  },
  { type:'code',      label:'Code',      Icon:Code  },
  { type:'image',     label:'Image',     Icon:Image },
  { type:'bulletList',label:'List',      Icon:FileText },
];

function newBlock(type) {
  const base = { id: Date.now().toString() + Math.random(), type };
  if (type === 'paragraph')  return { ...base, content:'' };
  if (type === 'heading')    return { ...base, content:'', level:2 };
  if (type === 'quote')      return { ...base, content:'' };
  if (type === 'code')       return { ...base, content:'', language:'javascript' };
  if (type === 'image')      return { ...base, url:'', alt:'', caption:'' };
  if (type === 'bulletList') return { ...base, items:[''] };
  return base;
}

function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => onChange({ ...block, [k]: v });

  const inputStyle = { ...FI, marginBottom:'8px' };
  const taStyle    = { ...FI, minHeight:100, resize:'vertical' };

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'8px', overflow:'hidden' }}>
      {/* Block header */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-elevated)', borderBottom:'1px solid var(--border-1)' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', flex:1 }}>{block.type}</div>
        <button onClick={onMoveUp}   disabled={isFirst} style={{ background:'none', border:'none', color:isFirst?'var(--border-2)':'var(--text-3)', cursor:isFirst?'default':'pointer', padding:'2px', display:'flex' }}><ChevronUp size={13}/></button>
        <button onClick={onMoveDown} disabled={isLast}  style={{ background:'none', border:'none', color:isLast?'var(--border-2)':'var(--text-3)', cursor:isLast?'default':'pointer', padding:'2px', display:'flex' }}><ChevronDown size={13}/></button>
        <button onClick={onDelete} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'2px', display:'flex' }}><Trash2 size={13}/></button>
      </div>

      {/* Block content */}
      <div style={{ padding:'12px' }}>
        {block.type === 'paragraph' && (
          <textarea style={taStyle} value={block.content||''} onChange={e=>set('content',e.target.value)} placeholder="Write your paragraph…" onFocus={foc} onBlur={blr}/>
        )}
        {block.type === 'heading' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'8px', marginBottom:'8px' }}>
              <select style={FI} value={block.level||2} onChange={e=>set('level',Number(e.target.value))}>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
              <input style={FI} value={block.content||''} onChange={e=>set('content',e.target.value)} placeholder="Heading text…" onFocus={foc} onBlur={blr}/>
            </div>
          </>
        )}
        {block.type === 'quote' && (
          <textarea style={{ ...taStyle, minHeight:60 }} value={block.content||''} onChange={e=>set('content',e.target.value)} placeholder="Quote text…" onFocus={foc} onBlur={blr}/>
        )}
        {block.type === 'code' && (
          <>
            <div style={{ marginBottom:'8px' }}>
              <label style={LB}>Language</label>
              <input style={FI} value={block.language||''} onChange={e=>set('language',e.target.value)} placeholder="javascript" onFocus={foc} onBlur={blr}/>
            </div>
            <textarea style={{ ...taStyle, fontFamily:'Space Mono,monospace', fontSize:'0.8rem' }} value={block.content||''} onChange={e=>set('content',e.target.value)} placeholder="// code here…" onFocus={foc} onBlur={blr}/>
          </>
        )}
        {block.type === 'image' && (
          <>
            <div style={{ marginBottom:'8px' }}>
              <label style={LB}>Image URL or Upload</label>
              <div style={{ display:'flex', gap:'8px' }}>
                <input style={{ ...FI, flex:1 }} value={block.url||''} onChange={e=>set('url',e.target.value)} placeholder="https://… or upload below" onFocus={foc} onBlur={blr}/>
                <label style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:uploading?'not-allowed':'pointer', flexShrink:0 }}>
                  {uploading ? 'Uploading…' : <><Image size={12}/> Upload</>}
                  <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploading} onChange={async e=>{
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const url = await uploadToCloudinary(file, 'blog');
                      set('url', url);
                      toast.success('Image uploaded');
                    } catch { toast.error('Upload failed'); }
                    finally { setUploading(false); e.target.value=''; }
                  }}/>
                </label>
              </div>
            </div>
            {block.url && <img src={block.url} alt={block.alt||''} style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:'var(--radius-md)', marginBottom:'8px' }}/>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              <div><label style={LB}>Alt Text</label><input style={FI} value={block.alt||''} onChange={e=>set('alt',e.target.value)} placeholder="Describe the image…" onFocus={foc} onBlur={blr}/></div>
              <div><label style={LB}>Caption (optional)</label><input style={FI} value={block.caption||''} onChange={e=>set('caption',e.target.value)} placeholder="Image caption…" onFocus={foc} onBlur={blr}/></div>
            </div>
          </>
        )}
        {block.type === 'bulletList' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {(block.items||['']).map((item, ii) => (
              <div key={ii} style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', flexShrink:0, marginTop:2 }}/>
                <input style={{ ...FI, flex:1, padding:'6px 10px' }} value={item} onChange={e=>{
                  const next = [...(block.items||[])];
                  next[ii] = e.target.value;
                  set('items', next);
                }} placeholder={`Item ${ii+1}…`} onFocus={foc} onBlur={blr}
                  onKeyDown={e=>{
                    if (e.key==='Enter') { e.preventDefault(); const next=[...(block.items||[])]; next.splice(ii+1,0,''); set('items',next); }
                    if (e.key==='Backspace' && !item && block.items.length>1) { e.preventDefault(); const next=[...(block.items||[])]; next.splice(ii,1); set('items',next); }
                  }}
                />
                {block.items.length > 1 && (
                  <button onClick={()=>{ const next=[...(block.items||[])]; next.splice(ii,1); set('items',next); }} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'2px', flexShrink:0 }}><Trash2 size={12}/></button>
                )}
              </div>
            ))}
            <button onClick={()=>set('items',[...(block.items||[]),''])} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-sm)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer', alignSelf:'flex-start', marginTop:'4px' }}>
              <Plus size={11}/> Add Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Post editor ──────────────────────────────────────────
function PostEditor({ post, onSave, onCancel }) {
  const [local,   setLocal]   = useState({
    title: post?.title || '',
    slug:  post?.slug  || '',
    excerpt: post?.excerpt || '',
    coverImage: post?.coverImage || '',
    tags: post?.tags?.join(', ') || '',
    status: post?.status || 'draft',
    seoTitle: post?.seoTitle || '',
    seoDescription: post?.seoDescription || '',
    blocks: post?.blocks || [],
  });
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setLocal(l => ({ ...l, [k]: v }));

  const addBlock = (type) => {
    set('blocks', [...local.blocks, newBlock(type)]);
  };

  const updateBlock = (index, updated) => {
    set('blocks', local.blocks.map((b, i) => i === index ? updated : b));
  };

  const deleteBlock = (index) => {
    set('blocks', local.blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index, dir) => {
    const next = [...local.blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set('blocks', next);
  };

  const handleSave = async (status) => {
    if (!local.title.trim()) { toast.error('Title required'); return; }
    if (!local.slug.trim())  { toast.error('Slug required'); return; }
    setSaving(true);
    try {
      const tags = local.tags.split(',').map(t=>t.trim()).filter(Boolean);
      const readTime = calcReadTime(local.blocks);
      await onSave({
        ...local,
        tags,
        readTime,
        status: status || local.status,
        publishedAt: (status === 'published' && post?.status !== 'published')
          ? serverTimestamp()
          : post?.publishedAt || null,
      });
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px', flexWrap:'wrap' }}>
        <button onClick={onCancel} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 14px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>
          ← All Posts
        </button>
        <div style={{ flex:1 }}/>
        <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color: local.status==='published'?'#34d399':'#f5c518', padding:'3px 10px', border:`1px solid ${local.status==='published'?'rgba(52,211,153,0.3)':'rgba(245,197,24,0.3)'}`, borderRadius:100 }}>
          {local.status}
        </span>
        <button onClick={()=>handleSave('draft')} disabled={saving} style={{ padding:'8px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>
          Save Draft
        </button>
        <button onClick={()=>handleSave('published')} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:saving?'not-allowed':'pointer' }}>
          <Eye size={13}/>{saving?'Saving…':'Publish'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'24px', alignItems:'start' }} className="blog-edit-grid">
        {/* Main content */}
        <div>
          {/* Title */}
          <div style={{ marginBottom:'16px' }}>
            <label style={LB}>Post Title *</label>
            <input style={{ ...FI, fontSize:'1.1rem', fontWeight:600 }} value={local.title}
              onChange={e=>{ set('title',e.target.value); if (!post?.id) set('slug', slugify(e.target.value)); }}
              placeholder="Post title…" onFocus={foc} onBlur={blr}/>
          </div>

          {/* Slug */}
          <div style={{ marginBottom:'16px' }}>
            <label style={LB}>URL Slug * — shakilxvs.com/blog/<strong style={{ color:'var(--accent)' }}>{local.slug||'…'}</strong></label>
            <div style={{ display:'flex', gap:'8px' }}>
              <input style={{ ...FI, flex:1 }} value={local.slug} onChange={e=>set('slug',e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} placeholder="my-post-slug" onFocus={foc} onBlur={blr}/>
              <button onClick={()=>set('slug',slugify(local.title))} style={{ padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer', flexShrink:0 }}>Auto</button>
            </div>
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom:'20px' }}>
            <label style={LB}>Excerpt (shown on listing page)</label>
            <textarea style={{ ...FI, minHeight:70, resize:'vertical' }} value={local.excerpt} onChange={e=>set('excerpt',e.target.value)} placeholder="Brief summary of the post…" onFocus={foc} onBlur={blr}/>
          </div>

          {/* Content blocks */}
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' }}>
            Content Blocks ({local.blocks.length})
          </div>

          {local.blocks.map((block, i) => (
            <BlockEditor
              key={block.id || i}
              block={block}
              onChange={updated => updateBlock(i, updated)}
              onDelete={() => deleteBlock(i)}
              onMoveUp={() => moveBlock(i, -1)}
              onMoveDown={() => moveBlock(i, 1)}
              isFirst={i === 0}
              isLast={i === local.blocks.length - 1}
            />
          ))}

          {/* Add block buttons */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'12px', padding:'14px', background:'var(--bg-surface)', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-lg)' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', width:'100%', marginBottom:'6px' }}>Add Block</div>
            {BLOCK_TYPES.map(({ type, label, Icon }) => (
              <button key={type} onClick={() => addBlock(type)} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer' }}>
                <Icon size={12}/>{label}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Cover image */}
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'16px' }}>
            <label style={LB}>Cover Image</label>
            {local.coverImage && <img src={local.coverImage} alt="" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', borderRadius:'var(--radius-md)', marginBottom:'8px' }}/>}
            <input style={FI} value={local.coverImage} onChange={e=>set('coverImage',e.target.value)} placeholder="https://… or upload" onFocus={foc} onBlur={blr}/>
            <label style={{ display:'inline-flex', alignItems:'center', gap:'5px', marginTop:'8px', padding:'7px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:uploading?'not-allowed':'pointer' }}>
              {uploading ? 'Uploading…' : <><Image size={12}/> Upload Cover</>}
              <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploading} onChange={async e=>{
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try { const url = await uploadToCloudinary(file,'blog'); set('coverImage',url); toast.success('Uploaded'); }
                catch { toast.error('Upload failed'); }
                finally { setUploading(false); e.target.value=''; }
              }}/>
            </label>
          </div>

          {/* Tags + read time */}
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'16px' }}>
            <div style={{ marginBottom:'12px' }}>
              <label style={LB}>Tags (comma separated)</label>
              <input style={FI} value={local.tags} onChange={e=>set('tags',e.target.value)} placeholder="Shopify, Marketing, SaaS" onFocus={foc} onBlur={blr}/>
            </div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
              Est. read time: <span style={{ color:'var(--accent)' }}>{calcReadTime(local.blocks)} min</span>
            </div>
          </div>

          {/* SEO */}
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'16px' }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' }}>SEO</div>
            <div style={{ marginBottom:'10px' }}>
              <label style={LB}>SEO Title (leave blank to use post title)</label>
              <input style={FI} value={local.seoTitle} onChange={e=>set('seoTitle',e.target.value)} placeholder={local.title||'Post title…'} onFocus={foc} onBlur={blr}/>
            </div>
            <div>
              <label style={LB}>Meta Description</label>
              <textarea style={{ ...FI, minHeight:70, resize:'vertical' }} value={local.seoDescription} onChange={e=>set('seoDescription',e.target.value)} placeholder={local.excerpt||'Post excerpt…'} onFocus={foc} onBlur={blr}/>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.blog-edit-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

// ─── Main Blog admin page ─────────────────────────────────
export default function AdminBlogPage() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, 'new' = new, post = edit

  useEffect(() => {
    getAllBlogPosts().then(p => { setPosts(p); setLoading(false); });
  }, []);

  const handleSave = async (data) => {
    if (editing === 'new') {
      const id = await addBlogPost(data);
      const newPost = { id, ...data };
      setPosts(p => [newPost, ...p]);
      toast.success('Post created');
      setEditing(null);
    } else {
      await updateBlogPost(editing.id, data);
      setPosts(p => p.map(x => x.id === editing.id ? { ...x, ...data } : x));
      toast.success('Post saved');
      setEditing(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post permanently?')) return;
    await deleteBlogPost(id);
    setPosts(p => p.filter(x => x.id !== id));
    toast.success('Post deleted');
  };

  const handleToggleStatus = async (post) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    await updateBlogPost(post.id, { status: next, ...(next==='published'?{publishedAt:serverTimestamp()}:{}) });
    setPosts(p => p.map(x => x.id === post.id ? { ...x, status:next } : x));
    toast.success(next === 'published' ? 'Published!' : 'Moved to draft');
  };

  if (editing) {
    return (
      <div style={{ maxWidth:1100 }}>
        <PostEditor
          post={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Content</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.5rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1 }}>Blog</h1>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-3)', marginTop:'4px' }}>
            {posts.filter(p=>p.status==='published').length} published · {posts.filter(p=>p.status==='draft').length} draft
          </div>
        </div>
        <button onClick={() => setEditing('new')} style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={15}/> New Post
        </button>
      </div>

      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[0,1,2].map(i=><div key={i} style={{ height:72, borderRadius:'var(--radius-lg)' }} className="skeleton"/>)}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:'8px' }}>No Posts Yet</div>
          <div style={{ fontSize:'0.875rem', marginBottom:'20px' }}>Start writing to attract global traffic. Each post is a permanent SEO asset.</div>
          <button onClick={()=>setEditing('new')} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 20px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
            <Plus size={14}/> Write First Post
          </button>
        </div>
      )}

      {posts.map(post => (
        <div key={post.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'8px', flexWrap:'wrap', transition:'border-color 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>

          {/* Cover thumb */}
          {post.coverImage
            ? <img src={post.coverImage} alt="" style={{ width:56, height:36, objectFit:'cover', borderRadius:'var(--radius-sm)', flexShrink:0 }}/>
            : <div style={{ width:56, height:36, background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}><FileText size={16} color="var(--text-3)"/></div>
          }

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.title||'Untitled'}</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'2px' }}>
              /blog/{post.slug||'…'} · {post.readTime||1} min read
            </div>
          </div>

          <button onClick={()=>handleToggleStatus(post)} style={{ padding:'4px 10px', background: post.status==='published'?'rgba(52,211,153,0.12)':'rgba(245,197,24,0.12)', color: post.status==='published'?'#34d399':'#f5c518', border:`1px solid ${post.status==='published'?'rgba(52,211,153,0.3)':'rgba(245,197,24,0.3)'}`, borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', cursor:'pointer', flexShrink:0 }}>
            {post.status==='published'?'Published':'Draft'}
          </button>

          <button onClick={()=>setEditing(post)} style={{ padding:'6px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer', flexShrink:0 }}>Edit</button>
          <button onClick={()=>handleDelete(post.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'4px', flexShrink:0 }}><Trash2 size={14}/></button>
        </div>
      ))}
    </div>
  );
}
