import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime  = 'nodejs';

/*
  GET /api/favicon?url=https://messifyxvs.vercel.app
  → { ok: true, faviconUrl: "https://messifyxvs.vercel.app/icon.abc123.png" }
  → { ok: true, faviconUrl: null }   when the target has no discoverable favicon

  Why this endpoint exists:
  Modern apps (including every Next.js 13+ app on Vercel) declare their favicon
  via <link rel="icon" href="/something.png"> in the HTML <head> — NOT at the
  legacy /favicon.ico path. A browser tab shows the right icon because the
  browser parses the HTML. Other origins can't do the same from the client
  (CORS blocks cross-origin HTML reads). So the favicon has to be resolved
  server-side where there's no CORS restriction, then handed back to the
  client as a plain URL the browser can load directly.
*/

// In-memory cache for the lifetime of this serverless instance. Vercel
// warm instances reuse this Map so repeat lookups for the same URL don't
// re-fetch. Cold starts reset it. 1-hour TTL keeps it fresh enough that
// updated favicons propagate within an hour without any manual cache bust.
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.value;
}
function setCached(key, value) {
  cache.set(key, { value, at: Date.now() });
}

// Browser-side cache hint. With server-side Map + browser cache together,
// the same app URL won't re-trigger an HTML fetch for an hour. If an app's
// favicon changes, the worst case is a 1-hour stale window, which is fine
// for a rarely-updated thing like a site favicon.
const BROWSER_CACHE = { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' };

/*
  Parse HTML for favicon declarations, in priority order:
    1. apple-touch-icon — typically the highest-quality version (180x180+)
    2. icon            — standard favicon declaration
    3. shortcut icon   — legacy but still common
  Each pattern is tried twice — once with rel-before-href, once with
  href-before-rel — because authoring tools and frameworks emit both forms.
  Returns resolved absolute URL or null.
*/
function parseFaviconFromHtml(html, baseUrl) {
  const patterns = [
    /<link\s[^>]*rel\s*=\s*["'](?:apple-touch-icon[^"']*)["'][^>]*href\s*=\s*["']([^"']+)["']/i,
    /<link\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["'](?:apple-touch-icon[^"']*)["']/i,
    /<link\s[^>]*rel\s*=\s*["']icon["'][^>]*href\s*=\s*["']([^"']+)["']/i,
    /<link\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']icon["']/i,
    /<link\s[^>]*rel\s*=\s*["']shortcut\s+icon["'][^>]*href\s*=\s*["']([^"']+)["']/i,
    /<link\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']shortcut\s+icon["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      try {
        // Resolve relative paths ("/icon.png") against the app's base URL.
        return new URL(match[1], baseUrl).href;
      } catch {
        // Malformed href — skip and keep trying.
      }
    }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = (searchParams.get('url') || '').trim();

  if (!targetUrl) {
    return NextResponse.json({ ok: false, error: 'missing url' }, { status: 400 });
  }
  // Only fetch public http(s) URLs. Blocks javascript:, data:, file:, etc.
  if (!/^https?:\/\//i.test(targetUrl)) {
    return NextResponse.json({ ok: true, faviconUrl: null }, { headers: BROWSER_CACHE });
  }

  // Cache hit — skip the fetch.
  const cached = getCached(targetUrl);
  if (cached !== null) {
    return NextResponse.json({ ok: true, faviconUrl: cached }, { headers: BROWSER_CACHE });
  }

  try {
    // 5-second timeout — don't block the page forever on a slow target.
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; shakilxvs-favicon-bot/1.0; +https://shakilxvs.com)',
        'Accept':     'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    if (!response.ok || !response.body) {
      setCached(targetUrl, null);
      return NextResponse.json({ ok: true, faviconUrl: null }, { headers: BROWSER_CACHE });
    }

    // Read just the first ~50 KB — enough to see the full <head> on any sane
    // site, avoids downloading the entire page (which could be megabytes).
    const reader  = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let html      = '';
    let bytesRead = 0;
    const MAX_BYTES = 50_000;
    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html      += decoder.decode(value, { stream: true });
      bytesRead += value.length;
      // Stop as soon as </head> appears — everything after it is irrelevant.
      if (html.includes('</head>')) break;
    }
    try { reader.cancel(); } catch { /* ignore */ }

    // Primary: parse <link rel="icon"> etc. from the HTML head.
    // Fallback: default /favicon.ico — many older sites only have this.
    // We always return a candidate URL and let the client-side Image-preload
    // verifier decide if it actually loads. Returning null means "we know
    // for sure there's no favicon" — right now we only return null when the
    // target is unreachable.
    const parsedUrl  = parseFaviconFromHtml(html, targetUrl);
    const defaultUrl = new URL('/favicon.ico', targetUrl).href;
    const faviconUrl = parsedUrl || defaultUrl;

    setCached(targetUrl, faviconUrl);
    return NextResponse.json({ ok: true, faviconUrl }, { headers: BROWSER_CACHE });
  } catch {
    // Network error, timeout, DNS failure — all resolve to null so the
    // client falls through to the letter fallback.
    setCached(targetUrl, null);
    return NextResponse.json({ ok: true, faviconUrl: null }, { headers: BROWSER_CACHE });
  }
}
