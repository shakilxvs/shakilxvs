'use client';
import { useState, useEffect, useRef } from 'react';
import {
  getClients, addClient, updateClient, deleteClient,
  getClientProjects, addPortalProject, updatePortalProject, deletePortalProject,
  getProjectTasks, addTask, updateTask, deleteTask,
  getClientInvoices, addInvoice, updateInvoice, deleteInvoice,
  getPortalMessages, sendPortalMessage, getAllPortalMessages,
  getProjectFiles, addPortalFile, deletePortalFile,
} from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Save, ChevronDown, ChevronUp, ChevronRight,
  User, Briefcase, CreditCard, MessageSquare, X, Upload, Download,
  CheckCircle, Clock, AlertTriangle, FileText, Send, Eye, EyeOff,
} from 'lucide-react';

/* ─── Shared styles ─────────────────────────────────── */
const FI = { width:'100%', padding:'9px 12px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' };
const LB = { fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'4px', display:'block' };
const foc = e => e.target.style.borderColor = 'var(--accent-border)';
const blr = e => e.target.style.borderColor = 'var(--border-2)';

const STATUS_COLORS = {
  'Planning':    { bg:'rgba(245,197,24,0.12)',  color:'#f5c518', border:'rgba(245,197,24,0.3)'  },
  'In Progress': { bg:'rgba(35,77,194,0.12)',   color:'#5c8dff', border:'rgba(35,77,194,0.3)'  },
  'Review':      { bg:'rgba(124,58,237,0.12)',  color:'#a78bfa', border:'rgba(124,58,237,0.3)' },
  'Completed':   { bg:'rgba(16,185,129,0.12)',  color:'#34d399', border:'rgba(16,185,129,0.3)' },
  'Cancelled':   { bg:'rgba(255,69,0,0.1)',     color:'#ff6b35', border:'rgba(255,69,0,0.2)'   },
  'Todo':        { bg:'rgba(255,255,255,0.05)', color:'var(--text-3)', border:'var(--border-2)' },
  'Done':        { bg:'rgba(16,185,129,0.12)',  color:'#34d399', border:'rgba(16,185,129,0.3)' },
  'Unpaid':      { bg:'rgba(245,197,24,0.12)',  color:'#f5c518', border:'rgba(245,197,24,0.3)'  },
  'Paid':        { bg:'rgba(16,185,129,0.12)',  color:'#34d399', border:'rgba(16,185,129,0.3)' },
  'Overdue':     { bg:'rgba(255,69,0,0.1)',     color:'#ff6b35', border:'rgba(255,69,0,0.2)'   },
};
function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS['Todo'];
  return (
    <span style={{ padding:'2px 8px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>
      {status}
    </span>
  );
}

/* ─── Utility: simple hash for password storage ─────── */
async function hashPassword(pw) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/* ══════════════════════════════════════════════════════
   PROJECTS PANEL
══════════════════════════════════════════════════════ */
function ProjectsPanel({ client }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [newP,     setNewP]     = useState({ title:'', description:'', status:'Planning', deadline:'', budget:'' });
  const [saving,   setSaving]   = useState(false);
  const [open,     setOpen]     = useState(null); // expanded project id

  useEffect(() => {
    getClientProjects(client.id).then(p => { setProjects(p); setLoading(false); });
  }, [client.id]);

  const handleAdd = async () => {
    if (!newP.title.trim()) { toast.error('Project title required'); return; }
    setSaving(true);
    try {
      const id = await addPortalProject({ ...newP, clientId: client.id });
      setProjects(p => [{ id, ...newP, clientId: client.id }, ...p]);
      setNewP({ title:'', description:'', status:'Planning', deadline:'', budget:'' });
      setAdding(false);
      toast.success('Project added');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updatePortalProject(id, data);
      setProjects(p => p.map(x => x.id===id ? {...x,...data} : x));
      toast.success('Saved');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await deletePortalProject(id);
      setProjects(p => p.filter(x => x.id!==id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ padding:'20px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>Loading projects…</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>
          {projects.length} Project{projects.length!==1?'s':''}
        </div>
        <button onClick={()=>setAdding(a=>!a)} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'7px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
          <Plus size={13}/> Add Project
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background:'var(--bg-void)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-lg)', padding:'16px', marginBottom:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            <div style={{ gridColumn:'1/-1' }}><label style={LB}>Project Title *</label><input style={FI} value={newP.title} onChange={e=>setNewP(p=>({...p,title:e.target.value}))} placeholder="e.g. Shopify Store Redesign" onFocus={foc} onBlur={blr}/></div>
            <div><label style={LB}>Status</label>
              <select style={FI} value={newP.status} onChange={e=>setNewP(p=>({...p,status:e.target.value}))}>
                {['Planning','In Progress','Review','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={LB}>Deadline</label><input type="date" style={FI} value={newP.deadline} onChange={e=>setNewP(p=>({...p,deadline:e.target.value}))} onFocus={foc} onBlur={blr}/></div>
            <div><label style={LB}>Budget ($)</label><input style={FI} value={newP.budget} onChange={e=>setNewP(p=>({...p,budget:e.target.value}))} placeholder="e.g. 1500" onFocus={foc} onBlur={blr}/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={LB}>Description</label><textarea style={{ ...FI, minHeight:70, resize:'vertical' }} value={newP.description} onChange={e=>setNewP(p=>({...p,description:e.target.value}))} onFocus={foc} onBlur={blr}/></div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={handleAdd} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:saving?'not-allowed':'pointer' }}>
              <Save size={12}/>{saving?'Saving…':'Save Project'}
            </button>
            <button onClick={()=>setAdding(false)} style={{ padding:'8px 14px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !adding && (
        <div style={{ textAlign:'center', padding:'40px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-lg)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>
          No projects yet. Click "Add Project" to create one.
        </div>
      )}

      {projects.map(project => (
        <ProjectRow key={project.id} project={project} open={open===project.id}
          onToggle={()=>setOpen(open===project.id?null:project.id)}
          onUpdate={data=>handleUpdate(project.id, data)}
          onDelete={()=>handleDelete(project.id)}
          clientPerms={client.permissions||{}}
        />
      ))}
    </div>
  );
}

function ProjectRow({ project, open, onToggle, onUpdate, onDelete, clientPerms }) {
  const [local, setLocal] = useState({ ...project });
  const [dirty,  setDirty]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [tasks,  setTasks]  = useState([]);
  const [files,  setFiles]  = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open && tasks.length === 0) {
      setLoadingTasks(true);
      Promise.all([getProjectTasks(project.id), getProjectFiles(project.id)]).then(([t,f]) => {
        setTasks(t); setFiles(f); setLoadingTasks(false);
      });
    }
  }, [open, project.id]);

  const set = (k,v) => { setLocal(l=>({...l,[k]:v})); setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    try { await onUpdate(local); setDirty(false); }
    finally { setSaving(false); }
  };

  const handleAddTask = async (title) => {
    if (!title?.trim()) return;
    try {
      const id = await addTask({ projectId: project.id, clientId: project.clientId, title: title.trim(), status:'Todo', assignedTo:'admin' });
      setTasks(t => [...t, { id, projectId: project.id, clientId: project.clientId, title: title.trim(), status:'Todo', assignedTo:'admin' }]);
    } catch { toast.error('Failed'); }
  };

  const handleTaskStatus = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      setTasks(t => t.map(x => x.id===taskId ? {...x,status} : x));
    } catch { toast.error('Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(t => t.filter(x => x.id!==taskId));
    } catch { toast.error('Failed'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'portal/files');
      const id  = await addPortalFile({ projectId: project.id, clientId: project.clientId, name: file.name, url, uploadedBy:'admin', size: file.size });
      setFiles(f => [...f, { id, projectId: project.id, name: file.name, url, uploadedBy:'admin' }]);
      toast.success('File uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deletePortalFile(fileId);
      setFiles(f => f.filter(x => x.id!==fileId));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==='Done').length/tasks.length)*100) : 0;

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px' }}>
      {/* Header */}
      <div onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', cursor:'pointer', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{project.title}</span>
            <StatusBadge status={project.status}/>
          </div>
          {project.deadline && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'3px' }}>Due: {project.deadline}</div>}
        </div>
        {project.budget && <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--accent)', flexShrink:0 }}>${project.budget}</span>}
        <button onClick={e=>{e.stopPropagation();onDelete();}} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'4px', flexShrink:0 }}><Trash2 size={13}/></button>
        <div style={{ color:'var(--text-3)', flexShrink:0 }}>{open?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ padding:'0 16px 20px', borderTop:'1px solid var(--border-1)' }}>
          {/* Edit fields */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'14px', marginBottom:'14px' }}>
            <div style={{ gridColumn:'1/-1' }}><label style={LB}>Title</label><input style={FI} value={local.title} onChange={e=>set('title',e.target.value)} onFocus={foc} onBlur={blr}/></div>
            <div><label style={LB}>Status</label>
              <select style={FI} value={local.status} onChange={e=>set('status',e.target.value)}>
                {['Planning','In Progress','Review','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={LB}>Deadline</label><input type="date" style={FI} value={local.deadline||''} onChange={e=>set('deadline',e.target.value)} onFocus={foc} onBlur={blr}/></div>
            <div><label style={LB}>Budget ($)</label><input style={FI} value={local.budget||''} onChange={e=>set('budget',e.target.value)} onFocus={foc} onBlur={blr}/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={LB}>Description</label><textarea style={{ ...FI, minHeight:64, resize:'vertical' }} value={local.description||''} onChange={e=>set('description',e.target.value)} onFocus={foc} onBlur={blr}/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={LB}>Internal Notes (not visible to client)</label><textarea style={{ ...FI, minHeight:52, resize:'vertical' }} value={local.internalNotes||''} onChange={e=>set('internalNotes',e.target.value)} onFocus={foc} onBlur={blr}/></div>
          </div>
          {dirty && (
            <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'7px 16px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', marginBottom:'16px' }}>
              <Save size={12}/>{saving?'Saving…':'Save Changes'}
            </button>
          )}

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div style={{ marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textTransform:'uppercase' }}>Progress</span>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)' }}>{progress}%</span>
              </div>
              <div style={{ height:4, background:'var(--border-2)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'var(--accent)', borderRadius:2, transition:'width 0.4s ease' }}/>
              </div>
            </div>
          )}

          {/* Tasks */}
          <div style={{ marginBottom:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Tasks ({tasks.length})</span>
              <button onClick={()=>setAddingTask(a=>!a)} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer' }}>
                <Plus size={11}/> Add Task
              </button>
            </div>
            {addingTask && (
              <div style={{ display:'flex', gap:'8px', marginBottom:'8px', marginTop:'8px' }}>
                <input style={{ flex:1, padding:'7px 10px', background:'var(--bg-void)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', outline:'none' }}
                  value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} placeholder="Task title…" autoFocus
                  onKeyDown={e=>{ if(e.key==='Enter'){ handleAddTask(newTaskTitle); setNewTaskTitle(''); setAddingTask(false); } if(e.key==='Escape'){ setAddingTask(false); setNewTaskTitle(''); } }}/>
                <button onClick={()=>{ handleAddTask(newTaskTitle); setNewTaskTitle(''); setAddingTask(false); }}
                  style={{ padding:'7px 12px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.78rem', cursor:'pointer' }}>Add</button>
                <button onClick={()=>{ setAddingTask(false); setNewTaskTitle(''); }}
                  style={{ padding:'7px 10px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer' }}>Cancel</button>
              </div>
            )}
            {loadingTasks && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>Loading…</div>}
            {!loadingTasks && tasks.length === 0 && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>No tasks yet.</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                  <select value={task.status} onChange={e=>handleTaskStatus(task.id,e.target.value)}
                    style={{ padding:'2px 6px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:'4px', color:'var(--text-2)', fontFamily:'Space Mono,monospace', fontSize:'0.55rem', cursor:'pointer' }}>
                    {['Todo','In Progress','Done'].map(s=><option key={s}>{s}</option>)}
                  </select>
                  <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color: task.status==='Done'?'var(--text-3)':'var(--text-1)', flex:1, textDecoration: task.status==='Done'?'line-through':'none' }}>{task.title}</span>
                  {task.assignedTo === 'client' && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.5rem', color:'var(--accent)', padding:'1px 6px', border:'1px solid var(--accent-border)', borderRadius:100 }}>client</span>}
                  <button onClick={()=>handleDeleteTask(task.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'2px', flexShrink:0 }}><X size={12}/></button>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Files ({files.length})</span>
              <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer' }}>
                {uploading?<Clock size={11}/>:<Upload size={11}/>} {uploading?'Uploading…':'Upload File'}
              </button>
              <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleUpload}/>
            </div>
            {files.length === 0 && !uploading && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>No files yet.</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {files.map(file => (
                <div key={file.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                  <FileText size={13} color="var(--accent)" style={{ flexShrink:0 }}/>
                  <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-1)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</span>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)' }}>{file.uploadedBy}</span>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)', display:'flex', alignItems:'center', flexShrink:0 }}><Download size={13}/></a>
                  <button onClick={()=>handleDeleteFile(file.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'2px', flexShrink:0 }}><X size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INVOICES PANEL
══════════════════════════════════════════════════════ */
function InvoicesPanel({ client }) {
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [newInv,   setNewInv]   = useState({ number:'', amount:'', currency:'USD', dueDate:'', status:'Unpaid', description:'', payUrl:'/pay' });

  useEffect(() => {
    getClientInvoices(client.id).then(i => { setInvoices(i); setLoading(false); });
  }, [client.id]);

  const handleAdd = async () => {
    if (!newInv.amount) { toast.error('Amount required'); return; }
    setSaving(true);
    try {
      const id = await addInvoice({ ...newInv, clientId: client.id });
      setInvoices(i => [{ id, ...newInv, clientId: client.id }, ...i]);
      setNewInv({ number:'', amount:'', currency:'USD', dueDate:'', status:'Unpaid', description:'', payUrl:'/pay' });
      setAdding(false);
      toast.success('Invoice added');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateInvoice(id, { status });
      setInvoices(i => i.map(x => x.id===id ? {...x,status} : x));
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      setInvoices(i => i.filter(x => x.id!==id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ padding:'20px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>Loading invoices…</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>{invoices.length} Invoice{invoices.length!==1?'s':''}</div>
        <button onClick={()=>setAdding(a=>!a)} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'7px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
          <Plus size={13}/> Add Invoice
        </button>
      </div>

      {adding && (
        <div style={{ background:'var(--bg-void)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-lg)', padding:'16px', marginBottom:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            <div><label style={LB}>Invoice # (optional)</label><input style={FI} value={newInv.number} onChange={e=>setNewInv(v=>({...v,number:e.target.value}))} placeholder="INV-001" onFocus={foc} onBlur={blr}/></div>
            <div><label style={LB}>Amount *</label><input style={FI} value={newInv.amount} onChange={e=>setNewInv(v=>({...v,amount:e.target.value}))} placeholder="500" onFocus={foc} onBlur={blr}/></div>
            <div><label style={LB}>Currency</label>
              <select style={FI} value={newInv.currency} onChange={e=>setNewInv(v=>({...v,currency:e.target.value}))}>
                {['USD','GBP','EUR','BDT','CAD','AUD'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={LB}>Due Date</label><input type="date" style={FI} value={newInv.dueDate} onChange={e=>setNewInv(v=>({...v,dueDate:e.target.value}))} onFocus={foc} onBlur={blr}/></div>
            <div><label style={LB}>Status</label>
              <select style={FI} value={newInv.status} onChange={e=>setNewInv(v=>({...v,status:e.target.value}))}>
                {['Unpaid','Paid','Overdue'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={LB}>Pay Link URL</label><input style={FI} value={newInv.payUrl} onChange={e=>setNewInv(v=>({...v,payUrl:e.target.value}))} placeholder="/pay" onFocus={foc} onBlur={blr}/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={LB}>Description</label><input style={FI} value={newInv.description} onChange={e=>setNewInv(v=>({...v,description:e.target.value}))} placeholder="Shopify store development" onFocus={foc} onBlur={blr}/></div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={handleAdd} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
              <Save size={12}/>{saving?'Saving…':'Save Invoice'}
            </button>
            <button onClick={()=>setAdding(false)} style={{ padding:'8px 14px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {invoices.length === 0 && !adding && (
        <div style={{ textAlign:'center', padding:'40px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-lg)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>No invoices yet.</div>
      )}

      {invoices.map(inv => (
        <div key={inv.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', marginBottom:'8px', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)' }}>
              {inv.number ? `#${inv.number} — ` : ''}{inv.currency} {inv.amount}
            </div>
            {inv.description && <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', color:'var(--text-3)', marginTop:'2px' }}>{inv.description}</div>}
            {inv.dueDate && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'2px' }}>Due: {inv.dueDate}</div>}
          </div>
          <select value={inv.status} onChange={e=>handleStatusChange(inv.id,e.target.value)}
            style={{ padding:'4px 8px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:6, color:'var(--text-1)', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', cursor:'pointer', flexShrink:0 }}>
            {['Unpaid','Paid','Overdue'].map(s=><option key={s}>{s}</option>)}
          </select>
          <StatusBadge status={inv.status}/>
          <button onClick={()=>handleDelete(inv.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:'4px', flexShrink:0 }}><Trash2 size={13}/></button>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MESSAGES PANEL
══════════════════════════════════════════════════════ */
function MessagesPanel({ client }) {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    getPortalMessages(client.id).then(m => { setMessages(m); setLoading(false); });
  }, [client.id]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const id = await sendPortalMessage({ clientId: client.id, text: text.trim(), from:'admin' });
      setMessages(m => [...m, { id, clientId: client.id, text: text.trim(), from:'admin', sentAt: new Date() }]);
      setText('');
    } catch { toast.error('Failed'); }
    finally { setSending(false); }
  };

  if (loading) return <div style={{ padding:'20px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>Loading messages…</div>;

  return (
    <div>
      <div style={{ maxHeight:360, overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px', paddingRight:'4px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-lg)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>No messages yet.</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} style={{ display:'flex', flexDirection:'column', alignItems: msg.from==='admin'?'flex-end':'flex-start' }}>
            <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius:'var(--radius-lg)', background: msg.from==='admin'?'var(--accent)':'var(--bg-elevated)', color: msg.from==='admin'?'#fff':'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', lineHeight:1.5 }}>
              {msg.text}
            </div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', marginTop:'3px', paddingLeft:'4px', paddingRight:'4px' }}>
              {msg.from==='admin'?'You':'Client'} · {msg.sentAt?.toDate ? msg.sentAt.toDate().toLocaleDateString() : 'just now'}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <input style={{ ...FI, flex:1 }} value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message to client…" onFocus={foc} onBlur={blr}
          onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}/>
        <button onClick={handleSend} disabled={sending||!text.trim()} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'9px 16px', background:sending||!text.trim()?'var(--bg-elevated)':'var(--accent)', color:sending||!text.trim()?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:sending?'not-allowed':'pointer', flexShrink:0 }}>
          <Send size={13}/>{sending?'…':'Send'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CLIENT CARD (expandable)
══════════════════════════════════════════════════════ */
function ClientCard({ client, onUpdate, onDelete }) {
  const [open,  setOpen]  = useState(false);
  const [tab,   setTab]   = useState('projects'); // projects | invoices | messages
  const [editMode, setEditMode] = useState(false);
  const [local, setLocal] = useState({ ...client });
  const [showPw, setShowPw] = useState(false);
  const [newPw,  setNewPw]  = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k,v) => setLocal(l=>({...l,[k]:v}));
  const setPerms = (k,v) => setLocal(l=>({...l,permissions:{...(l.permissions||{}), [k]:v}}));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...local };
      if (newPw.trim()) {
        data.passwordHash = await hashPassword(newPw.trim());
        data.passwordPlain = newPw.trim(); // stored so admin can view it
      }
      await onUpdate(data);
      setNewPw('');
      setEditMode(false);
      toast.success('Client saved');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id:'projects',  label:'Projects',  Icon:Briefcase     },
    { id:'invoices',  label:'Invoices',  Icon:CreditCard    },
    { id:'messages',  label:'Messages',  Icon:MessageSquare },
  ];

  return (
    <div style={{ background:'var(--bg-surface)', border:`1px solid ${client.active===false?'var(--border-2)':'var(--border-2)'}`, borderRadius:'var(--radius-lg)', marginBottom:'12px' }}>
      {/* Header row */}
      <div onClick={()=>setOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', cursor:'pointer', flexWrap:'wrap' }}>
        <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {client.photo ? <img src={client.photo} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/> : <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--accent)' }}>{(client.name||'?')[0].toUpperCase()}</span>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem' }}>{client.name}</span>
            {client.company && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', padding:'2px 7px', border:'1px solid var(--border-2)', borderRadius:100 }}>{client.company}</span>}
            {client.active===false && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--fire)', padding:'2px 7px', border:'1px solid rgba(255,69,0,0.3)', borderRadius:100 }}>Suspended</span>}
          </div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'2px' }}>
            @{client.username} · {client.email}
          </div>
        </div>
        <div style={{ display:'flex', gap:'6px', flexShrink:0 }} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>{ setEditMode(e=>!e); setOpen(true); }} style={{ padding:'6px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer' }}>Edit</button>
          <button onClick={()=>onDelete()} style={{ padding:'6px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center' }}><Trash2 size={13}/></button>
        </div>
        <div style={{ color:'var(--text-3)', flexShrink:0 }}>{open?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop:'1px solid var(--border-1)' }}>
          {/* Edit fields */}
          {editMode && (
            <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border-1)', background:'var(--bg-elevated)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                <div><label style={LB}>Full Name</label><input style={FI} value={local.name||''} onChange={e=>set('name',e.target.value)} onFocus={foc} onBlur={blr}/></div>
                <div><label style={LB}>Username (login)</label><input style={FI} value={local.username||''} onChange={e=>set('username',e.target.value.toLowerCase().replace(/\s/g,''))} onFocus={foc} onBlur={blr}/></div>
                <div><label style={LB}>Email</label><input style={FI} value={local.email||''} onChange={e=>set('email',e.target.value.toLowerCase())} onFocus={foc} onBlur={blr}/></div>
                <div><label style={LB}>Company</label><input style={FI} value={local.company||''} onChange={e=>set('company',e.target.value)} onFocus={foc} onBlur={blr}/></div>
                <div><label style={LB}>Phone</label><input style={FI} value={local.phone||''} onChange={e=>set('phone',e.target.value)} onFocus={foc} onBlur={blr}/></div>
                <div><label style={LB}>Country</label><input style={FI} value={local.country||''} onChange={e=>set('country',e.target.value)} onFocus={foc} onBlur={blr}/></div>
                {/* Password */}
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={LB}>
                    New Password {client.passwordPlain && <span style={{ color:'var(--text-3)' }}>— current: <span style={{ color:'var(--accent)' }}>{showPw?client.passwordPlain:'••••••••'}</span></span>}
                    <button onClick={()=>setShowPw(x=>!x)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', marginLeft:'6px', padding:0 }}>
                      {showPw?<EyeOff size={11}/>:<Eye size={11}/>}
                    </button>
                  </label>
                  <input type={showPw?'text':'password'} style={FI} value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Leave blank to keep current" onFocus={foc} onBlur={blr}/>
                </div>
                <div style={{ gridColumn:'1/-1' }}><label style={LB}>Notes (internal)</label><textarea style={{ ...FI, minHeight:52, resize:'vertical' }} value={local.notes||''} onChange={e=>set('notes',e.target.value)} onFocus={foc} onBlur={blr}/></div>
              </div>
              {/* Permissions */}
              <div style={{ marginBottom:'14px' }}>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>Portal Permissions</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  {[['addTasks','Can add tasks'],['editTasks','Can edit tasks'],['uploadFiles','Can upload files'],['comment','Can comment']].map(([k,label])=>(
                    <label key={k} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-surface)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', cursor:'pointer' }}>
                      <input type="checkbox" checked={!!(local.permissions?.[k])} onChange={e=>setPerms(k,e.target.checked)} style={{ accentColor:'var(--accent)', width:14, height:14 }}/>
                      <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-1)' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Active toggle */}
              <label style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px', cursor:'pointer' }}>
                <input type="checkbox" checked={local.active!==false} onChange={e=>set('active',e.target.checked)} style={{ accentColor:'var(--accent)', width:14, height:14 }}/>
                <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)' }}>Account Active (uncheck to suspend)</span>
              </label>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 18px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
                  <Save size={12}/>{saving?'Saving…':'Save Client'}
                </button>
                <button onClick={()=>setEditMode(false)} style={{ padding:'8px 14px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display:'flex', gap:'0', borderBottom:'1px solid var(--border-1)' }}>
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={()=>setTab(id)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 18px', background:'none', border:'none', borderBottom: tab===id?'2px solid var(--accent)':'2px solid transparent', color: tab===id?'var(--accent)':'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', fontWeight: tab===id?700:400, cursor:'pointer', transition:'all 0.15s', marginBottom:'-1px' }}>
                <Icon size={13}/>{label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding:'16px 18px' }}>
            {tab === 'projects'  && <ProjectsPanel  client={client}/>}
            {tab === 'invoices'  && <InvoicesPanel  client={client}/>}
            {tab === 'messages'  && <MessagesPanel  client={client}/>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ADD CLIENT FORM
══════════════════════════════════════════════════════ */
function AddClientForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name:'', username:'', email:'', password:'', company:'', phone:'', country:'', notes:'', active:true, permissions:{ addTasks:false, editTasks:false, uploadFiles:false, comment:false } });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setPerms = (k,v) => setForm(f=>({...f,permissions:{...f.permissions,[k]:v}}));

  const handleSave = async () => {
    if (!form.name.trim())     { toast.error('Name required'); return; }
    if (!form.username.trim()) { toast.error('Username required'); return; }
    if (!form.email.trim())    { toast.error('Email required'); return; }
    if (!form.password.trim()) { toast.error('Password required'); return; }
    setSaving(true);
    try {
      const passwordHash = await hashPassword(form.password.trim());
      await onAdd({ ...form, username: form.username.toLowerCase(), email: form.email.toLowerCase(), passwordHash, passwordPlain: form.password.trim() });
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-lg)', padding:'20px', marginBottom:'16px' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em', marginBottom:'16px' }}>New Client</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
        <div><label style={LB}>Full Name *</label><input style={FI} value={form.name} onChange={e=>set('name',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Username * (for login)</label><input style={FI} value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/\s/g,''))} placeholder="johndoe" onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Email *</label><input style={FI} value={form.email} onChange={e=>set('email',e.target.value.toLowerCase())} onFocus={foc} onBlur={blr}/></div>
        <div>
          <label style={LB}>Password *</label>
          <div style={{ position:'relative' }}>
            <input type={showPw?'text':'password'} style={{ ...FI, paddingRight:'36px' }} value={form.password} onChange={e=>set('password',e.target.value)} onFocus={foc} onBlur={blr}/>
            <button onClick={()=>setShowPw(x=>!x)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', padding:'2px' }}>
              {showPw?<EyeOff size={13}/>:<Eye size={13}/>}
            </button>
          </div>
        </div>
        <div><label style={LB}>Company</label><input style={FI} value={form.company} onChange={e=>set('company',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Country</label><input style={FI} value={form.country} onChange={e=>set('country',e.target.value)} onFocus={foc} onBlur={blr}/></div>
      </div>
      {/* Permissions */}
      <div style={{ marginBottom:'14px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>Portal Permissions</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          {[['addTasks','Can add tasks'],['editTasks','Can edit tasks'],['uploadFiles','Can upload files'],['comment','Can comment']].map(([k,label])=>(
            <label key={k} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', cursor:'pointer' }}>
              <input type="checkbox" checked={!!form.permissions[k]} onChange={e=>setPerms(k,e.target.checked)} style={{ accentColor:'var(--accent)', width:14, height:14 }}/>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-1)' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'9px 20px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={13}/>{saving?'Creating…':'Create Client'}
        </button>
        <button onClick={onCancel} style={{ padding:'9px 16px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', cursor:'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN CRM PAGE
══════════════════════════════════════════════════════ */
export default function AdminCRMPage() {
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    getClients().then(c => { setClients(c); setLoading(false); });
  }, []);

  const handleAdd = async (data) => {
    const id = await addClient(data);
    setClients(c => [{ id, ...data }, ...c]);
    setAdding(false);
    toast.success(`Client "${data.name}" created`);
  };

  const handleUpdate = async (id, data) => {
    await updateClient(id, data);
    setClients(c => c.map(x => x.id===id ? { ...x, ...data } : x));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await deleteClient(id);
    setClients(c => c.filter(x => x.id!==id));
    toast.success('Client deleted');
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.username?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Client CRM</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', marginTop:'2px' }}>{clients.length} client{clients.length!==1?'s':''} · Portal at shakilxvs.com/portal</div>
        </div>
        <button onClick={()=>setAdding(a=>!a)} style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}>
          <Plus size={15}/> Add Client
        </button>
      </div>

      {/* Add form */}
      {adding && <AddClientForm onAdd={handleAdd} onCancel={()=>setAdding(false)}/>}

      {/* Search */}
      {clients.length > 0 && (
        <div style={{ position:'relative', marginBottom:'16px' }}>
          <input style={{ ...FI, paddingLeft:'36px' }} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients by name, username, email, company…" onFocus={foc} onBlur={blr}/>
          <svg style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          {search && <button onClick={()=>setSearch('')} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', padding:'2px' }}><X size={13}/></button>}
        </div>
      )}

      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[0,1,2].map(i=>(
            <div key={i} style={{ height:64, background:'var(--bg-surface)', borderRadius:'var(--radius-lg)' }} className="skeleton"/>
          ))}
        </div>
      )}

      {!loading && clients.length === 0 && !adding && (
        <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          <User size={40} style={{ margin:'0 auto 12px', color:'var(--border-2)' }} strokeWidth={1}/>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', marginBottom:'8px', color:'var(--text-2)' }}>No Clients Yet</div>
          <div style={{ fontSize:'0.875rem' }}>Click "Add Client" to create your first client account.</div>
        </div>
      )}

      {!loading && search && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>No clients match "{search}"</div>
      )}

      {filtered.map(client => (
        <ClientCard key={client.id} client={client}
          onUpdate={data => handleUpdate(client.id, data)}
          onDelete={() => handleDelete(client.id)}
        />
      ))}
    </div>
  );
}
