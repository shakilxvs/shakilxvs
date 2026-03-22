import { NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, service, rating, text, videoUrl, country, countryFlag } = body;

    if (!name || !email || !rating || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    await addDoc(collection(db, 'reviews_pending'), {
      name,
      email,
      service: service || '',
      rating: Number(rating),
      text,
      videoUrl: videoUrl || '',
      country: country || '',
      countryFlag: countryFlag || '',
      verified: false,
      status: 'pending',
      submittedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
