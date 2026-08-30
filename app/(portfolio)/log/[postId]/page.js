import { redirect } from 'next/navigation';
import { getLogPostById, getLogSettings } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

// Always folded into per-post keywords so every /log/[id] page — the ones
// most likely to rank for a specific photo/video — still carries the
// core brand terms alongside whatever tags/keywords the post has.
const BRAND_TERMS = ['Shakil Ahmed', 'shakilxvs'];

// ─── SEO metadata per post ────────────────────────────────
export async function generateMetadata({ params }) {
  const post = await getLogPostById(params.postId);
  if (!post || !post.published) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }
  const title = post.seo_title?.trim()
    || (post.title?.trim() ? `${post.title.trim()} — Shakil Ahmed` : 'Log entry — Shakil Ahmed (shakilxvs)');
  const description = post.seo_description?.trim()
    || post.description?.trim()?.slice(0, 160)
    || `A ${post.type} fragment from Shakil Ahmed's (@shakilxvs) daily log — photography, videography & cinematography.`;
  const ogImage = post.type === 'photo' ? post.media_url
    : post.type === 'video' ? post.media_thumbnail
    : null;
  const keywordList = [
    ...BRAND_TERMS,
    ...(post.seo_keywords ? post.seo_keywords.split(',').map(s => s.trim()) : []),
    ...(post.tags || []),
  ].filter(Boolean);
  const keywords = Array.from(new Set(keywordList)).join(', ');

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `https://shakilxvs.com/log/${params.postId}` },
    openGraph: {
      title,
      description,
      url: `https://shakilxvs.com/log/${params.postId}`,
      type: 'article',
      siteName: 'Shakil Ahmed',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: '@shakilxvs',
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

function buildBreadcrumbSchema(postId, title) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Log',  item: 'https://shakilxvs.com/log' },
      { '@type': 'ListItem', position: 3, name: title || 'Log entry', item: `https://shakilxvs.com/log/${postId}` },
    ],
  };
}

