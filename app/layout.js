import './globals.css';
import { Toaster } from 'react-hot-toast';
import { getPortfolioDoc } from '@/lib/firestore';

export const dynamic = 'force-dynamic'; // Always fetch fresh siteSettings — no stale accent/logo

export const metadata = {
  title: 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
  description: 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer with 6+ years experience and 5000+ global projects.',
  metadataBase: new URL('https://shakilxvs.com'),
  openGraph: {
    title: 'Shakil — CMS & Web Expert',
    description: '6+ years · 5000+ projects · Global clients',
    url: 'https://shakilxvs.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', creator: '@shakilxvs' },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }) {
  // Fetch siteSettings server-side so accent color and logo are known
  // before the first byte of HTML is sent — eliminates flash of default content.
  let accentColor = null;
  let siteConfig  = null;
  try {
    const s = await getPortfolioDoc('siteSettings');
    if (s) {
      accentColor = s.accentColor || null;
      siteConfig  = {
        logo:     s.logo     || null,
        navItems: s.navItems || null,
        badge:    s.badge    || null,
      };
    }
  } catch {}

  // Build accent CSS vars — injected before any JS, eliminates color flash
  const accentStyle = accentColor
    ? `:root{--accent:${accentColor};--accent-glow:${accentColor}2e;--accent-border:${accentColor}59;--accent-muted:${accentColor}1a;}`
    : null;

  // Serialize site config for inline script — read synchronously by Navbar
  const siteConfigJson = siteConfig ? JSON.stringify(siteConfig) : 'null';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Inject accent color BEFORE first paint — eliminates flash of default color */}
        {accentStyle && <style dangerouslySetInnerHTML={{ __html: accentStyle }}/>}
        {/* Inject site config synchronously — Navbar reads this instead of async Firestore */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SITE_CONFIG__=${siteConfigJson};`
          }}
        />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141414', color: '#ffffff',
              border: '1px solid #202020',
              fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#000' } },
            error:   { iconTheme: { primary: '#ff4500', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
