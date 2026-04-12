'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Upload, Download, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/lib/utils';
import { portalFetch } from '@/lib/portal-client';

const STATUS_COLORS = {
  'Planning':    { bg:'rgba(245,197,24,0.12)',  color:'#f5c518', border:'rgba(245,197,24,0.3)'  },
  'In Progress': { bg:'rgba(35,77,194,0.12)',   color:'#5c8dff', border:'rgba(35,77,194,0.3)'  },
  'Review':      { bg:'rgba(124,58,237,0.12)',  color:'#a78bfa', border:'rgba(124,58,237,0.3)' },
  'Completed':   { bg:'rgba(16,185,129,0.12)',  color:'#34d399', border:'rgba(16,185,129,0.3)' },
  'Cancelled':   { bg:'rgba(255,69,0,0.1)',     color:'#ff6b35', border:'rgba(255,69,0,0.2)'   },
  'Todo':        { bg:'rgba(255,255,255,0.05)', color:'var(--text-3)', border:'var(--border-2)' },
  'Done':        { bg:'rgba(16,185,129,0.12)',  color:'#34d399', border:'rgba(16,185,129,0.3)' },
};
function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS['Todo'];
  return <span style={{ padding:'2px 8px', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.55rem', background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{status}</span>;
}

function ProjectRow({ project, perms, open, onToggle }) {
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open && tasks.length === 0 && files.length === 0) {
      setLoadingDetails(true);
      Promise.all([
        portalFetch(`/api/portal/projects/${project.id}/tasks`),
        portalFetch(`/api/portal/projects/${project.id}/files`),
      ]).then(([t, f]) => {
        setTasks(t.ok ? t.data : []);
        setFiles(f.ok ? f.data : []);
        setLoadingDetails(false);
      });
    }
  }, [open, project.id]);

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const res = await portalFetch(`/api/portal/projects/${project.id}/tasks`, {
      method: 'POST', body: JSON.stringify({ title }),
    });
    if (!res.ok) { toast.error(res.error || 'Failed'); return; }
    setTasks(t => [...t, res.data]);
    setNewTaskTitle(''); setAddingTask(false);
    toast.success('Task added');
  };

  const handleTaskStatus = async (taskId, status) => {
    const res = await portalFetch(`/api/portal/projects/${project.id}/tasks`, {
      method: 'PATCH', body: JSON.stringify({ taskId, status }),
    });
    if (!res.ok) { toast.error(res.error || 'Failed'); return; }
    setTasks(t => t.map(x => x.id === taskId ? { ...x, status } : x));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, `portal/${project.id}`);
      const res = await portalFetch(`/api/portal/projects/${project.id}/files`, {
        method: 'POST', body: JSON.stringify({ name: file.name, url, size: file.size }),
      });
      if (!res.ok) { toast.error(res.error || 'Upload failed'); return; }
      setFiles(f => [res.data, ...f]);
      toast.success('File uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==='Done').length / tasks.length) * 100) : 0;

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', marginBottom:'10px' }}>
      <div onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 18px', cursor:'pointer', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--text-1)', fontSize:'0.95rem' }}>{project.title}</span>
            <StatusBadge status={project.status}/>
          </div>
          {project.deadline && <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', marginTop:'3px' }}>Due: {project.deadline}</div>}
        </div>
        {project.budget && <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.2rem', color:'var(--accent)', flexShrink:0 }}>${project.budget}</span>}
        <div style={{ color:'var(--text-3)', flexShrink:0 }}>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</div>
      </div>

      {open && (
        <div style={{ padding:'0 18px 20px', borderTop:'1px solid var(--border-1)' }}>
          {project.description && (
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.6, paddingTop:'14px', marginBottom:'14px' }}>{project.description}</p>
          )}
          {tasks.length > 0 && (
            <div style={{ marginBottom:'18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--text-3)', textTransform:'uppercase' }}>Progress</span>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.55rem', color:'var(--accent)' }}>{progress}%</span>
              </div>
              <div style={{ height:4, background:'var(--border-2)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'var(--accent)', borderRadius:2, transition:'width 0.4s ease' }}/>
              </div>
            </div>
          )}

          <div style={{ marginBottom:'18px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Tasks ({tasks.length})</span>
              {perms.addTasks && (
                <button onClick={()=>setAddingTask(a=>!a)} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer' }}>
                  <Plus size={11}/> Add Task
                </button>
              )}
            </div>
            {addingTask && (
              <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                <input style={{ flex:1, padding:'7px 10px', background:'var(--bg-void)', border:'1px solid var(--accent-border)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', outline:'none' }}
                  value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} placeholder="Task title…" autoFocus
                  onKeyDown={e=>{ if(e.key==='Enter') handleAddTask(); if(e.key==='Escape'){ setAddingTask(false); setNewTaskTitle(''); } }}/>
                <button onClick={handleAddTask} style={{ padding:'7px 12px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.78rem', cursor:'pointer' }}>Add</button>
                <button onClick={()=>{ setAddingTask(false); setNewTaskTitle(''); }} style={{ padding:'7px 10px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.78rem', cursor:'pointer' }}>Cancel</button>
              </div>
            )}
            {loadingDetails && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>Loading…</div>}
            {!loadingDetails && tasks.length === 0 && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>No tasks yet.</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                  {perms.editTasks
                    ? <select value={task.status} onChange={e=>handleTaskStatus(task.id, e.target.value)} style={{ padding:'2px 6px', background:'var(--bg-void)', border:'1px solid var(--border-2)', borderRadius:4, color:'var(--text-2)', fontFamily:'Space Mono,monospace', fontSize:'0.55rem', cursor:'pointer' }}>
                        {['Todo','In Progress','Done'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    : <StatusBadge status={task.status}/>}
                  <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color: task.status==='Done'?'var(--text-3)':'var(--text-1)', flex:1, textDecoration: task.status==='Done'?'line-through':'none' }}>{task.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Files ({files.length})</span>
              {perms.uploadFiles && (
                <>
                  <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-2)', fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', cursor:'pointer' }}>
                    {uploading?<Clock size={11}/>:<Upload size={11}/>} {uploading?'Uploading…':'Upload File'}
                  </button>
                  <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleUpload}/>
                </>
              )}
            </div>
            {!loadingDetails && files.length === 0 && !uploading && <div style={{ color:'var(--text-3)', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem' }}>No files yet.</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {files.map(file => (
                <div key={file.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                  <FileText size={13} color="var(--accent)"/>
                  <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-1)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</span>
                  <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'var(--text-3)' }}>{file.uploadedBy}</span>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)', display:'flex', alignItems:'center' }}><Download size={13}/></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [perms,    setPerms]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [openId,   setOpenId]   = useState(null);

  useEffect(() => {
    Promise.all([
      portalFetch('/api/portal/projects'),
      portalFetch('/api/portal/account'),
    ]).then(([p, a]) => {
      setProjects(p.ok ? p.data : []);
      setPerms((a.ok && a.data.permissions) || {});
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>{[0,1,2].map(i=><div key={i} className="skeleton" style={{ height:64, borderRadius:'var(--radius-lg)' }}/>)}</div>;
  }

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em' }}>Your Work</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', color:'var(--text-1)', letterSpacing:'0.03em', lineHeight:1, marginTop:'4px' }}>Projects ({projects.length})</h1>
      </div>
      {projects.length === 0
        ? <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No projects yet.</div>
        : projects.map(p => (
            <ProjectRow key={p.id} project={p} perms={perms} open={openId===p.id} onToggle={()=>setOpenId(openId===p.id?null:p.id)}/>
          ))}
    </div>
  );
}
