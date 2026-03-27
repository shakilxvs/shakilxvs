import { getPublishedBlogPosts } from '@/lib/firestore';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Blog — Shakil Ahmed | Web Development & Digital Marketing',
    description: 'Articles on Shopify development, SaaS, web apps, and digital marketing. Real insights from 6+ years and 5000+ global projects.',
    alternates: { canonical: 'https://shakilxvs.com/blog' },
    openGraph: {
      title: 'Blog — Shakil Ahmed',
      description: 'Web development, SaaS, and digital marketing insights.',
      url: 'https://shakilxvs.com/blog',
    },
  };
}

function PostCard({ post }) {
  const date = post.publishedAt?.toDate
    ? post.publishedAt.toDate().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : null;

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration:'none', display:'block', height:'100%' }}>
      <article className="blog-card" style={{
        background:'var(--bg-surface)', border:'1px solid var(--border-2)',
        borderRadius:'var(--radius-lg)', overflow:'hidden', height:'100%',
        display:'flex', flexDirection:'column',
        transition:'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
      }}>

        {/* Cover image */}
        <div style={{ aspectRatio:'16/9', overflow:'hidden', background:'var(--bg-elevated)', flexShrink:0, position:'relative' }}>
          {post.coverImage
            ? <img src={post.coverImage} alt={post.title} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' }}/>
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue,sans-serif', fontSize:'3rem', color:'var(--accent)', opacity:0.2 }}>{(post.title||'B')[0]}</div>
          }
          {post.tags?.length > 0 && (
            <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {post.tags.slice(0,2).map(tag => (
                <span key={tag} style={{ padding:'2px 8px', background:'rgba(35,77,194,0.85)', borderRadius:100, fontFamily:'Space Mono,monospace', fontSize:'0.52rem', color:'#fff', letterSpacing:'0.05em' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding:'20px', flex:1, display:'flex', flexDirection:'column', gap:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {date && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>{date}</span>}
            {post.readTime && <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)' }}>· {post.readTime} min read</span>}
          </div>

          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'var(--text-1)', lineHeight:1.35, margin:0 }}>
            {post.title}
          </h2>

          {post.excerpt && (
            <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.65, margin:0, flex:1, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {post.excerpt}
            </p>
          )}

          <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--accent)', fontWeight:600, marginTop:'auto' }}>
            Read More <ArrowRight size={13}/>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts().catch(() => []);

  // Blog listing schema
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Shakil Ahmed — Blog',
    url: 'https://shakilxvs.com/blog',
    description: 'Web development, SaaS, Shopify, and digital marketing articles.',
    author: { '@type': 'Person', name: 'Shakil Ahmed', url: 'https://shakilxvs.com' },
  };

  return (
    <div style={{ minHeight:'100vh', paddingTop:'100px', paddingBottom:'80px', position:'relative', zIndex:1 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}/>

      {/* Background orb */}
      <div style={{ position:'absolute', top:'5%', right:'-5%', width:'500px', height:'500px', background:'rgba(35,77,194,0.05)', borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none' }}/>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ marginBottom:'56px' }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'12px' }}>
            Insights & Resources
          </div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(3rem,7vw,6rem)', color:'var(--text-1)', letterSpacing:'0.02em', lineHeight:1, marginBottom:'16px' }}>
            Blog
          </h1>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'1rem', color:'var(--text-2)', maxWidth:'520px', lineHeight:1.75 }}>
            Real insights from 6+ years of building web projects, marketing campaigns, and digital products for global clients.
          </p>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 24px', border:'1px dashed var(--border-2)', borderRadius:'var(--radius-xl)', color:'var(--text-3)', fontFamily:'Outfit,sans-serif' }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'1.5rem', color:'var(--text-2)', marginBottom:'8px' }}>No Posts Yet</div>
            <div>Articles are coming soon. Check back shortly.</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px' }} className="blog-grid">
            {posts.map(post => <PostCard key={post.id} post={post}/>)}
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:1024px){.blog-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:640px) {.blog-grid{grid-template-columns:1fr!important;}}
        .blog-card:hover{border-color:var(--accent-border)!important;transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,0.3);}
      `}</style>
    </div>
  );
}
