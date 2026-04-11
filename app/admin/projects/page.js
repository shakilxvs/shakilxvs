'use client';
import { useState, useEffect } from 'react';
import { getProjects, addProject, updateProject, deleteProject, batchUpdateOrder } from '@/lib/firestore';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp, Star } from 'lucide-react';

const CATS  = ['CMS', 'Custom Built', 'Marketing', 'Design', 'Web App'];
const EMPTY = { title:'', description:'', category:'CMS', tags:[], thumbnailUrl:'', liveUrl:'', metrics:'', featured:false, active:true, slug:'', fullDescription:'', challenge:'', solution:'', results:'' };

function slugify(text) {
  return (text||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function SortableProject({ project, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [local, setLocal]   = useState(project);
  const set   = (k, v) => setLocal(prev => ({ ...prev, [k]: v }));
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const save = async () => {
    setSaving(true);
    try { await updateProject(project.id, local); onUpdate(project.id, local); toast.success('Project saved!'); }
    catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const fi  = { width:'100%', padding:'8px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none' };
  const lbl = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };

  return (
    <div ref={setNodeRef} style={{ ...style, background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', flexWrap:'wrap' }}>
        <div {...attributes} {...listeners} style={{ cursor:'grab', color:'var(--text-3)', flexShrink:0 }}><GripVertical size={16}/></div>
        {local.thumbnailUrl && <img src={local.thumbnailUrl} alt="" style={{ width:48, height:27, objectFit:'cover', borderRadius:4, flexShrink:0 }} />}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{local.title || 'Untitled Project'}</div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>{local.category}</div>
        </div>
        {local.featured && <Star size={14} fill="var(--gold)" color="var(--gold)" style={{ flexShrink:0 }}/>}
        <label style={{ display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', flexShrink:0 }}>
          <input type="checkbox" checked={local.active} onChange={e=>set('active',e.target.checked)} style={{ accentColor:'var(--accent)' }} />
          <span className="admin-row-active-label" style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', whiteSpace:'nowrap' }}>Active</span>
        </label>
        <button onClick={()=>setOpen(o=>!o)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}>{open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>
        <button onClick={()=>onDelete(project.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', flexShrink:0 }}><Trash2 size={15}/></button>
      </div>

      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border-1)', paddingTop:'20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Title</label><input style={fi} value={local.title} onChange={e=>set('title',e.target.value)} /></div>
            <div>
              <label style={lbl}>Category</label>
              <select style={fi} value={local.category} onChange={e=>set('category',e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Metrics (e.g. +40% CVR)</label><input style={fi} value={local.metrics||''} onChange={e=>set('metrics',e.target.value)} /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Description</label><textarea style={{ ...fi, minHeight:80, resize:'vertical' }} value={local.description||''} onChange={e=>set('description',e.target.value)} /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Tags (comma separated)</label><input style={fi} value={(local.tags||[]).join(', ')} onChange={e=>set('tags', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Thumbnail URL</label><input style={fi} value={local.thumbnailUrl||''} onChange={e=>set('thumbnailUrl',e.target.value)} placeholder="https://..." /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Live URL</label><input style={fi} value={local.liveUrl||''} onChange={e=>set('liveUrl',e.target.value)} placeholder="https://..." /></div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbl}>Slug (URL: /projects/[slug])</label>
              <div style={{ display:'flex', gap:'8px' }}>
                <input style={fi} value={local.slug||''} onChange={e=>set('slug',e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} placeholder="e.g. shopify-store-redesign" />
                <button onClick={()=>set('slug', slugify(local.title))} style={{ padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>Auto</button>
              </div>
            </div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Full Description (case study)</label><textarea style={{ ...fi, minHeight:80, resize:'vertical' }} value={local.fullDescription||''} onChange={e=>set('fullDescription',e.target.value)} placeholder="Detailed writeup for the case study page…" /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Challenge</label><textarea style={{ ...fi, minHeight:60, resize:'vertical' }} value={local.challenge||''} onChange={e=>set('challenge',e.target.value)} placeholder="What problem did the client have?" /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Solution</label><textarea style={{ ...fi, minHeight:60, resize:'vertical' }} value={local.solution||''} onChange={e=>set('solution',e.target.value)} placeholder="What did you build / do?" /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Results</label><textarea style={{ ...fi, minHeight:60, resize:'vertical' }} value={local.results||''} onChange={e=>set('results',e.target.value)} placeholder="Outcomes, metrics, client feedback…" /></div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', marginBottom:'16px' }}>
            <input type="checkbox" checked={local.featured} onChange={e=>set('featured',e.target.checked)} style={{ accentColor:'var(--accent)' }} />
            <Star size={13} style={{ color:'var(--gold)' }}/> Featured (shown at top of projects page)
          </label>
          <button onClick={save} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
            <Save size={14}/>{saving ? 'Saving…' : 'Save Project'}
          </button>
        </div>
      )}
    <style>{`@media(max-width:640px){.admin-row-active-label{display:none!important;}}`}</style>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => { getProjects().then(d => { setProjects(d); setLoading(false); }); }, []);

  const handleAdd = async () => {
    try {
      const id = await addProject({ ...EMPTY, order: projects.length });
      const newItem = { ...EMPTY, id, order: projects.length };
      setProjects(s => [...s, newItem]);
      toast.success('Project added!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try { await deleteProject(id); setProjects(s => s.filter(x=>x.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const handleUpdate = (id, data) => setProjects(s => s.map(x => x.id===id ? {...x,...data} : x));

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(projects, projects.findIndex(s=>s.id===active.id), projects.findIndex(s=>s.id===over.id));
    setProjects(reordered);
    try { await batchUpdateOrder('projects', reordered); } catch { toast.error('Reorder failed'); }
  };

  if (loading) return <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Projects</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'4px' }}>Drag to reorder · Star = Featured at top of projects page</div>
        </div>
        <button onClick={handleAdd} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={15}/> Add Project
        </button>
      </div>
      {projects.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No projects yet.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map(p=>p.id)} strategy={verticalListSortingStrategy}>
            {projects.map(p => <SortableProject key={p.id} project={p} onUpdate={handleUpdate} onDelete={handleDelete} />)}
          </SortableContext>
        </DndContext>
      )}
    <style>{`@media(max-width:640px){.admin-row-active-label{display:none!important;}}`}</style>
    </div>
  );
}
