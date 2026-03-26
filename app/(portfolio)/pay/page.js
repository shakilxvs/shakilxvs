import PayPageClient from '@/components/portfolio/PayPageClient';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export const revalidate = 0;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.pay || {};
    return {
      title: seo.title || 'Pay Shakil | Multiple Payment Options Worldwide',
      description: seo.description || 'Send payment to Shakil via bank transfer, crypto, PayPal, Wise, Payoneer and more.',
      alternates: { canonical: 'https://shakilxvs.com/pay' },
    };
  } catch {
    return { title: 'Pay Shakil | Multiple Payment Options Worldwide' };
  }
}

export default function Page() {
  return (
    <>
      <TrackPage page="pay" />
      <PayPageClient />
    </>
  );
}
