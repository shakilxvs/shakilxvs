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
  const sub = settings.page_subtitle || 'A personal feed.';
  return {
    title: `${t} — shakilxvs`,
    description: sub,
    alternates: { canonical: 'https://shakilxvs.com/log' },
    openGraph: { title: `${t} — shakilxvs`, description: sub, url: 'https://shakilxvs.com/log', type: 'website' },
    twitter: { card: 'summary_large_image', title: `${t} — shakilxvs`, description: sub },
  };
}

export default async function LogPage() {
  const [settings, rawPosts] = await Promise.all([
    getLogSettings(),
    getPublishedLogPosts(),
  ]);

  if (!settings?.page_enabled) redirect('/');

  const posts       = rawPosts.map(serializePost);
  const titleLine1  = settings.page_title        || '';
  const titleLine2  = settings.page_title_accent  || '';
  const subtitle    = settings.page_subtitle      || '';
  const heroImg1    = settings.hero_image_1       || '';
  const heroImg2    = settings.hero_image_2       || '';
  const hasImages   = !!(heroImg1 || heroImg2);
  const btn1Text    = settings.btn1_text          || '';
  const btn1Url     = settings.btn1_url           || '/blog';
  const btn2Text    = settings.btn2_text          || '';
  const btn2Url     = settings.btn2_url           || '/contact';
  const hasTitle    = !!(titleLine1 || titleLine2);

  return (
    <div className="log-root">
      <div className="log-bg" aria-hidden="true">
        <div className="log-blob log-blob-1"/>
        <div className="log-blob log-blob-2"/>
        <div className="log-grain"/>
      </div>

      <style>{`
        :root {
          --log-bg: #0a0a0a;
          --log-text: #f4f4f5;
          --log-text-sub: rgba(232,232,234,0.50);
          --log-card-bg: #141414;
          --log-card-border: rgba(255,255,255,0.07);
          --log-card-hover-border: rgba(255,255,255,0.14);
          --log-pill-bg: rgba(255,255,255,0.04);
          --log-pill-border: rgba(255,255,255,0.08);
          --log-pill-text: rgba(232,232,234,0.72);
          --log-pill-active-bg: #f4f4f5;
          --log-pill-active-text: #0a0a0a;
          --log-empty-text: rgba(232,232,234,0.35);
          --log-badge-bg: rgba(10,10,10,0.55);
          --log-grain-opacity: 0.025;
        }
        [data-theme="light"] {
          --log-bg: var(--bg-base, #f4f6fc);
          --log-text: var(--text-1, #0d1117);
          --log-text-sub: var(--text-3, #8896b3);
          --log-card-bg: var(--bg-surface, #ffffff);
          --log-card-border: rgba(0,0,0,0.06);
          --log-card-hover-border: rgba(0,0,0,0.14);
          --log-pill-bg: rgba(0,0,0,0.03);
          --log-pill-border: rgba(0,0,0,0.08);
          --log-pill-text: var(--text-2, #4a5568);
          --log-pill-active-bg: var(--text-1, #0d1117);
          --log-pill-active-text: #ffffff;
          --log-empty-text: var(--text-3, #8896b3);
          --log-badge-bg: rgba(255,255,255,0.75);
          --log-grain-opacity: 0.012;
        }

        .log-root {
          position: relative; min-height: 100vh;
          background: var(--log-bg); color: var(--log-text);
          padding: 0 24px 120px; overflow-x: hidden;
          transition: background 0.3s, color 0.3s;
        }
        .log-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .log-blob { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(140px); }
        .log-blob-1 { background: rgba(35,77,194,0.08); top: -100px; left: -80px; }
        .log-blob-2 { background: rgba(120,80,200,0.06); bottom: -120px; right: -100px; }
        .log-grain { position: absolute; inset: 0; opacity: var(--log-grain-opacity); background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; }
        .log-wrap { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

        /* ── HERO ─────────────────────────────────────── */
        .log-hero {
          display: flex; align-items: center;
          gap: 48px; padding: 80px 0 64px;
        }
        .log-hero-text { flex: 1; min-width: 0; }

        /* Title — 2-line, line1 default color, line2 accent */
        .log-hero-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: clamp(2.6rem, 5.5vw, 4.2rem);
          line-height: 1.1; letter-spacing: -0.025em;
          margin: 0 0 16px;
        }
        .log-hero-title-accent {
          color: var(--accent, #234DC2);
        }

        /* Subtitle */
        .log-hero-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 1rem; font-weight: 400;
          color: var(--log-text-sub);
          line-height: 1.55; margin: 0 0 28px;
          max-width: 380px;
        }

        /* CTA row */
        .log-hero-cta-row { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .log-hero-cta {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 28px; border-radius: 999; border: none;
          background: var(--accent, #234DC2); color: #fff;
          font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 700;
          text-decoration: none; transition: opacity 0.15s;
        }
        .log-hero-cta:hover { opacity: 0.88; }
        .log-hero-secondary {
          font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600;
          color: var(--log-text); text-decoration: none;
          transition: opacity 0.15s;
        }
        .log-hero-secondary:hover { opacity: 0.65; }

        /* Images — two tilted overlapping cards */
        .log-hero-imgs {
          flex-shrink: 0; position: relative;
          width: 360px; height: 340px;
        }
        .log-hero-img {
          position: absolute; border-radius: 18px; overflow: hidden;
          border: 5px solid rgba(255,255,255,0.92);
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .log-hero-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .log-hero-img-1 {
          width: 230px; height: 290px;
          top: 0; left: 0;
          transform: rotate(-5deg); z-index: 1;
        }
        .log-hero-img-2 {
          width: 200px; height: 260px;
          top: 36px; left: 150px;
          transform: rotate(4deg); z-index: 2;
        }
        .log-hero-img-1:hover { transform: rotate(-2deg) scale(1.02); }
        .log-hero-img-2:hover { transform: rotate(1deg) scale(1.02); }
        [data-theme="light"] .log-hero-img {
          border-color: rgba(255,255,255,0.96);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }

        /* ── MOBILE ───────────────────────────────────── */
        @media (max-width: 768px) {
          .log-root { padding: 0 16px 80px; }
          .log-hero {
            flex-direction: column; gap: 0;
            padding: 12px 0 32px; text-align: center;
          }
          /* Images first, text second */
          .log-hero-imgs {
            order: -1;
            width: 200px; height: 170px;
            margin: 0 auto 24px;
          }
          .log-hero-img-1 { width: 120px; height: 150px; left: 0; top: 0; }
          .log-hero-img-2 { width: 110px; height: 138px; left: 78px; top: 16px; }
          .log-hero-text { text-align: center; }
          .log-hero-title { font-size: clamp(2rem, 8vw, 2.8rem); margin-bottom: 12px; }
          .log-hero-sub { margin: 0 auto 20px; }
          .log-hero-cta-row { justify-content: center; }
          .log-hero-cta { padding: 12px 24px; font-size: 0.9rem; }
        }

        @media (prefers-reduced-motion: reduce) { .log-blob { animation: none; } }
      `}</style>

      <div className="log-wrap">
        {posts.length > 0 && hasTitle && (
          <div className="log-hero">
            <div className="log-hero-text">
              <h1 className="log-hero-title">
                {titleLine1 && <>{titleLine1}<br/></>}
                {titleLine2 && <span className="log-hero-title-accent">{titleLine2}</span>}
              </h1>
              {subtitle && <p className="log-hero-sub">{subtitle}</p>}
              {(btn1Text || btn2Text) && (
                <div className="log-hero-cta-row">
                  {btn1Text && <Link href={btn1Url} className="log-hero-cta">{btn1Text}</Link>}
                  {btn2Text && <Link href={btn2Url} className="log-hero-secondary">{btn2Text}</Link>}
                </div>
              )}
            </div>
            {hasImages && (
              <div className="log-hero-imgs">
                {heroImg1 && <div className="log-hero-img log-hero-img-1"><img src={heroImg1} alt=""/></div>}
                {heroImg2 && <div className="log-hero-img log-hero-img-2"><img src={heroImg2} alt=""/></div>}
              </div>
            )}
          </div>
        )}

        <LogFeed initialPosts={posts}/>
      </div>
    </div>
  );
}