// ─── JSON-LD for search engines ───────────────────────────
function buildJsonLd(post) {
  const keywordList = [
    ...BRAND_TERMS,
    ...(post.seo_keywords ? post.seo_keywords.split(',').map(s => s.trim()) : []),
    ...(post.tags || []),
  ].filter(Boolean);

  const data = {
    '@context':     'https://schema.org',
    '@type':        'SocialMediaPosting',
    datePublished:  post.post_date?.seconds
      ? new Date(post.post_date.seconds * 1000).toISOString()
      : undefined,
    headline:       post.title || 'Log entry by Shakil Ahmed',
    articleBody:    post.description || undefined,
    keywords:       Array.from(new Set(keywordList)).join(', ') || undefined,
    isPartOf: { '@type': 'WebSite', name: 'Shakil Ahmed', url: 'https://shakilxvs.com' },
    author: {
      '@type': 'Person',
      name:    'Shakil Ahmed',
      alternateName: 'shakilxvs',
      url:     'https://shakilxvs.com',
    },
    mainEntityOfPage: `https://shakilxvs.com/log/${post.id}`,
  };
  if (post.type === 'photo' && post.media_url) data.image = post.media_url;
  if (post.type === 'video' && post.media_url) {
    data['@type'] = 'VideoObject';
    data.contentUrl   = post.media_url;
    data.thumbnailUrl = post.media_thumbnail || post.media_url;
    data.uploadDate   = data.datePublished;
  }
  // Strip undefineds
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

// ─── Serialize Firestore Timestamps for dangerouslySetInnerHTML ─
function plainPost(p) {
  const out = { ...p };
  for (const k of ['post_date', 'created_at', 'updatedAt']) {
    const v = out[k];
    if (v && typeof v === 'object' && typeof v.toDate === 'function') {
      out[k] = { seconds: v.seconds ?? 0, nanoseconds: v.nanoseconds ?? 0 };
    }
  }
  return out;
}

export default async function LogDeepLinkPage({ params }) {
  const [post, settings] = await Promise.all([
    getLogPostById(params.postId),
    getLogSettings(),
  ]);

  // Feature off, or post missing / unpublished → bounce to /log
  // (/log itself will then redirect to / if the feature is off)
  if (!settings?.page_enabled) redirect('/');
  if (!post || !post.published) redirect('/log');

  const plain = plainPost(post);
  const date  = plain.post_date?.seconds
    ? new Date(plain.post_date.seconds * 1000).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : '';
  const title = plain.title?.trim() || '';
  const desc  = plain.description?.trim() || '';
  const tags  = Array.isArray(plain.tags) ? plain.tags : [];

  // ─── Server HTML ─────────────────────────────────────────
  // Crawlers (no JS) see a fully rendered article with JSON-LD.
  // Users with JS see this for ~100ms then get redirected to the
  // modal experience via the inline script below.
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e8e8ea',
      padding: '72px 24px 120px',
      fontFamily: "'DM Sans', 'Outfit', sans-serif",
    }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(plain)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(plain.id, title)) }}
      />

      {/* Redirect to modal experience. Crawlers ignore JS, real
          users see a brief dark flash then land on /log with the
          modal open. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(typeof window!=='undefined'){window.location.replace('/log?open=${encodeURIComponent(plain.id)}');}}catch(e){}})();`,
        }}
      />

      {/* Visible content: hidden by default for JS users (the redirect
          fires immediately), visible for JS-disabled crawlers via
          noscript-friendly rendering. The content sits behind a dark
          overlay so even if the redirect takes 100ms, the user sees
          a clean dark screen rather than a layout flash. */}
      <style>{`
        .log-dl-article { opacity: 0; animation: log-dl-fadein 0.8s ease 0.5s forwards; }
        @keyframes log-dl-fadein { to { opacity: 1; } }
      `}</style>

      <article className="log-dl-article" style={{ maxWidth: 720, margin: '0 auto' }}>
        <a href="/log" style={{
          display: 'inline-block',
          fontFamily: "'DM Sans', 'Outfit', sans-serif",
          fontSize: '0.78rem',
          color: 'rgba(232,232,234,0.5)',
          textDecoration: 'none',
          marginBottom: 32,
        }}>
          ← Back to feed
        </a>

        {plain.type === 'photo' && plain.media_url && (
          <img src={plain.media_url} alt={title ? `${title} — Shakil Ahmed (@shakilxvs)` : 'Photography by Shakil Ahmed — @shakilxvs'}
            style={{ display:'block', width:'100%', height:'auto', borderRadius:16, marginBottom:24 }}/>
        )}
        {plain.type === 'video' && plain.media_url && (
          <video src={plain.media_url} controls poster={plain.media_thumbnail || undefined}
            style={{ display:'block', width:'100%', borderRadius:16, background:'#000', marginBottom:24 }}/>
        )}
        {plain.type === 'audio' && plain.media_url && (
          <audio src={plain.media_url} controls
            style={{ display:'block', width:'100%', marginBottom:24 }}/>
        )}

        {title && (
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            margin: '0 0 16px',
            color: '#f4f4f5',
            fontWeight: 400,
          }}>
            {title}
          </h1>
        )}
        {desc && (
          <div style={{
            fontSize: '1.02rem',
            lineHeight: 1.7,
            color: 'rgba(232,232,234,0.82)',
            whiteSpace: 'pre-wrap',
            marginBottom: 20,
          }}>
            {desc}
          </div>
        )}
        {tags.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom: 20 }}>
            {tags.map(t => (
              <span key={t} style={{
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.72rem',
                color: 'rgba(232,232,234,0.6)',
              }}>
                {t}
              </span>
            ))}
          </div>
        )}
        {date && (
          <div style={{
            fontSize: '0.78rem',
            color: 'rgba(232,232,234,0.45)',
            paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {date}
          </div>
        )}
      </article>
    </div>
  );
}
