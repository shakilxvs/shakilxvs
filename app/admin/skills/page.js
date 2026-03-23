'use client';
import { useState, useEffect } from 'react';
import { getSkills, addSkill, updateSkill, deleteSkill, batchUpdateOrder } from '@/lib/firestore';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp } from 'lucide-react';

const EMPTY_SKILL = { name:'', icon:'', level:80, color:'#234DC2', description:'', subProjects:[], active:true };

function SortableSkill({ skill, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(skill);

  const set = (k, v) => setLocal(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await updateSkill(skill.id, local);
      onUpdate(skill.id, local);
      toast.success('Skill saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const field = { width:'100%', padding:'8px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none' };
  const lbl   = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px', display:'block' };

  return (
    <div ref={setNodeRef} style={{ ...style, background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px', overflow:'hidden' }}>
      {/* Row header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px 20px' }}>
        <div {...attributes} {...listeners} style={{ cursor:'grab', color:'var(--text-3)', flexShrink:0 }}>
          <GripVertical size={16} />
        </div>
        <div style={{ width:12, height:12, borderRadius:'50%', background:local.color, flexShrink:0 }} />
        <div style={{ flex:1, fontFamily:'Outfit,sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.9rem' }}>{local.name || 'Untitled Skill'}</div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:local.color }}>{local.level}%</div>
        <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}>
          <input type="checkbox" checked={local.active} onChange={e => { set('active', e.target.checked); }} style={{ accentColor:'var(--accent)' }} />
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>Active</span>
        </label>
        <button onClick={() => setOpen(o => !o)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer' }}>
          {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
        <button onClick={() => onDelete(skill.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer' }}>
          <Trash2 size={15}/>
        </button>
      </div>

      {/* Expanded editor */}
      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border-1)', paddingTop:'20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div><label style={lbl}>Skill Name</label><input style={field} value={local.name} onChange={e => set('name',e.target.value)} /></div>
            <div><label style={lbl}>Level (0–100)</label><input type="number" min="0" max="100" style={field} value={local.level} onChange={e => set('level',Number(e.target.value))} /></div>
            <div><label style={lbl}>Color</label><input type="color" value={local.color} onChange={e => set('color',e.target.value)} style={{ height:38, width:'100%', borderRadius:'var(--radius-md)', border:'1px solid var(--border-2)', background:'var(--bg-void)', cursor:'pointer' }} /></div>
            <div><label style={lbl}>Icon (emoji optional)</label><input style={field} value={local.icon} onChange={e => set('icon',e.target.value)} placeholder="e.g. leave blank" /></div>
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...field, minHeight:70, resize:'vertical' }} value={local.description} onChange={e => set('description',e.target.value)} />
          </div>
          <div style={{ marginBottom:'16px' }}>
            <label style={lbl}>Sub-Projects (comma separated)</label>
            <input style={field} value={(local.subProjects||[]).join(', ')} onChange={e => set('subProjects', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="Shopify Theme Dev, Liquid Coding, ..." />
          </div>
          <button onClick={save} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
            <Save size={14}/>{saving ? 'Saving…' : 'Save Skill'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminSkillsPage() {
  const [skills, setSkills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    getSkills().then(d => { setSkills(d); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    try {
      const id = await addSkill({ ...EMPTY_SKILL, order: skills.length });
      setSkills(s => [...s, { ...EMPTY_SKILL, id, order: s.length }]);
      toast.success('Skill added!');
    } catch { toast.error('Failed to add'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await deleteSkill(id);
      setSkills(s => s.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleUpdate = (id, data) => setSkills(s => s.map(x => x.id === id ? { ...x, ...data } : x));

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = skills.findIndex(s => s.id === active.id);
    const newIdx = skills.findIndex(s => s.id === over.id);
    const reordered = arrayMove(skills, oldIdx, newIdx);
    setSkills(reordered);
    try { await batchUpdateOrder('skills', reordered); }
    catch { toast.error('Reorder failed'); }
  };

  if (loading) return <div style={{ color:'var(--accent)', fontFamily:'Outfit,sans-serif' }}>Loading skills...</div>;

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Skills & Services</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'4px' }}>Drag to reorder. Click a skill to expand and edit.</div>
        </div>
        <button onClick={handleAdd} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={15}/> Add Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          No skills yet. Click "Add Skill" to get started.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {skills.map(skill => (
              <SortableSkill key={skill.id} skill={skill} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
