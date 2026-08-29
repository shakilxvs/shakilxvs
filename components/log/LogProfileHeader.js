// Server component — no 'use client'. Renders as plain HTML so crawlers
// (and users with JS disabled) see the full profile bar, name, bio, and
// social links immediately. This is the main on-page place we want the
// words "Shakil Ahmed" / "shakilxvs" to appear as real, visible, crawlable
// text — that's what search engines actually weight, not meta tags alone.

const SOCIAL_ICON_PATHS = {
  instagram: 'M12 2.2c2.9 0 3.3 0 4.4.06 1.2.06 1.9.24 2.4.44a4.8 4.8 0 0 1 1.8 1.15 4.8 4.8 0 0 1 1.15 1.8c.2.5.38 1.2.44 2.4.06 1.1.06 1.5.06 4.4s0 3.3-.06 4.4c-.06 1.2-.24 1.9-.44 2.4a4.8 4.8 0 0 1-1.15 1.8 4.8 4.8 0 0 1-1.8 1.15c-.5.2-1.2.38-2.4.44-1.1.06-1.5.06-4.4.06s-3.3 0-4.4-.06c-1.2-.06-1.9-.24-2.4-.44a4.8 4.8 0 0 1-1.8-1.15 4.8 4.8 0 0 1-1.15-1.8c-.2-.5-.38-1.2-.44-2.4C2.2 15.3 2.2 14.9 2.2 12s0-3.3.06-4.4c.06-1.2.24-1.9.44-2.4a4.8 4.8 0 0 1 1.15-1.8A4.8 4.8 0 0 1 5.65 2.25c.5-.2 1.2-.38 2.4-.44C9.15 2.2 9.55 2.2 12 2.2zm0 1.8c-2.85 0-3.2 0-4.32.06-.98.05-1.5.2-1.86.34-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.3.88-.34 1.86C3.5 8.8 3.5 9.15 3.5 12s0 3.2.06 4.32c.05.98.2 1.5.34 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.88.3 1.86.34 1.12.06 1.47.06 4.32.06s3.2 0 4.32-.06c.98-.05 1.5-.2 1.86-.34.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.3-.88.34-1.86.06-1.12.06-1.47.06-4.32s0-3.2-.06-4.32c-.05-.98-.2-1.5-.34-1.86a3.03 3.03 0 0 0-.75-1.15 3.03 3.03 0 0 0-1.15-.75c-.36-.14-.88-.3-1.86-.34C15.2 4 14.85 4 12 4zm0 3.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zm0 1.8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2zm4.6-2.05a1.03 1.03 0 1 1 0 2.06 1.03 1.03 0 0 1 0-2.06z',
  twitter: 'M18.9 2H22l-7.4 8.5L23.3 22h-6.8l-5.3-6.9L5 22H1.9l7.9-9L1 2h7l4.8 6.3zm-1.2 18h1.9L7.4 4H5.4z',
  facebook: 'M14 9V6.5c0-.8.6-1.5 1.5-1.5H17V2h-2.5A4.5 4.5 0 0 0 10 6.5V9H7v3.5h3V22h4v-9.5h3l1-3.5h-4z',
  linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.85-2.05 3.8-2.05 4.07 0 4.82 2.68 4.82 6.17V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.86V21h-4z',
  tiktok: 'M13.5 2h3.2c.15 1.6 1.35 3.14 2.9 3.7.6.22 1.25.34 1.9.36v3.3a7.7 7.7 0 0 1-4.7-1.6v6.9a6.44 6.44 0 1 1-6.44-6.44c.26 0 .5.02.76.06v3.36a3.1 3.1 0 1 0 2.38 3.02z',
};

function SocialDot({ href, label, path }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="lph-social"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
    </a>
  );
}

