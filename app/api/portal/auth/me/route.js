import { NextResponse } from 'next/server';
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
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const snap = await adminDb.collection('clients').doc(session.clientId).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: 'Client not found' }, { status: 404 });
    }
    const data = snap.data();
    if (data.active === false) {
      return NextResponse.json({ ok: false, error: 'Account suspended' }, { status: 403 });
    }
    return NextResponse.json({ ok: true, data: sanitizeClient(snap.id, data) });
  } catch (e) {
    console.error('portal/auth/me error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load' }, { status: 500 });
  }
}
