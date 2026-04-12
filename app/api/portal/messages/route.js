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

export async function GET(request) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const snap = await adminDb.collection('portal_messages')
      .where('clientId', '==', session.clientId).get();
    const messages = snap.docs
      .map(d => ({ id: d.id, ...serialize(d.data()) }))
      .sort((a, b) => {
        const ta = a.sentAt ? new Date(a.sentAt).getTime() : 0;
        const tb = b.sentAt ? new Date(b.sentAt).getTime() : 0;
        return ta - tb;
      });
    return NextResponse.json({ ok: true, data: messages });
  } catch (e) {
    console.error('portal/messages GET error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load messages' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const body = await request.json().catch(() => ({}));
    const text = String(body.text || '').trim();
    if (!text) return NextResponse.json({ ok: false, error: 'Empty message' }, { status: 400 });
    if (text.length > 5000) {
      return NextResponse.json({ ok: false, error: 'Message too long' }, { status: 400 });
    }

    const docRef = await adminDb.collection('portal_messages').add({
      clientId: session.clientId,
      text,
      from:     'client',
      read:     false,
      sentAt:   FieldValue.serverTimestamp(),
    });
    const created = await docRef.get();
    return NextResponse.json({ ok: true, data: { id: docRef.id, ...serialize(created.data()) } });
  } catch (e) {
    console.error('portal/messages POST error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to send' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const body = await request.json().catch(() => ({}));
    const messageId = String(body.messageId || '');
    if (!messageId) return NextResponse.json({ ok: false, error: 'Bad input' }, { status: 400 });

    const msgSnap = await adminDb.collection('portal_messages').doc(messageId).get();
    if (!msgSnap.exists) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }
    const msg = msgSnap.data();
    // Must belong to this client AND be from admin (can't mark your own outgoing as read)
    if (msg.clientId !== session.clientId || msg.from !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Not allowed' }, { status: 403 });
    }
    await adminDb.collection('portal_messages').doc(messageId).update({ read: true });
    return NextResponse.json({ ok: true, data: { id: messageId } });
  } catch (e) {
    console.error('portal/messages PATCH error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to update' }, { status: 500 });
  }
}
