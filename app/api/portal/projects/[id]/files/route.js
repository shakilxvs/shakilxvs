import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
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

async function assertOwnsProject(clientId, projectId) {
  const snap = await adminDb.collection('portal_projects').doc(projectId).get();
  if (!snap.exists) return { ok: false, status: 404, error: 'Project not found' };
  if (snap.data().clientId !== clientId) {
    return { ok: false, status: 403, error: 'forbidden' };
  }
  return { ok: true };
}

async function getClientPerms(clientId) {
  const c = await adminDb.collection('clients').doc(clientId).get();
  return (c.exists && c.data().permissions) || {};
}

export async function GET(request, { params }) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const own = await assertOwnsProject(session.clientId, params.id);
    if (!own.ok) return NextResponse.json({ ok: false, error: own.error }, { status: own.status });

    const snap = await adminDb.collection('portal_files')
      .where('projectId', '==', params.id).get();
    const files = snap.docs
      .map(d => ({ id: d.id, ...serialize(d.data()) }))
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    return NextResponse.json({ ok: true, data: files });
  } catch (e) {
    console.error('portal/files GET error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load files' }, { status: 500 });
  }
}

// Records a file metadata row after the browser has uploaded the actual
// file to Cloudinary directly. The browser sends { name, url, size }.
export async function POST(request, { params }) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const own = await assertOwnsProject(session.clientId, params.id);
    if (!own.ok) return NextResponse.json({ ok: false, error: own.error }, { status: own.status });

    const perms = await getClientPerms(session.clientId);
    if (!perms.uploadFiles) {
      return NextResponse.json({ ok: false, error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    const url  = String(body.url  || '').trim();
    const size = Number(body.size || 0);

    if (!name || !url) {
      return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 });
    }
    // Sanity check: URL must be from Cloudinary (we control upload preset)
    if (!url.startsWith('https://res.cloudinary.com/')) {
      return NextResponse.json({ ok: false, error: 'Invalid file URL' }, { status: 400 });
    }

    const docRef = await adminDb.collection('portal_files').add({
      projectId:  params.id,
      clientId:   session.clientId,
      name,
      url,
      size,
      uploadedBy: 'client',
      createdAt:  FieldValue.serverTimestamp(),
    });
    const created = await docRef.get();
    return NextResponse.json({ ok: true, data: { id: docRef.id, ...serialize(created.data()) } });
  } catch (e) {
    console.error('portal/files POST error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to add file' }, { status: 500 });
  }
}
