import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLogSettings, getPublishedLogPosts, getPortfolioDoc } from '@/lib/firestore';
import LogFeed from '@/components/log/LogFeed';
import LogProfileHeader from '@/components/log/LogProfileHeader';

export const dynamic = 'force-dynamic';

// ─── Brand keywords ────────────────────────────────────────
// Hardcoded so that "Shakil Ahmed", "shakilxvs", "Freelancer Shakil", etc.
// are always present in this page's <meta keywords> and structured data —
// even before the admin adds anything from Settings. Admin-entered
// page_keywords (Settings tab) and post tags are merged in on top of these.
const BRAND_KEYWORDS = [
  'Shakil Ahmed', 'shakilxvs', 'Freelancer Shakil', 'Freelancer Shakil Ahmed',
  'Shakil Ahmed photography', 'Shakil Ahmed videography', 'Shakil Ahmed cinematography',
  'Shakil Ahmed daily log', 'Shakil web developer', 'Shakil Ahmed Bangladesh',
];

function serializePost(p) {
  const out = { ...p };
  for (const k of ['post_date', 'created_at', 'updatedAt']) {
    const v = out[k];
    if (v && typeof v === 'object' && typeof v.toDate === 'function') {
      out[k] = { seconds: v.seconds ?? 0, nanoseconds: v.nanoseconds ?? 0 };
    }
  }
  return out;
}

function tsSeconds(ts) {
  if (!ts) return 0;
  if (typeof ts.seconds === 'number') return ts.seconds;
  return 0;
}

function buildKeywords(settings, posts) {
  const admin = (settings?.page_keywords || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const tagSet = new Set();
  for (const p of posts) {
    (Array.isArray(p.tags) ? p.tags : []).forEach(t => t && tagSet.add(t));
  }
  const merged = [...BRAND_KEYWORDS, ...admin, ...Array.from(tagSet).slice(0, 20)];
  return Array.from(new Set(merged)); // dedupe, preserve order
}

function pickOgImage(settings, posts) {
  const firstPhoto = posts.find(p => p.type === 'photo' && p.media_url);
  const firstVideoThumb = posts.find(p => p.type === 'video' && p.media_thumbnail);
  return firstPhoto?.media_url || firstVideoThumb?.media_thumbnail
    || settings?.hero_image_1 || settings?.hero_image_2 || null;
}

export async function generateMetadata() {
  const [settings, rawPosts] = await Promise.all([
    getLogSettings(),
    getPublishedLogPosts().catch(() => []),
  ]);
  if (!settings?.page_enabled) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }
  const t = [settings.page_title, settings.page_title_accent].filter(Boolean).join(' ') || 'log';
  const sub = settings.page_meta_description || settings.page_subtitle
    || 'Shakil Ahmed — photography, videography, and cinematography from daily life and client work. Follow @shakilxvs.';
  const title = `${t} — Shakil Ahmed (@shakilxvs)`;
  const keywords = buildKeywords(settings, rawPosts).join(', ');
  const ogImage = pickOgImage(settings, rawPosts);
  const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];

  return {
    title,
    description: sub,
    keywords,
    alternates: { canonical: 'https://shakilxvs.com/log' },
    openGraph: {
      title, description: sub, url: 'https://shakilxvs.com/log', type: 'profile', images,
      siteName: 'Shakil Ahmed',
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title, description: sub, creator: '@shakilxvs',
      ...(images.length ? { images: [ogImage] } : {}),
    },
  };
}

