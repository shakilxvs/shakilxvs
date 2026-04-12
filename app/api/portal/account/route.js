import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/admin-firebase';
import { getPortalSession } from '@/lib/portal-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sanitizeClient(id, data) {
  const {
    passwordHash, passwordPlain, notes, internalNotes,
    ...safe
  } = data || {};
  return { id, ...safe };
}

export async function GET(request) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const snap = await adminDb.collection('clients').doc(session.clientId).get();
    if (!snap.exists) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: sanitizeClient(snap.id, snap.data()) });
  } catch (e) {
    console.error('portal/account GET error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load' }, { status: 500 });
  }
}

// Whitelist of fields the client may edit themselves.
// EVERYTHING ELSE is ignored — including username, passwordHash, permissions, active, role.
const ALLOWED_FIELDS = ['name', 'phone', 'country'];

export async function PATCH(request) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const body = await request.json().catch(() => ({}));
    const update = {};
    for (const key of ALLOWED_FIELDS) {
      if (typeof body[key] === 'string') {
        update[key] = body[key].trim().slice(0, 200);
      }
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: 'Nothing to update' }, { status: 400 });
    }
    update.updatedAt = FieldValue.serverTimestamp();
    await adminDb.collection('clients').doc(session.clientId).update(update);

    const snap = await adminDb.collection('clients').doc(session.clientId).get();
    return NextResponse.json({ ok: true, data: sanitizeClient(snap.id, snap.data()) });
  } catch (e) {
    console.error('portal/account PATCH error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to update' }, { status: 500 });
  }
}
