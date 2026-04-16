import { redirect } from 'next/navigation';
import { getLogSettings, getPublishedLogPosts } from '@/lib/firestore';
import LogFeed from '@/components/log/LogFeed';

export const dynamic = 'force-dynamic';

// ─── Serialize Firestore Timestamps before passing to client ───
// Server components can fetch Firestore data, but any Timestamp
// object it returns is a class instance — not serializable through
// the server→client boundary. Strip to { seconds, nanoseconds }
// (plain objects) so React can pass them into LogFeed safely.
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
    // Feature hidden — return neutral metadata so if a crawler
    // somehow finds /log while disabled, nothing indexes.
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

  // If the feature is disabled, bounce to homepage. This runs
  // server-side so no /log content ever flashes for a user.
  if (!settings?.page_enabled) redirect('/');

  const posts    = rawPosts.map(serializePost);
  const title    = settings.page_title    || 'log';
  const subtitle = settings.page_subtitle || '';

  return (
    <div className="log-page-root">
      {/* Ambient background — drifting blobs + grain */}
      <div className="log-bg" aria-hidden="true">
        <div className="log-blob log-blob-1"/>
        <div className="log-blob log-blob-2"/>
        <div className="log-blob log-blob-3"/>
        <div className="log-grain"/>
      </div>

      {/* Page scoped styles — keep them here so /log has a
          completely distinct visual world from the rest of the site */}
      <style>{`
        .log-page-root {
          position: relative;
          min-height: 100vh;
          background: #0a0a0a;
          color: #e8e8ea;
          padding: 72px 24px 120px;
          overflow-x: hidden;
        }
        .log-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          overflow: hidden;
        }
        .log-blob {
          position: absolute;
          width: 520px; height: 520px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.12;
          will-change: transform;
          animation: log-blob-drift 28s ease-in-out infinite alternate;
        }
        .log-blob-1 { background: #3b2f8a; top: -120px; left: -100px;
          animation-duration: 34s; }
        .log-blob-2 { background: #b87333; bottom: -160px; right: -120px;
          animation-duration: 42s; animation-delay: -12s; opacity: 0.10; }
        .log-blob-3 { background: #2f8a7a; top: 40%; left: 55%;
          animation-duration: 50s; animation-delay: -24s; opacity: 0.09; }
        @keyframes log-blob-drift {
          0%   { transform: translate(0, 0)    scale(1);    }
          33%  { transform: translate(80px, -60px) scale(1.08); }
          66%  { transform: translate(-60px, 70px) scale(0.95); }
          100% { transform: translate(40px, 30px)  scale(1.04); }
        }
        .log-grain {
          position: absolute; inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
        .log-content { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; }
        .log-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(3.5rem, 9vw, 6rem);
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: #f4f4f5;
          margin: 0;
          font-weight: 400;
        }
        .log-subtitle {
          font-family: 'DM Sans', 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: rgba(232,232,234,0.55);
          margin-top: 14px;
          max-width: 540px;
          line-height: 1.6;
        }
        @media (prefers-reduced-motion: reduce) {
          .log-blob { animation: none; }
        }
      `}</style>

      <div className="log-content">
        {posts.length > 0 && (
          <header style={{ marginBottom: '56px' }}>
            <h1 className="log-title">{title}</h1>
            {subtitle && <p className="log-subtitle">{subtitle}</p>}
          </header>
        )}

        <LogFeed initialPosts={posts}/>
      </div>
    </div>
  );
}
