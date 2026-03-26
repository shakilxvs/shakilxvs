import './globals.css';
import { Toaster } from 'react-hot-toast';

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
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
