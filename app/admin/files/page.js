'use client';
import { useState, useEffect } from 'react';
import { getFiles, addFile, updateFile, deleteFile, batchUpdateOrder } from '@/lib/firestore';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp, Star } from 'lucide-react';

const EMPTY = { name:'', description:'', type:'PDF', version:'', link:'', price:'', featured:false, active:true };

function SortableFile({ file, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.id });
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [local, setLocal]   = useState(file);
  const set = (k, v) => setLocal(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await updateFile(file.id, local); onUpdate(file.id, local); toast.success('File saved!'); }
    catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const fi = { width:'100%', padding:'8px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };
  const isFree = !local.price || local.price === '' || local.price === '0';

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', flexWrap:'wrap' }}>
        <div {...attributes} {...listeners} style={{ cursor:'grab', color:'var(--text-3)', flexShrink:0 }}><GripVertical size={16}/></div>
        <div style={{ padding:'2px 8px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-2)', flexShrink:0 }}>{local.type||'FILE'}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{local.name||'Untitled File'}</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color: isFree ? 'var(--accent)' : 'var(--text-2)' }}>{isFree ? 'Free' : `$${local.price}`}</div>
        </div>
        {local.featured && <Star size={14} fill="var(--gold)" color="var(--gold)" style={{ flexShrink:0 }}/>}
        <label style={{ display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', flexShrink:0 }}>
          <input type="checkbox" checked={local.active} onChange={e=>set('active',e.target.checked)} style={{ accentColor:'var(--accent)' }}/>
          <span className="admin-row-active-label" style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', whiteSpace:'nowrap' }}>Active</span>
        </label>
        <button onClick={()=>setOpen(o=>!o)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
        <button onClick={()=>onDelete(file.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}><Trash2 size={15}/></button>
      </div>

      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border-1)', paddingTop:'20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div style={{ gridColumn:'1/-1' }}><label style={lb}>File Name</label><input style={fi} value={local.name} onChange={e=>set('name',e.target.value)}/></div>
            <div><label style={lb}>Type (PDF, ZIP, DOCX...)</label><input style={fi} value={local.type} onChange={e=>set('type',e.target.value)} placeholder="PDF"/></div>
            <div><label style={lb}>Version (optional)</label><input style={fi} value={local.version||''} onChange={e=>set('version',e.target.value)} placeholder="v1.0"/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lb}>Description</label><textarea style={{ ...fi, minHeight:70, resize:'vertical' }} value={local.description||''} onChange={e=>set('description',e.target.value)}/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lb}>Download / Payment Link</label><input style={fi} value={local.link||''} onChange={e=>set('link',e.target.value)} placeholder="https://drive.google.com/... or payment link"/></div>
            <div>
              <label style={lb}>Price (leave empty = Free)</label>
              <input style={fi} value={local.price||''} onChange={e=>set('price',e.target.value)} placeholder="9.99"/>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'4px' }}>Leave blank for free downloads</div>
            </div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'16px' }}>
            <input type="checkbox" checked={local.featured||false} onChange={e=>set('featured',e.target.checked)} style={{ accentColor:'var(--accent)' }}/>
            <Star size={13} style={{ color:'var(--gold)' }}/> Featured (pinned at top of files page)
          </label>
          <button onClick={save} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
            <Save size={14}/>{saving?'Saving…':'Save File'}
          </button>
        </div>
      )}
    <style>{`@media(max-width:640px){.admin-row-active-label{display:none!important;}}`}</style>
    </div>
  );
}

export default function AdminFilesPage() {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => { getFiles().then(d=>{ setFiles(d); setLoading(false); }); }, []);

  const handleAdd = async () => {
    try {
      const id = await addFile({...EMPTY, order:0});
      const newItem = {...EMPTY, id, order:0};
      setFiles(s => [newItem, ...s]);
      toast.success('Added!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try { await deleteFile(id); setFiles(s=>s.filter(x=>x.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const handleUpdate = (id, data) => setFiles(s=>s.map(x=>x.id===id?{...x,...data}:x));

  const handleDragEnd = async ({active, over}) => {
    if (!over||active.id===over.id) return;
    const r = arrayMove(files, files.findIndex(s=>s.id===active.id), files.findIndex(s=>s.id===over.id));
    setFiles(r);
    try { await batchUpdateOrder('files', r); } catch { toast.error('Reorder failed'); }
  };

  if (loading) return <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Files & Downloads</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'4px' }}>Drag to reorder. Empty price = free download.</div>
        </div>
        <button onClick={handleAdd} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={15}/> Add File
        </button>
      </div>
      {files.length===0 ? (
        <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No files yet.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={files.map(f=>f.id)} strategy={verticalListSortingStrategy}>
            {files.map(file=><SortableFile key={file.id} file={file} onUpdate={handleUpdate} onDelete={handleDelete}/>)}
          </SortableContext>
        </DndContext>
      )}
    <style>{`@media(max-width:640px){.admin-row-active-label{display:none!important;}}`}</style>
    </div>
  );
}
