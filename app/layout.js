import './globals.css';
import { Toaster } from 'react-hot-toast';
import { getPortfolioDoc } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shakil Ahmed — Freelance Website & CMS Expert | Global',
  description: 'Hire Shakil Ahmed — a top-rated freelance website and CMS expert working with global clients. Specialist in CMS development, custom web apps, SaaS, and eCommerce. 6+ years · 5000+ global projects · 47 countries.',
  keywords: 'Shakil Ahmed, shakilxvs, freelance website expert, CMS expert, CMS developer, hire web developer, custom website developer, SaaS developer, eCommerce developer, web app developer, Shopify developer, Shopify specialist, Shopify theme developer, WordPress developer, WordPress expert, WooCommerce developer, Webflow developer, Squarespace developer, headless CMS, Next.js developer, React developer, Firebase developer, best freelancer, hire freelancer, website developer for hire, web developer Bangladesh, Shakil website expert',
  metadataBase: new URL('https://shakilxvs.com'),
  openGraph: {
    title: 'Shakil Ahmed — Freelance Website & CMS Expert | Global',
    description: 'Hire Shakil Ahmed — a top-rated freelance website and CMS expert working with global clients. 6+ years · 5000+ global projects · 47 countries.',
    url: 'https://shakilxvs.com',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', creator: '@shakilxvs' },
  robots: { index: true, follow: true },
};

// Curated safe font list — all available on Google Fonts
const FONT_MAP = {
  // Heading fonts
  'Bebas Neue':    'Bebas+Neue',
  'Oswald':        'Oswald:wght@400;700',
  'Montserrat':    'Montserrat:wght@400;600;700;800',
  'Raleway':       'Raleway:wght@400;600;700;800',
  'Playfair Display': 'Playfair+Display:wght@400;600;700',
  'Roboto Condensed': 'Roboto+Condensed:wght@400;700',
  'Anton':         'Anton',
  'Barlow Condensed': 'Barlow+Condensed:wght@400;600;700',
  // Body fonts
  'Outfit':        'Outfit:wght@300;400;500;600;700;800',
  'Inter':         'Inter:wght@300;400;500;600;700',
  'Poppins':       'Poppins:wght@300;400;500;600;700',
  'DM Sans':       'DM+Sans:wght@300;400;500;600;700',
  'Nunito':        'Nunito:wght@300;400;500;600;700',
  'Lato':          'Lato:wght@300;400;700',
  'Source Sans 3': 'Source+Sans+3:wght@300;400;600;700',
  'Rubik':         'Rubik:wght@300;400;500;600;700',
};

export default async function RootLayout({ children }) {
  let accentColor  = null;
  let siteConfig   = null;
  let headingFont  = 'Bebas Neue';
  let bodyFont     = 'Outfit';
  let tracking = {};
  try {
    const s = await getPortfolioDoc('siteSettings');
    if (s) {
      accentColor = s.accentColor || null;
      siteConfig  = {
        logo:     s.logo     || null,
        navItems: s.navItems || null,
        badge:    s.badge    || null,
      };
      if (s.headingFont) headingFont = s.headingFont;
      if (s.bodyFont)    bodyFont    = s.bodyFont;
      if (s.tracking)   tracking    = s.tracking || {};
    }
  } catch {}

  // Build Google Fonts URL — always load Space Mono + selected heading + selected body
  const fontsToLoad = ['Space+Mono:wght@400;700'];
  const headingSlug = FONT_MAP[headingFont];
  const bodySlug    = FONT_MAP[bodyFont];
  if (headingSlug && !fontsToLoad.includes(headingSlug)) fontsToLoad.push(headingSlug);
  if (bodySlug    && !fontsToLoad.includes(bodySlug))    fontsToLoad.push(bodySlug);
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f=>`family=${f}`).join('&')}&display=swap`;

  // Font override CSS — only inject if different from defaults
  const headingCss = headingFont !== 'Bebas Neue'
    ? `.font-bebas, [style*="Bebas Neue"] { font-family: '${headingFont}', sans-serif !important; }`
    : null;
  const bodyCss = bodyFont !== 'Outfit'
    ? `body, .font-outfit, [style*="Outfit"] { font-family: '${bodyFont}', sans-serif !important; }`
    : null;

  const accentStyle = accentColor
    ? `:root{--accent:${accentColor};--accent-glow:${accentColor}2e;--accent-border:${accentColor}59;--accent-muted:${accentColor}1a;}`
    : null;

  const fullStyleBlock = [accentStyle, headingCss, bodyCss].filter(Boolean).join('\n');
  const siteConfigJson = siteConfig ? JSON.stringify(siteConfig) : 'null';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
        {fullStyleBlock && <style dangerouslySetInnerHTML={{ __html: fullStyleBlock }}/>}
        <script dangerouslySetInnerHTML={{ __html: `window.__SITE_CONFIG__=${siteConfigJson};` }}/>

        {/* ── Site Verification Meta Tags (server-side — crawlers need these in static HTML) ── */}
        {tracking.pinterestDomainVerify && (
          <meta name="p:domain_verify" content={tracking.pinterestDomainVerify}/>
        )}
        {tracking.googleSiteVerify && (
          <meta name="google-site-verification" content={tracking.googleSiteVerify}/>
        )}
        {tracking.bingSiteVerify && (
          <meta name="msvalidate.01" content={tracking.bingSiteVerify}/>
        )}
        {tracking.yandexVerify && (
          <meta name="yandex-verification" content={tracking.yandexVerify}/>
        )}
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
