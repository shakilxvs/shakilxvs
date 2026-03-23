import { getPortfolioDoc, getSkills, getFeaturedProjects, getApprovedReviews } from '@/lib/firestore';
import Hero from '@/components/portfolio/Hero';
import Marquee from '@/components/portfolio/Marquee';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import FeaturedProjects from '@/components/portfolio/FeaturedProjects';
import ReviewsTeaser from '@/components/portfolio/ReviewsTeaser';
import CTABanner from '@/components/portfolio/CTABanner';

export const revalidate = 0;

export const metadata = {
  title: 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
  description: 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer with 6+ years experience and 5000+ global projects.',
  alternates: { canonical: 'https://shakilxvs.vercel.app' },
};

export default async function HomePage() {
  const [hero, about, skills, featuredProjects, reviews, siteSettings] = await Promise.all([
    getPortfolioDoc('hero').catch(()=>null),
    getPortfolioDoc('about').catch(()=>null),
    getSkills().catch(()=>[]),
    getFeaturedProjects().catch(()=>[]),
    getApprovedReviews().catch(()=>[]),
    getPortfolioDoc('siteSettings').catch(()=>null),
  ]);

  /* Section visibility — default all true if not configured */
  const sec = siteSettings?.sections || {};
  const show = (key) => sec[key] !== false;

  return (
    <>
      {show('hero')     && <Hero data={hero} />}
      {show('marquee')  && <Marquee />}
      {show('about')    && <About data={about} />}
      {show('skills')   && <Skills data={skills} />}
      {show('projects') && <FeaturedProjects projects={featuredProjects} />}
      {show('reviews')  && <ReviewsTeaser reviews={reviews} />}
      {show('cta')      && <CTABanner />}
    </>
  );
}
