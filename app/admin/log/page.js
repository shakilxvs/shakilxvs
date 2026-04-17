'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, X, Upload, Clock, Image as ImageIcon,
  Video, Type, Music, ChevronDown, ChevronUp, Eye, EyeOff, Star,
} from 'lucide-react';
import {
  getAllLogPosts, addLogPost, updateLogPost, deleteLogPost,
  getLogSettings, setLogSettings, addDocument,
} from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';

// ─── Shared style constants (match the rest of admin) ──────
const FI = {
  width:'100%', padding:'10px 14px', background:'var(--bg-elevated)',
  border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)',
  color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem',
  outline:'none', boxSizing:'border-box', transition:'border-color 0.15s',
};
const LB = {
  fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)',
  textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'6px', display:'block',
};
const foc = e => { e.target.style.borderColor = 'var(--accent-border)'; };
const blr = e => { e.target.style.borderColor = 'var(--border-2)'; };

const TYPE_ICONS  = { photo: ImageIcon, video: Video, text: Type, audio: Music };
const TYPE_LABELS = { photo: 'Photo',   video: 'Video', text: 'Text', audio: 'Audio' };
const TYPE_ORDER  = ['photo', 'video', 'text', 'audio'];

// Convert JS Date ↔ datetime-local input string
function toLocalInput(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(s) {
  if (!s) return new Date();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}
function tsToDate(ts) {
  if (!ts) return null;
  if (typeof ts === 'string') return new Date(ts);
  if (ts.seconds != null) return new Date(ts.seconds * 1000);
  if (ts.toDate) return ts.toDate();
  return null;
}

// ─── Post row ──────────────────────────────────────────────
function PostRow({ post, onEdit, onDelete }) {
  const Icon = TYPE_ICONS[post.type] || Type;
  const date = tsToDate(post.post_date);
  const dateLabel = date ? date.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';
  const display   = post.title?.trim() || dateLabel;

  return (
    <div
      onClick={() => onEdit(post)}
      style={{
        display:'flex', alignItems:'center', gap:'14px',
        padding:'14px 18px', background:'var(--bg-surface)',
        border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)',
        cursor:'pointer', transition:'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
    >
      {/* Type icon */}
      <div style={{
        width:36, height:36, borderRadius:'var(--radius-md)',
        background:'var(--accent-muted)', border:'1px solid var(--accent-border)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        <Icon size={16} color="var(--accent)" strokeWidth={1.75}/>
      </div>

      {/* Title/date */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.92rem',
          color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>
          {display}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'3px' }}>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textTransform:'uppercase' }}>
            {TYPE_LABELS[post.type]} · {dateLabel}
          </span>
          {post.views ? (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>
              · {post.views} view{post.views === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Status badges */}
      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
        {post.featured && (
          <span style={{
            display:'inline-flex', alignItems:'center', gap:'4px',
            padding:'3px 8px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem',
            background:'rgba(245,197,24,0.12)', color:'#f5c518', border:'1px solid rgba(245,197,24,0.3)',
          }}>
            <Star size={9} strokeWidth={2}/> FEATURED
          </span>
        )}
        <span style={{
          padding:'3px 8px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem',
          background: post.published ? 'rgba(52,211,153,0.12)' : 'rgba(245,197,24,0.12)',
          color:     post.published ? '#34d399' : '#f5c518',
          border:    post.published ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(245,197,24,0.3)',
        }}>
          {post.published ? 'PUBLISHED' : 'DRAFT'}
        </span>
      </div>

      {/* Actions */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(post); }}
        style={{
          background:'none', border:'1px solid var(--border-2)',
          borderRadius:'var(--radius-sm)', padding:'6px',
          color:'var(--text-3)', cursor:'pointer', flexShrink:0,
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ff6b35'; e.currentTarget.style.borderColor = 'rgba(255,69,0,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
        title="Delete"
      >
        <Trash2 size={14} strokeWidth={1.75}/>
      </button>
    </div>
  );
}

// ─── Post drawer (create/edit) ─────────────────────────────
function PostDrawer({ post, onClose, onSaved }) {
  const isNew = !post?.id;
  const [local, setLocal] = useState(() => ({
    type:            post?.type            || 'photo',
    media_url:       post?.media_url       || '',
    media_thumbnail: post?.media_thumbnail || '',
    title:           post?.title           || '',
    description:     post?.description     || '',
    tagsInput:       '',
    tags:            Array.isArray(post?.tags) ? [...post.tags] : [],
    seo_title:       post?.seo_title       || '',
    seo_description: post?.seo_description || '',
    seo_keywords:    post?.seo_keywords    || '',
    published:       !!post?.published,
    featured:        !!post?.featured,
    post_date:       toLocalInput(tsToDate(post?.post_date) || new Date()),
  }));
  const [saving,   setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seoOpen,  setSeoOpen]  = useState(false);
  const fileRef = useRef(null);

  const set = (k, v) => setLocal(l => ({ ...l, [k]: v }));

  // Type change: reset media fields (a text post shouldn't carry an image URL)
  const handleTypeChange = (type) => {
    setLocal(l => ({ ...l, type, media_url: '', media_thumbnail: '' }));
  };

  const handleAddTag = () => {
    const t = local.tagsInput.trim().replace(/,+$/, '');
    if (!t) return;
    if (local.tags.includes(t)) { set('tagsInput', ''); return; }
    setLocal(l => ({ ...l, tags: [...l.tags, t], tagsInput: '' }));
  };
  const handleRemoveTag = (tag) => {
    setLocal(l => ({ ...l, tags: l.tags.filter(t => t !== tag) }));
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side MIME sanity check per selected type
    if (local.type === 'photo' && !file.type?.startsWith('image/')) {
      toast.error('Select an image file');
      e.target.value = ''; return;
    }
    if (local.type === 'video' && !file.type?.startsWith('video/')) {
      toast.error('Select a video file');
      e.target.value = ''; return;
    }
    if (local.type === 'audio' && !file.type?.startsWith('audio/')) {
      toast.error('Select an audio file');
      e.target.value = ''; return;
    }
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, 'log', { returnFull: true });
      setLocal(l => ({
        ...l,
        media_url:       result.url,
        media_thumbnail: result.thumbnail || '',
      }));
      toast.success('Uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    // Validation
    if (local.type !== 'text' && !local.media_url) {
      toast.error(`Upload ${local.type} media first`); return;
    }
    if (local.type === 'text' && !local.description.trim()) {
      toast.error('Text posts need a description'); return;
    }
    setSaving(true);
    try {
      const payload = {
        type:            local.type,
        media_url:       local.media_url || '',
        media_thumbnail: local.media_thumbnail || '',
        title:           local.title.trim(),
        description:     local.description.trim(),
        tags:            local.tags,
        seo_title:       local.seo_title.trim(),
        seo_description: local.seo_description.trim(),
        seo_keywords:    local.seo_keywords.trim(),
        published:       local.published,
        featured:        local.featured,
        post_date:       fromLocalInput(local.post_date),
      };
      if (isNew) await addLogPost(payload);
      else       await updateLogPost(post.id, payload);

      // Sync to media library — if post has media and it's new or changed
      if (payload.media_url && (isNew || payload.media_url !== post?.media_url)) {
        const mediaType = payload.type === 'photo' ? 'image'
                        : payload.type === 'video' ? 'video'
                        : payload.type === 'audio' ? 'video' // Cloudinary stores audio as video
                        : 'raw';
        try {
          await addDocument('mediaLibrary', {
            url:        payload.media_url,
            type:       mediaType,
            fileName:   payload.title || `log-${payload.type}`,
            source:     'log',
            uploadedAt: new Date().toISOString(),
          });
        } catch {
          // Non-critical — don't block the save
        }
      }

      toast.success(isNew ? 'Post created' : 'Post updated');
      onSaved();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const showMediaUploader = local.type !== 'text';

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
        backdropFilter:'blur(4px)', zIndex:200,
      }}/>
      {/* Drawer */}
      <aside style={{
        position:'fixed', top:0, right:0, bottom:0,
        width:'min(560px, 100vw)', background:'var(--bg-base)',
        borderLeft:'1px solid var(--border-2)', zIndex:201,
        overflowY:'auto', display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <header style={{
          position:'sticky', top:0, zIndex:2,
          padding:'18px 22px', borderBottom:'1px solid var(--border-1)',
          background:'var(--bg-base)', display:'flex', alignItems:'center', gap:'12px',
        }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.15em' }}>
              {isNew ? 'New Post' : 'Edit Post'}
            </div>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--text-1)', letterSpacing:'0.04em', marginTop:'2px' }}>
              LOG ENTRY
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'none', border:'1px solid var(--border-2)',
            borderRadius:'var(--radius-md)', padding:'8px',
            color:'var(--text-2)', cursor:'pointer',
          }}>
            <X size={16} strokeWidth={1.75}/>
          </button>
        </header>

        {/* Body */}
        <div style={{ padding:'22px', flex:1 }}>
          {/* Type pills */}
          <div style={{ marginBottom:'18px' }}>
            <label style={LB}>Type</label>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {TYPE_ORDER.map(t => {
                const Icon = TYPE_ICONS[t];
                const active = local.type === t;
                return (
                  <button key={t} onClick={() => handleTypeChange(t)} style={{
                    display:'inline-flex', alignItems:'center', gap:'6px',
                    padding:'8px 14px', borderRadius:100,
                    fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', fontWeight:active ? 700 : 500,
                    background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                    color:      active ? '#fff'          : 'var(--text-2)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-2)'}`,
                    cursor:'pointer', transition:'all 0.15s ease',
                  }}>
                    <Icon size={13} strokeWidth={1.75}/>{TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Media uploader (hidden for text) */}
          {showMediaUploader && (
            <div style={{ marginBottom:'18px' }}>
              <label style={LB}>
                {local.type === 'photo' && 'Photo'}
                {local.type === 'video' && 'Video (Cloudinary)'}
                {local.type === 'audio' && 'Audio (Cloudinary)'}
              </label>

              {/* Preview */}
              {local.media_url && (
                <div style={{
                  padding:'12px', background:'var(--bg-surface)',
                  border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)',
                  marginBottom:'8px',
                }}>
                  {local.type === 'photo' && (
                    <img src={local.media_url} alt=""
                      style={{ width:'100%', maxHeight:200, objectFit:'contain', borderRadius:'var(--radius-sm)' }}/>
                  )}
                  {local.type === 'video' && (
                    <video src={local.media_url} controls
                      style={{ width:'100%', maxHeight:220, borderRadius:'var(--radius-sm)', background:'#000' }}/>
                  )}
                  {local.type === 'audio' && (
                    <audio src={local.media_url} controls style={{ width:'100%' }}/>
                  )}
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {local.media_url}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:'8px' }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:'6px',
                    padding:'9px 16px', background:uploading ? 'var(--bg-elevated)' : 'var(--accent)',
                    color: uploading ? 'var(--text-3)' : '#fff', border:'none',
                    borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif',
                    fontSize:'0.82rem', fontWeight:700, cursor: uploading ? 'not-allowed' : 'pointer',
                  }}>
                  {uploading ? <Clock size={13}/> : <Upload size={13}/>}
                  {uploading ? 'Uploading…' : (local.media_url ? 'Replace' : 'Upload')}
                </button>
                {local.media_url && !uploading && (
                  <button onClick={() => setLocal(l => ({ ...l, media_url:'', media_thumbnail:'' }))}
                    style={{
                      padding:'9px 14px', background:'none', border:'1px solid var(--border-2)',
                      borderRadius:'var(--radius-md)', color:'var(--text-3)',
                      fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer',
                    }}>
                    Remove
                  </button>
                )}
                <input ref={fileRef} type="file" style={{ display:'none' }}
                  accept={
                    local.type === 'photo' ? 'image/*' :
                    local.type === 'video' ? 'video/*' :
                    local.type === 'audio' ? 'audio/*' : undefined
                  }
                  onChange={handleMediaUpload}/>
              </div>
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom:'16px' }}>
            <label style={LB}>Title (optional)</label>
            <input style={FI} value={local.title} onChange={e => set('title', e.target.value)}
              onFocus={foc} onBlur={blr} placeholder="A short caption…"/>
          </div>

          {/* Description */}
          <div style={{ marginBottom:'16px' }}>
            <label style={LB}>
              Description {local.type === 'text' && <span style={{ color:'var(--accent)' }}>*</span>}
            </label>
            <textarea
              style={{ ...FI, minHeight:110, resize:'vertical', fontFamily:'Outfit,sans-serif' }}
              value={local.description}
              onChange={e => set('description', e.target.value)}
              onFocus={foc} onBlur={blr}
              placeholder={local.type === 'text' ? 'Write your thoughts…' : 'Optional context…'}/>
          </div>

          {/* Tags */}
          <div style={{ marginBottom:'16px' }}>
            <label style={LB}>Tags</label>
            <div style={{ display:'flex', gap:'8px' }}>
              <input style={{ ...FI, flex:1 }} value={local.tagsInput}
                onChange={e => set('tagsInput', e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); }
                  if (e.key === 'Backspace' && !local.tagsInput && local.tags.length) {
                    handleRemoveTag(local.tags[local.tags.length - 1]);
                  }
                }}
                onFocus={foc} onBlur={blr}
                placeholder="Press Enter to add…"/>
              <button onClick={handleAddTag}
                style={{
                  padding:'10px 14px', background:'var(--bg-elevated)',
                  border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)',
                  color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', cursor:'pointer',
                }}>Add</button>
            </div>
            {local.tags.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'10px' }}>
                {local.tags.map(tag => (
                  <span key={tag} style={{
                    display:'inline-flex', alignItems:'center', gap:'5px',
                    padding:'4px 6px 4px 10px', borderRadius:100,
                    background:'var(--accent-muted)', border:'1px solid var(--accent-border)',
                    fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color:'var(--accent)',
                  }}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}
                      style={{
                        background:'none', border:'none', color:'var(--accent)',
                        cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center',
                      }}>
                      <X size={11} strokeWidth={2}/>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO (collapsible) */}
          <div style={{
            marginBottom:'18px', background:'var(--bg-surface)',
            border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)',
          }}>
            <button onClick={() => setSeoOpen(s => !s)} style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 14px', background:'none', border:'none', cursor:'pointer',
              color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem',
            }}>
              <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>SEO</span>
                <span style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>(optional)</span>
              </span>
              {seoOpen ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
            </button>
            {seoOpen && (
              <div style={{ padding:'0 14px 14px' }}>
                <div style={{ marginBottom:'12px' }}>
                  <label style={LB}>SEO Title</label>
                  <input style={FI} value={local.seo_title} onChange={e => set('seo_title', e.target.value)}
                    onFocus={foc} onBlur={blr}/>
                </div>
                <div style={{ marginBottom:'12px' }}>
                  <label style={LB}>SEO Description</label>
                  <textarea style={{ ...FI, minHeight:70, resize:'vertical', fontFamily:'Outfit,sans-serif' }}
                    value={local.seo_description} onChange={e => set('seo_description', e.target.value)}
                    onFocus={foc} onBlur={blr}/>
                </div>
                <div>
                  <label style={LB}>SEO Keywords (comma-separated)</label>
                  <input style={FI} value={local.seo_keywords} onChange={e => set('seo_keywords', e.target.value)}
                    onFocus={foc} onBlur={blr}/>
                </div>
              </div>
            )}
          </div>

          {/* Post date */}
          <div style={{ marginBottom:'16px' }}>
            <label style={LB}>Post Date</label>
            <input type="datetime-local" style={FI} value={local.post_date}
              onChange={e => set('post_date', e.target.value)} onFocus={foc} onBlur={blr}/>
          </div>

          {/* Toggles */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'22px' }}>
            <label style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 14px', background:'var(--bg-surface)',
              border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', cursor:'pointer',
            }}>
              <input type="checkbox" checked={local.published}
                onChange={e => set('published', e.target.checked)}
                style={{ accentColor:'var(--accent)', width:15, height:15 }}/>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:'Outfit,sans-serif', fontSize:'0.88rem', color:'var(--text-1)' }}>
                {local.published ? <Eye size={13} strokeWidth={1.75}/> : <EyeOff size={13} strokeWidth={1.75}/>}
                Published {local.published ? '(visible on /log)' : '(draft)'}
              </span>
            </label>
            <label style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 14px', background:'var(--bg-surface)',
              border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', cursor:'pointer',
            }}>
              <input type="checkbox" checked={local.featured}
                onChange={e => set('featured', e.target.checked)}
                style={{ accentColor:'var(--accent)', width:15, height:15 }}/>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:'Outfit,sans-serif', fontSize:'0.88rem', color:'var(--text-1)' }}>
                <Star size={13} strokeWidth={1.75}/>
                Featured (pinned to top)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          position:'sticky', bottom:0, padding:'14px 22px',
          borderTop:'1px solid var(--border-1)', background:'var(--bg-base)',
          display:'flex', gap:'10px', justifyContent:'flex-end',
        }}>
          <button onClick={onClose} disabled={saving} style={{
            padding:'10px 18px', background:'none', border:'1px solid var(--border-2)',
            borderRadius:'var(--radius-md)', color:'var(--text-2)',
            fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', cursor:'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || uploading} style={{
            padding:'10px 22px',
            background: (saving || uploading) ? 'var(--bg-elevated)' : 'var(--accent)',
            color:      (saving || uploading) ? 'var(--text-3)' : '#fff',
            border:'none', borderRadius:'var(--radius-md)',
            fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem',
            cursor: (saving || uploading) ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving…' : (isNew ? 'Create Post' : 'Save Changes')}
          </button>
        </footer>
      </aside>
    </>
  );
}

// ─── Settings tab ──────────────────────────────────────────
function SettingsTab() {
  const [local, setLocal] = useState({ page_title: '', page_subtitle: '', page_enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [dirty,   setDirty]   = useState(false);

  useEffect(() => {
    getLogSettings().then(s => {
      if (s) {
        setLocal({
          page_title:    s.page_title    || '',
          page_subtitle: s.page_subtitle || '',
          page_enabled:  !!s.page_enabled,
        });
      }
      setLoading(false);
    });
  }, []);

  const set = (k, v) => { setLocal(l => ({ ...l, [k]: v })); setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setLogSettings(local);
      toast.success('Settings saved');
      setDirty(false);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:'40px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>Loading…</div>;

  return (
    <div style={{ maxWidth:620 }}>
      <div style={{
        background:'var(--bg-surface)', border:'1px solid var(--border-2)',
        borderRadius:'var(--radius-lg)', padding:'22px',
      }}>
        <div style={{ marginBottom:'16px' }}>
          <label style={LB}>Page Title</label>
          <input style={FI} value={local.page_title} onChange={e => set('page_title', e.target.value)}
            onFocus={foc} onBlur={blr} placeholder="log · lately · fragments…"/>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'5px' }}>
            Displayed in large editorial serif at the top of /log.
          </div>
        </div>
        <div style={{ marginBottom:'16px' }}>
          <label style={LB}>Page Subtitle</label>
          <input style={FI} value={local.page_subtitle} onChange={e => set('page_subtitle', e.target.value)}
            onFocus={foc} onBlur={blr} placeholder="A quiet one-liner (optional)…"/>
        </div>
        <label style={{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'12px 14px', background:'var(--bg-elevated)',
          border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', cursor:'pointer',
        }}>
          <input type="checkbox" checked={local.page_enabled}
            onChange={e => set('page_enabled', e.target.checked)}
            style={{ accentColor:'var(--accent)', width:15, height:15 }}/>
          <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:'Outfit,sans-serif', fontSize:'0.88rem', color:'var(--text-1)' }}>
            {local.page_enabled ? <Eye size={13} strokeWidth={1.75}/> : <EyeOff size={13} strokeWidth={1.75}/>}
            /log page enabled
          </span>
          <span style={{ marginLeft:'auto', fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>
            {local.page_enabled ? 'LIVE' : 'HIDDEN'}
          </span>
        </label>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'6px', paddingLeft:'4px' }}>
          When hidden, /log redirects to homepage. The hero photo also stops linking to it.
        </div>
      </div>
      <div style={{ marginTop:'16px', display:'flex', justifyContent:'flex-end' }}>
        <button onClick={handleSave} disabled={saving || !dirty} style={{
          padding:'10px 22px',
          background: (!dirty || saving) ? 'var(--bg-elevated)' : 'var(--accent)',
          color:      (!dirty || saving) ? 'var(--text-3)' : '#fff',
          border:'none', borderRadius:'var(--radius-md)',
          fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem',
          cursor: (!dirty || saving) ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>
    </div>
  );
}

// ─── Posts tab ─────────────────────────────────────────────
function PostsTab() {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [drawerPost, setDrawerPost] = useState(null); // null closed; {} new; {id,...} edit
  const [filter,   setFilter]   = useState('all'); // all | published | draft

  const load = async () => {
    setLoading(true);
    const data = await getAllLogPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (p) => {
    if (!confirm(`Delete this ${p.type} post? This cannot be undone.`)) return;
    try {
      await deleteLogPost(p.id);
      toast.success('Deleted');
      await load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = posts.filter(p => {
    if (filter === 'published') return p.published;
    if (filter === 'draft')     return !p.published;
    return true;
  });

  return (
    <div>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
        {/* Filter chips */}
        <div style={{ display:'flex', gap:'6px' }}>
          {[
            { id:'all',       label:'All' },
            { id:'published', label:'Published' },
            { id:'draft',     label:'Drafts' },
          ].map(f => {
            const active = filter === f.id;
            const count = f.id === 'all' ? posts.length
                        : f.id === 'published' ? posts.filter(p => p.published).length
                        : posts.filter(p => !p.published).length;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding:'7px 14px', borderRadius:100,
                background: active ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                color:      active ? 'var(--accent)'      : 'var(--text-2)',
                border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-2)'}`,
                fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', fontWeight: active ? 700 : 500,
                cursor:'pointer',
              }}>
                {f.label} <span style={{ opacity:0.6, marginLeft:4 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ flex:1 }}/>
        <button onClick={() => setDrawerPost({})} style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none',
          borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem',
          cursor:'pointer',
        }}>
          <Plus size={13} strokeWidth={2}/> New Post
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[0,1,2].map(i => (
            <div key={i} className="skeleton" style={{ height:64, borderRadius:'var(--radius-lg)' }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'80px 24px',
          border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)',
          color:'var(--text-3)', fontFamily:'Outfit,sans-serif',
        }}>
          {posts.length === 0 ? 'No posts yet. Start with a new one.' : 'No posts match this filter.'}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {filtered.map(p => (
            <PostRow key={p.id} post={p}
              onEdit={setDrawerPost}
              onDelete={handleDelete}/>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawerPost !== null && (
        <PostDrawer
          post={drawerPost}
          onClose={() => setDrawerPost(null)}
          onSaved={() => { setDrawerPost(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Page shell with tabs ─────────────────────────────────
export default function AdminLogPage() {
  const [tab, setTab] = useState('posts');

  return (
    <div style={{ maxWidth:1100 }}>
      {/* Tabs */}
      <div style={{
        display:'flex', gap:'4px', marginBottom:'24px',
        borderBottom:'1px solid var(--border-1)',
      }}>
        {[
          { id:'posts',    label:'Posts' },
          { id:'settings', label:'Settings' },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'10px 18px', background:'none', border:'none',
              borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
              color: active ? 'var(--text-1)' : 'var(--text-3)',
              fontFamily:'Outfit,sans-serif', fontSize:'0.88rem',
              fontWeight: active ? 700 : 500, cursor:'pointer',
              marginBottom:'-1px',
            }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'posts'    && <PostsTab/>}
      {tab === 'settings' && <SettingsTab/>}
    </div>
  );
}
