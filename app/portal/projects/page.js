'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getClientProjects, getProjectTasks, getProjectFiles, addTask, updateTask, addPortalFile } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/utils';
import { ChevronDown, ChevronUp, Download, Upload, Plus, Check, Clock, AlertTriangle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Planning':    { bg:'rgba(245,197,24,0.12)',  color:'#f5c518', border:'rgba(245,197,24,0.3)'  },
  'In Progress': { bg:'rgba(35,77,194,0.12)',   color:'#5c8dff', border:'rgba(35,77,194,0.3)'  },
  'Review':      { bg:'rgba(124,58,237,0.12)',  color:'#a78bfa', border:'rgba(124,58,237,0.3)' },
  'Completed':   { bg:'rgba(16,185,129,0.12)',  color:'#34d399', border:'rgba(16,185,129,0.3)' },
  'Cancelled':   { bg:'rgba(255,69,0,0.1)',     color:'#ff6b35', border:'rgba(255,69,0,0.2)'   },
};
function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg:'var(--bg-elevated)', color:'var(--text-3)', border:'var(--border-2)' };
  return <span style={{ padding:'3px 10px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{status}</span>;
}

function ProjectCard({ project, perms }) {
  const [open,    setOpen]    = useState(false);
  const [tasks,   setTasks]   = useState([]);
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef(null);

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==='Done').length/tasks.length)*100) : 0;

  useEffect(() => {
    if (open && tasks.length === 0 && !loading) {
      setLoading(true);
      Promise.all([getProjectTasks(project.id), getProjectFiles(project.id)]).then(([t,f]) => {
        setTasks(t); setFiles(f); setLoading(false);
      });
    }
  }, [open, project.id]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const id = await addTask({ projectId: project.id, clientId: project.clientId, title: newTask.trim(), status:'Todo', assignedTo:'client' });
      setTasks(t => [...t, { id, title: newTask.trim(), status:'Todo', assignedTo:'client' }]);
      setNewTask(''); setAddingTask(false);
      toast.success('Task added');
    } catch { toast.error('Failed to add task'); }
  };

  const handleTaskDone = async (taskId, current) => {
    if (!perms.editTasks) return;
    const next = current === 'Done' ? 'Todo' : 'Done';
    try {
      await updateTask(taskId, { status: next });
      setTasks(t => t.map(x => x.id===taskId ? {...x,status:next} : x));
    } catch { toast.error('Failed'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'portal/files');
      const session = JSON.parse(localStorage.getItem('portal_session')||'{}');
      const id = await addPortalFile({ projectId: project.id, clientId: project.clientId, name: file.name, url, uploadedBy:'client', uploaderName: session.name||'Client' });
      setFiles(f => [...f, { id, name: file.name, url, uploadedBy:'client' }]);
      toast.success('File uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value=''; }
  };

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'14px', overflow:'hidden', transition:'border-color 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
      {/* Header */}
      <div onClick={()=>setOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px 20px', cursor:'pointer', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--text-1)' }}>{project.title}</span>
            <StatusBadge status={project.status}/>
          </div>
          {project.deadline && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', display:'flex', alignItems:'center', gap:'4px' }}><Clock size={10}/> Due {project.deadline}</div>}
        </div>
        {project.budget && <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--accent)', flexShrink:0 }}>${project.budget}</span>}
        <div style={{ color:'var(--text-3)', flexShrink:0 }}>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</div>
      </div>

      {/* Progress bar (visible always if tasks loaded) */}
      {tasks.length > 0 && (
        <div style={{ padding:'0 20px 12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)' }}>Progress</span>
            <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)' }}>{progress}%</span>
          </div>
          <div style={{ height:4, background:'var(--border-2)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:'var(--accent)', borderRadius:2, transition:'width 0.4s ease' }}/>
          </div>
        </div>
      )}

      {/* Expanded content */}
      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border-1)' }}>
          {project.description && (
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-2)', lineHeight:1.7, marginTop:'14px', marginBottom:'20px' }}>{project.description}</p>
          )}

          {loading && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', padding:'10px 0' }}>Loading tasks and files…</div>}

          {/* Tasks */}
          {!loading && (
            <div style={{ marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Tasks ({tasks.filter(t=>t.status==='Done').length}/{tasks.length})</span>
                {perms.addTasks && (
                  <button onClick={()=>setAddingTask(a=>!a)} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-sm)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer' }}>
                    <Plus size={11}/> Add Task
                  </button>
                )}
              </div>
              {addingTask && (
                <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                  <input style={{ flex:1, padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', outline:'none' }}
                    value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Task description…"
                    onKeyDown={e=>{ if(e.key==='Enter') handleAddTask(); if(e.key==='Escape') setAddingTask(false); }}
                    autoFocus/>
                  <button onClick={handleAddTask} style={{ padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>Add</button>
                  <button onClick={()=>setAddingTask(false)} style={{ padding:'8px 12px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>Cancel</button>
                </div>
              )}
              {tasks.length === 0 && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem' }}>No tasks yet.</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {tasks.map(task => (
                  <div key={task.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)' }}>
                    <button
                      onClick={()=>handleTaskDone(task.id, task.status)}
                      disabled={!perms.editTasks}
                      style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${task.status==='Done'?'var(--accent)':'var(--border-3)'}`, background:task.status==='Done'?'var(--accent)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:perms.editTasks?'pointer':'default', transition:'all 0.15s', outline:'none' }}>
                      {task.status==='Done' && <Check size={10} color="#fff" strokeWidth={3}/>}
                    </button>
                    <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color: task.status==='Done'?'var(--text-3)':'var(--text-1)', flex:1, textDecoration: task.status==='Done'?'line-through':'none' }}>{task.title}</span>
                    {task.assignedTo === 'client' && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.5rem', color:'var(--accent)', padding:'1px 6px', border:'1px solid var(--accent-border)', borderRadius:100 }}>you</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {!loading && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Files ({files.length})</span>
                {perms.uploadFiles && (
                  <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-sm)', color:'var(--accent)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer' }}>
                    <Upload size={11}/>{uploading?'Uploading…':'Upload File'}
                  </button>
                )}
                <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleUpload}/>
              </div>
              {files.length === 0 && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem' }}>No files yet.</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {files.map(file => (
                  <div key={file.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                    <FileText size={14} color="var(--accent)" style={{ flexShrink:0 }}/>
                    <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</span>
                    <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)', flexShrink:0 }}>{file.uploadedBy==='admin'?'from Shakil':'you'}</span>
                    <a href={file.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', fontWeight:700, textDecoration:'none', flexShrink:0 }}>
                      <Download size={11}/> Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PortalProjects() {
  const router = useRouter();
  const [client,   setClient]   = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('All');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      if (!raw) { router.replace('/portal/login'); return; }
      const session = JSON.parse(raw);
      setClient(session);
      getClientProjects(session.clientId).then(p => { setProjects(p); setLoading(false); });
    } catch { router.replace('/portal/login'); }
  }, [router]);

  const FILTERS = ['All','In Progress','Review','Completed'];
  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter);

  if (!client) return null;
  const perms = client.permissions || {};

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'6px' }}>Your Work</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2rem,5vw,3rem)', color:'var(--text-1)', letterSpacing:'0.02em' }}>Projects</h1>
      </div>

      {/* Filter pills */}
      {projects.length > 0 && (
        <div className="pill-bar" style={{ marginBottom:'20px' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={()=>setFilter(f)} className={`pill${filter===f?' active':''}`}>{f}</button>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {[0,1,2].map(i=><div key={i} style={{ height:80, background:'var(--bg-surface)', borderRadius:'var(--radius-lg)' }} className="skeleton"/>)}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:'8px' }}>No Projects Yet</div>
          <div style={{ fontSize:'0.875rem' }}>Projects will appear here once your work begins.</div>
        </div>
      )}

      {!loading && filtered.length === 0 && projects.length > 0 && (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem' }}>No {filter} projects.</div>
      )}

      {filtered.map(project => (
        <ProjectCard key={project.id} project={project} perms={perms}/>
      ))}
    </div>
  );
}

// Need React for useRef in nested component
