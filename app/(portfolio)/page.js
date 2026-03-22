import { getPortfolioDoc } from '@/lib/firestore';
import Hero from '@/components/portfolio/Hero';
import Marquee from '@/components/portfolio/Marquee';

export const metadata = {
  title: 'Shakil — CMS & Web Expert | Shopify Developer | Digital Marketer',
  description: 'Shakil is a CMS & Custom Web Expert, Shopify Developer, and Digital Marketer with 6+ years experience and 5000+ global projects.',
  alternates: { canonical: 'https://shakilxvs.vercel.app' },
};

export default async function HomePage() {
  let hero = null;
  try {
    hero = await getPortfolioDoc('hero');
  } catch(e) {}

  return (
    <>
      <Hero data={hero} />
      <Marquee />
    </>
  );
}
