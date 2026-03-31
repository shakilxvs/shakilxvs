'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import emailjs from 'emailjs-com';
import {
  getClientByUsername, updateClient,
  getClientProjects, addPortalProject, updatePortalProject, deletePortalProject,
  getProjectTasks, addTask, updateTask, deleteTask,
  getClientInvoices, addInvoice, updateInvoice, deleteInvoice,
  getPortalMessages, sendPortalMessage,
  getProjectFiles, addPortalFile, deletePortalFile,
} from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  ChevronLeft, Plus, Trash2, Save, ChevronDown, ChevronUp,
  Briefcase, CreditCard, MessageSquare, X, Upload, Download,
  Clock, FileText, Send, Eye, EyeOff, Mail, CheckCircle, TrendingUp,
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

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/* ══════════════════════════════════════════════════════
   PROJECTS PANEL
══════════════════════════════════════════════════════ */
function ProjectsPanel({ client, emailNotify }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [newP,     setNewP]     = useState({ title:'', description:'', status:'Planning', deadline:'', budget:'' });
  const [saving,   setSaving]   = useState(false);
  const [open,     setOpen]     = useState(null);

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
      const prevProject = projects.find(p=>p.id===id);
      setProjects(p => p.map(x => x.id===id ? {...x,...data} : x));
      toast.success('Saved');
      // Email client when project marked Completed (if notify enabled)
      if (data.status === 'Completed' && prevProject?.status !== 'Completed' && emailNotify && client?.email) {
        sendStatusEmail({
          toEmail: client.email,
          toName:  client.name,
          subject: `Project completed: ${data.title || prevProject?.title}`,
          message: `Your project "${data.title || prevProject?.title}" has been marked as completed!\n\nThank you for working with us. Log in to your portal to download any final files or invoices: https://shakilxvs.com/portal`,
        });
      }
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
          emailNotify={emailNotify}
          client={client}
          projects={projects}
        />
      ))}
    </div>
  );
}

