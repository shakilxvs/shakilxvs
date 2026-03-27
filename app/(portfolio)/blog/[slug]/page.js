import { getBlogPostBySlug } from '@/lib/firestore';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const post = await getBlogPostBySlug(params.slug).catch(() => null);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.seoTitle || `${post.title} — Shakil Ahmed`,
    description: post.seoDescription || post.excerpt || '',
    alternates: { canonical: `https://shakilxvs.com/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      url: `https://shakilxvs.com/blog/${post.slug}`,
      type: 'article',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

function renderBlock(block, index) {
  const key = block.id || index;
  const textBase = { fontFamily:'Outfit,sans-serif', color:'var(--text-1)', lineHeight:1.8 };

  switch (block.type) {
    case 'paragraph':
      return (
        <p key={key} style={{ ...textBase, fontSize:'1.05rem', marginBottom:'24px', whiteSpace:'pre-wrap' }}>
          {block.content}
        </p>
      );
    case 'heading':
      const Tag = `h${block.level || 2}`;
      const hSize = block.level === 2 ? '1.75rem' : '1.35rem';
      return (
        <Tag key={key} style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:hSize, color:'var(--text-1)', letterSpacing:'0.03em', marginBottom:'16px', marginTop:'40px', lineHeight:1.1 }}>
          {block.content}
        </Tag>
      );
    case 'quote':
      return (
        <blockquote key={key} style={{ borderLeft:'3px solid var(--accent)', paddingLeft:'24px', margin:'32px 0', fontFamily:'Outfit,sans-serif', fontSize:'1.1rem', color:'var(--text-2)', fontStyle:'italic', lineHeight:1.7 }}>
          {block.content}
        </blockquote>
      );
    case 'code':
      return (
        <div key={key} style={{ margin:'28px 0' }}>
          {block.language && (
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{block.language}</div>
          )}
          <pre style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', padding:'20px 24px', overflow:'auto', fontFamily:'Space Mono,monospace', fontSize:'0.85rem', color:'var(--text-1)', lineHeight:1.6, margin:0 }}>
            <code>{block.content}</code>
          </pre>
        </div>
      );
    case 'image':
      return (
        <figure key={key} style={{ margin:'32px 0' }}>
          <img src={block.url} alt={block.alt||''} style={{ width:'100%', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-2)', display:'block' }}/>
          {block.caption && (
            <figcaption style={{ fontFamily:'Space Mono,monospace', fontSize:'0.62rem', color:'var(--text-3)', textAlign:'center', marginTop:'10px', letterSpacing:'0.05em' }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'bulletList':
      return (
        <ul key={key} style={{ margin:'0 0 24px 0', padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:'10px' }}>
          {(block.items||[]).map((item, i) => (
            <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px', fontFamily:'Outfit,sans-serif', fontSize:'1.05rem', color:'var(--text-1)', lineHeight:1.6 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', flexShrink:0, marginTop:'9px' }}/>
              {item}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({ params }) {
  const post = await getBlogPostBySlug(params.slug).catch(() => null);
  if (!post || post.status !== 'published') notFound();

  const date = post.publishedAt?.toDate
    ? post.publishedAt.toDate().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : null;

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    author: { '@type': 'Person', name: 'Shakil Ahmed', url: 'https://shakilxvs.com' },
    publisher: { '@type': 'Person', name: 'Shakil Ahmed', url: 'https://shakilxvs.com' },
    url: `https://shakilxvs.com/blog/${post.slug}`,
    ...(post.coverImage ? { image: post.coverImage } : {}),
    ...(date ? { datePublished: date } : {}),
    keywords: (post.tags||[]).join(', '),
    timeRequired: `PT${post.readTime||1}M`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://shakilxvs.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://shakilxvs.com/blog/${post.slug}` },
    ],
  };

  return (
    <div style={{ position:'relative', zIndex:1 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>

      {/* Hero */}
      <section style={{ paddingTop:'80px', paddingBottom:'48px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px' }}>
          <Link href="/blog" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'28px', transition:'color 0.15s' }}
            className="back-link-blog">
            <ArrowLeft size={12}/> All Posts
          </Link>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{ padding:'3px 10px', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)' }}>{tag}</span>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(2.2rem,5vw,3.8rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1.05, marginBottom:'20px' }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.05rem', color:'var(--text-2)', lineHeight:1.75, marginBottom:'24px' }}>
              {post.excerpt}
            </p>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent-muted)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'0.9rem', color:'var(--accent)' }}>S</div>
              <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-1)', fontWeight:600 }}>Shakil Ahmed</span>
            </div>
            {date && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>{date}</span>}
            {post.readTime && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)' }}>{post.readTime} min read</span>}
          </div>
        </div>
      </section>

      {/* Cover image */}
      {post.coverImage && (
        <div style={{ maxWidth:1000, margin:'0 auto', padding:'0 24px 48px' }}>
          <img src={post.coverImage} alt={post.title} style={{ width:'100%', aspectRatio:'16/7', objectFit:'cover', objectPosition:'center', borderRadius:'var(--radius-xl)', border:'1px solid var(--border-2)', display:'block' }}/>
        </div>
      )}

      {/* Content */}
      <article style={{ maxWidth:760, margin:'0 auto', padding:'0 24px 80px' }}>
        {(post.blocks||[]).map((block, i) => renderBlock(block, i))}

        {/* Bottom CTA */}
        <div style={{ marginTop:'64px', padding:'40px', background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', textAlign:'center' }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'12px' }}>
            Need help with your project?
          </div>
          <h3 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2rem', color:'var(--text-1)', letterSpacing:'0.03em', marginBottom:'12px' }}>
            Let's Work Together
          </h3>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', color:'var(--text-2)', marginBottom:'20px', lineHeight:1.6 }}>
            6+ years · 5000+ projects · Global clients
          </p>
          <Link href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'12px 24px', background:'var(--accent)', color:'#fff', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', textDecoration:'none' }}>
            Get in Touch <ArrowLeft size={14} style={{ transform:'rotate(180deg)' }}/>
          </Link>
        </div>
      </article>
      <style>{`.back-link-blog:hover{color:var(--accent)!important;}`}</style>
    </div>
  );
}