export default function LogProfileHeader({
  name,
  handle,
  bio,
  avatarUrl,
  postCount,
  totalViews,
  sinceYear,
  socials = {},
  ctaHref = '/contact',
  ctaText = 'Hire Me',
}) {
  const initial = (name?.[0] || 'S').toUpperCase();
  const stats = [
    postCount > 0 ? { label: postCount === 1 ? 'Post' : 'Posts', value: postCount } : null,
    totalViews > 0 ? { label: totalViews === 1 ? 'View' : 'Views', value: formatCompact(totalViews) } : null,
    sinceYear ? { label: 'Since', value: sinceYear } : null,
  ].filter(Boolean);

  return (
    <div className="lph">
      <style>{`
        .lph {
          display: flex; align-items: center; gap: 18px;
          padding: 18px 20px;
          margin-bottom: 28px;
          background: var(--log-card-bg, #141414);
          border: 1px solid var(--log-card-border, rgba(255,255,255,0.07));
          border-radius: 18px;
          flex-wrap: wrap;
        }
        .lph-avatar {
          width: 60px; height: 60px; border-radius: 50%;
          flex-shrink: 0; overflow: hidden;
          border: 2px solid var(--accent, #234DC2);
          display: flex; align-items: center; justify-content: center;
          background: var(--accent-muted, rgba(35,77,194,0.1));
        }
        .lph-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lph-avatar-fallback {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem; color: var(--accent, #234DC2);
        }
        .lph-mid { flex: 1; min-width: 220px; }
        .lph-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .lph-name {
          font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.05rem;
          color: var(--log-text, #f4f4f5); letter-spacing: -0.01em;
        }
        .lph-badge { color: #2dd4bf; display: inline-flex; flex-shrink: 0; }
        .lph-handle {
          font-family: 'Space Mono', monospace; font-size: 0.72rem;
          color: var(--accent, #234DC2);
        }
        .lph-bio {
          font-family: 'Outfit', sans-serif; font-size: 0.82rem; line-height: 1.5;
          color: var(--log-text-sub, rgba(232,232,234,0.6)); margin-top: 4px; max-width: 480px;
        }
        .lph-stats {
          display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap;
        }
        .lph-stat {
          font-family: 'Outfit', sans-serif; font-size: 0.76rem;
          color: var(--log-text-sub, rgba(232,232,234,0.55));
        }
        .lph-stat b { color: var(--log-text, #f4f4f5); font-weight: 700; }
        .lph-right {
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
          margin-left: auto;
        }
        .lph-socials { display: flex; gap: 6px; }
        .lph-social {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: var(--log-pill-bg, rgba(255,255,255,0.04));
          border: 1px solid var(--log-pill-border, rgba(255,255,255,0.08));
          color: var(--log-pill-text, rgba(232,232,234,0.72));
          text-decoration: none; transition: color .15s, border-color .15s;
        }
        .lph-social:hover { color: var(--accent, #234DC2); border-color: var(--accent-border, rgba(35,77,194,0.35)); }
        .lph-cta {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 9px 18px; border-radius: 999px;
          background: var(--accent, #234DC2); color: #fff;
          font-family: 'Outfit', sans-serif; font-size: 0.8rem; font-weight: 700;
          text-decoration: none; white-space: nowrap; transition: opacity .15s;
        }
        .lph-cta:hover { opacity: 0.88; }

        @media (max-width: 640px) {
          .lph { padding: 16px; gap: 14px; }
          .lph-avatar { width: 52px; height: 52px; }
          .lph-right { width: 100%; margin-left: 0; justify-content: space-between; }
        }
      `}</style>

      <div className="lph-avatar">
        {avatarUrl
          ? <img src={avatarUrl} alt={`${name} — ${handle}`} loading="eager" />
          : <span className="lph-avatar-fallback">{initial}</span>}
      </div>

      <div className="lph-mid">
        <div className="lph-name-row">
          <span className="lph-name">{name}</span>
          <span className="lph-badge" aria-label="Verified">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </span>
          <span className="lph-handle">{handle}</span>
        </div>
        {bio && <p className="lph-bio">{bio}</p>}
        {stats.length > 0 && (
          <div className="lph-stats">
            {stats.map(s => (
              <span key={s.label} className="lph-stat"><b>{s.value}</b> {s.label}</span>
            ))}
          </div>
        )}
      </div>

      <div className="lph-right">
        <div className="lph-socials">
          <SocialDot href={socials.instagram} label="Instagram" path={SOCIAL_ICON_PATHS.instagram} />
          <SocialDot href={socials.twitter}   label="Twitter / X" path={SOCIAL_ICON_PATHS.twitter} />
          <SocialDot href={socials.facebook}  label="Facebook" path={SOCIAL_ICON_PATHS.facebook} />
          <SocialDot href={socials.tiktok}    label="TikTok" path={SOCIAL_ICON_PATHS.tiktok} />
          <SocialDot href={socials.linkedin}  label="LinkedIn" path={SOCIAL_ICON_PATHS.linkedin} />
        </div>
        {ctaHref && ctaText && <a href={ctaHref} className="lph-cta">{ctaText}</a>}
      </div>
    </div>
  );
}

function formatCompact(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}