function ProjectRow({ project, open, onToggle, onUpdate, onDelete, emailNotify, client, projects }) {
  const [local,        setLocal]        = useState({ ...project });
  const [dirty,        setDirty]        = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [tasks,        setTasks]        = useState([]);
  const [files,        setFiles]        = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask,   setAddingTask]   = useState(false);
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
      // Email client when task is marked Done (if email notify enabled)
      if (status === 'Done' && emailNotify && client?.email) {
        const taskObj = tasks.find(t=>t.id===taskId);
        if (taskObj) {
          sendStatusEmail({
            toEmail: client.email,
            toName:  client.name,
            subject: `Task completed: ${taskObj.title}`,
            message: `Good news! The task "${taskObj.title}" on your project has been completed.\n\nLog in to your portal to see the latest progress: https://shakilxvs.com/portal`,
          });
        }
      }
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

      {open && (
        <div style={{ padding:'0 16px 20px', borderTop:'1px solid var(--border-1)' }}>
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
      <div style={{ maxHeight:400, overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px', paddingRight:'4px' }}>
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
   EDIT CLIENT PANEL
══════════════════════════════════════════════════════ */
function EditClientPanel({ client, onSave }) {
  const [local,  setLocal]  = useState({ ...client });
  const [showPw, setShowPw] = useState(false);
  const [newPw,  setNewPw]  = useState('');
  const [saving, setSaving] = useState(false);

  const set     = (k,v) => setLocal(l=>({...l,[k]:v}));
  const setPerms= (k,v) => setLocal(l=>({...l,permissions:{...(l.permissions||{}),[k]:v}}));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...local };
      if (newPw.trim()) {
        data.passwordHash  = await hashPassword(newPw.trim());
        data.passwordPlain = newPw.trim();
      }
      await onSave(data);
      setNewPw('');
      toast.success('Client saved');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'24px', marginBottom:'24px' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'0.05em', marginBottom:'18px' }}>Client Details</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
        <div><label style={LB}>Full Name</label><input style={FI} value={local.name||''} onChange={e=>set('name',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Username (login)</label><input style={FI} value={local.username||''} onChange={e=>set('username',e.target.value.toLowerCase().replace(/\s/g,''))} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Email</label><input style={FI} value={local.email||''} onChange={e=>set('email',e.target.value.toLowerCase())} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Company</label><input style={FI} value={local.company||''} onChange={e=>set('company',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Phone</label><input style={FI} value={local.phone||''} onChange={e=>set('phone',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div style={{ gridColumn:'1/-1' }}><label style={LB}>Address</label><input style={FI} value={local.address||''} onChange={e=>set('address',e.target.value)} placeholder="Street address" onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>City</label><input style={FI} value={local.city||''} onChange={e=>set('city',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>State / Province</label><input style={FI} value={local.state||''} onChange={e=>set('state',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Postal / ZIP Code</label><input style={FI} value={local.zip||''} onChange={e=>set('zip',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div><label style={LB}>Country</label><input style={FI} value={local.country||''} onChange={e=>set('country',e.target.value)} onFocus={foc} onBlur={blr}/></div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={LB}>
            New Password {client.passwordPlain && <span style={{ color:'var(--text-3)', textTransform:'none', letterSpacing:0 }}>— current: <span style={{ color:'var(--accent)' }}>{showPw?client.passwordPlain:'••••••••'}</span></span>}
            <button onClick={()=>setShowPw(x=>!x)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', marginLeft:'6px', padding:0, verticalAlign:'middle' }}>
              {showPw?<EyeOff size={11}/>:<Eye size={11}/>}
            </button>
          </label>
          <input type={showPw?'text':'password'} style={FI} value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Leave blank to keep current" onFocus={foc} onBlur={blr}/>
        </div>
        <div style={{ gridColumn:'1/-1' }}><label style={LB}>Notes (internal)</label><textarea style={{ ...FI, minHeight:52, resize:'vertical' }} value={local.notes||''} onChange={e=>set('notes',e.target.value)} onFocus={foc} onBlur={blr}/></div>
      </div>
      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>Portal Permissions</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          {[['addTasks','Can add tasks'],['editTasks','Can edit tasks'],['uploadFiles','Can upload files'],['comment','Can comment']].map(([k,label])=>(
            <label key={k} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', cursor:'pointer' }}>
              <input type="checkbox" checked={!!(local.permissions?.[k])} onChange={e=>setPerms(k,e.target.checked)} style={{ accentColor:'var(--accent)', width:14, height:14 }}/>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-1)' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <label style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', cursor:'pointer' }}>
        <input type="checkbox" checked={local.active!==false} onChange={e=>set('active',e.target.checked)} style={{ accentColor:'var(--accent)', width:14, height:14 }}/>
        <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)' }}>Account Active (uncheck to suspend)</span>
      </label>
      <label style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', cursor:'pointer' }}>
        <input type="checkbox" checked={!!(local.emailNotify)} onChange={e=>set('emailNotify',e.target.checked)} style={{ accentColor:'var(--accent)', width:14, height:14 }}/>
        <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)' }}>
          Email Notifications — notify client when tasks or project status change
        </span>
      </label>
      <button onClick={handleSave} disabled={saving} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 20px', background:saving?'var(--bg-elevated)':'var(--accent)', color:saving?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', cursor:saving?'not-allowed':'pointer' }}>
        <Save size={13}/>{saving?'Saving…':'Save Changes'}
      </button>
    </div>
  );
}


/* ─── Email notification helper ────────────────────────── */
async function sendStatusEmail({ toEmail, toName, subject, message }) {
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      {
        subject,
        from_name:  'Shakil',
        to_name:    toName,
        to_email:   toEmail,
        email:      toEmail,
        message,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
    return true;
  } catch (e) {
    console.error('sendStatusEmail:', e);
    return false;
  }
}

/* ══════════════════════════════════════════════════════
   TIMELINE PANEL
══════════════════════════════════════════════════════ */
function TimelinePanel({ client }) {
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getClientProjects(client.id).then(async projs => {
      setProjects(projs);
      // Load tasks for each project
      const taskMap = {};
      await Promise.all(projs.map(async p => {
        const t = await getProjectTasks(p.id);
        taskMap[p.id] = t;
      }));
      setTasks(taskMap);
      setLoading(false);
    });
  }, [client.id]);

  if (loading) return <div style={{ padding:'20px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>Loading timeline…</div>;

  if (projects.length === 0) return (
    <div style={{ textAlign:'center', padding:'40px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-lg)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>
      No projects yet. Add a project to see the timeline.
    </div>
  );

  const STATUS_COLOR = {
    'Planning':    '#f5c518',
    'In Progress': '#5c8dff',
    'Review':      '#a78bfa',
    'Completed':   '#34d399',
    'Cancelled':   '#ff6b35',
  };

  return (
    <div>
      {projects.map(project => {
        const projectTasks = tasks[project.id] || [];
        const done = projectTasks.filter(t=>t.status==='Done').length;
        const progress = projectTasks.length > 0 ? Math.round((done/projectTasks.length)*100) : 0;
        const color = STATUS_COLOR[project.status] || 'var(--accent)';

        return (
          <div key={project.id} style={{ marginBottom:'24px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            {/* Project header bar */}
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', gap:'12px', background:'var(--bg-elevated)', flexWrap:'wrap' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>{project.title}</div>
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'2px' }}>
                  {project.status}{project.deadline?` · Due ${project.deadline}`:''}
                  {project.budget?` · $${project.budget}`:''}
                </div>
              </div>
              {projectTasks.length > 0 && (
                <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color, flexShrink:0 }}>
                  {done}/{projectTasks.length} tasks · {progress}%
                </div>
              )}
            </div>

            {/* Progress bar */}
            {projectTasks.length > 0 && (
              <div style={{ height:4, background:'var(--border-2)' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:color, transition:'width 0.8s ease' }}/>
              </div>
            )}

            {/* Task list */}
            <div style={{ padding:'12px 18px' }}>
              {projectTasks.length === 0 && (
                <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', padding:'8px 0' }}>No tasks yet.</div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {projectTasks.map((task, i) => (
                  <div key={task.id} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    {/* Timeline dot + line */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:16 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background: task.status==='Done'?'#34d399':task.status==='In Progress'?'#5c8dff':'var(--border-3)', border:`2px solid ${task.status==='Done'?'#34d399':task.status==='In Progress'?'#5c8dff':'var(--border-3)'}`, flexShrink:0 }}/>
                      {i < projectTasks.length-1 && <div style={{ width:2, flex:1, minHeight:12, background:'var(--border-2)', marginTop:'2px' }}/>}
                    </div>
                    <div style={{ flex:1, padding:'6px 0' }}>
                      <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color: task.status==='Done'?'var(--text-3)':'var(--text-1)', textDecoration: task.status==='Done'?'line-through':'none' }}>
                        {task.title}
                      </div>
                      {task.status !== 'Todo' && (
                        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color: task.status==='Done'?'#34d399':'#5c8dff', marginTop:'1px' }}>{task.status}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN — CLIENT PAGE
══════════════════════════════════════════════════════ */
export default function AdminClientPage() {
  const { username } = useParams();
  const router = useRouter();
  const [client,  setClient]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('projects');

  useEffect(() => {
    if (!username) return;
    getClientByUsername(username).then(c => {
      if (!c) {
        toast.error('Client not found');
        router.replace('/admin/crm');
        return;
      }
      setClient(c);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load client');
      router.replace('/admin/crm');
    });
  }, [username, router]);

  const handleSave = async (data) => {
    await updateClient(client.id, data);
    setClient(c => ({ ...c, ...data }));
  };

  const TABS = [
    { id:'projects',  label:'Projects',  Icon:Briefcase     },
    { id:'invoices',  label:'Invoices',  Icon:CreditCard    },
    { id:'messages',  label:'Messages',  Icon:MessageSquare },
    { id:'timeline',  label:'Timeline',  Icon:TrendingUp    },
    { id:'edit',      label:'Edit',      Icon:Save          },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth:900 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
          <div style={{ height:16, width:200, borderRadius:4 }} className="skeleton"/>
        </div>
        <div style={{ height:100, borderRadius:'var(--radius-lg)' }} className="skeleton"/>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div style={{ maxWidth:900 }}>
      {/* Back + client header */}
      <div style={{ marginBottom:'24px' }}>
        <Link href="/admin/crm" style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'14px', transition:'color 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--accent)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>
          <ChevronLeft size={13}/> All Clients
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--accent-muted)', border:'2px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.4rem', color:'var(--accent)' }}>{(client.name||'?')[0].toUpperCase()}</span>
          </div>
          <div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.2rem', color:'var(--text-1)' }}>{client.name}</div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', marginTop:'2px' }}>
              @{client.username}
              {client.company && ` · ${client.company}`}
              {client.email && ` · ${client.email}`}
            </div>
          </div>
          {client.active === false && (
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--fire)', padding:'3px 10px', border:'1px solid rgba(255,69,0,0.3)', borderRadius:100 }}>Suspended</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border-1)', marginBottom:'20px' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={()=>setTab(id)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 20px', background:'none', border:'none', borderBottom: tab===id?'2px solid var(--accent)':'2px solid transparent', color: tab===id?'var(--accent)':'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', fontWeight: tab===id?700:400, cursor:'pointer', transition:'all 0.15s', marginBottom:'-1px' }}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'projects' && <ProjectsPanel client={client} emailNotify={client.emailNotify}/>}
      {tab === 'invoices' && <InvoicesPanel client={client}/>}
      {tab === 'messages' && <MessagesPanel client={client}/>}
      {tab === 'timeline' && <TimelinePanel client={client}/>}
      {tab === 'edit'     && <EditClientPanel client={client} onSave={handleSave}/>}
    </div>
  );
}
