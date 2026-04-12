'use client';

// ─── Client-side helper for portal API calls ─────────────────
//
// Browser-only. Wraps fetch() so portal pages don't have to
// repeat the auth header / error handling on every call.
//
// Token storage: localStorage key 'portal_token' (JWT string).
// Replaces the old 'portal_session' JSON object.

const TOKEN_KEY = 'portal_token';

export function getPortalToken() {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setPortalToken(token) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function clearPortalToken() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    // Also clear the legacy session key from any old version of the portal
    localStorage.removeItem('portal_session');
  } catch {}
}

/**
 * Wrapped fetch for portal API calls.
 * - Adds Authorization: Bearer <token>
 * - Adds Content-Type for JSON bodies
 * - On 401: clears token and redirects to /portal/login (unless already there)
 * - Returns parsed JSON: { ok, data?, error? }
 */
export async function portalFetch(path, opts = {}) {
  const token = getPortalToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (opts.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res;
  try {
    res = await fetch(path, { ...opts, headers, cache: 'no-store' });
  } catch (e) {
    return { ok: false, error: 'Network error' };
  }

  if (res.status === 401) {
    clearPortalToken();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/portal/login')) {
      window.location.href = '/portal/login';
    }
    return { ok: false, error: 'unauthorized' };
  }

  let json;
  try {
    json = await res.json();
  } catch {
    return { ok: false, error: `HTTP ${res.status}` };
  }
  return json;
}
