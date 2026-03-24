'use client';
import { useState, useEffect, useRef } from 'react';
import { getCollection, addDocument, deleteDocument } from '@/lib/firestore';
import { Copy, Trash2, Upload, Check, Film, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

async function uploadFile(file, onProgress) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio_uploads';

  const isImage = file.type?.startsWith('image/');
  const isVideo = file.type?.startsWith('video/');
  const resourceType = isImage ? 'image' : isVideo ? 'video' : 'raw';
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  formData.append('folder', 'portfolio/media');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round((e.loaded/e.total)*90)); };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        onProgress(100);
        resolve({ url: data.secure_url, type: resourceType });
      } else {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

function MediaItem({ item, onDelete }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(item.url); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const isImage = item.type === 'image';
  const isVideo = item.type === 'video';
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'border-color 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}
    >
      <div style={{ aspectRatio:'16/9', background:'var(--bg-elevated)', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {isImage
          ? <img src={item.url} alt={item.fileName||'media'} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
          : isVideo
            ? <video src={item.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted/>
            : <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
                <FileText size={28} color="var(--text-3)"/>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', textTransform:'uppercase' }}>{item.fileName?.split('.').pop()||'file'}</span>
              </div>
        }
        <div style={{ position:'absolute', top:8, left:8 }}>
          <span style={{ padding:'2px 7px', background:'rgba(0,0,0,0.7)', borderRadius:4, fontFamily:'Space Mono,monospace', fontSize:'0.53rem', color:'#fff', textTransform:'uppercase' }}>
            {item.type}
          </span>
        </div>
      </div>
      <div style={{ padding:'10px 12px' }}>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'8px' }}>
          {item.fileName||item.url.split('/').pop()}
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          <button onClick={copy} style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'7px', background:copied?'rgba(35,77,194,0.1)':'var(--bg-elevated)', border:copied?'1px solid var(--accent-border)':'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:copied?'var(--accent)':'var(--text-2)', fontFamily:'Space Mono,monospace', fontSize:'0.58rem', cursor:'pointer' }}>
            {copied?<Check size={11}/>:<Copy size={11}/>} {copied?'Copied':'Copy URL'}
          </button>
          <button onClick={()=>onDelete(item.id)} style={{ padding:'7px 10px', background:'none', border:'1px solid var(--border-2)', borderRadius:'var(--radius-sm)', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center' }}>
            <Trash2 size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMediaPage() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [dragging, setDragging] = useState(false);
  const [uploads,  setUploads]  = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    getCollection('mediaLibrary', 'uploadedAt')
      .then(data => { setItems(data.reverse()); setLoading(false); })
      .catch(()   => setLoading(false));
  }, []);

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.size < 100*1024*1024); // 100MB max
    if (!arr.length) return;

    const slots = arr.map(f => ({ name:f.name, progress:0, done:false, error:'' }));
    setUploads(prev => [...slots, ...prev]);

    for (let i=0; i<arr.length; i++) {
      const file = arr[i];
      try {
        const { url, type } = await uploadFile(file, pct => {
          setUploads(prev => prev.map((u,idx) => idx===i ? {...u,progress:pct} : u));
        });
        const id = await addDocument('mediaLibrary', { url, type, fileName:file.name, uploadedAt:new Date().toISOString() });
        setItems(prev => [{ id, url, type, fileName:file.name }, ...prev]);
        setUploads(prev => prev.map((u,idx) => idx===i ? {...u,progress:100,done:true} : u));
        toast.success(`Uploaded: ${file.name}`);
      } catch (err) {
        setUploads(prev => prev.map((u,idx) => idx===i ? {...u,error:'Failed',done:true} : u));
        toast.error(`Failed: ${file.name}`);
      }
    }
    setTimeout(() => setUploads([]), 4000);
  };

  const handleDrop = e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  const handleDelete = async (id) => {
    if (!confirm('Remove from library?')) return;
    try {
      await deleteDocument('mediaLibrary', id);
      setItems(prev => prev.filter(x => x.id !== id));
      toast.success('Removed');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ maxWidth:1000 }}>
      {/* Drop zone */}
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop}
        onClick={()=>inputRef.current?.click()}
        style={{ border:`2px dashed ${dragging?'var(--accent)':'var(--border-2)'}`, borderRadius:'var(--radius-xl)', padding:'48px 24px', textAlign:'center', cursor:'pointer', background:dragging?'var(--accent-muted)':'var(--bg-surface)', transition:'all 0.2s', marginBottom:'20px' }}
      >
        <div style={{ width:48,height:48,borderRadius:'50%',background:'var(--bg-elevated)',border:'1px solid var(--border-2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
          <Upload size={22} color="var(--text-2)"/>
        </div>
        <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--text-1)', marginBottom:'6px' }}>
          Drop files here or click to upload
        </div>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', letterSpacing:'0.06em' }}>
          Images · Videos · PDF · ZIP · DOC · XLS · PPT — up to 100MB each
        </div>
        <input
          ref={inputRef} type="file" multiple
          accept="image/*,video/*,.pdf,.zip,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx"
          style={{ display:'none' }}
          onChange={e=>handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress bars */}
      {uploads.length>0 && (
        <div style={{ marginBottom:'20px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {uploads.map((u,i)=>(
            <div key={i} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', padding:'12px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:u.error?'var(--fire)':u.done?'var(--accent)':'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{u.name}</span>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{u.error||`${u.progress}%`}</span>
              </div>
              <div style={{ height:3, background:'var(--border-2)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${u.progress}%`, background:u.error?'var(--fire)':'var(--accent)', borderRadius:2, transition:'width 0.3s' }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading
        ? <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }} className="media-grid">
            {Array.from({length:6}).map((_,i)=><div key={i} style={{ aspectRatio:'16/9', borderRadius:'var(--radius-lg)', background:'var(--bg-surface)' }} className="skeleton"/>)}
          </div>
        : items.length===0
          ? <div style={{ textAlign:'center', padding:'60px', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>No media yet. Upload your first file above.</div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }} className="media-grid">
              {items.map(item=><MediaItem key={item.id} item={item} onDelete={handleDelete}/>)}
            </div>
      }
      <style>{`@media(max-width:768px){.media-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:480px){.media-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
