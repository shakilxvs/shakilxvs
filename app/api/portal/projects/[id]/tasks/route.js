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

    const snap = await adminDb.collection('portal_tasks')
      .where('projectId', '==', params.id).get();
    const tasks = snap.docs
      .map(d => ({ id: d.id, ...serialize(d.data()) }))
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      });
    return NextResponse.json({ ok: true, data: tasks });
  } catch (e) {
    console.error('portal/tasks GET error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load tasks' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const own = await assertOwnsProject(session.clientId, params.id);
    if (!own.ok) return NextResponse.json({ ok: false, error: own.error }, { status: own.status });

    const perms = await getClientPerms(session.clientId);
    if (!perms.addTasks) {
      return NextResponse.json({ ok: false, error: 'Permission denied' }, { status: 403 });
    }

    const body  = await request.json().catch(() => ({}));
    const title = String(body.title || '').trim();
    if (!title) return NextResponse.json({ ok: false, error: 'Title required' }, { status: 400 });

    const docRef = await adminDb.collection('portal_tasks').add({
      projectId:  params.id,
      clientId:   session.clientId,
      title,
      status:     'Todo',
      assignedTo: 'client',
      createdAt:  FieldValue.serverTimestamp(),
    });
    const created = await docRef.get();
    return NextResponse.json({ ok: true, data: { id: docRef.id, ...serialize(created.data()) } });
  } catch (e) {
    console.error('portal/tasks POST error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to add task' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const own = await assertOwnsProject(session.clientId, params.id);
    if (!own.ok) return NextResponse.json({ ok: false, error: own.error }, { status: own.status });

    const perms = await getClientPerms(session.clientId);
    if (!perms.editTasks) {
      return NextResponse.json({ ok: false, error: 'Permission denied' }, { status: 403 });
    }

    const body   = await request.json().catch(() => ({}));
    const taskId = String(body.taskId || '');
    const status = String(body.status || '');
    if (!taskId || !['Todo', 'In Progress', 'Done'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 });
    }

    const taskSnap = await adminDb.collection('portal_tasks').doc(taskId).get();
    if (!taskSnap.exists || taskSnap.data().projectId !== params.id) {
      return NextResponse.json({ ok: false, error: 'Task not found' }, { status: 404 });
    }

    await adminDb.collection('portal_tasks').doc(taskId).update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true, data: { id: taskId, status } });
  } catch (e) {
    console.error('portal/tasks PATCH error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to update task' }, { status: 500 });
  }
}
