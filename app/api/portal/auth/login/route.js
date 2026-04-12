import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { adminDb } from '@/lib/admin-firebase';
import { mintPortalToken } from '@/lib/portal-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sha256Hex(input) {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier || '').trim().toLowerCase();
    const password   = String(body.password   || '');
    const remember   = !!body.remember;

    if (!identifier || !password) {
      return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 });
    }

    // Look up by username first, then email. Username allows leading '@'.
    const cleanedUsername = identifier.replace(/^@/, '');
    let snap = await adminDb.collection('clients')
      .where('username', '==', cleanedUsername).limit(1).get();
    if (snap.empty && identifier.includes('@')) {
      snap = await adminDb.collection('clients')
        .where('email', '==', identifier).limit(1).get();
    }
    if (snap.empty) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const doc    = snap.docs[0];
    const client = doc.data();

    if (client.active === false) {
      return NextResponse.json({ ok: false, error: 'Account suspended' }, { status: 403 });
    }
    const hash = sha256Hex(password);
    if (hash !== client.passwordHash) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await mintPortalToken(
      { clientId: doc.id, username: client.username },
      remember
    );

    return NextResponse.json({
      ok: true,
      data: {
        token,
        client: {
          id:       doc.id,
          username: client.username,
          name:     client.name || '',
          email:    client.email || '',
          company:  client.company || '',
        },
      },
    });
  } catch (e) {
    console.error('portal login error:', e);
    return NextResponse.json({ ok: false, error: 'Login failed' }, { status: 500 });
  }
}
