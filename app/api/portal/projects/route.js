import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-firebase';
import { getPortalSession } from '@/lib/portal-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function serialize(data) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (v && typeof v === 'object' && typeof v.toDate === 'function') {
      out[k] = v.toDate().toISOString();
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function GET(request) {
  const session = await getPortalSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  try {
    const snap = await adminDb.collection('portal_projects')
      .where('clientId', '==', session.clientId).get();
    const projects = snap.docs
      .map(d => ({ id: d.id, ...serialize(d.data()) }))
      // Strip internal-only field that should never go to client
      .map(({ internalNotes, ...rest }) => rest)
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    return NextResponse.json({ ok: true, data: projects });
  } catch (e) {
    console.error('portal/projects GET error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load projects' }, { status: 500 });
  }
}
