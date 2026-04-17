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
  const title    = settings.page_title    || 'log';
  const subtitle = settings.page_subtitle || 'A personal feed.';
  return {
    title: `${title} — shakilxvs`,
    description: subtitle,
    alternates: { canonical: 'https://shakilxvs.com/log' },
    openGraph: { title: `${title} — shakilxvs`, description: subtitle, url: 'https://shakilxvs.com/log', type: 'website' },
    twitter: { card: 'summary_large_image', title: `${title} — shakilxvs`, description: subtitle },
  };
}

export default async function LogPage() {
  const [settings, rawPosts] = await Promise.all([
    getLogSettings(),
    getPublishedLogPosts(),
  ]);

  if (!settings?.page_enabled) redirect('/');

  const posts      = rawPosts.map(serializePost);
  const title      = settings.page_title    || 'log';
  const subtitle   = settings.page_subtitle || '';
  const heroImg1   = settings.hero_image_1  || '';
  const heroImg2   = settings.hero_image_2  || '';
  const hasHeroImgs = !!(heroImg1 || heroImg2);
  const btn1Text   = settings.btn1_text     || '';
  const btn1Url    = settings.btn1_url      || '/blog';
  const btn2Text   = settings.btn2_text     || '';
  const btn2Url    = settings.btn2_url      || '/contact';

  return (
    <div className="log-page-root">
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

        .log-page-root {
          position: relative; min-height: 100vh;
          background: var(--log-bg); color: var(--log-text);
          padding: 0 24px 120px; overflow-x: hidden;
          transition: background 0.3s, color 0.3s;
        }
        .log-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .log-blob { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(140px); will-change: transform; animation: log-drift 30s ease-in-out infinite alternate; }
        .log-blob-1 { background: rgba(35,77,194,0.10); top: -100px; left: -80px; animation-duration: 36s; }
        .log-blob-2 { background: rgba(120,80,200,0.07); bottom: -120px; right: -100px; animation-duration: 44s; animation-delay: -14s; }
        @keyframes log-drift { 0%{transform:translate(0,0)} 50%{transform:translate(60px,-40px)} 100%{transform:translate(-30px,50px)} }
        .log-grain { position: absolute; inset: 0; opacity: var(--log-grain-opacity); background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; }
        .log-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

        /* ─── Hero — Pinterest style ──────────────────── */
        .log-hero {
          display: flex; align-items: center; justify-content: space-between;
          gap: 48px; padding: 72px 0 56px;
        }
        .log-hero-left { flex: 1; max-width: 520px; }
        .log-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 800; line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--log-text);
          margin: 0 0 20px;
        }
        .log-hero-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 1.05rem; font-weight: 400;
          color: var(--log-text-sub);
          line-height: 1.6; margin: 0 0 32px;
          max-width: 400px;
        }
        .log-hero-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .log-hero-cta {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 16px 32px; border-radius: 999; border: none;
          background: var(--accent, #234DC2); color: #fff;
          font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700;
          text-decoration: none; cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .log-hero-cta:hover { opacity: 0.9; transform: translateY(-1px); }
        .log-hero-link {
          font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 600;
          color: var(--log-text); text-decoration: none;
          transition: opacity 0.2s;
        }
        .log-hero-link:hover { opacity: 0.7; }

        /* Tilted images — Pinterest exact style */
        .log-hero-right { flex-shrink: 0; position: relative; width: 380px; height: 360px; }
        .log-hero-img {
          position: absolute; border-radius: 20px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.25);
          border: 5px solid rgba(255,255,255,0.9);
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .log-hero-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .log-hero-img-1 { width: 240px; height: 300px; top: 0; left: 0; transform: rotate(-4deg); z-index: 1; }
        .log-hero-img-2 { width: 220px; height: 280px; top: 30px; left: 140px; transform: rotate(4deg); z-index: 2; }
        .log-hero-img-1:hover { transform: rotate(-2deg) scale(1.02); }
        .log-hero-img-2:hover { transform: rotate(2deg) scale(1.02); }
        [data-theme="light"] .log-hero-img { border-color: rgba(255,255,255,0.95); box-shadow: 0 16px 48px rgba(0,0,0,0.10); }

        /* ─── Mobile ──────────────────────────────────── */
        @media (max-width: 768px) {
          .log-page-root { padding: 0 16px 80px; }
          .log-hero {
            flex-direction: column-reverse; gap: 32px;
            padding: 32px 0 40px; text-align: center;
          }
          .log-hero-left { max-width: 100%; }
          .log-hero-title { font-size: clamp(2.2rem, 9vw, 3rem); margin-bottom: 14px; }
          .log-hero-subtitle { margin: 0 auto 24px; }
          .log-hero-actions { justify-content: center; }
          .log-hero-right {
            width: 280px; height: 260px;
            margin: 0 auto;
          }
          .log-hero-img-1 { width: 180px; height: 220px; left: 0; top: 0; }
          .log-hero-img-2 { width: 160px; height: 200px; left: 100px; top: 24px; }
          .log-hero-cta { padding: 14px 28px; font-size: 0.95rem; }
        }

        @media (prefers-reduced-motion: reduce) { .log-blob { animation: none; } }
      `}</style>

      <div className="log-content">
        {posts.length > 0 && (
          <div className="log-hero">
            <div className="log-hero-left">
              <h1 className="log-hero-title">{title}</h1>
              {subtitle && <p className="log-hero-subtitle">{subtitle}</p>}
              {(btn1Text || btn2Text) && (
                <div className="log-hero-actions">
                  {btn1Text && <Link href={btn1Url} className="log-hero-cta">{btn1Text}</Link>}
                  {btn2Text && <Link href={btn2Url} className="log-hero-link">{btn2Text}</Link>}
                </div>
              )}
            </div>
            {hasHeroImgs && (
              <div className="log-hero-right">
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
