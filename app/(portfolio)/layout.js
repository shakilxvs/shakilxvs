'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/portfolio/Navbar';
import Footer from '@/components/portfolio/Footer';

function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handle = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(docH > 0 ? (scrollTop / docH) * 100 : 0);
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      height: '2px',
      width: `${width}%`,
      background: 'var(--accent)',
      zIndex: 9999,
      transition: 'width 0.1s linear',
      pointerEvents: 'none',
    }} />
  );
}

export default function PortfolioLayout({ children }) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
