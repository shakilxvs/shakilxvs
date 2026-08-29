import ReviewsPageClient from '@/components/portfolio/ReviewsPageClient';
import TrackPage from '@/components/TrackPage';
import { getPortfolioDoc, getApprovedReviews } from '@/lib/firestore';

export const revalidate = 0;

export async function generateMetadata() {
  try {
    const s = await getPortfolioDoc('siteSettings');
    const seo     = s?.seo?.reviews || {};
    const ogImage = s?.ogImageUrl || null;
    const title       = seo.title       || 'Client Reviews | Shakil Ahmed — Website & CMS Expert';
    const description = seo.description || 'Verified reviews from global clients. 5000+ projects delivered across 47 countries. See what clients say about working with Shakil.';
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];
    return {
      title,
      description,
      keywords: 'Shakil Ahmed reviews, web developer reviews, CMS expert reviews, client testimonials, freelancer reviews',
      alternates: { canonical: 'https://shakilxvs.com/reviews' },
      openGraph: {
        title,
        description,
        url: 'https://shakilxvs.com/reviews',
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
    return { title: 'Client Reviews | Shakil Ahmed — Website & CMS Expert' };
  }
}

export default async function Page() {
  // Fetch reviews server-side for AggregateRating schema
  let reviews = [];
  try {
    reviews = await getApprovedReviews();
  } catch {}

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://shakilxvs.com' },
      { '@type': 'ListItem', position: 2, name: 'Reviews', item: 'https://shakilxvs.com/reviews' },
    ],
  };

  const reviewCount = reviews.length;
  const avgRating   = reviewCount > 0
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
    : null;

  const aggregateSchema = avgRating && reviewCount >= 3 ? {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Shakil Ahmed — Web Development & Digital Marketing',
    url: 'https://shakilxvs.com',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: String(reviewCount),
      bestRating: '5',
      worstRating: '1',
    },
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      {aggregateSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateSchema) }}/>
      )}
      <TrackPage page="reviews" />
      <ReviewsPageClient />
    </>
  );
}
