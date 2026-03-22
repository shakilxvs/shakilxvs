import { getPortfolioDoc, getSkills, getFeaturedProjects } from '@/lib/firestore';
import Hero from '@/components/portfolio/Hero';
import Marquee from '@/components/portfolio/Marquee';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import FeaturedProjects from '@/components/portfolio/FeaturedProjects';

export const metadata = {
  title: 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
  description: 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer with 6+ years experience and 5000+ global projects.',
  alternates: { canonical: 'https://shakilxvs.vercel.app' },
};

export default async function HomePage() {
  const [hero, about, skills, featuredProjects] = await Promise.all([
    getPortfolioDoc('hero').catch(() => null),
    getPortfolioDoc('about').catch(() => null),
    getSkills().catch(() => []),
    getFeaturedProjects().catch(() => []),
  ]);

  return (
    <>
      <Hero data={hero} />
      <Marquee />
      <About data={about} />
      <Skills data={skills} />
      <FeaturedProjects projects={featuredProjects} />
    </>
  );
}
