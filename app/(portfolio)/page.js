import { getPortfolioDoc, getSkills, getFeaturedProjects, getApprovedReviews  } from '@/lib/firestore';
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
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.home || {};
    return {
      title: seo.title || 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
      description: seo.description || 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer.',
      alternates: { canonical: 'https://shakilxvs.com' },
    };
  } catch { return { title: 'Shakil — CMS & Web Expert' }; }
}

export default async function HomePage() {
  const [hero, about, skills, featuredProjects, reviews, siteSettings, contact] = await Promise.all([
    getPortfolioDoc('hero').catch(()=>null),
    getPortfolioDoc('about').catch(()=>null),
    getSkills().catch(()=>[]),
    getFeaturedProjects().catch(()=>[]),
    getApprovedReviews().catch(()=>[]),
    getPortfolioDoc('siteSettings').catch(()=>null),
    getPortfolioDoc('contact').catch(()=>null),
  ]);

  // Build Schema.org JSON-LD
  const sameAs = [
    contact?.linkedin,
    contact?.twitter,
    contact?.instagram,
    contact?.facebook,
    contact?.github || 'https://github.com/shakilxvs',
  ].filter(Boolean);

  const reviewCount  = reviews?.length || 0;
  const avgRating    = reviewCount > 0
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
    : null;

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shakil Ahmed',
    jobTitle: 'Full-Stack Web Developer & Digital Marketing Strategist',
    url: 'https://shakilxvs.com',
    email: contact?.email || 'shakilxvs@gmail.com',
    telephone: contact?.phone || '',
    sameAs,
    knowsAbout: [
      'Shopify Development', 'WordPress Development', 'SaaS Development',
      'Web Application Development', 'Digital Marketing', 'eCommerce',
      'Next.js', 'React', 'Firebase', 'Meta Ads', 'Google Ads',
    ],
    description: 'Full-stack web developer and digital marketing strategist with 6+ years experience, 5000+ global projects across 47 countries.',
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Shakil Ahmed — Web Development & Digital Marketing',
    url: 'https://shakilxvs.com',
    description: 'Custom web development, SaaS, Shopify, WordPress, and digital marketing services for global clients.',
    priceRange: '$$',
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web Development & Marketing Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shopify Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SaaS Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Web App Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WordPress Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Digital Marketing' } },
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

  const sec  = siteSettings?.sections || {};
  const show = (key) => sec[key] !== false;
  const badge = siteSettings?.badge || null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <TrackPage page="home" />
      {show('hero')     && <Hero data={hero} badge={badge} />}
      {show('marquee')  && <Marquee />}
      {show('about')    && <About data={about} />}
      {show('skills')   && <Skills data={skills} />}
      {show('projects') && <FeaturedProjects projects={featuredProjects} />}
      {show('reviews')  && <ReviewsTeaser reviews={reviews} />}
      {show('cta')      && <CTABanner />}
    </>
  );
}