export default async function LogPage() {
  const [settings, rawPosts, contact] = await Promise.all([
    getLogSettings(),
    getPublishedLogPosts(),
    getPortfolioDoc('contact').catch(() => null),
  ]);

  if (!settings?.page_enabled) redirect('/');

  const posts      = rawPosts.map(serializePost);
  const line1      = settings.page_title        || '';
  const line2      = settings.page_title_accent  || '';
  const subtitle   = settings.page_subtitle      || '';
  const img1       = settings.hero_image_1       || '';
  const img2       = settings.hero_image_2       || '';
  const hasImgs    = !!(img1 || img2);
  const btn1       = settings.btn1_text          || '';
  const btn1Url    = settings.btn1_url           || '/blog';
  const btn2       = settings.btn2_text          || '';
  const btn2Url    = settings.btn2_url           || '/contact';
  const hasTitle   = !!(line1 || line2);

  // ─── Profile header data ──────────────────────────────────
  const profileName   = settings.profile_name || 'Shakil Ahmed';
  const profileHandle = settings.profile_handle || '@shakilxvs';
  const profileBio    = settings.profile_bio
    || 'Freelance CMS & web expert — sharing photography, videography, and cinematography from projects and daily life.';
  const profileAvatar = settings.profile_avatar_url || img1 || img2 || '';
  const totalViews    = posts.reduce((s, p) => s + (Number(p.views) || 0), 0);
  const years         = posts.map(p => tsSeconds(p.post_date) || tsSeconds(p.created_at)).filter(Boolean);
  const sinceYear      = years.length ? new Date(Math.min(...years) * 1000).getFullYear() : null;
  const showProfileHeader = settings.show_profile_header !== false;

  // ─── Structured data ───────────────────────────────────────
  const sameAs = [...new Set([
    contact?.instagram, contact?.linkedin, contact?.twitter, contact?.facebook,
    'https://github.com/shakilxvs',
  ].filter(Boolean))];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Log',  item: 'https://shakilxvs.com/log' },
    ],
  };

  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: posts.length ? new Date((years.length ? Math.min(...years) : Date.now() / 1000) * 1000).toISOString() : undefined,
    mainEntity: {
      '@type': 'Person',
      name: profileName,
      alternateName: ['Shakil', 'shakilxvs'],
      url: 'https://shakilxvs.com',
      description: profileBio,
      ...(profileAvatar ? { image: profileAvatar } : {}),
      sameAs,
      knowsAbout: [
        'Photography', 'Videography', 'Cinematography', 'Shopify Development',
        'WordPress Development', 'Web Development', 'Digital Marketing',
      ],
    },
  };

  const galleryItems = posts.slice(0, 24).map((p, i) => {
    const isVideo = p.type === 'video';
    const isPhoto = p.type === 'photo';
    const base = {
      position: i + 1,
      name: p.title?.trim() || `${profileName} — log entry`,
      url: `https://shakilxvs.com/log/${p.id}`,
      ...(p.description ? { description: p.description.slice(0, 200) } : {}),
      ...((p.tags || []).length ? { keywords: p.tags.join(', ') } : {}),
    };
    if (isPhoto && p.media_url) {
      return { '@type': 'ListItem', ...base, item: { '@type': 'ImageObject', contentUrl: p.media_url, name: base.name } };
    }
    if (isVideo && p.media_url) {
      return {
        '@type': 'ListItem', ...base,
        item: {
          '@type': 'VideoObject', contentUrl: p.media_url,
          thumbnailUrl: p.media_thumbnail || undefined, name: base.name,
          uploadDate: p.post_date?.seconds ? new Date(p.post_date.seconds * 1000).toISOString() : undefined,
        },
      };
    }
    return { '@type': 'ListItem', ...base, item: { '@type': 'CreativeWork', name: base.name } };
  });

  const collectionSchema = posts.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${profileName} — Log`,
    url: 'https://shakilxvs.com/log',
    about: 'Photography, videography, and cinematography from Shakil Ahmed (shakilxvs).',
    isPartOf: { '@type': 'WebSite', name: 'Shakil Ahmed', url: 'https://shakilxvs.com' },
    mainEntity: { '@type': 'ItemList', itemListElement: galleryItems },
  } : null;

  return (
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}/>
      {collectionSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}/>
      )}
      <div className="lp-bg" aria-hidden="true">
        <div className="lp-blob lp-b1"/>
        <div className="lp-blob lp-b2"/>
      </div>

      <style>{`
        :root {
          --log-bg:#0a0a0a; --log-text:#f4f4f5; --log-text-sub:rgba(232,232,234,0.50);
          --log-card-bg:#141414; --log-card-border:rgba(255,255,255,0.07);
          --log-card-hover-border:rgba(255,255,255,0.14);
          --log-pill-bg:rgba(255,255,255,0.04); --log-pill-border:rgba(255,255,255,0.08);
          --log-pill-text:rgba(232,232,234,0.72);
          --log-pill-active-bg:#f4f4f5; --log-pill-active-text:#0a0a0a;
          --log-empty-text:rgba(232,232,234,0.35);
          --log-badge-bg:rgba(10,10,10,0.55);
        }
        [data-theme="light"] {
          --log-bg:var(--bg-base,#f4f6fc); --log-text:var(--text-1,#0d1117);
          --log-text-sub:var(--text-3,#8896b3);
          --log-card-bg:var(--bg-surface,#fff); --log-card-border:rgba(0,0,0,0.06);
          --log-card-hover-border:rgba(0,0,0,0.14);
          --log-pill-bg:rgba(0,0,0,0.03); --log-pill-border:rgba(0,0,0,0.08);
          --log-pill-text:var(--text-2,#4a5568);
          --log-pill-active-bg:var(--text-1,#0d1117); --log-pill-active-text:#fff;
          --log-empty-text:var(--text-3,#8896b3);
          --log-badge-bg:rgba(255,255,255,0.75);
        }

        /* ── Page ──────────────────────────────────────── */
        .lp {
          position:relative; min-height:100vh;
          background:var(--log-bg); color:var(--log-text);
          padding:80px 24px 120px;
          overflow-x:hidden; transition:background .3s,color .3s;
        }
        .lp-bg { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
        .lp-blob { position:absolute; width:500px; height:500px; border-radius:50%; filter:blur(140px); }
        .lp-b1 { background:rgba(35,77,194,0.07); top:-100px; left:-80px; }
        .lp-b2 { background:rgba(120,80,200,0.05); bottom:-120px; right:-100px; }
        .lp-w { position:relative; z-index:1; max-width:1200px; margin:0 auto; }

        /* ── Hero ──────────────────────────────────────── */
        .lp-hero {
          display:flex; align-items:center;
          gap:48px; padding:0 0 56px;
        }
        .lp-hero-l { flex:1; min-width:0; }

        .lp-h1 {
          font-family:'Outfit',sans-serif;
          font-weight:800; line-height:1.08;
          font-size:clamp(2.6rem,5.5vw,4.2rem);
          letter-spacing:-0.025em; margin:0 0 16px;
          color:var(--log-text);
        }
        .lp-h1-accent { color:var(--accent,#234DC2); }

        .lp-sub {
          font-family:'Outfit',sans-serif;
          font-size:1.05rem; font-weight:400;
          color:var(--log-text-sub);
          line-height:1.55; margin:0 0 32px;
          max-width:400px;
        }

        .lp-acts { display:flex; align-items:center; gap:28px; flex-wrap:wrap; }
        .lp-cta {
          display:inline-flex; align-items:center; justify-content:center;
          padding:22px 52px; border-radius:999; border:none;
          background:var(--accent,#234DC2); color:#fff;
          font-family:'Outfit',sans-serif; font-size:1.2rem; font-weight:600;
          text-decoration:none; transition:opacity .15s,transform .15s;
          letter-spacing:-0.01em;
        }
        .lp-cta:hover { opacity:.88; transform:translateY(-1px); }
        .lp-sec {
          font-family:'Outfit',sans-serif; font-size:1.1rem; font-weight:400;
          color:var(--log-text); text-decoration:none; opacity:0.8;
          transition:opacity .15s;
        }
        .lp-sec:hover { opacity:.5; }

        /* ── Images ────────────────────────────────────── */
        .lp-hero-r { flex-shrink:0; position:relative; width:380px; height:360px; }
        .lp-img {
          position:absolute; border-radius:20px; overflow:hidden;
          border:5px solid rgba(255,255,255,0.92);
          box-shadow:0 14px 44px rgba(0,0,0,0.22);
          transition:transform .35s cubic-bezier(.22,1,.36,1);
        }
        .lp-img img { display:block; width:100%; height:100%; object-fit:cover; }
        .lp-i1 { width:240px; height:300px; top:0; left:0; transform:rotate(-5deg); z-index:1; }
        .lp-i2 { width:210px; height:270px; top:40px; left:150px; transform:rotate(4deg); z-index:2; }
        .lp-i1:hover { transform:rotate(-2deg) scale(1.02); }
        .lp-i2:hover { transform:rotate(1deg) scale(1.02); }
        [data-theme="light"] .lp-img { border-color:rgba(255,255,255,.96); box-shadow:0 14px 44px rgba(0,0,0,.08); }

        /* ── Mobile ────────────────────────────────────── */
        @media (max-width:768px) {
          .lp { padding:70px 16px 80px; }
          .lp-hero {
            flex-direction:column; gap:28px;
            padding:0 0 32px; text-align:center;
          }
          .lp-hero-r {
            order:-1; width:200px; height:165px;
            margin:0 auto;
          }
          .lp-i1 { width:115px; height:145px; left:0; top:0; }
          .lp-i2 { width:105px; height:132px; left:78px; top:18px; }
          .lp-hero-l { text-align:center; }
          .lp-h1 { font-size:clamp(1.8rem,8vw,2.6rem); margin-bottom:10px; }
          .lp-sub { margin:0 auto 20px; font-size:.95rem; }
          .lp-acts { justify-content:center; gap:18px; }
          .lp-cta { padding:18px 44px; font-size:1.1rem; }
          .lp-sec { font-size:1rem; }
        }

        @media (prefers-reduced-motion:reduce) { .lp-blob { display:none; } }
      `}</style>

      <div className="lp-w">
        {showProfileHeader && (
          <LogProfileHeader
            name={profileName}
            handle={profileHandle}
            bio={profileBio}
            avatarUrl={profileAvatar}
            postCount={posts.length}
            totalViews={totalViews}
            sinceYear={sinceYear}
            socials={{
              instagram: contact?.showInstagram !== false ? contact?.instagram : null,
              twitter:   contact?.showTwitter   !== false ? contact?.twitter   : null,
              facebook:  contact?.showFacebook  !== false ? contact?.facebook  : null,
              tiktok:    contact?.showTiktok    !== false ? contact?.tiktok    : null,
              linkedin:  contact?.showLinkedin  !== false ? contact?.linkedin  : null,
            }}
          />
        )}

        {posts.length > 0 && hasTitle && (
          <div className="lp-hero">
            <div className="lp-hero-l">
              <h1 className="lp-h1">
                {line1}{line2 && <><br/><span className="lp-h1-accent">{line2}</span></>}
              </h1>
              {subtitle && <p className="lp-sub">{subtitle}</p>}
              {(btn1 || btn2) && (
                <div className="lp-acts" style={{ display:'flex', alignItems:'center', gap:'28px', flexWrap:'wrap' }}>
                  {btn1 && <Link href={btn1Url} style={{
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    padding:'14px 36px', borderRadius:'999px', border:'none',
                    background:'var(--accent,#234DC2)', color:'#fff',
                    fontFamily:"'Outfit',sans-serif", fontSize:'1rem', fontWeight:600,
                    textDecoration:'none', letterSpacing:'-0.01em',
                  }}>{btn1}</Link>}
                  {btn2 && <Link href={btn2Url} style={{
                    fontFamily:"'Outfit',sans-serif", fontSize:'1rem', fontWeight:400,
                    color:'var(--log-text)', textDecoration:'none', opacity:0.8,
                  }}>{btn2}</Link>}
                </div>
              )}
            </div>
            {hasImgs && (
              <div className="lp-hero-r">
                {img1 && <div className="lp-img lp-i1"><img src={img1} alt={`${profileName} — photography and cinematography`}/></div>}
                {img2 && <div className="lp-img lp-i2"><img src={img2} alt={`${profileName} — behind the scenes`}/></div>}
              </div>
            )}
          </div>
        )}

        <LogFeed initialPosts={posts}/>
      </div>
    </div>
  );
}
