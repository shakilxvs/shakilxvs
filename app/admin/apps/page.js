'use client';
import { useState, useEffect, useRef } from 'react';
import { getApps, addApp, updateApp, deleteApp, batchUpdateOrder } from '@/lib/firestore';
import { getAppGradient, uploadToCloudinary } from '@/lib/utils';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp, Star, ImagePlus, Upload } from 'lucide-react';

const STATUSES = ['Live', 'Beta', 'In Development'];
const EMPTY    = { name:'', url:'', iconUrl:'', bannerUrl:'', status:'Live', featured:false, active:true };

/* Build the list of candidate favicon URLs to try, in priority order.
   - First: the site's own /favicon.ico (fast, no 3rd-party dependency, works for
     anything with a conventional favicon).
   - Then: DuckDuckGo's icon service as a fallback for modern sites that only
     declare their favicon via <link rel="icon"> at a non-standard path.
   We deliberately AVOID Google's /s2/favicons because it serves a generic
   globe placeholder with 200 status — which defeats any fallback logic. */
function getFaviconCandidates(url) {
  if (!url) return [];
  try {
    const hostname = new URL(url).hostname;
    return [
      `https://${hostname}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    ];
  } catch {
    return [];
  }
}

/* Preload + verify a candidate list in priority order. Resolves with the
   first URL that actually loads as a real image, or null if none do.
   naturalWidth>0 guards against broken-image responses that fire onload
   with a 0x0 image (some error services do this). */
function preloadFirstValid(urls) {
  return new Promise(resolve => {
    let i = 0;
    const tryNext = () => {
      if (i >= urls.length) { resolve(null); return; }
      const src = urls[i++];
      const img = new Image();
      img.onload  = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) resolve(src);
        else tryNext();
      };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });
}

/* Shared cascade: uploaded iconUrl → favicon from app URL → letter + gradient.
   Same logic lives in components/portfolio/AppsPage.js so admin preview matches
   what the public page renders. We always render the letter FIRST (server and
   initial client render) — hydration-safe — then upgrade to a real image only
   after useEffect confirms via Image preload that it actually loads. This
   avoids: (a) hydration mismatches, (b) broken-image placeholders when a 3rd-
   party icon service returns unexpected content for missing favicons. */
function AppIconPreview({ name, iconUrl, url, size = 36 }) {
  // loadedKind: null (letter) | 'icon' (uploaded) | 'favicon' (from URL)
  // loadedSrc: the exact URL confirmed to load, passed to the <img> tag
  const [loadedKind, setLoadedKind] = useState(null);
  const [loadedSrc,  setLoadedSrc]  = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Reset on source change so the preview always reflects current inputs.
    setLoadedKind(null);
    setLoadedSrc(null);

    (async () => {
      // Uploaded icon is priority 1 — check independently so we know which
      // styling branch to use (object-fit: cover vs. favicon's centered look).
      if (iconUrl) {
        const ok = await preloadFirstValid([iconUrl]);
        if (cancelled) return;
        if (ok) { setLoadedKind('icon'); setLoadedSrc(ok); return; }
      }
      // Fall through to favicon candidates built from the app URL.
      const favHit = await preloadFirstValid(getFaviconCandidates(url));
      if (cancelled) return;
      if (favHit) { setLoadedKind('favicon'); setLoadedSrc(favHit); }
      // else: stay on letter fallback (default null state).
    })();

    return () => { cancelled = true; };
  }, [iconUrl, url]);

  const letter = (name?.[0] || '?').toUpperCase();
  const radius = Math.round(size * 0.22);

  if (loadedKind === 'icon') {
    return (
      <div style={{ width:size, height:size, borderRadius:radius, overflow:'hidden', background:'var(--bg-elevated)', flexShrink:0 }}>
        <img src={loadedSrc} alt={name||'icon'}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      </div>
    );
  }
  if (loadedKind === 'favicon') {
    return (
      <div style={{ width:size, height:size, borderRadius:radius, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <img src={loadedSrc} alt={name||'favicon'}
          style={{ width:'70%', height:'70%', objectFit:'contain', display:'block' }}/>
      </div>
    );
  }
  // Letter + gradient — default state (initial render, still loading, or all sources failed)
  return (
    <div style={{ width:size, height:size, borderRadius:radius, background:getAppGradient(name||'?'), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:size*0.55, color:'#fff', lineHeight:1 }}>{letter}</span>
    </div>
  );
}

function SortableApp({ app, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [local,     setLocal]     = useState(app);
  const iconInputRef = useRef(null);
  const set = (k, v) => setLocal(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await updateApp(app.id, local); onUpdate(app.id, local); toast.success('Saved!'); }
    catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) { toast.error('Please select an image file'); e.target.value = ''; return; }
    setUploading(true);
    try {
      const iconUrl = await uploadToCloudinary(file, 'apps/icons');
      set('iconUrl', iconUrl);
      toast.success('Icon uploaded — click Save App to persist.');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const fi = { width:'100%', padding:'8px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };

  return (
    <div ref={setNodeRef} style={{ transform:CSS.Transform.toString(transform), transition, opacity:isDragging?0.5:1, background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 16px', overflowX:'auto', scrollbarWidth:'none' }}>
        <div {...attributes} {...listeners} style={{ cursor:'grab', color:'var(--text-3)', flexShrink:0 }}><GripVertical size={16}/></div>
        <AppIconPreview name={local.name} iconUrl={local.iconUrl} url={local.url}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{local.name||'Untitled App'}</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>{local.status}</div>
        </div>
        {local.featured && <Star size={14} fill="var(--gold)" color="var(--gold)" style={{ flexShrink:0 }}/>}
        {local.bannerUrl && <ImagePlus size={13} color="var(--text-3)" style={{ flexShrink:0 }}/>}
        <label style={{ display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', flexShrink:0 }}>
          <input type="checkbox" checked={local.active} onChange={e=>set('active',e.target.checked)} style={{ accentColor:'var(--accent)' }}/>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', whiteSpace:'nowrap' }}>Active</span>
        </label>
        <button onClick={()=>setOpen(o=>!o)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
        <button onClick={()=>onDelete(app.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}><Trash2 size={15}/></button>
      </div>
      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border-1)', paddingTop:'20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lb}>App Name</label><input style={fi} value={local.name} onChange={e=>set('name',e.target.value)} placeholder="Messify"/></div>
            <div><label style={lb}>Status</label><select style={fi} value={local.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lb}>App URL</label><input style={fi} value={local.url||''} onChange={e=>set('url',e.target.value)} placeholder="https://..."/></div>

            {/* App Icon — uploaded image takes priority; if blank, favicon is used; if favicon fails, letter fallback shows. */}
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lb}>App Icon (optional)</label>
              <div style={{ display:'flex', gap:'10px', alignItems:'stretch' }}>
                {/* Live preview mirrors public cascade so admin sees exactly what users will see */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'4px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)' }}>
                  <AppIconPreview name={local.name} iconUrl={local.iconUrl} url={local.url} size={44}/>
                </div>
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
                  <input style={fi} value={local.iconUrl||''} onChange={e=>set('iconUrl',e.target.value)} placeholder="https://... or click Upload"/>
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button
                      type="button"
                      onClick={()=>iconInputRef.current?.click()}
                      disabled={uploading}
                      style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'7px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', color:'var(--text-2)', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:uploading?'wait':'pointer', opacity:uploading?0.6:1 }}
                    >
                      <Upload size={11}/> {uploading?'Uploading…':'Upload Icon'}
                    </button>
                    {local.iconUrl && (
                      <button
                        type="button"
                        onClick={()=>set('iconUrl','')}
                        style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'7px 12px', background:'none', border:'1px solid var(--border-2)', color:'var(--text-3)', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer' }}
                      >
                        <Trash2 size={11}/> Clear
                      </button>
                    )}
                  </div>
                  <input ref={iconInputRef} type="file" accept="image/*" onChange={handleIconUpload} style={{ display:'none' }}/>
                </div>
              </div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'6px', lineHeight:1.5 }}>
                Square icon recommended (512×512). Leave empty to auto-use the favicon from the App URL. If the favicon is unavailable, the letter icon is shown.
              </div>
            </div>

            <div style={{ gridColumn:'1/-1' }}>
              <label style={lb}>Banner Image URL</label>
              <input style={fi} value={local.bannerUrl||''} onChange={e=>set('bannerUrl',e.target.value)} placeholder="https://... (shown at top of featured card)"/>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'4px' }}>Recommended: 1200×400px or wider. Shown at top of featured app cards.</div>
            </div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'16px' }}>
            <input type="checkbox" checked={local.featured} onChange={e=>set('featured',e.target.checked)} style={{ accentColor:'var(--accent)' }}/>
            <Star size={13} style={{ color:'var(--gold)' }}/> Featured (larger card at top of apps page)
          </label>
          <button onClick={save} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
            <Save size={14}/>{saving?'Saving…':'Save App'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminAppsPage() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => { getApps().then(d=>{ setApps(d); setLoading(false); }); }, []);

  const handleAdd = async () => {
    try {
      const id = await addApp({...EMPTY, order: apps.length});
      const newItem = {...EMPTY, id, order: apps.length};
      setApps(s => [...s, newItem]);
      toast.success('Added!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this app?')) return;
    try { await deleteApp(id); setApps(s=>s.filter(x=>x.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const handleUpdate = (id, data) => setApps(s=>s.map(x=>x.id===id?{...x,...data}:x));

  const handleDragEnd = async ({active, over}) => {
    if (!over||active.id===over.id) return;
    const r = arrayMove(apps, apps.findIndex(s=>s.id===active.id), apps.findIndex(s=>s.id===over.id));
    setApps(r);
    try { await batchUpdateOrder('apps', r); } catch { toast.error('Reorder failed'); }
  };

  if (loading) return <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Apps</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'4px' }}>Upload an icon, or leave blank to auto-use the App URL&apos;s favicon. Drag to reorder.</div>
        </div>
        <button onClick={handleAdd} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={15}/> Add App
        </button>
      </div>
      {apps.length===0 ? (
        <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No apps yet.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={apps.map(a=>a.id)} strategy={verticalListSortingStrategy}>
            {apps.map(app=><SortableApp key={app.id} app={app} onUpdate={handleUpdate} onDelete={handleDelete}/>)}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
