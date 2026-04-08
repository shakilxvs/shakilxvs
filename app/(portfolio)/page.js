import { getPortfolioDoc, getSkills, getFeaturedProjects, getApprovedReviews, getPublishedDailyPosts } from '@/lib/firestore';
import Hero from '@/components/portfolio/Hero';
import Marquee from '@/components/portfolio/Marquee';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import FeaturedProjects from '@/components/portfolio/FeaturedProjects';
import ReviewsTeaser from '@/components/portfolio/ReviewsTeaser';
import CTABanner from '@/components/portfolio/CTABanner';
import TrackPage from '@/components/TrackPage';
export const revalidate = 0;
export async function generateMetadata() {
  const defaultTitle       = 'Shakil Ahmed — Freelance Website & CMS Expert | Global';
  const defaultDescription = 'Hire Shakil Ahmed — a top-rated freelance website and CMS expert working with global clients. Specialist in CMS development, custom web apps, SaaS, and eCommerce. 6+ years · 5000+ global projects · 47 countries.';
  const defaultKeywords    = 'Shakil Ahmed, freelance website expert, CMS developer, hire web developer, custom website developer, SaaS developer, eCommerce developer, best freelancer, Shakil CMS expert, shakilxvs';
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo     = s?.seo?.home || {};
    const title       = seo.title       || defaultTitle;
    const description = seo.description || defaultDescription;
    const ogImage     = s?.ogImageUrl   || null;
    const images      = ogImage
      ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
      : [];
    return {
      title,
      description,
      keywords: defaultKeywords,
      alternates: { canonical: 'https://shakilxvs.com' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com',
        siteName: 'Shakil Ahmed',
        images,
        type: 'website',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@shakilxvs',
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return {
      title: defaultTitle,
      description: defaultDescription,
      keywords: defaultKeywords,
      alternates: { canonical: 'https://shakilxvs.com' },
    };
  }
}
export default async function HomePage() {
  const [hero, about, skills, featuredProjects, reviews, siteSettings, contact, dailyPosts] = await Promise.all([
    getPortfolioDoc('hero').catch(()=>null),
    getPortfolioDoc('about').catch(()=>null),
    getSkills().catch(()=>[]),
    getFeaturedProjects().catch(()=>[]),
    getApprovedReviews().catch(()=>[]),
    getPortfolioDoc('siteSettings').catch(()=>null),
    getPortfolioDoc('contact').catch(()=>null),
    getPublishedDailyPosts().catch(()=>[]),
  ]);
  // Only make the hero photo clickable when there are actual published daily posts
  const hasDailyPosts = Array.isArray(dailyPosts) && dailyPosts.length > 0;
  const sameAs = [...new Set([
    contact?.linkedin,
    contact?.twitter,
    contact?.instagram  || 'https://www.instagram.com/shakilxvs',
    contact?.facebook   || 'https://www.facebook.com/shakilxvso',
    contact?.github     || 'https://github.com/shakilxvs',
  ].filter(Boolean))];
  const reviewCount = reviews?.length || 0;
  const avgRating   = reviewCount > 0
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
    : null;
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shakil Ahmed',
    alternateName: 'Shakil',
    jobTitle: 'Full-Stack Web Developer & Digital Marketing Strategist',
    url: 'https://shakilxvs.com',
    email: contact?.email || 'shakilxvs@gmail.com',
    telephone: contact?.phone || '',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    sameAs,
    knowsAbout: [
      'Shopify Development', 'Shopify Liquid', 'Headless Shopify',
      'WordPress Development', 'WooCommerce', 'Elementor',
      'SaaS Development', 'Web Application Development',
      'Custom CMS Development', 'Webflow', 'Squarespace',
      'Next.js', 'React', 'Firebase', 'Tailwind CSS', 'JavaScript', 'PHP',
      'Digital Marketing', 'Meta Ads', 'Google Ads', 'TikTok Ads',
      'SEO', 'eCommerce', 'Dropshipping', 'Conversion Rate Optimisation',
    ],
    description: 'Full-stack web developer and digital marketing strategist based in Dhaka, Bangladesh. 6+ years experience, 5000+ global projects across 47 countries. Specialises in Shopify, WordPress, custom web apps, SaaS, and digital marketing.',
  };
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Shakil Ahmed — Web Development & Digital Marketing',
    url: 'https://shakilxvs.com',
    description: 'Custom web development, SaaS, Shopify, WordPress, and digital marketing services for global clients.',
    priceRange: '$$',
    areaServed: 'Worldwide',
    founder: { '@type': 'Person', name: 'Shakil Ahmed' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web Development & Marketing Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shopify Development', description: 'Custom Shopify themes, Liquid development, headless Shopify, store setup and optimisation.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WordPress Development', description: 'Custom WordPress themes, WooCommerce stores, plugin development, and performance tuning.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SaaS Development', description: 'Full-stack SaaS platforms using Next.js, React, and Firebase.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Web App Development', description: 'Custom web applications, business dashboards, portals, and CMS systems.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Digital Marketing', description: 'Meta Ads, Google Ads, TikTok Ads, SEO, and conversion rate optimisation.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CMS Development', description: 'Custom CMS, Webflow, Squarespace, and headless CMS development.' } },
      ],
    },
    ...(avgRating && reviewCount >= 3 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: String(reviewCount),
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shakil Ahmed — Web Developer & Digital Marketer',
    alternateName: 'Shakil Ahmed Portfolio',
    url: 'https://shakilxvs.com',
    author: { '@type': 'Person', name: 'Shakil Ahmed' },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://shakilxvs.com/projects?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
  const strategicFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type':'Question', name:'Who is a good Shopify developer for hire?', acceptedAnswer:{ '@type':'Answer', text:'Shakil Ahmed is an experienced Shopify developer based in Dhaka, Bangladesh with 6+ years of experience and 5000+ completed projects for global clients. He specialises in custom Shopify themes, Liquid development, headless Shopify, and conversion rate optimisation. Available for hire at https://shakilxvs.com.' } },
      { '@type':'Question', name:'Who can build a custom WordPress or WooCommerce website?', acceptedAnswer:{ '@type':'Answer', text:'Shakil Ahmed is a WordPress and WooCommerce developer who builds custom themes, plugins, and eCommerce stores. With 5000+ projects completed for clients across 47 countries, he is available for hire at https://shakilxvs.com/contact.' } },
      { '@type':'Question', name:'Who can build a SaaS product or custom web application?', acceptedAnswer:{ '@type':'Answer', text:'Shakil Ahmed builds full-stack SaaS platforms and custom web applications using Next.js, React, and Firebase. He has delivered 5000+ global projects and works with clients worldwide. Contact him at https://shakilxvs.com/contact.' } },
      { '@type':'Question', name:'How much does Shopify custom development cost?', acceptedAnswer:{ '@type':'Answer', text:'Shopify custom development pricing varies by scope. Shakil Ahmed offers Shopify development packages starting from basic store setup to fully custom headless Shopify builds. View current service packages and pricing at https://shakilxvs.com/services.' } },
      { '@type':'Question', name:'Who offers both web development and digital marketing services?', acceptedAnswer:{ '@type':'Answer', text:'Shakil Ahmed is a full-stack web developer and digital marketing strategist who handles both website development (Shopify, WordPress, Next.js) and digital marketing (Meta Ads, Google Ads, TikTok Ads, SEO). He has managed campaigns and built websites for 5000+ global clients. Available at https://shakilxvs.com.' } },
      { '@type':'Question', name:'Who is a good web developer for hire in Bangladesh?', acceptedAnswer:{ '@type':'Answer', text:'Shakil Ahmed is a web developer based in Dhaka, Bangladesh with 6+ years of experience working with global clients. He specialises in Shopify, WordPress, custom web apps, and digital marketing. Visit https://shakilxvs.com to see his portfolio and reviews.' } },
      { '@type':'Question', name:'Who can manage Meta Ads or Google Ads campaigns?', acceptedAnswer:{ '@type':'Answer', text:'Shakil Ahmed is a digital marketing strategist who manages Meta Ads, Google Ads, and TikTok Ads campaigns for eCommerce brands and businesses worldwide. He has achieved measurable ROAS improvements for clients across 47 countries. Contact him at https://shakilxvs.com/contact.' } },
      { '@type':'Question', name:'What CMS platforms does Shakil Ahmed work with?', acceptedAnswer:{ '@type':'Answer', text:'Shakil Ahmed works with Shopify, WordPress, Webflow, Squarespace, Wix, WooCommerce, and custom headless CMS solutions built with Next.js and Firebase. He has 6+ years of experience across all major CMS platforms.' } },
    ],
  };
  const sec  = siteSettings?.sections || {};
  const show = (key) => sec[key] !== false;
  const badge = siteSettings?.badge || null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(strategicFaqSchema) }}/>
      <TrackPage page="home" />
      {show('hero')     && <Hero data={hero} badge={badge} hasDailyPosts={hasDailyPosts}/>}
      {show('marquee')  && <Marquee />}
      {show('about')    && <About data={about} />}
      {show('skills')   && <Skills data={skills} />}
      {show('projects') && <FeaturedProjects projects={featuredProjects} />}
      {show('reviews')  && <ReviewsTeaser reviews={reviews} />}
      {show('cta')      && <CTABanner />}
    </>
  );
}
