'use client';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/firestore';
export default function TrackPage({ page }) {
  useEffect(() => { trackPageView(page); }, [page]);
  return null;
}
