'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/admin/hero');
      }
    });
    return () => unsub();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Sign in error:', e);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-void)',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Admin Access
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: 'var(--text-1)', marginBottom: '8px' }}>
          SHAKIL CMS
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '40px' }}>
          Sign in with your admin Google account
        </div>
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <div style={{ marginTop: '24px', fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>
          Only {process.env.NEXT_PUBLIC_ADMIN_EMAIL} can access this panel
        </div>
      </div>
    </div>
  );
}
