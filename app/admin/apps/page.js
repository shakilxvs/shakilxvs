'use client';
import { useState, useEffect } from 'react';
import { getApps, addApp, updateApp, deleteApp, batchUpdateOrder } from '@/lib/firestore';
import { getAppGradient } from '@/lib/utils';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp, Star, ImagePlus } from 'lucide-react';

const STATUSES = ['Live', 'Beta', 'In Development'];
const EMPTY    = { name:'', url:'', bannerUrl:'', status:'Live', featured:false, active:true };

function AppIconPreview({ name }) {
  const letter = (name?.[0] || '?').toUpperCase();
  return (
    <div style={{ width:36, height:36, borderRadius:8, background:getAppGradient(name||'?'), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'#fff', lineHeight:1 }}>{letter}</span>
    </div>
  );
}

function SortableApp({ app, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [local,  setLocal]  = useState(app);
  const set = (k, v) => setLocal(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await updateApp(app.id, local); onUpdate(app.id, local); toast.success('Saved!'); }
    catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const fi = { width:'100%', padding:'8px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };

  return (
    <div ref={setNodeRef} style={{ transform:CSS.Transform.toString(transform), transition, opacity:isDragging?0.5:1, background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 16px', overflowX:'auto', scrollbarWidth:'none' }}>
        <div {...attributes} {...listeners} style={{ cursor:'grab', color:'var(--text-3)', flexShrink:0 }}><GripVertical size={16}/></div>
        <AppIconPreview name={local.name}/>
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
      const id = await addApp({...EMPTY, order:0});
      const newItem = {...EMPTY, id, order:0};
      setApps(s => [newItem, ...s]);
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
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'4px' }}>Icons auto-generated from first letter. Drag to reorder.</div>
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
