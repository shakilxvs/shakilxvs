import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin-firebase';
import { getPortalSession } from '@/lib/portal-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const session = await getPortalSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const snap = await adminDb.collection('portfolio').doc('siteSettings').get();
    const sender = (snap.exists && snap.data().invoiceSender) || {};
    return NextResponse.json({ ok: true, data: sender });
  } catch (e) {
    console.error('portal/invoices/sender error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to load' }, { status: 500 });
  }
}
