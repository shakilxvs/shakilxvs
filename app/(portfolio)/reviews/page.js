import ReviewsPageClient from '@/components/portfolio/ReviewsPageClient';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc } from '@/lib/firestore';

export const revalidate = 0;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo = s?.seo?.reviews || {};
    return {
      title: seo.title || 'Reviews | Shakil — CMS & Web Expert',
      description: seo.description || 'Read what clients say about working with Shakil. 5000+ projects, verified reviews.',
      alternates: { canonical: 'https://shakilxvs.com/reviews' },
    };
  } catch {
    return { title: 'Reviews | Shakil — CMS & Web Expert' };
  }
}

export default function Page() {
  return (
    <>
      <TrackPage page="reviews" />
      <ReviewsPageClient />
    </>
  );
}
