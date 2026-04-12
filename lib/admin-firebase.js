// ─── Firebase Admin SDK initialization (lazy) ────────────────
//
// SERVER-ONLY. Never import from a client component.
//
// LAZY init: the SDK is instantiated on first call, NOT on module
// load. This matters because Next.js evaluates module-level code
// during build, when Vercel env vars may or may not be in scope.
// Lazy init guarantees we only read FIREBASE_ADMIN_KEY at request
// time, when env vars are definitely present.
//
// Get the service account from:
//   Firebase Console → Project Settings → Service accounts →
//   Generate new private key → save the JSON file → paste contents
//   into FIREBASE_ADMIN_KEY env var in Vercel.

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let _app  = null;
let _db   = null;
let _auth = null;

function loadServiceAccount() {
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) {
    throw new Error(
      'FIREBASE_ADMIN_KEY env var is missing. ' +
      'Add it in Vercel → Project Settings → Environment Variables. ' +
      'Value: the full service account JSON (single line, no NEXT_PUBLIC_ prefix).'
    );
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(
      'FIREBASE_ADMIN_KEY is not valid JSON. ' +
      'Make sure you pasted the entire service account file, ' +
      'including the outer { } braces.'
    );
  }
}

function init() {
  if (_app) return;
  _app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(loadServiceAccount()) });
  _db   = getFirestore(_app);
  _auth = getAuth(_app);
}

// Proxy objects that initialize on first property access
export const adminDb = new Proxy({}, {
  get(_, prop) {
    init();
    const v = _db[prop];
    return typeof v === 'function' ? v.bind(_db) : v;
  },
});

export const adminAuth = new Proxy({}, {
  get(_, prop) {
    init();
    const v = _auth[prop];
    return typeof v === 'function' ? v.bind(_auth) : v;
  },
});
