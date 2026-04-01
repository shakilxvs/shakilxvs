import PayPageClient from '@/components/portfolio/PayPageClient';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export const revalidate = 0;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo     = s?.seo?.pay || {};
    const ogImage = s?.ogImageUrl || null;
    const title       = seo.title       || 'Pay Shakil Ahmed | Multiple Payment Options Worldwide';
    const description = seo.description || 'Send payment to Shakil Ahmed via bank transfer, crypto, PayPal, Wise, Payoneer, bKash, and more. Multiple secure payment options for global clients.';
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];
    return {
      title,
      description,
      keywords: 'pay Shakil Ahmed, payment options, bank transfer, PayPal, Wise, Payoneer, crypto payment, bKash',
      alternates: { canonical: 'https://shakilxvs.com/pay' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com/pay',
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
    return { title: 'Pay Shakil Ahmed | Multiple Payment Options Worldwide' };
  }
}

export default function Page() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Pay',  item: 'https://shakilxvs.com/pay' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      <TrackPage page="pay" />
      <PayPageClient />
    </>
  );
}
