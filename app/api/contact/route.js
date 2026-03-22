import { NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, service, budget, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await addDoc(collection(db, 'messages'), {
      name,
      email,
      service: service || '',
      budget: budget || '',
      message,
      read: false,
      starred: false,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
