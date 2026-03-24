'use client';
import { useState, useEffect } from 'react';
import { getFiles, incrementFileDownload , trackPageView } from '@/lib/firestore';
import { getFileTypeBadgeClass } from '@/lib/utils';
import { Download, FileX, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFiles().then(data => { setFiles(data.filter(f => f.active !== false)); setLoading(false); });
  }, []);

  useEffect(() => { trackPageView('files'); }, []);

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ marginBottom:'40px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Downloads</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'14px' }}>
            Files &amp; Resources
          </h1>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.95rem', color:'var(--text-2)', maxWidth:'520px', lineHeight:1.7 }}>
            Free templates, guides, and premium resources to help you grow your business.
          </p>
        </div>

        <div style={{ border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding:'14px 18px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:36, height:18, borderRadius:100 }} className="skeleton" />
                <div style={{ flex:1, height:14, borderRadius:4 }} className="skeleton" />
                <div style={{ width:40, height:18, borderRadius:4 }} className="skeleton" />
                <div style={{ width:80, height:30, borderRadius:6 }} className="skeleton" />
              </div>
            ))
          ) : files.length === 0 ? (
            <div style={{ padding:'80px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
              <FileX size={36} style={{ color:'var(--text-3)' }} strokeWidth={1} />
              <div style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-3)', fontSize:'0.9rem' }}>No files yet.</div>
            </div>
          ) : (
            files.map((file, i) => {
              const isFree   = !file.price || file.price === '' || file.price === '0';
              const badgeCls = getFileTypeBadgeClass(file.type);
              const isLast   = i === files.length - 1;

              return (
                <div key={file.id}
                  style={{
                    /* 
                      Layout:
                       [badge]  [filename — takes all remaining space]  [price]  [button]
                       All in one row, nothing wraps, filename truncates if needed
                    */
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-1)',
                    transition: 'background 0.15s ease',
                    minWidth: 0,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-surface)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  {/* Col 1: type badge — very small, fixed, no flex grow */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontFamily: 'Space Mono,monospace',
                    fontSize: '0.52rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-2)',
                    color: 'var(--text-3)',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    {file.type || 'FILE'}
                  </span>

                  {/* Col 2: filename + description — takes all space, truncates */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {file.name}
                      {file.version && (
                        <span style={{ marginLeft: '6px', fontFamily: 'Space Mono,monospace', fontSize: '0.55rem', color: 'var(--text-3)', fontWeight: 400 }}>
                          {file.version}
                        </span>
                      )}
                    </div>
                    {file.description && (
                      <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.75rem', color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {file.description}
                      </div>
                    )}
                  </div>

                  {/* Col 3: price — small, fixed */}
                  <div style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem',
                    color: isFree ? 'var(--accent)' : 'var(--text-1)',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {isFree ? 'Free' : `$${file.price}`}
                  </div>

                  {/* Col 4: download button — small */}
                  <a href={file.link} target="_blank" rel="noopener noreferrer" onClick={()=>incrementFileDownload(file.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '7px 14px',
                      background: 'var(--accent)', color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.75rem',
                      textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                  >
                    <Download size={11}/> Download
                  </a>
                </div>
              );
            })
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop:'40px', textAlign:'center', padding:'36px 24px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)' }}>
          <div className="section-label" style={{ marginBottom:'10px', justifyContent:'center', display:'flex' }}>Need Something Custom?</div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', marginBottom:'8px' }}>Let&apos;s Build It Together</div>
          <p style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-2)', fontSize:'0.875rem', marginBottom:'20px' }}>Need a custom template, audit, or solution? I can create it for you.</p>
          <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'11px 24px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.875rem', textDecoration:'none' }}>
            Request a Quote <ArrowRight size={15}/>
          </Link>
        </div>
      </div>
    </div>
  );
}
