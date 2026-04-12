'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setPortalToken, getPortalToken, clearPortalToken } from '@/lib/portal-client';

export default function PortalLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [remember,   setRemember]   = useState(true);
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // If already logged in, bounce to /portal. Otherwise, wipe any legacy
  // portal_session key from older versions so it doesn't sit in localStorage forever.
  useEffect(() => {
    if (getPortalToken()) {
      router.replace('/portal');
    } else {
      clearPortalToken();
    }
  }, [router]);

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/portal/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ identifier: identifier.trim(), password, remember }),
        cache:   'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) {
        setError(json.error || 'Login failed');
        setLoading(false);
        return;
      }
      setPortalToken(json.data.token);
      router.replace('/portal');
    } catch {
      setError('Network error. Try again.');
      setLoading(false);
    }
  };

  const fi = { width:'100%', padding:'12px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-md)', color:'var(--text-1)', fontFamily:'Outfit,sans-serif', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' };
  const lb = { fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px', display:'block' };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', padding:'40px 20px', position:'relative', zIndex:1 }}>
      <div style={{ position:'absolute', top:'10%', left:'-5%', width:'420px', height:'420px', background:'rgba(35,77,194,0.08)', borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none' }}/>
      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <Link href="/" style={{ fontFamily:'Space Mono,monospace', fontSize:'0.7rem', color:'var(--accent)', textDecoration:'none', letterSpacing:'0.15em' }}>
            {'<shakil />'}
          </Link>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.8rem', color:'var(--text-1)', letterSpacing:'0.04em', marginTop:'18px', lineHeight:1 }}>Client Portal</h1>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-3)', marginTop:'10px' }}>Sign in to access your projects, invoices, and messages</div>
        </div>

        <form onSubmit={handleLogin} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-lg)', padding:'28px' }}>
          <div style={{ marginBottom:'16px' }}>
            <label style={lb}>Username or Email</label>
            <input style={fi} value={identifier} onChange={e=>setIdentifier(e.target.value)}
              placeholder="@username or email@example.com" autoFocus
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
              onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          </div>
          <div style={{ marginBottom:'16px' }}>
            <label style={lb}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} style={{ ...fi, paddingRight:'46px' }} value={password} onChange={e=>setPassword(e.target.value)}
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
                onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              <button type="button" onClick={()=>setShowPw(x=>!x)}
                style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontFamily:'Space Mono,monospace', fontSize:'0.6rem', letterSpacing:'0.1em' }}>
                {showPw?'HIDE':'SHOW'}
              </button>
            </div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'18px', cursor:'pointer' }}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:'var(--accent)', width:14, height:14 }}/>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--text-2)' }}>Remember me for 30 days</span>
          </label>
          {error && (
            <div style={{ background:'rgba(255,69,0,0.1)', border:'1px solid rgba(255,69,0,0.25)', color:'#ff6b35', padding:'10px 14px', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', marginBottom:'14px' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'12px', background:loading?'var(--bg-elevated)':'var(--accent)', color:loading?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.95rem', cursor:loading?'not-allowed':'pointer', transition:'opacity 0.15s' }}>
            {loading?'Signing in…':'Sign In'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'20px', fontFamily:'Outfit,sans-serif', fontSize:'0.8rem', color:'var(--text-3)' }}>
          Forgot your password? <Link href="/contact" style={{ color:'var(--accent)', textDecoration:'none' }}>Contact Shakil</Link>
        </div>
      </div>
    </div>
  );
}
