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
  const subtitle = settings.page_subtitle || 'A personal feed of fragments.';
  return {
    title: `${title} — shakilxvs`,
    description: subtitle,
    alternates: { canonical: 'https://shakilxvs.com/log' },
    openGraph: {
      title: `${title} — shakilxvs`,
      description: subtitle,
      url: 'https://shakilxvs.com/log',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — shakilxvs`,
      description: subtitle,
    },
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
  const hasHeroImgs = !!(heroImg1 && heroImg2);

  return (
    <div className="log-page-root">
      <div className="log-bg" aria-hidden="true">
        <div className="log-blob log-blob-1"/>
        <div className="log-blob log-blob-2"/>
        <div className="log-blob log-blob-3"/>
        <div className="log-grain"/>
      </div>

      <style>{`
        :root {
          --log-bg: #0a0a0a;
          --log-text: #f4f4f5;
          --log-text-sub: rgba(232,232,234,0.55);
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
          --log-blob1: #3b2f8a;
          --log-blob2: #b87333;
          --log-blob3: #2f8a7a;
          --log-grain-opacity: 0.03;
          --log-gradient-1: var(--accent, #234DC2);
          --log-gradient-2: #a78bfa;
          --log-gradient-3: #f9a8d4;
          --log-btn-bg: var(--accent, #234DC2);
          --log-btn-ghost-border: rgba(255,255,255,0.12);
          --log-btn-ghost-text: rgba(232,232,234,0.85);
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
          --log-blob1: rgba(35,77,194,0.15);
          --log-blob2: rgba(234,179,8,0.12);
          --log-blob3: rgba(16,185,129,0.10);
          --log-grain-opacity: 0.015;
          --log-gradient-1: var(--accent, #234DC2);
          --log-gradient-2: #7c3aed;
          --log-gradient-3: #ec4899;
          --log-btn-bg: var(--accent, #234DC2);
          --log-btn-ghost-border: rgba(0,0,0,0.12);
          --log-btn-ghost-text: var(--text-1, #0d1117);
        }

        .log-page-root {
          position: relative; min-height: 100vh;
          background: var(--log-bg); color: var(--log-text);
          padding: 0 24px 120px; overflow-x: hidden;
          transition: background 0.3s ease, color 0.3s ease;
        }
        .log-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .log-blob { position: absolute; width: 520px; height: 520px; border-radius: 50%; filter: blur(120px); opacity: 0.12; will-change: transform; animation: log-blob-drift 28s ease-in-out infinite alternate; }
        .log-blob-1 { background: var(--log-blob1); top: -120px; left: -100px; animation-duration: 34s; }
        .log-blob-2 { background: var(--log-blob2); bottom: -160px; right: -120px; animation-duration: 42s; animation-delay: -12s; opacity: 0.10; }
        .log-blob-3 { background: var(--log-blob3); top: 40%; left: 55%; animation-duration: 50s; animation-delay: -24s; opacity: 0.09; }
        @keyframes log-blob-drift {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(80px, -60px) scale(1.08); }
          66%  { transform: translate(-60px, 70px) scale(0.95); }
          100% { transform: translate(40px, 30px) scale(1.04); }
        }
        .log-grain { position: absolute; inset: 0; opacity: var(--log-grain-opacity); background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; }

        .log-content { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; }

        /* ─── Hero ────────────────────────────────────── */
        .log-hero { display: flex; align-items: center; gap: 56px; padding: 80px 0 60px; min-height: 320px; }
        .log-hero-left { flex: 1; min-width: 0; }
        .log-hero-right { flex: 0 0 380px; position: relative; height: 320px; }
        .log-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(4rem, 10vw, 7rem); line-height: 0.92; letter-spacing: -0.03em;
          margin: 0; font-weight: 400;
          background: linear-gradient(135deg, var(--log-text) 0%, var(--log-gradient-1) 25%, var(--log-gradient-2) 50%, var(--log-gradient-3) 75%, var(--log-text) 100%);
          background-size: 300% 100%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: log-title-shimmer 8s ease-in-out infinite;
        }
        @keyframes log-title-shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .log-accent-line { width: 56px; height: 3px; border-radius: 2px; background: linear-gradient(90deg, var(--log-gradient-1), var(--log-gradient-2)); margin-top: 22px; opacity: 0.7; }
        .log-subtitle { font-family: 'DM Sans', 'Outfit', sans-serif; font-size: 1rem; color: var(--log-text-sub); margin-top: 18px; max-width: 420px; line-height: 1.6; font-style: italic; }
        .log-hero-btns { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; }
        .log-hero-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 999; font-family: 'DM Sans', 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: opacity 0.2s, transform 0.2s; }
        .log-hero-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .log-hero-btn-primary { background: var(--log-btn-bg); color: #fff; border: none; }
        .log-hero-btn-ghost { background: transparent; color: var(--log-btn-ghost-text); border: 1px solid var(--log-btn-ghost-border); }

        /* Tilted images */
        .log-hero-img { position: absolute; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); border: 4px solid rgba(255,255,255,0.85); transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        .log-hero-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .log-hero-img-1 { width: 230px; height: 290px; top: 0; left: 20px; transform: rotate(-6deg); z-index: 1; }
        .log-hero-img-2 { width: 210px; height: 270px; top: 20px; left: 120px; transform: rotate(5deg); z-index: 2; }
        .log-hero-img-1:hover { transform: rotate(-3deg) scale(1.03); }
        .log-hero-img-2:hover { transform: rotate(2deg) scale(1.03); }
        [data-theme="light"] .log-hero-img { border-color: rgba(0,0,0,0.08); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }

        @media (max-width: 768px) {
          .log-page-root { padding: 0 14px 80px; }
          .log-hero { flex-direction: column-reverse; gap: 28px; padding: 40px 0 36px; min-height: auto; align-items: center; text-align: center; }
          .log-hero-left { display: flex; flex-direction: column; align-items: center; }
          .log-accent-line { margin-left: auto; margin-right: auto; }
          .log-hero-right { flex: none; width: 100%; height: 200px; display: flex; justify-content: center; align-items: flex-start; }
          .log-hero-img-1 { width: 150px; height: 190px; top: 0; left: auto; position: relative; margin-right: -28px; }
          .log-hero-img-2 { width: 140px; height: 180px; top: 16px; right: auto; position: relative; }
          .log-title { font-size: clamp(3rem, 12vw, 4.5rem); }
          .log-subtitle { margin-left: auto; margin-right: auto; }
          .log-hero-btns { margin-top: 22px; justify-content: center; }
          .log-hero-btn { padding: 10px 22px; font-size: 0.82rem; }
        }
        @media (prefers-reduced-motion: reduce) { .log-blob { animation: none; } .log-title { animation: none; background-size: 100% 100%; } }
      `}</style>

      <div className="log-content">
        {posts.length > 0 && (
          <div className="log-hero">
            <div className="log-hero-left">
              <h1 className="log-title">{title}</h1>
              <div className="log-accent-line"/>
              {subtitle && <p className="log-subtitle">{subtitle}</p>}
              <div className="log-hero-btns">
                <Link href="/blog" className="log-hero-btn log-hero-btn-primary">Blog</Link>
                <Link href="/contact" className="log-hero-btn log-hero-btn-ghost">Contact</Link>
              </div>
            </div>
            {hasHeroImgs && (
              <div className="log-hero-right">
                <div className="log-hero-img log-hero-img-1"><img src={heroImg1} alt=""/></div>
                <div className="log-hero-img log-hero-img-2"><img src={heroImg2} alt=""/></div>
              </div>
            )}
          </div>
        )}
        <LogFeed initialPosts={posts}/>
      </div>
    </div>
  );
}
