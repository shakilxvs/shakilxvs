'use client';
import { useState, useEffect } from 'react';
import { getFiles } from '@/lib/firestore';
import { getFileTypeBadgeClass } from '@/lib/utils';
import { Download, FileX, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFiles().then(data => {
      setFiles(data.filter(f => f.active !== false));
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ marginBottom:'48px' }}>
          <div className="section-label" style={{ marginBottom:'12px' }}>Downloads</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,6vw,5rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'16px' }}>
            Files &amp; Resources
          </h1>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1rem', color:'var(--text-2)', maxWidth:'520px', lineHeight:1.7 }}>
            Free templates, guides, and premium resources to help you grow your business.
          </p>
        </div>

        <div style={{ border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding:'20px 24px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:48, height:22, borderRadius:100 }} className="skeleton" />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'8px' }}>
                  <div style={{ height:16, width:'40%', borderRadius:4 }} className="skeleton" />
                  <div style={{ height:12, width:'70%', borderRadius:4 }} className="skeleton" />
                </div>
                <div style={{ width:100, height:36, borderRadius:8 }} className="skeleton" />
              </div>
            ))
          ) : files.length === 0 ? (
            <div style={{ padding:'80px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
              <FileX size={40} style={{ color:'var(--text-3)' }} strokeWidth={1} />
              <div style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-3)' }}>No files available yet.</div>
            </div>
          ) : (
            files.map((file, i) => {
              const isFree   = !file.price || file.price === '' || file.price === '0';
              const badgeCls = getFileTypeBadgeClass(file.type);
              const isLast   = i === files.length - 1;

              return (
                <div key={file.id}
                  style={{
                    padding:'16px 20px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-1)',
                    transition:'background 0.15s ease',
                    display:'grid',
                    gridTemplateColumns:'1fr auto auto',
                    alignItems:'center',
                    gap:'12px',
                    minWidth:0,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-surface)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  {/* Col 1: info — takes remaining space, truncates */}
                  <div style={{ minWidth:0, display:'flex', flexDirection:'column', gap:'4px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
                      <span className={`badge ${badgeCls}`} style={{ flexShrink:0 }}>{file.type || 'FILE'}</span>
                      <span style={{
                        fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--text-1)',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0,
                      }}>
                        {file.name}
                      </span>
                      {file.version && (
                        <span style={{ flexShrink:0, padding:'1px 8px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>
                          {file.version}
                        </span>
                      )}
                    </div>
                    {file.description && (
                      <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {file.description}
                      </div>
                    )}
                  </div>

                  {/* Col 2: price — fixed width */}
                  <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.95rem', color: isFree ? 'var(--accent)' : 'var(--text-1)', whiteSpace:'nowrap' }}>
                    {isFree ? 'Free' : `$${file.price}`}
                  </div>

                  {/* Col 3: button — always same "Download" */}
                  <a href={file.link} target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.82rem', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0, transition:'opacity 0.15s ease' }}
                    onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                  >
                    <Download size={13}/> Download
                  </a>
                </div>
              );
            })
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop:'48px', textAlign:'center', padding:'40px 24px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)' }}>
          <div className="section-label" style={{ marginBottom:'12px', justifyContent:'center', display:'flex' }}>Need Something Custom?</div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', marginBottom:'8px' }}>Let&apos;s Build It Together</div>
          <p style={{ fontFamily:'Outfit,sans-serif', color:'var(--text-2)', fontSize:'0.9rem', marginBottom:'24px' }}>Need a custom template, audit, or solution? I can create it for you.</p>
          <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, textDecoration:'none' }}>
            Request a Quote <ArrowRight size={16}/>
          </Link>
        </div>
      </div>

      {/* On very small screens, stack price and button below info */}
      <style>{`
        @media (max-width: 520px) {
          .file-row { grid-template-columns: 1fr !important; }
          .file-price { text-align: left !important; }
        }
      `}</style>
    </div>
  );
}
