'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getPortfolioDoc } from '@/lib/firestore';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function isAllowedEmail(userEmail) {
    if (!userEmail) return false;
    if (userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL) return true;
    try {
      const team = await getPortfolioDoc('teamMembers');
      return (team?.members || []).some(m => m.email === userEmail && m.active !== false);
    } catch { return false; }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return;
      const allowed = await isAllowedEmail(user.email);
      if (allowed) router.push('/admin/hero');
      else { await auth.signOut(); setError('Access Restricted'); }
    });
    return () => unsub();
  }, [router]);

  const handleEmailSignIn = async () => {
    if (!email.trim())    { setError('Enter your email'); return; }
    if (!password.trim()) { setError('Enter your password'); return; }
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      const msgs = {
        'auth/user-not-found':     'Incorrect email or password',
        'auth/wrong-password':     'Incorrect email or password',
        'auth/invalid-credential': 'Incorrect email or password',
        'auth/invalid-email':      'Invalid email address',
        'auth/too-many-requests':  'Too many attempts. Try again later.',
      };
      setError(msgs[e.code] || `Sign in failed (${e.code})`);
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    // IMPORTANT: signInWithPopup MUST be called before any state updates.
    // setLoading() causes a React re-render that breaks Chrome's synchronous
    // user-gesture chain required for window.open(). Call popup first.
    setError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged handles the redirect
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        // silent — user closed the popup
      } else if (e.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Click the address bar icon to allow popups for this site, then try again.');
      } else {
        setError(`Google sign in failed (${e.code})`);
      }
    }
  };

  const fi = { width:'100%', padding:'12px 14px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-void)', position:'relative', zIndex:1 }}>
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'48px', width:'100%', maxWidth:'400px' }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.65rem', color:'var(--accent)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'16px', textAlign:'center' }}>Admin Access</div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.5rem', color:'var(--text-1)', marginBottom:'40px', textAlign:'center', letterSpacing:'0.05em' }}>@shakilxvs</div>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', letterSpacing:'0.1em', marginBottom:'12px', textAlign:'center', textTransform:'uppercase' }}>Email &amp; Password</div>
          <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}
            style={{ ...fi, marginBottom:'10px' }}
            onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
            onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleEmailSignIn()}
            style={{ ...fi, marginBottom:'12px' }}
            onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
            onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          <button onClick={handleEmailSignIn} disabled={loading}
            style={{ width:'100%', padding:'13px', background:loading?'var(--bg-elevated)':'var(--accent)', color:loading?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', cursor:loading?'not-allowed':'pointer' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
          <div style={{ flex:1, height:'1px', background:'var(--border-1)' }}/>
          <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', letterSpacing:'0.12em' }}>OR</span>
          <div style={{ flex:1, height:'1px', background:'var(--border-1)' }}/>
        </div>

        <button onClick={handleGoogleSignIn} disabled={loading}
          style={{ width:'100%', padding:'13px', background:'var(--bg-elevated)', color:'var(--text-1)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:600, fontSize:'0.9rem', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}
          onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-border)'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {error && (
          <div style={{ marginTop:'16px', padding:'12px', background:'rgba(255,69,0,0.08)', border:'1px solid rgba(255,69,0,0.25)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--fire)', textAlign:'center' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
