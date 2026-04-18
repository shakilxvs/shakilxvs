import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLogSettings, getPublishedLogPosts } from '@/lib/firestore';
import LogFeed from '@/components/log/LogFeed';

export const dynamic = 'force-dynamic';

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

export async function generateMetadata() {
  const settings = await getLogSettings();
  if (!settings?.page_enabled) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }
  const t = [settings.page_title, settings.page_title_accent].filter(Boolean).join(' ') || 'log';
  const sub = settings.page_subtitle || '';
  return {
    title: `${t} — shakilxvs`,
    description: sub || 'A personal feed.',
    alternates: { canonical: 'https://shakilxvs.com/log' },
    openGraph: { title: `${t} — shakilxvs`, description: sub || 'A personal feed.', url: 'https://shakilxvs.com/log', type: 'website' },
    twitter: { card: 'summary_large_image', title: `${t} — shakilxvs`, description: sub || 'A personal feed.' },
  };
}

export default async function LogPage() {
  const [settings, rawPosts] = await Promise.all([
    getLogSettings(),
    getPublishedLogPosts(),
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

  return (
    <div className="lp">
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
          padding:18px 44px; border-radius:999; border:none;
          background:var(--accent,#234DC2); color:#fff;
          font-family:'Outfit',sans-serif; font-size:1.15rem; font-weight:700;
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
          .lp-cta { padding:16px 36px; font-size:1.05rem; }
          .lp-sec { font-size:1rem; }
        }

        @media (prefers-reduced-motion:reduce) { .lp-blob { display:none; } }
      `}</style>

      <div className="lp-w">
        {posts.length > 0 && hasTitle && (
          <div className="lp-hero">
            <div className="lp-hero-l">
              <h1 className="lp-h1">
                {line1}{line2 && <><br/><span className="lp-h1-accent">{line2}</span></>}
              </h1>
              {subtitle && <p className="lp-sub">{subtitle}</p>}
              {(btn1 || btn2) && (
                <div className="lp-acts">
                  {btn1 && <Link href={btn1Url} className="lp-cta">{btn1}</Link>}
                  {btn2 && <Link href={btn2Url} className="lp-sec">{btn2}</Link>}
                </div>
              )}
            </div>
            {hasImgs && (
              <div className="lp-hero-r">
                {img1 && <div className="lp-img lp-i1"><img src={img1} alt=""/></div>}
                {img2 && <div className="lp-img lp-i2"><img src={img2} alt=""/></div>}
              </div>
            )}
          </div>
        )}

        <LogFeed initialPosts={posts}/>
      </div>
    </div>
  );
}
