'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { useState } from 'react';
import { getPortfolioDoc } from '@/lib/firestore';

/* Reads accent color + tracking IDs from Firestore CLIENT-SIDE after hydration.
   This is safe because it runs in the browser where Firebase auth works correctly. */

export default function SiteConfig() {
  const [tracking, setTracking] = useState(null);
  const [accentColor, setAccentColor] = useState(null);

  useEffect(() => {
    getPortfolioDoc('siteSettings').then(s => {
      if (!s) return;
      if (s.accentColor) setAccentColor(s.accentColor);
      if (s.tracking) setTracking(s.tracking);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Dynamic accent color — injected after hydration */}
      {accentColor && (
        <style>{`:root { --accent: ${accentColor}; --accent-glow: ${accentColor}2e; --accent-border: ${accentColor}59; --accent-muted: ${accentColor}1a; }`}</style>
      )}

      {/* Google Analytics */}
      {tracking?.gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${tracking.gaId}`} strategy="afterInteractive"/>
          <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${tracking.gaId}');` }}/>
        </>
      )}

      {/* Google Tag Manager */}
      {tracking?.gtmId && (
        <Script id="gtm-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tracking.gtmId}');` }}/>
      )}

      {/* Meta Pixel */}
      {tracking?.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tracking.metaPixelId}');fbq('track','PageView');` }}/>
      )}

      {/* TikTok Pixel */}
      {tracking?.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tracking.tiktokPixelId}');ttq.page();}(window,document,'ttq');` }}/>
      )}

      {/* Pinterest Tag */}
      {tracking?.pinterestTagId && (
        <Script id="pinterest-tag" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${tracking.pinterestTagId}');pintrk('page');` }}/>
      )}
    </>
  );
}
