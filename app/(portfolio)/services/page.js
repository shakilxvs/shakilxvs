import ServicesPageClient from '@/components/portfolio/ServicesPage';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export const revalidate = 0;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.services || {};
    const sv  = await getPortfolioDoc('services');
    return {
      title:       seo.title       || sv?.pageTitle       || 'Services | Shakil — CMS & Web Expert',
      description: seo.description || sv?.pageDescription || 'Shopify development, digital marketing, custom web apps and more. Affordable packages for every stage.',
      alternates: { canonical: 'https://shakilxvs.com/services' },
    };
  } catch {
    return { title: 'Services | Shakil — CMS & Web Expert' };
  }
}

export default function Page() {
  return (
    <>
      <TrackPage page="services" />
      <ServicesPageClient />
    </>
  );
}
/* ─── redeploy ────────────────────────────────────── */
