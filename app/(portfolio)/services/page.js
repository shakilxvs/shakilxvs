import ServicesPageClient from '@/components/portfolio/ServicesPage';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc, getServices } from '@/lib/firestore';

export const revalidate = 0;

export async function generateMetadata() {
  try {
    const s   = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.services || {};
    const sv  = await getPortfolioDoc('services');
    const ogImage = s?.ogImageUrl || null;
    const title       = seo.title       || sv?.pageTitle       || 'Services & Pricing | Shakil Ahmed — Website & CMS Expert';
    const description = seo.description || sv?.pageDescription || 'Website development, CMS setup, SaaS platforms, and eCommerce solutions. Transparent pricing packages for every stage of your business.';
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];
    return {
      title,
      description,
      keywords: 'web development services, CMS development pricing, SaaS development cost, eCommerce website, hire web developer, website packages, Shakil Ahmed services',
      alternates: { canonical: 'https://shakilxvs.com/services' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com/services',
        type: 'website',
        images,
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
    return { title: 'Services & Pricing | Shakil Ahmed — Website & CMS Expert' };
  }
}

export default async function Page() {
  // Fetch services for schema
  let services = null;
  try {
    services = await getServices();
  } catch {}

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://shakilxvs.com/services' },
    ],
  };

  // Build service offering schema from tiers if available
  const tiers = services?.tiers || [];
  const offerCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Shakil Ahmed — Website & CMS Expert',
    url: 'https://shakilxvs.com/services',
    description: 'Freelance website development, CMS setup, SaaS, and eCommerce services for global clients.',
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Website Development Services',
      itemListElement: tiers.length > 0
        ? tiers.map(tier => ({
            '@type': 'Offer',
            name: tier.name || 'Service Package',
            description: tier.description || '',
            price: tier.price ? String(tier.price) : undefined,
            priceCurrency: 'USD',
            url: 'https://shakilxvs.com/services',
          })).filter(o => o.name)
        : [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CMS Development',       description: 'Custom CMS setup, Webflow, Squarespace, and headless CMS.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Web App',         description: 'Full-stack web apps using Next.js, React, and Firebase.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SaaS Development',       description: 'End-to-end SaaS platform development for global businesses.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'eCommerce Development',  description: 'eCommerce stores with custom features and integrations.' } },
          ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema) }}/>
      <TrackPage page="services" />
      <ServicesPageClient />
    </>
  );
}
