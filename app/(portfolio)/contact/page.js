import ContactClient from '@/components/portfolio/ContactClient';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export const revalidate = 60;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const ogImage = s?.ogImageUrl || null;
    const title       = 'Contact | Hire Shakil Ahmed — Website & CMS Expert';
    const description = 'Get in touch with Shakil Ahmed to hire a freelance website and CMS expert. Available for CMS development, custom web apps, SaaS, and eCommerce projects worldwide.';
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];
    return {
      title,
      description,
      keywords: 'hire Shakil Ahmed, contact web developer, hire CMS expert, hire freelance developer, hire website expert',
      alternates: { canonical: 'https://shakilxvs.com/contact' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com/contact',
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
    return { title: 'Contact | Hire Shakil Ahmed — Website & CMS Expert' };
  }
}

export default function ContactPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://shakilxvs.com/contact' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      <TrackPage page="contact" />
      <ContactClient />
    </>
  );
}
