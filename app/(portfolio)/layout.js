'use client';
import { useEffect, useState } from 'react';

function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      id="scroll-progress"
      style={{ width: `${width}%` }}
    />
  );
}

export default function PortfolioLayout({ children }) {
  return (
    <>
      <ScrollProgress />
      {children}
    </>
  );
}
