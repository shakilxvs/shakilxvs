import { redirect } from 'next/navigation';
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

  const posts    = rawPosts.map(serializePost);
  const title    = settings.page_title    || 'log';
  const subtitle = settings.page_subtitle || '';

  return (
    <div className="log-page-root">
      {/* Ambient background */}
      <div className="log-bg" aria-hidden="true">
        <div className="log-blob log-blob-1"/>
        <div className="log-blob log-blob-2"/>
        <div className="log-blob log-blob-3"/>
        <div className="log-grain"/>
      </div>

      <style>{`
        /* ─── Theme tokens (dark default) ────────────── */
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
        }

        /* ─── Page shell ─────────────────────────────── */
        .log-page-root {
          position: relative;
          min-height: 100vh;
          background: var(--log-bg);
          color: var(--log-text);
          padding: 60px 24px 120px;
          overflow-x: hidden;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ─── Ambient blobs ──────────────────────────── */
        .log-bg {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 0; overflow: hidden;
        }
        .log-blob {
          position: absolute;
          width: 520px; height: 520px; border-radius: 50%;
          filter: blur(120px); opacity: 0.12;
          will-change: transform;
          animation: log-blob-drift 28s ease-in-out infinite alternate;
        }
        .log-blob-1 { background: var(--log-blob1); top: -120px; left: -100px;
          animation-duration: 34s; }
        .log-blob-2 { background: var(--log-blob2); bottom: -160px; right: -120px;
          animation-duration: 42s; animation-delay: -12s; opacity: 0.10; }
        .log-blob-3 { background: var(--log-blob3); top: 40%; left: 55%;
          animation-duration: 50s; animation-delay: -24s; opacity: 0.09; }
        @keyframes log-blob-drift {
          0%   { transform: translate(0, 0)    scale(1);    }
          33%  { transform: translate(80px, -60px) scale(1.08); }
          66%  { transform: translate(-60px, 70px) scale(0.95); }
          100% { transform: translate(40px, 30px)  scale(1.04); }
        }
        .log-grain {
          position: absolute; inset: 0;
          opacity: var(--log-grain-opacity);
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* ─── Content wrapper ────────────────────────── */
        .log-content {
          position: relative; z-index: 1;
          max-width: 1240px; margin: 0 auto;
        }

        /* ─── Title — animated gradient shimmer ──────── */
        .log-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(4rem, 10vw, 7rem);
          line-height: 0.92;
          letter-spacing: -0.03em;
          margin: 0;
          font-weight: 400;
          background: linear-gradient(
            135deg,
            var(--log-text) 0%,
            var(--log-gradient-1) 25%,
            var(--log-gradient-2) 50%,
            var(--log-gradient-3) 75%,
            var(--log-text) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: log-title-shimmer 8s ease-in-out infinite;
        }
        @keyframes log-title-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }

        /* ─── Accent line under title ────────────────── */
        .log-accent-line {
          width: 60px; height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--log-gradient-1), var(--log-gradient-2));
          margin-top: 20px;
          opacity: 0.7;
        }

        /* ─── Subtitle ───────────────────────────────── */
        .log-subtitle {
          font-family: 'DM Sans', 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: var(--log-text-sub);
          margin-top: 16px;
          max-width: 540px;
          line-height: 1.6;
          font-style: italic;
        }

        @media (prefers-reduced-motion: reduce) {
          .log-blob { animation: none; }
          .log-title { animation: none; background-size: 100% 100%; }
        }
        @media (max-width: 640px) {
          .log-page-root { padding: 40px 14px 80px; }
        }
      `}</style>

      <div className="log-content">
        {posts.length > 0 && (
          <header style={{ marginBottom: '52px' }}>
            <h1 className="log-title">{title}</h1>
            <div className="log-accent-line"/>
            {subtitle && <p className="log-subtitle">{subtitle}</p>}
          </header>
        )}

        <LogFeed initialPosts={posts}/>
      </div>
    </div>
  );
}
