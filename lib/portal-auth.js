// ─── Portal JWT auth helpers ─────────────────────────────────
//
// SERVER-ONLY. Never import from a client component.
//
// Mints and verifies signed JWTs for portal sessions. The token
// payload contains { clientId, username }. The signature is
// computed with PORTAL_JWT_SECRET and cannot be forged without
// the secret — so even if a client edits their localStorage
// to change clientId, verification fails on the server.
//
// Requires PORTAL_JWT_SECRET env var. Generate one with:
//   openssl rand -base64 48

import { SignJWT, jwtVerify } from 'jose';

const ALG = 'HS256';

function getSecret() {
  const raw = (process.env.PORTAL_JWT_SECRET || '').trim();
  if (!raw || raw.length < 32) {
    throw new Error(
      'PORTAL_JWT_SECRET env var is missing or too short. ' +
      'Add it in Vercel → Project Settings → Environment Variables. ' +
      'Generate one with: openssl rand -base64 48 (no NEXT_PUBLIC_ prefix).'
    );
  }
  return new TextEncoder().encode(raw);
}

/**
 * Sign a portal session token.
 * @param {Object} payload - { clientId, username }
 * @param {boolean} remember - if true, 30-day expiry; otherwise 1-day
 * @returns {Promise<string>} JWT
 */
export async function mintPortalToken(payload, remember = false) {
  const expiresIn = remember ? '30d' : '1d';
  return await new SignJWT({
    clientId: payload.clientId,
    username: payload.username,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer('shakilxvs-portal')
    .setAudience('shakilxvs-portal-client')
    .sign(getSecret());
}

/**
 * Verify a portal session token.
 * @param {string} token - JWT from Authorization header
 * @returns {Promise<{clientId: string, username: string} | null>}
 *          Returns null on any verification failure.
 */
export async function verifyPortalToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
      issuer: 'shakilxvs-portal',
      audience: 'shakilxvs-portal-client',
    });
    if (!payload.clientId || !payload.username) return null;
    return { clientId: payload.clientId, username: payload.username };
  } catch {
    return null;
  }
}

export function getBearerToken(request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function getPortalSession(request) {
  const token = getBearerToken(request);
  if (!token) return null;
  return await verifyPortalToken(token);
}
