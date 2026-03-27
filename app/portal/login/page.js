'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientByUsername, getClientByEmail } from '@/lib/firestore';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export default function PortalLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password,   setPassword]   = useState('');
  const [remember,   setRemember]   = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.clientId && (!s.expiresAt || Date.now() < s.expiresAt)) {
          router.replace('/portal');
        }
      }
    } catch {}
  }, [router]);

  const handleLogin = async () => {
    const id = identifier.trim();
    const pw = password.trim();
    if (!id) { setError('Enter your email or username'); return; }
    if (!pw) { setError('Enter your password'); return; }
    setLoading(true);
    setError('');
    try {
      // Look up by email first, then by username
      let client = null;
      if (id.includes('@')) {
        client = await getClientByEmail(id.toLowerCase());
      }
      if (!client) {
        client = await getClientByUsername(id.toLowerCase());
      }

      if (!client) {
        setError('No account found with that email or username.');
        setLoading(false);
        return;
      }

      if (client.active === false) {
        setError('Your account has been suspended. Please contact us.');
        setLoading(false);
        return;
      }

      // Verify password
      const hash = await hashPassword(pw);
      if (hash !== client.passwordHash) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      // Save session to localStorage
      const session = {
        clientId:    client.id,
        name:        client.name,
        username:    client.username,
        email:       client.email,
        company:     client.company || '',
        permissions: client.permissions || {},
        expiresAt:   remember ? Date.now() + 30*24*60*60*1000 : Date.now() + 24*60*60*1000,
      };
      localStorage.setItem('portal_session', JSON.stringify(session));
      router.replace('/portal');
    } catch {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const fi = {
    width:'100%', padding:'12px 14px',
    background:'var(--bg-elevated)', border:'1px solid var(--border-2)',
    borderRadius:'var(--radius-md)', color:'var(--text-1)',
    fontFamily:'Outfit,sans-serif', fontSize:'0.9rem',
    outline:'none', boxSizing:'border-box', transition:'border-color 0.15s',
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-void)', position:'relative', padding:'24px' }}>
      {/* Background orb */}
      <div style={{ position:'fixed', top:'30%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'300px', background:'rgba(35,77,194,0.07)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>

      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-2)', borderRadius:'var(--radius-xl)', padding:'48px 40px', width:'100%', maxWidth:'420px', position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <Link href="/" style={{ fontFamily:'Space Mono,monospace', fontSize:'0.85rem', color:'var(--accent)', letterSpacing:'0.05em', textDecoration:'none' }}>@shakilxvs</Link>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.58rem', color:'var(--text-3)', marginTop:'6px', letterSpacing:'0.15em', textTransform:'uppercase' }}>Client Portal</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'2.2rem', color:'var(--text-1)', letterSpacing:'0.05em', marginTop:'16px', lineHeight:1 }}>Sign In</h1>
          <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-3)', marginTop:'6px' }}>Use your email or username to access your portal.</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
          {/* Identifier */}
          <div>
            <label style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'5px', display:'block' }}>Email or Username</label>
            <input style={fi} type="text" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="you@email.com or johndoe"
              onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
              onBlur={e=>e.target.style.borderColor='var(--border-2)'}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontFamily:'Space Mono,monospace', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'5px', display:'block' }}>Password</label>
            <div style={{ position:'relative' }}>
              <input style={{ ...fi, paddingRight:'42px' }} type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"
                onFocus={e=>e.target.style.borderColor='var(--accent-border)'}
                onBlur={e=>e.target.style.borderColor='var(--border-2)'}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                autoComplete="current-password"
              />
              <button onClick={()=>setShowPw(x=>!x)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', padding:'4px' }}>
                {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* Remember */}
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:'var(--accent)', width:15, height:15 }}/>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', color:'var(--text-2)' }}>Remember me for 30 days</span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding:'10px 14px', background:'rgba(255,69,0,0.08)', border:'1px solid rgba(255,69,0,0.25)', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontSize:'0.85rem', color:'var(--fire)', marginBottom:'16px', textAlign:'center' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'13px', background:loading?'var(--bg-elevated)':'var(--accent)', color:loading?'var(--text-3)':'#fff', border:'none', borderRadius:'var(--radius-md)', fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'0.9rem', cursor:loading?'not-allowed':'pointer', transition:'all 0.15s' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ textAlign:'center', marginTop:'20px' }}>
          <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--text-3)' }}>Need access? </span>
          <Link href="/contact" style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.82rem', color:'var(--accent)', textDecoration:'none' }}>Contact us</Link>
        </div>
      </div>
    </div>
  );
}
