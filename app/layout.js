import './globals.css';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { getPortfolioDoc } from '@/lib/firestore';

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.home || {};
    return {
      title: seo.title || 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
      description: seo.description || 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer with 6+ years experience and 5000+ global projects.',
      metadataBase: new URL('https://shakilxvs.vercel.app'),
      openGraph: {
        title: seo.title || 'Shakil — CMS & Web Expert',
        description: seo.description || '6+ years · 5000+ projects · Global clients',
        url: 'https://shakilxvs.vercel.app',
        images: [{ url: seo.ogImage || '/og-image.png', width: 1200, height: 630 }],
        type: 'website',
      },
      twitter: { card: 'summary_large_image', creator: '@shakilxvs' },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
      description: 'CMS & Custom Web Expert, Shopify Developer, Digital Marketer.',
    };
  }
}

export default async function RootLayout({ children }) {
  let tracking = {};
  let accentColor = '#234DC2';
  try {
    const s = await getPortfolioDoc('siteSettings');
    tracking    = s?.tracking    || {};
    accentColor = s?.accentColor || '#234DC2';
  } catch {}

  const { gtmId, gaId, metaPixelId, tiktokPixelId, pinterestTagId, pinterestDomainVerify } = tracking;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Inject dynamic accent color from admin */}
        <style>{`:root { --accent: ${accentColor}; --accent-glow: ${accentColor}2e; --accent-border: ${accentColor}59; --accent-muted: ${accentColor}1a; }`}</style>

        {/* Pinterest domain verification */}
        {pinterestDomainVerify && (
          <meta name="p:domain_verify" content={pinterestDomainVerify} />
        )}

        {/* Google Tag Manager */}
        {gtmId && (
          <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');` }} />
        )}
      </head>
      <body>
        {/* GTM noscript */}
        {gtmId && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{ display:'none', visibility:'hidden' }} />
          </noscript>
        )}

        {children}

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive"/>
            <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');` }}/>
          </>
        )}

        {/* Meta Pixel */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');` }}/>
        )}

        {/* TikTok Pixel */}
        {tiktokPixelId && (
          <Script id="tiktok-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');` }}/>
        )}

        {/* Pinterest Tag */}
        {pinterestTagId && (
          <Script
            id="pinterest-tag"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${pinterestTagId}');pintrk('page');` }}
          />
        )}

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141414', color: '#ffffff',
              border: '1px solid #202020', fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#000' } },
            error:   { iconTheme: { primary: '#ff4500', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
