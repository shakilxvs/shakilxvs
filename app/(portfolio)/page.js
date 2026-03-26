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
  const [hero, about, skills, featuredProjects, reviews, siteSettings] = await Promise.all([
    getPortfolioDoc('hero').catch(()=>null),
    getPortfolioDoc('about').catch(()=>null),
    getSkills().catch(()=>[]),
    getFeaturedProjects().catch(()=>[]),
    getApprovedReviews().catch(()=>[]),
    getPortfolioDoc('siteSettings').catch(()=>null),
  ]);

  const sec  = siteSettings?.sections || {};
  const show = (key) => sec[key] !== false;
  const badge = siteSettings?.badge || null;

  return (
    <>
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
